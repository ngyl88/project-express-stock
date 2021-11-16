require("dotenv").config();

const errors = require("../config/errors");

const axios = require("axios");
axios.defaults.baseURL = "http://api.marketstack.com/v1";
axios.defaults.timeout = 3000;

const axiosAlphaVantageinstance = axios.create({
  baseURL: 'https://www.alphavantage.co/'
});

const queryAlphaVantage = async symbol => {
  try {
    const response = await axiosAlphaVantageinstance.get(`query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`);
    return await response.json();
  } catch (err) {
    console.error("APIConnectionIssue in queryAlphaVantage:", err);
    const e = new Error("Unable to hit service provider...");
    e.name = errors.APIConnectionIssue;
    throw e;
  }
}

const transformData = stocks => {
  return stocks.map(stock => {
    return {
      symbol: stock.symbol,
      name: stock.name,
      currency: stock.currency,
      price: stock.price,
      volume: stock.volume,
      last_trade_time: stock.last_trade_time
    };
  });
};
const getUnvailableTickers = (tickers, apiResponse) => {
  const stocks = apiResponse.data;
  const tickersReturned = stocks.map(stock => stock.symbol.toUpperCase());
  return tickers
    .split(",")
    .filter(ticker => tickersReturned.indexOf(ticker.toUpperCase()) === -1);
};
const processPriceDataFromAPI = (tickers, apiResponse) => {
  const response = {
    stock_information: [],
    unavailable_tickers: []
  };
  response.unavailable_tickers = getUnvailableTickers(tickers, apiResponse);
  response.stock_information = transformData(apiResponse.data);
  return response;
};
const getPriceFromAPI = async tickers => {
  let data = [];
  try {
    const response = await axios.get("/eod/latest", {
      params: {
        symbols: tickers,
        access_key: process.env.API_KEY_WORLD_TRADING_DATA
      }
    });
    data = response.data;
  } catch (err) {
    console.error("APIConnectionIssue in watchlist:", err);
    const e = new Error("Unable to hit service provider...");
    e.name = errors.APIConnectionIssue;
    throw e;
  }
  return processPriceDataFromAPI(tickers, data);
};

module.exports = {
  getPriceFromAPI,
  queryAlphaVantage
};

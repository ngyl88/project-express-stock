const WatchList = require("../models/watchlist");

const apiHelper = require("./external");
const authorizationHelper = require("./authorization");

const checkDuplicateTickers = async (tickers, userId) => {
  const tickersFoundInUserWatchList = await WatchList.findTickersByUser(userId);

  if (tickersFoundInUserWatchList.length === 0) return [];
  if (Array.isArray(tickers)) {
    const duplicated = tickers.filter(
      ticker => tickersFoundInUserWatchList.indexOf(ticker.toUpperCase()) !== -1
    );
    return duplicated;
  }
  return tickersFoundInUserWatchList.indexOf(tickers.toUpperCase()) === -1
    ? []
    : tickers;
};

const createWatchListForUser = async (ticker, user) => {
  const watchlist = new WatchList({
    ticker,
    user: user._id
  });
  await watchlist.save();
};
const createWatchListsFromRequest = async (tickers, user) => {
  if (Array.isArray(tickers)) {
    let promises = tickers.map(ticker => createWatchListForUser(ticker, user));
    await Promise.all(promises);
  } else {
    await createWatchListForUser(tickers, user);
  }
};
const getAllWatchList = async (req, res) => {
  authorizationHelper.checkSuperAuthorization(
    req.user.username,
    "view the list of watchlist"
  );
  const watchlist = await WatchList.find().populate("user", "username");
  res.json({
    message: "All watchlists are retrieved successfully",
    watchlist
  });
};
const connectAPI = async (req, res) => {
  const watchlist = await WatchList.findTickersByUser(req.user._id);

  const tickers = watchlist.join(",");

  const response = await apiHelper.getPriceFromAPI(tickers);
  res.json({
    message: `Stock prices on watchlist retrieved successfully for ${
      req.user.username
    }`,
    stock_information: response.stock_information,
    unavailable_tickers: response.unavailable_tickers
  });
};
module.exports = {
  checkDuplicateTickers,
  createWatchListsFromRequest,
  getAllWatchList,
  connectAPI
};

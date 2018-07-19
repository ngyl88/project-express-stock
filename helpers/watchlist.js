const WatchList = require("../models/watchlist");

// GET Requests

// POST Requests
const checkDuplicateTickers = async (tickers, userId) => {
  const tickersFoundInUserWatchList = await WatchList.findTickersByUser(userId);

  if (tickersFoundInUserWatchList.length === 0) return [];
  if (Array.isArray(tickers)) {
    const temp = tickers.filter(
      ticker => tickersFoundInUserWatchList.indexOf(ticker.toUpperCase()) !== -1
    );
    return temp;
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
    for (let i = 0; i < tickers.length; i++) {
      await createWatchListForUser(tickers[i], user);
    }
  } else {
    await createWatchListForUser(tickers, user);
  }
};

module.exports = {
  checkDuplicateTickers,
  createWatchListsFromRequest
};

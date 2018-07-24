const WatchList = require("../models/watchlist");

const watchlistHelper = require("../helpers/watchlist");

const errors = require("../config/errors");

const getWatchList = async (req, res, next) => {
  try {
    if (req.query.all === "true")
      return await watchlistHelper.getAllWatchList(req, res);

    if (req.query["price"] !== undefined)
      return await watchlistHelper.connectAPI(req, res);

    const watchlist = await WatchList.findByUser(req.user._id);
    res.json({
      message: `Watchlist retrieved successfully for ${req.user.username}`,
      watchlist
    });
  } catch (err) {
    next(err);
  }
};

const addWatchlist = async (req, res, next) => {
  try {
    const user = req.user;
    const tickers = req.body.watchlist;

    const duplicateTickers = await watchlistHelper.checkDuplicateTickers(
      tickers,
      user._id
    );
    if (duplicateTickers.length > 0) {
      console.log(
        `Rejected new watchlist request: user=${
          user.username
        }, tickers=${duplicateTickers}`
      );
      const e = new Error(
        `Tickers { ${duplicateTickers} } already exist for ${user.username}`
      );
      e.name = errors.ExistingWatchList;
      throw e;
    }

    await watchlistHelper.createWatchListsFromRequest(tickers, user);
    res.json({
      message: `Watchlist created for username ${user.username}`
    });
  } catch (err) {
    next(err);
  }
};

const updateWatchlist = async (req, res, next) => {
  try {
    if (!req.watchlist) return next();

    const { id, ticker } = req.params;

    const update = {
      ...req.watchlist.toJSON(),
      ticker: req.params.ticker,
      updated: Date.now()
    };

    const updatedWatchlist = await WatchList.findByIdAndUpdate(id, update);
    if (updatedWatchlist === null) return next();

    const oldTicker = req.watchlist.ticker;
    const { username } = req.watchlist.user;
    res.json({
      message: `Ticker successfully updated from ${oldTicker} to ${ticker.toUpperCase()} on ${username}'s watchlist`
    });
  } catch (err) {
    next(err);
  }
};

const deleteWatchlist = async (req, res, next) => {
  try {
    if (!req.watchlist) return next();

    const deletedWatchlist = await WatchList.findByIdAndDelete(
      req.params.id
    ).populate("user");
    if (deletedWatchlist === null) return next();
    res.json({
      message: `Ticker ${deletedWatchlist.ticker} successfully deleted from ${
        deletedWatchlist.user.username
      }'s watchlist`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWatchList,
  addWatchlist,
  updateWatchlist,
  deleteWatchlist
};

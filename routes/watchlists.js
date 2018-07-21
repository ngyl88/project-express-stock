const express = require("express");

const errors = require("../config/errors");

const passport = require("../config/passport");
const errorHandler = require("../middleware/errorHandler");

const watchlistMiddleware = require("../middleware/watchlist");

const authorizationHelper = require("../helpers/authorization");
const watchlistHelper = require("../helpers/watchlist");
const apiHelper = require("../helpers/external");

const WatchList = require("../models/watchlist");

const router = express.Router();
router.use(express.json());

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

router.get("/", async (req, res, next) => {
  try {
    if (req.query.all === "true") return await getAllWatchList(req, res);

    if (req.query["price"] !== undefined) return await connectAPI(req, res);

    const watchlist = await WatchList.findByUser(req.user._id);
    res.json({
      message: `Watchlist retrieved successfully for ${req.user.username}`,
      watchlist
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
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
});

router.delete("/:id", watchlistMiddleware.authenticate, async (req, res, next) => {
  try {
    if (!req.watchlist) return next();

    const deletedWatchlist = await WatchList.findByIdAndDelete(req.watchlist._id).populate("user");
    if (deletedWatchlist === null) return next();
    res.json({
      message: `Ticker ${deletedWatchlist.ticker} successfully deleted from ${
        deletedWatchlist.user.username
      }'s watchlist`
    });
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler.handlerWatchList);
router.use(errorHandler.handlerMongooseError);
router.use(errorHandler.handlerTokenMismatch);
router.use(errorHandler.handlerSuperAuthorization);

module.exports = app => {
  app.use("/watchlist", passport.authenticate, router);
};

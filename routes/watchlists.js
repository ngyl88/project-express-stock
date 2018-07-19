const express = require("express");

const errors = require("../config/errors");

const passport = require("../config/passport");
const errorHandler = require("../middleware/errorHandler");

const authorizationHelper = require("../helpers/authorization");
const watchlistHelper = require("../helpers/watchlist");

const WatchList = require("../models/watchlist");

const router = express.Router();
router.use(express.json());

router.get("/", async (req, res, next) => {
  try {
    if (req.query.admin === "true") {
      authorizationHelper.checkSuperAuthorization(
        req.user.username, "view the list of watchlist"
      );

      const watchlist = await WatchList.find().populate("user");
      res.json({
        message: "All watchlists are retrieved successfully",
        watchlist
      });
      return;
    }

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

    watchlistHelper.createWatchListsFromRequest(tickers, user);
    res.json({
      message: `Watchlist created for username ${user.username}`
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const watchlistId = req.params.id;
    
    const watchlist = await WatchList.findById(watchlistId).populate("user");
    if (watchlist === null) {
      return next();
    }

    if (authorizationHelper.checkMatchingUsers(watchlist.user, req.user)) {
      const deletedWatchlist = await WatchList.findByIdAndDelete(watchlistId);
      if (deletedWatchlist === null) {
        return next();
      }
      res.json({
        message: `Ticker ${watchlist.ticker} successfully deleted from ${
          watchlist.user.username
        }'s watchlist`
      });
    }
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler.handlerWatchList);
router.use(handlerMongooseError);
router.use(errorHandler.handlerSuperAuthorization);
router.use(errorHandler.handlerPassportAndToken);

module.exports = app => {
  app.use("/watchlist", passport.authenticate, router);
};

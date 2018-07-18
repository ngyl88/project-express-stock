const express = require("express");

const passport = require("../config/passport");
const { handler401, handlerWatchList, handlerSuperAuthorization } = require("../middleware/error");

const { checkSuperAuthorization } = require('../helpers/authorization');
const watchlistHelper = require('../helpers/watchlist');

const errors = require("../config/errors");

const WatchList = require("../models/watchlist");

const router = express.Router();
router.use(express.json());

router.get("/", async (req, res, next) => {
  try {
    if (req.query.admin === "true") {
      checkSuperAuthorization(req.user.username, 'view the list of watchlist');

      const watchlist = await WatchList.find();
      res.json({
        message: "All watchlists are retrieved successfully",
        watchlist
      });
      return;
    }

    const watchlist = await WatchList.findByUser(req.user._id);
    res.json({
      message: `Watchlist for ${req.user.username} retrieved successfully`,
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

    const duplicateTickers = await watchlistHelper.checkDuplicateTickers(tickers, user._id);
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
  
});

router.use(handlerSuperAuthorization);
router.use(handlerWatchList);
router.use(handler401);

module.exports = app => {
  app.use("/watchlist", passport.authenticate, router);
};

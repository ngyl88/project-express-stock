const express = require("express");

const passport = require("../config/passport");
const errorHandler = require("../middleware/errorHandler");

const watchlistMiddleware = require("../middleware/watchlist");
const watchlistService = require("../middleware/watchlistService");

const router = express.Router();
router.use(express.json());

router.get("/", watchlistService.getWatchList);

router.post("/", watchlistService.addWatchlist);

router.put(
  "/:id/:ticker",
  watchlistMiddleware.authenticate,
  watchlistService.updateWatchlist
);

router.delete(
  "/:id",
  watchlistMiddleware.authenticate,
  watchlistService.deleteWatchlist
);

router.use(errorHandler.handlerWatchList);
router.use(errorHandler.handlerMongooseError);
router.use(errorHandler.handlerTokenMismatch);
router.use(errorHandler.handlerSuperAuthorization);

module.exports = app => {
  app.use("/watchlist", passport.authenticate, router);
};

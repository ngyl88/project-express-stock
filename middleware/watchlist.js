const authorizationHelper = require("../helpers/authorization");

const WatchList = require("../models/watchlist");

const authenticate = async (req, res, next) => {
  try {
    const watchlistId = req.params.id;

    const watchlist = await WatchList.findById(watchlistId).populate("user");
    if (watchlist === null) next();

    if (authorizationHelper.checkMatchingUsers(watchlist.user, req.user)) {
      req.watchlist = watchlist;
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
    authenticate
};
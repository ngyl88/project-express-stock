const externalHelper = require("../helpers/external");

const queryAlphaVantage = async (req, res, next) => {
  try {
    const result = await externalHelper.queryAlphaVantage(req.query.symbol);
    res.json({
      message: `Watchlist retrieved successfully for ${req.query.symbol}`,
      result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  queryAlphaVantage,
};

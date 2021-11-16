const express = require("express");

const cors = require('cors');
const corsOptions = {
  origin: [process.env.REACT_STOCK_APP_FRONTEND_URL],
  preflightContinue: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const externalService = require("../middleware/externalService");

const router = express.Router();
router.use(cors())
router.use(express.json());

router.get("/", cors(corsOptions), externalService.queryAlphaVantage);

module.exports = app => {
  app.use("/wrapper", externalService.queryAlphaVantage);
};

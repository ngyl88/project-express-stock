const express = require("express");

const externalService = require("../middleware/externalService");

const router = express.Router();
router.use(express.json());

router.get("/", externalService.queryAlphaVantage);

module.exports = app => {
  app.use("/wrapper", externalService.queryAlphaVantage);
};

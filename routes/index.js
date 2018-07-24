const express = require("express");

const { handlerMongooseError } = require("../middleware/errorHandler");
const indexService = require("../middleware/indexService");

const router = express.Router();
router.use(express.json());

router.get("/", (req, res, next) => {
  res.json({ message: "Hello from Stock API!" });
});

router.post("/signup", indexService.signup);

router.post("/signin", indexService.signin);

router.use(handlerMongooseError);

module.exports = app => app.use("/", router);

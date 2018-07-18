const express = require("express");

const passport = require("../config/passport");
const { handlerPassportAndToken, handlerSuperAuthorization } = require("../middleware/errorHandler");

const { checkSuperAuthorization } = require('../helpers/authorization');

const router = express.Router();

const User = require("../models/user");

router.get("/", async (req, res, next) => {
  try {
    checkSuperAuthorization(req.user.username, 'view the list of users');
    const users = await User.find();
    res.json({
      message: "List of users retrieved successfully",
      users
    });
  } catch (err) {
    next(err);
  }
});

router.use(handlerSuperAuthorization);
router.use(handlerPassportAndToken);

module.exports = app => {
  app.use("/users", passport.authenticate, router);
};

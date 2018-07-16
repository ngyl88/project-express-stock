const express = require("express");
const router = express.Router();

const User = require("../models/user");

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      message: "List of users retrieved successfully",
      users
    });
  } catch (err) {
    next(err);
  }
});

module.exports = app => {
  app.use("/users", router);
};

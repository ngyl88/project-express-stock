const express = require("express");

const jwt = require("jsonwebtoken");
const { jwtOptions } = require("../config/passport");

const { handlerSchemaValidationError, handlerPassportAndToken } = require("../middleware/errorHandler");

const User = require("../models/user");

const router = express.Router();
router.use(express.json());

router.get("/", (req, res, next) => {
  res.json({ message: "Hello from Stock API!" });
});

router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  const user = new User({ username });
  user.setPassword(password);

  try {
    await user.save();
    res.json({ message: `Account created for username ${username}` });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      res.status(401).json({ message: "no such user found" });
      return;
    }

    if (user.isValidPassword(password)) {
      const userId = { id: user.id };

      const signOptions = { expiresIn: "30m" };
      const token = jwt.sign(userId, jwtOptions.secretOrKey, signOptions);
      res.json({ message: "signin ok", token: token });
    } else {
      res.status(401).json({ message: "passwords did not match" });
    }
  } catch (err) {
    next(err);
  }
});

router.use(handlerSchemaValidationError);
router.use(handlerPassportAndToken);

module.exports = app => app.use("/", router);

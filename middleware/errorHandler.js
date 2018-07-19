const errors = require('../config/errors');

const mongoose = require("mongoose");
const { CastError, ValidationError } = mongoose.Error;

handlerWatchList = (err, req, res, next) => {
  if(err.name === errors.ExistingWatchList) {
    res.status(400).json({ message: err.message });
    return;
  }
  if(err.name === errors.APIConnectionIssue) {
    res.status(503).json({ message: err.message });
    return;
  }
  next(err);
};

handlerMongooseError = (err, req, res, next) => {
  if (err instanceof CastError) {
    res.status(400).json({ message: "Object ID not found" });
  } else if (err instanceof ValidationError) {
    res.status(400).json(err.message);
  } else {
    next(err);
  }
};

handlerPassport = (err, req, res, next) => {
  if (err.name === errors.PassportAuthenticationError) {
    if (err.message === "TokenExpiredError") {
      res.status(401).json({
        message: "Token expired. Please sign in again"
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    next(err);
  }
};

handlerTokenMismatch = (err, req, res, next) => {
  if (err.name === errors.TokenMismatch) {
    res.status(401).json({ message: err.message });
  } else {
    next(err);
  }
};

handlerSuperAuthorization = (err, req, res, next) => {
  if(err.name === errors.UnauthorizedSuperRequest) {
    res.status(403).json({ message: err.message });
    return;
  }
  next(err);
};

handler500 = (err, req, res, next) => {
  console.error(err);
  res.status(500).json("Oops! Something went wrong. Please try again later!");
};

handler404 = (req, res, next) => {
  res.status(404).json("Not Found.");
};

module.exports = {
  handlerMongooseError,
  handlerPassport,
  handlerSuperAuthorization,
  handler404,
  handler500,
  handlerWatchList,
  handlerTokenMismatch
};

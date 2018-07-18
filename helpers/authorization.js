const errors = require("../config/errors");

const checkSuperAuthorization = (username, actionDescription) => {
  if (username !== "super") {
    console.log(`username authorization failed for super access: ${username} attempting ${actionDescription}`);
    const e = new Error(`Not authorized to ${actionDescription}`);
    e.name = errors.UnauthorizedSuperRequest;
    throw e;
  }
  return true;
};

const checkMatchingUsers = (user1, user2) => {
  if (user1._id.toJSON() !== user2._id.toJSON()) {
    const e = new Error("Ticker not deleted");
    e.name = errors.TokenMismatch;
    throw e;
  }
  return true;
};

module.exports = {
  checkSuperAuthorization,
  checkMatchingUsers
};

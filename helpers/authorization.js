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

module.exports = {
  checkSuperAuthorization
};

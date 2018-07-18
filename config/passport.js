require("dotenv").config();

const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const PassportAuthenticationError = require('./errors').PassportAuthenticationError;

const User = require("../models/user");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

const verify = async (jwt_payload, done) => {
  const user = await User.findOne({ _id: jwt_payload.id });
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, verify);

passport.use(jwtStrategy);

// REF: https://jonathas.com/token-based-authentication-in-nodejs-with-passport-jwt-and-bcrypt/
const authenticate = (req, res, next) => passport.authenticate("jwt", { session: false },
(err, user, info) => {
  if (err) return next(err);
  if (!user) {
    console.info(`Authentication: ${info.name}: ${info.message}`);
    const e = new Error(info.name === "Error" ? info.message : info.name);
    e.name = PassportAuthenticationError
    throw e;
  }
  req.user = user;
  return next();
}
)(req, res, next);

module.exports = {
  jwtOptions,
  authenticate
};

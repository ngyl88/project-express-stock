const mongoose = require("mongoose");

const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      uniqueCaseInsensitive: true,
      required: [true, "cannot be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      lowercase: true
    },
    hash: String,
    salt: String
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, { message: "{VALUE} already exists. Please choose another username" });

if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret.hash;
  delete ret.salt;
  return ret;
}

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.setPassword = function(password) {
  this.salt = generateSalt();
  this.hash = hashPassword(password, this.salt);
};

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.isValidPassword = function(password) {
  return this.hash === hashPassword(password, this.salt);
};

const generateSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

const hashPassword = (password, salt) => {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
};

module.exports = mongoose.model("User", userSchema);

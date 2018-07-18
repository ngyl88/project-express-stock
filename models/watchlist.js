const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = require("./user");

const schema = Schema(
  {
    ticker: {
      type: String,
      required: [true, "cannot be blank"],
      match: [/[\S]*/, "ticker {VALUE} is invalid"],
      lowercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "cannot be blank"],
      validate: {
        validator: function(userId) {
          return User.findById(userId);
        },
        message: "not a valid user"
      }
    },
    created: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// STATIC METHODS on SCHEMA
schema.statics.findByUser = async function(userId) {
  const raw = await this.find({ user: userId });
  return raw.map(each => {
    return {
      id: each._id,
      ticker: each.ticker,
      created: each.created
    };
  });
};
schema.statics.findTickersByUser = async function(userId) {
  const watchlists = await this.find({ user: userId });
  return watchlists.map(watchlist => watchlist.ticker);
};

module.exports = mongoose.model("WatchList", schema);

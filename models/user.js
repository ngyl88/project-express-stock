const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'cannot be blank'],
        match: [/^[a-zA-Z0-9]+$/, "is invalid"]
    },
    hash: String,
    salt: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
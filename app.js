const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const passport = require("./config/passport");

const error = require("./middleware/error");

const logger = require("morgan");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", error =>
  console.error("An error occured in DB connection!", error)
);

const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");

const app = express();
app.use(logger("dev"));
// app.use(passport.initialize());

var swaggerOptions = { explorer: false };
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions)
);

app.use("/secret", passport.authenticate,
  (req, res, next) => {
    res.json("You see the secret");
  }
);

indexRouter(app);
userRouter(app);

app.use(error.handler401);
app.use(error.handler500);

app.use(error.handler404);

module.exports = app;

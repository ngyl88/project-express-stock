const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const passport = require("./config/passport");

const errorHandler = require("./middleware/errorHandler");

const logger = require("morgan");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", error =>
  console.error("An error occured in DB connection!", error)
);

const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");
const watchlistRouter = require("./routes/watchlists");

const app = express();
app.use(logger("dev"));

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
watchlistRouter(app);

app.use(errorHandler.handlerPassport);
app.use(errorHandler.handler500, errorHandler.handler404);

module.exports = app;

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const passport = require("./config/passport");

const errorHandler = require("./middleware/errorHandler");

const logger = require("morgan");

const mongoose = require("mongoose");
if (process.env.NODE_ENV != "test") {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log('DB connected!'))
    .catch((err) => console.error('DB not connected :(', err));
}

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

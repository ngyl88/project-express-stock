const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const mongoose = require('mongoose');

// const connectionOptions = {
//   useNewUrlParser: true
// };
// mongoose.connect(process.env.MONGODB_URI, connectionOptions);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/express-stock-prices');

const db = mongoose.connection;
db.on("error", error =>
  console.error("An error occured in DB connection!", error)
);

const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");

const app = express();

var swaggerOptions = { explorer: true };
app.use(
  "/api-docs",
  swaggerUi.serve,
  // swaggerUi.setup(swaggerDocument)
  swaggerUi.setup(swaggerDocument, swaggerOptions)
);

indexRouter(app);
userRouter(app);

module.exports = app;

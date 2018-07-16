const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const indexRouter = require("./routes/index");

const app = express();

// var swaggerOptions = { explorer: true };
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
//   swaggerUi.setup(swaggerDocument, swaggerOptions)
);

app.use("/", indexRouter);

module.exports = app;

import express from "express";
require("dotenv").config();
import { sequelize } from "./sequelize";

import { IndexRouter } from "./controllers/v0/index.router";

import bodyParser from "body-parser";

import { V0MODELS } from "./controllers/v0/model.index";

(async () => {
  // adding the models specified in model.index
  await sequelize.addModels(V0MODELS);
  // making the connection between our server and our data base
  // it also makes sure that our database is in sync with our models we have
  // if sequelize and our data store are not allignd we will have issuse
  // it will do that by checking the migration file wich will hve the latest form of data
  await sequelize.sync();

  const app = express();
  const port = process.env.PORT || 8080; // default port to listen

  app.use(bodyParser.json());

  //CORS Should be restricted
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  app.use("/api/v0/", IndexRouter);

  // Root URI call
  app.get("/", async (req, res) => {
    res.send("/api/v0/");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();

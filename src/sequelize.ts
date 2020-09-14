import { Sequelize } from "sequelize-typescript";
import { config } from "./config/config";

// sequelize is a library for handling and connecting SQL data to the server
// we can fully manage our SQL database, like creating the tables by creating models for the tables
// updating and deleting data
// it is like mongees library for mongo db

const c = config.postgtress;

// Instantiate new Sequelize instance!
// this will iniate the connection between sequelize and our database
export const sequelize = new Sequelize({
  username: c.username,
  password: c.password,
  database: c.database,
  host: c.host,

  dialect: "postgres",
  storage: ":memory:"
});

const dotenv = require("dotenv");
const mysql = require("mysql2");

require("dotenv").config();

// configraration with env.
dotenv.config();
// on GCP use sqluser

const client = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

client.connect(function (err) {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
    return;
  }

  console.log("Connected to database as ID " + client.threadId);
});

function runSqlCommand(query) {
  return new Promise((resolve, reject) => {
    client.query(query, function (error, results, fields) {
      if (error) {
        console.log("query", query);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = { client, runSqlCommand };

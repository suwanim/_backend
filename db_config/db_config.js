const dotenv = require("dotenv");
// const mysql = require("mysql2");
const mysql = require("mysql2/promise");

require("dotenv").config();

// configraration with env.
dotenv.config();
// on GCP use sqluser

// const client = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// client.connect(function (err) {
//   if (err) {
//     console.error("Error connecting to database: " + err.stack);
//     return;
//   }

//   console.log("Connected to database as ID " + client.threadId);
// });

// function runSqlCommand(query) {
//   return new Promise((resolve, reject) => {
//     client.query(query, function (error, results, fields) {
//       if (error) {
//         console.log("query", query);
//         reject(error);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// }

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

async function runSqlCommand(sql) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows, fields] = await connection.query(sql);
    connection.end();

    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { runSqlCommand };

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

async function runSqlCommand_2Params(sql, params) {
  try {
    const data = ["testt", "sk-t4562"];
    const sql = "SELECT * FROM tb_marketing_cross_ref_relationship WHERE customer_item_code IN (?)";
    const params = [data];

    console.log("params", params);


    const values = data;
    const _sql = `SELECT * FROM tb_marketing_cross_ref_relationship WHERE customer_item_code IN (${values
      .map((v) => `'${v}'`)
      .join(",")})`;


    // const data = [params];
    console.log(data);
    const connection = await mysql.createConnection(dbConfig);
    const [rows, fields] = await connection.execute(_sql);
    connection.end();




    console.log("rows", rows);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { runSqlCommand, runSqlCommand_2Params };

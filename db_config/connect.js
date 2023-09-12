// const Client = require("ssh2").Client;
// const mysql = require("mysql2");

// const dotenv = require("dotenv");

// require("dotenv").config();
// dotenv.config();

// const sshClient = new Client();
// sshClient.on("ready", function () {
//   console.log("SSH connection established");
//   sshClient.forwardOut(
//     "127.0.0.1",
//     3306,
//     process.env.SSH_HOST,
//     3306,
//     function (err, stream) {
//       if (err) throw err;
//       const connection = mysql.createConnection({
//         host: process.env.DB_RDS_ENDPOINT,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASS,
//         database: process.env.DB_NAME,
//         port: process.env.DB_PORT,
//         stream: stream,
//       });
//       connection.query(
//         "SELECT * FROM tb_name",
//         function (error, results, fields) {
//           if (error) throw error;
//           console.log(results);
//           connection.end();
//         }
//       );
//     }
//   );
// });


// sshClient.connect({
//   host: process.env.SSH_HOST,
//   port: 22,
//   username: process.env.SSH_USER,
//   privateKey: require("fs").readFileSync("C:/privatekey/nst-key-ec2-1.ppk"),
// });



// const mysql = require("mysql");
// const { Client } = require("ssh2");
// const { Transform } = require("stream");

// const dotenv = require("dotenv");
// require("dotenv").config();
// dotenv.config();

// const ssh_config = {
//   host: "54.169.89.9",
//   port: 22,
//   username: "ubuntu",
//   privateKey: require("fs").readFileSync("C:/privatekey/nst-key-ec2-1.pem"),
// };

// const mysql_config = {
//   user: "nst_root",
//   password: "nst2023",
//   database: "nst_customer_db",
//   host: "nstdb.chu6y9fmrps6.ap-southeast-1.rds.amazonaws.com",
//   port: 3306,
// };

// // Add this line before sshClient definition
// let mysqlConnection;

// const sshClient = new Client();

// sshClient
//   .on("ready", function () {
//     console.log("connected");
//     sshClient.forwardOut(
//       "127.0.0.1",
//       12345, // Local port
//       mysql_config.host,
//       mysql_config.port,
//       (err, stream) => {
//         if (err) throw err;

//         // Apply the stream to the MySQL connection config
//         mysql_config.stream = stream;

//         console.log("config", mysql_config);
//         const mysqlConnection = mysql.createConnection(mysql_config);

//         mysqlConnection.connect((err) => {
//           if (err) {
//             console.error("Error connecting to MySQL:", err.stack);
//             return;
//           }

//           console.log("Connected to MySQL as ID:", mysqlConnection.threadId);

//           // Your MySQL queries go here
//           // mysqlConnection.query(
//           //   "SELECT * FROM tb_users",
//           //   (err, results, fields) => {
//           //     if (err) throw err;
//           //     console.log("Results:", results);
//           //     mysqlConnection.end();
//           //     sshClient.end();
//           //   }
//           // );
//         });
//       }
//     );

//     // sshClient.forwardOut(
//     //   "127.0.0.1",
//     //   12345, // Local port
//     //   mysql_config.host,
//     //   mysql_config.port,
//     //   (err, stream) => {
//     //     if (err) throw err;
//     //     console.log("connected");
//     //     // // Apply the stream to the MySQL connection config
//     //     // mysql_config.stream = stream;

//     //     // // Replace the following line inside the forwardOut callback
//     //     // mysqlConnection = mysql.createConnection(mysql_config);

//     //     // mysqlConnection.connect((err) => {
//     //     //   if (err) {
//     //     //     console.error("Error connecting to MySQL:", err.stack);
//     //     //     return;
//     //     //   }

//     //     //   console.log("Connected to MySQL as ID:", mysqlConnection.threadId);

//     //     //   // Use the runSqlCommand function to execute your SQL query
//     //     //   runSqlCommand("SELECT * FROM tb_users")
//     //     //     .then((results) => {
//     //     //       console.log("Results:", results);
//     //     //       mysqlConnection.end();
//     //     //       sshClient.end();
//     //     //     })
//     //     //     .catch((error) => {
//     //     //       console.error("Error executing SQL query:", error);
//     //     //     });
//     //     // });
//     //   }
//     // );
//   })
//   .connect(ssh_config);

// function runSqlCommand(query) {
//   return new Promise((resolve, reject) => {
//     if (!mysqlConnection) {
//       reject(new Error("MySQL connection not established"));
//       return;
//     }

//     mysqlConnection.query(query, function (error, results, fields) {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// }

// module.exports = { runSqlCommand };

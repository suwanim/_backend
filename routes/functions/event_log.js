const db = require("../../db_config/db_config");
require("dotenv").config();

async function eventLog(params) {
  //   const _data = ({ event_log } = params);
  //console.log("_req_data", _req_data);

  //   console.log("params", params)
  //   const _query = {
  //     sql: "INSERT INTO tb_event_log (event_log) VALUES ('" + params + "')",
  //     values: [params],
  //   };

  console.log(
    "q",
    "INSERT INTO tb_event_log (event_log) VALUES ('" + params + "')"
  );


  const _result = await db.log_cmd(
    "INSERT INTO tb_event_log (event_log) VALUES ('" + params + "')"
  );
  console.log(_result.affectedRows);
}

module.exports = eventLog;

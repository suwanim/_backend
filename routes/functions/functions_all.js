const moment = require("moment")
const db = require("../../db_config/db_config")
const { v4: uuidv4 } = require("uuid")
const uuid = uuidv4()

// ใช้ ตรวจสอบ รหัสจำพวก code
// at_module = มาจากไหน
// ค่าที่ต้องการตรวจสอบ
// จากนั้น return json

async function checkCode(at_module, value) {
  let _data
  let _query = ""
  let _res = []
  let _status_check = false

  switch (at_module) {
    case "item":
      let _item_code = value.length > 0 ? value : value[0]

      _query = "SELECT id FROM tb_items WHERE item_code = '" + _item_code + "'"
      _res = await db.runSqlCommand(_query)
      _res.length > 0 ? (_status_check = true) : (_status_check = false)
      _data = JSON.stringify({ status: _status_check, data: [] })

      console.log("item length", _res.length, _query)

      break

    case "customer":
      let _cus_code = value.length > 0 ? value : value[0]
      _query =
        "SELECT id, cus_code FROM `tb_customer_info` WHERE cus_code = '" +
        _cus_code +
        "'"
      _res = await db.runSqlCommand(_query)

      let _cuscode
      let _run

      if (_res.length > 0) {
        _cuscode = _res[0].cus_code
        _run = _cuscode.substring(2, 7)
        _status_check = true
      } else {
        _run = "000000"
        _status_check = false
      }

      _data = JSON.stringify({ status: _status_check, data: _run })

      break

    default:
      break
  }

  return _data
}

async function insertTable(tb_name, data) {
  const _tableName = tb_name

  console.log("insertTable", data, Array.isArray(data))

  let _insertQuery = `INSERT INTO ${_tableName} `

  if (Array.isArray(data)) {
    // multiple row insert
    const _columns = Object.keys(data[0]) // get an array of keys from the first object in the data array

    // dynamically build the column names
    _insertQuery += `(${_columns.join(", ")}) VALUES `
    console.log("_insertQuery", _insertQuery, _columns)

    // dynamically build the values for each row
    for (let i = 0; i < data.length; i++) {
      const _values = Object.values(data[i])
      _insertQuery += `(${_values.map((v) => `'${v}'`).join(", ")})`

      if (i < data.length - 1) {
        _insertQuery += ", " // add a comma separator between each row
      }
    }
  } else {
    // single row insert
    const _columns = Object.keys(data) // get an array of keys from the data object
    const _values = Object.values(data) // get an array of values from the data object

    // dynamically build the column names
    _insertQuery += `(${_columns.join(", ")}) VALUES `

    // dynamically build the values for the single row
    _insertQuery += `(${_values.map((v) => `'${v}'`).join(", ")})`

    console.log("_insertQuery", _insertQuery)

  }

  _res = await db.runSqlCommand(_insertQuery)
  return _res
}

async function updateTable(tb_name, pk_name, data, id_value) {
  const _tableName = tb_name
  const _primaryKey = pk_name // assuming your primary key column is named 'id'
  const _id = id_value // assuming you're updating a specific row by ID

  const _columns = Object.keys(data) // get an array of keys from the req.body object
  const _values = Object.values(data) // get an array of values from the req.body object

  let _updateQuery = `UPDATE ${_tableName} SET `
  for (let i = 0; i < _columns.length; i++) {
    // use template literals and string concatenation to dynamically build the SET clause
    _updateQuery += `${_columns[i]} = '${_values[i]}'`
    if (i < _columns.length - 1) {
      _updateQuery += ", " // add a comma separator between each column/value pair
    }
  }

  // add the WHERE clause to update only the row with the specified primary key
  _updateQuery += ` WHERE ${_primaryKey} = ${_id}`
  _res = await db.runSqlCommand(_updateQuery)
  return _res
}

// เรียกใช้เพื่อสร้าง item ใหม่ base_code = type ของ items ที่จะสร้าง
async function genItemCode(base_code, number, item_code, module) {
  const _getYear = moment().format("YYYY")
  let _year = _getYear

  parseInt(_getYear) > 2500
    ? (_year = _getYear)
    : (_year = parseInt(_getYear) - 543)

  switch (module) {
    case "items":
      //   const _get_last_run =
      //     "SELECT * FROM tb_master_item_running WHERE `year` = '" +
      //     _year +
      //     "' and main_type = '" +
      //     base_code +
      //     "' and at_module = 'items'";

      //   let _lastrun = await db.runSqlCommand(_get_last_run);
      //   let _new_code;

      //   if (_lastrun && _lastrun.length > 0) {
      //     let _running;

      //     _running += 1;
      //     _new_code = number + item_code +
      //     let _sql = "UPDATE FROM tb_master_item_running SET running = 0";
      //     console.log("sss");
      //   } else {
      //     let _sql =
      //       "INSERT INTO tb_master_item_running (`year`, main_type, at_module, running) VALUES ('" +
      //       _year +
      //       "','" +
      //       base_code +
      //       "','items',0)";
      //     console.log("_sql", _sql);
      //   }
      break

    default:
      break
  }
}

//get ตารางเดียว
async function getTable(sql) {
  const _result = await db.runSqlCommand(sql)

  let _data = []
  if (_result) {
    _data = _result
  } else {
    _data = [{}]
  }

  return _data
}

//get ตาราง
async function getTables(tableName, sql) {
  const _result = await db.runSqlCommand(sql)

  let _data = []
  if (_result) {
    _data = [tableName, _result]
  } else {
    _data = [tableName, [{}]]
  }

  return _data
}

function setLog(module, event, result, data) {
  let _log
  _log = {
    uid: uuid,
    module: module,
    event: event,
    data: data,
    result: result,
  }

  //console.log('set log', JSON.stringify(_log))
  return JSON.stringify(_log)
}

function genUUID() {
  const _uid = uuidv4()

  return _uid
}

module.exports = {
  genItemCode,
  setLog,
  checkCode,
  insertTable,
  updateTable,
  getTable,
  getTables,
  genUUID,
}

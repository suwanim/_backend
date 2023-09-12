const express = require("express")
const router = express.Router()

const moment = require("moment")
const { v4: uuidv4 } = require("uuid")
const uuid = uuidv4()

const authen = require("../../functions/check_authen")
const eventlog = require("../../functions/event_log")
const db = require("../../../db_config/db_config")
const funcs = require("../../functions/functions_all")
const { json } = require("body-parser")

router.get("/", authen, async (req, res, next) => {
  res.send("OK")
})

router.get("/loaditems", authen, async (req, res, next) => {
  try {
    const _data = req.body
    let _result

    _result = await getItemsInfo(_data)

    res.send(_result).status(200)
  } catch (error) {
    console.log("error", error)
    res.send(error).status(400)
  }
})

router.get("/forecastdata/:opt/:value", authen, async (req, res, next) => {
  try {
    const _opt = req.params.opt
    const _value = req.params.value

    let _get_sql
    let _result

    switch (_opt) {
      case "all":
        _get_sql = "SELECT * FROM tb_marketing_forecast"
        break
      case "by_cuscode":
        _get_sql =
          "SELECT * FROM tb_marketing_forecast WHERE customer_code = '" +
          _value +
          "'"
        break
      case "by_month":
        _get_sql =
          "SELECT * FROM tb_marketing_forecast WHERE monthly = '" + _value + "'"
        break
      case "by_items":
        _get_sql =
          "SELECT * FROM tb_marketing_forecast WHERE customer_item_code = '" +
          _value +
          "'"
        break
      case "by_ciym":
        _get_sql =
          "SELECT * FROM tb_marketing_forecast WHERE customer_code = '' and customer_item_code = '" +
          _value +
          "' and year = '' and monthly = ''"
        break
      default:
        _get_sql = "SELECT * FROM tb_marketing_forecast"
        break
    }

    _result = await db.runSqlCommand(_get_sql)
    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }

    res.send(_result).status(200)
  } catch (error) {
    console.log("error", error)
    res.send(error).status(400)
  }
})

router.get(
  "/forecast4data/:cuscode/:cusitemcode/:year/:month",
  authen,
  async (req, res, next) => {
    try {
      const _cuscode = req.params.cuscode
      const _cusitemcode = req.params.cusitemcode
      const _year = req.params.year
      const _month = req.params.month

      let _result

      const _get_sql =
        "SELECT * FROM tb_marketing_forecast WHERE customer_code = '" +
        _cuscode +
        "' and customer_item_code = '" +
        _cusitemcode +
        "' and year = '" +
        _year +
        "' and monthly = '" +
        _month +
        "'"

      _result = await db.runSqlCommand(_get_sql)
      let _data = []
      if (_result) {
        _data = JSON.stringify(_result)
      } else {
        _data = [{}]
      }

      res.send(_result).status(200)
    } catch (error) {
      console.log("error", error)
      res.send(error).status(400)
    }
  }
)

router.post("/", authen, async (req, res, next) => {
  try {
    const _tableName = "tb_marketing_forecast"
    const _data = req.body

    console.log("body", _data)

    const _result = await funcs.insertTable(_tableName, _data)
    let _status = "Error"

    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    console.log("error", error)
    res.send(error).status(400)
  }
})

router.put("/:id", authen, async function (req, res, next) {
  try {
    // console.log("PUT permissions");
    //set params from frontend
    const _tableName = "tb_marketing_forecast" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value
    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)
    //check status
    let _status = "Error"

    console.log("_result", _result)
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

// router.get("/loaditems/:opt", authen, async (req, res, next) => {
//   try {
//     // ดึงข้อมูล item จาก relations ด้วย item code ของลูกค้า
//     const _opt = req.params.opt;
//     const _data = req.body;

//     const _result = await getItemsInfo(_data);

//     res.send(_result).status(200);
//   } catch (error) {
//     console.log("error", error);
//     res.send(error).status(400);
//   }
// });

// ดึงข้อมูลจากตาราง relationship โดยใช้ รหัส item ของลูกค้า

async function getItemsInfo(itemdata, customer) {
  try {
    // const _array = itemdata.customer_item_code;
    const _array = itemdata.map((item) => item.customer_item_code)
    let _sql = `SELECT id, item_code, item_name, customer_code, customer_item_code FROM tb_marketing_cross_ref_relationship WHERE customer_item_code IN (${_array
      .map((v) => `'${v}'`)
      .join(",")})`

    const _result = await db.runSqlCommand(_sql)

    return _result
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = router

const express = require("express")
const router = express.Router()

const moment = require("moment")
const { v4: uuidv4 } = require("uuid")
const uuid = uuidv4()

const authen = require("../../functions/check_authen")
const eventlog = require("../../functions/event_log")
const db = require("../../../db_config/db_config")
const funcs = require("../../functions/functions_all")

const genCoNumber = async () => {
  const _get_sql = "SELECT co_num FROM tb_marketing_co ORDER BY id DESC LIMIT 1"
  const _last_id = await funcs.getTable(_get_sql)

  console.log("_last_id", _last_id)

  return _last_id
}

router.get("/newco", authen, async function (req, res, next) {
  try {
    const _getCo = await genCoNumber()
    const _newCoNumber = parseInt(_getCo[0].co_num) + 1

    res.send({ co_id: _newCoNumber }).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})

router.get(
  "/co/:opt/:conum/:cuscode/:cusgroup",
  authen,
  async function (req, res, next) {
    try {
      const _tableName = "vw_marketing_co"
      const _opt = req.params.opt
      const _conum = req.params.conum
      const _cuscode = req.params.cuscode
      const _cusgroup = req.params.cusgroup

      // case by_codate, by_cusdate only
      const _date1 = req.params.cuscode
      const _date2 = req.params.cusgroup

      let _get_sql = ""

      switch (_opt) {
        case "all":
          _get_sql = "SELECT * FROM " + _tableName
          break
        case "by_conum":
          _get_sql =
            "SELECT * FROM " + _tableName + " WHERE co_num = '" + _conum + "'"
          break
        case "by_cuscode":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE cus_code = '" +
            _cuscode +
            "'"
          break
        case "by_cusgroup":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE cus_group_code = '" +
            _cusgroup +
            "'"
          break
        case "by_codate":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE co_num = '" +
            _conum +
            "' AND "
          "SELECT * FROM " +
            _tableName +
            " where co_num = = '" +
            _conum +
            "' AND (created >= '" +
            _date1 +
            "' OR created <= '" +
            _date2 +
            "')"
          break
        case "by_cusdate":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE co_num = '" +
            _conum +
            "' AND "
          "SELECT * FROM " +
            _tableName +
            " where cus_code = = '" +
            _cuscode +
            "' AND (created >= '" +
            _date1 +
            "' OR created <= '" +
            _date2 +
            "')"
          break

        default:
          _get_sql = "SELECT * FROM " + _tableName
          break
      }

      // const _get_sql = "SELECT * FROM tb_master_acc_type";
      const _result = await db.runSqlCommand(_get_sql)
      // console.log("_result", _result);
      let _data = []
      if (_result) {
        _data = JSON.stringify(_result)
      } else {
        _data = [{}]
      }
      return res.send(_data).status(200)
    } catch (error) {
      console.log(error)
      return res.send("error").status(400)
    }
  }
)

router.post("/co", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_marketing_co" // tabel name in database
    const _data = req.body // data from frontend
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
    return res.send(_status).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})


router.get(
  "/store/:opt/:conumstart/:conumend/:colinestart/:colineend/:cuscode/",
  authen,
  async function (req, res, next) {
    try {
      const _tableName = "tb_marketing_co_store"
      const _opt = req.params.opt
      const _conumstart = req.params.conumstart
      const _conumend = req.params.conumend
      const _colinestart = parseInt(req.params.colinestart)
      const _colineend = parseInt(req.params.colineend)
      const _cuscode = req.params.cuscode

      // case by_codate, by_cusdate only
      // const _date1 = req.params.cuscode
      // const _date2 = req.params.cusgroup

      let _get_sql = ""

      switch (_opt) {
        case "all":
          _get_sql = "SELECT * FROM " + _tableName + " WHERE status_genPO = 'add'" 
          
          break
       
        case "by_cuscode":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE cus_code = '" +
            _cuscode +
            "'"
          break
      
        case "open_invoice":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE co_num >= '" +
            _conumstart +
            "' AND co_num <= '" +
            _conumend +
          "' AND co_line_index >=  '" +
          _colinestart +
          "' AND co_line_index <=  '" +
          _colineend +
          // "' AND cus_code =  '" +
          // _cuscode +
          "'"
          break
        case "by_cusdate":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE co_num = '" +
            _conum +
            "' AND "
          "SELECT * FROM " +
            _tableName +
            " where cus_code = = '" +
            _cuscode +
            "' AND (created >= '" +
            _date1 +
            "' OR created <= '" +
            _date2 +
            "')"
          break

        default:
          _get_sql = "SELECT * FROM " + _tableName
          break
      }
       console.log("_get_sql", _get_sql);
     // const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql)
      console.log("_result", _result);
      let _data = []
      if (_result) {
        _data = JSON.stringify(_result)
      } else {
        _data = [{}]
      }
      return res.send(_data).status(200)
    } catch (error) {
      console.log(error)
      return res.send("error").status(400)
    }
  }
)









router.put("/co/:id", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_marketing_co" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value
    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
    return res.send(_status).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})

// CO LINE
router.post("/coline", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_marketing_co_line" // tabel name in database
    const _data = req.body // data from frontend
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
    return res.send(_status).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})

// CO LINE
router.post("/store", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_marketing_co_store" // tabel name in database
    const _data = req.body // data from frontend
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
    return res.send(_status).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})


router.put("/coline/:id", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_marketing_co_line" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value

    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
    return res.send(_status).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})

router.get(
  "/coline/:opt/:conum/:itemcode",
  authen,
  async function (req, res, next) {
    try {
      const _tableName = "tb_marketing_co_line"
      const _opt = req.params.opt
      const _conum = req.params.conum
      const _itemcode = req.params.itemcode

      let _get_sql = ""

      switch (_opt) {
        case "by_conum":
          _get_sql =
            "SELECT * FROM " + _tableName + " WHERE co_num = '" + _conum + "'"
          break
        case "by_itemcode":
          _get_sql =
            "SELECT * FROM " +
            _tableName +
            " WHERE part_num = '" +
            _itemcode +
            "'"
          break

        default:
          _get_sql = "SELECT * FROM " + _tableName
          break
      }

      // const _get_sql = "SELECT * FROM tb_master_acc_type";
      const _result = await db.runSqlCommand(_get_sql)
      // console.log("_result", _result);
      let _data = []
      if (_result) {
        _data = JSON.stringify(_result)
      } else {
        _data = [{}]
      }
      return res.send(_data).status(200)
    } catch (error) {
      console.log(error)
      return res.send("error").status(400)
    }
  }
)

module.exports = router

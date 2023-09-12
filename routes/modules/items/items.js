const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const moment = require("moment")

const { v4: uuidv4 } = require("uuid")
//test dfsgdd

// Generate a random UUID
const uuid = uuidv4()

const authen = require("../../functions/check_authen")
const eventlog = require("../../functions/event_log")
const db = require("../../../db_config/db_config")
const funcs = require("../../functions/functions_all")

// funcs.genItemCode("ITM001", "1", "itemCode", "items");

/**
 * @swagger
 * /items/checkitemcode/{item_code}:
 *   get:
 *     summary: check item code
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: item_code
 *         schema:
 *           type: string
 *         required: true
 *         description: check duplicate item code
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return status item code
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *          description: Error
 */

router.get(
  "/checkitemcode/:item_code",
  authen,
  async function (req, res, next) {
    try {
      const _item_code = req.params.item_code
      const _checking_code = await funcs.checkCode("item", _item_code)

      if (JSON.parse(_checking_code).status) {
        res
          .send([{ status: "Error : This item code already exists." }])
          .status(500)
      } else {
        res.send([{ status: "Ok : This item is ready." }]).status(200)
      }
    } catch (error) {
      res.send(error).status(400)
    }
  }
)

/**
 * @swagger
 * /items/detail/{opt}/{id}:
 *   get:
 *     summary: get item other detail
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/byid
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: detail id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *          description: Error
 */
router.get("/detail/:opt/:item_code", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _item_code = req.params.item_code

    let _get_sql = ""

    _opt === "all"
      ? (_get_sql = "SELECT * FROM tb_items_other_detail")
      : (_get_sql =
          "SELECT * FROM tb_items_other_detail WHERE item_uuid = '" +
          _item_code +
          "'")

    const _result = await db.runSqlCommand(_get_sql)
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
      let _log = setLog("items", "get", _result, _data)
    }

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /items/control/{opt}/{id}:
 *   get:
 *     summary: get control data
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option byid/all
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: control id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return json data
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */
router.get("/control/:opt/:item_code", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _item_code = req.params.item_code

    let _get_sql = ""

    _opt === "all"
      ? (_get_sql = "SELECT * FROM vw_items_control")
      : (_get_sql =
          "SELECT * FROM vw_items_control WHERE item_uuid = '" +
          _item_code +
          "'")

    const _result = await db.runSqlCommand(_get_sql)
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
      let _log = setLog("items", "get", _result, _data)
    }

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /items/plan/{opt}/{id}:
 *   get:
 *     summary: get plan data
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option byid/all
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: control id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return json data
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */
router.get("/plan/:opt/:item_code", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _item_code = req.params.item_code

    let _get_sql = ""

    _opt === "all"
      ? (_get_sql = "SELECT * FROM tb_items_plan")
      : (_get_sql =
          "SELECT * FROM tb_items_plan WHERE item_uuid = '" + _item_code + "'")

    const _result = await db.runSqlCommand(_get_sql)
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
      let _log = setLog("items", "get", _result, _data)
    }

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /items/{opt}/{item_code}:
 *   get:
 *     summary: item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option byid/all
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: control id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return json data
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */

router.get("/:opt/:item_code", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _item_code = req.params.item_code

    let _get_sql = ""

    _opt === "all"
      ? (_get_sql = "SELECT * FROM vw_items_3tab")
      : (_get_sql =
          "SELECT * FROM vw_items_3tab WHERE item_id = '" + _item_code + "'")

    const _result = await db.runSqlCommand(_get_sql)
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
      let _log = setLog("items", "get", _result, _data)
    }
    //console.log("_get_sql", _get_sql, _data)
    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/search/:itemcode", authen, async function (req, res, next) {
  console.log('in search')
  try {
    const _item_code = req.params.itemcode
    let _get_sql =
      "SELECT id, item_code FROM tb_items WHERE item_code LIKE '%" +
      _item_code +
      "'"
    const _result = await funcs.getTable(_get_sql)

    console.log('res', _result)
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }

    //console.log("_get_sql", _get_sql, _data)
    res.send(_data).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

router.get("/byMainType", authen, async function (req, res, next) {
  //console.log("ssssssss")
  try {
    const _product_type_code = req.query.maintype
    console.log("bymain", _product_type_code)
    let _get_sql = ""

    _product_type_code === "ITM000"
      ? (_get_sql = "SELECT * FROM vw_items_3tab")
      : (_get_sql =
          "SELECT * FROM vw_items_3tab WHERE item = '" +
          _product_type_code +
          "'")

    const _result = await db.runSqlCommand(_get_sql)
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
      let _log = setLog("items", "get", _result, _data)
    }

    console.log("_get_sql", _get_sql, _data)

    res.send(_data).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
  // res.send(_product_type_code)
})

async function addItems(tbname, data) {
  const _res = await funcs.insertTable(tbname, data)

  return _res
}

//new register item
/**
 * @swagger
 * /items/items:
 *   post:
 *     summary: register item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: The account type name
 *                 example: Savings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return json data
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */

// router.post("/items", authen, async function (req, res, next) {
//   try {
//     //const id = req.params.id;
//     let _item_id, _plan_id, _control_id, _detail_id
//     const _checking_code = await funcs.checkCode("item", req.body[0].item_code)

//     if (JSON.parse(_checking_code).status) {
//       res
//         .send([{ status: "Error : This item code already exists." }])
//         .status(500)
//     } else {
//       //ประกาศตัวแปรมารับค่าจาก frontend
//       // const _data = JSON.parse(JSON.stringify(req.body));
//       const _data = req.body

//       // console.log("_data", _data);
//       // affectedRows: 1
//       // insertId: 14

//       _item_id = await addItems("tb_items", _data)

//       if (_item_id.affectedRows > 0) {
//         const _data2 = {
//           item_uuid: _data.item_uuid,
//           item_code: _data.item_code,
//         }

//         let _insertPlan = await addItems("tb_items_plan", _data2)
//         _insertPlan.affectedRows > 0
//           ? (_plan_id = _insertPlan.insertId)
//           : (_plan_id = 0)

//         let _insertControl = await addItems("tb_items_control", _data2)
//         _insertControl.affectedRows > 0
//           ? (_control_id = _insertControl.insertId)
//           : (_control_id = 0)

//         let _insertDetail = await addItems("tb_items_other_detail", _data2)
//         _insertDetail.affectedRows > 0
//           ? (_detail_id = _insertDetail.insertId)
//           : (_detail_id = 0)

//         const _status = {
//           item_id: _item_id.insertId,
//           plan_id: _plan_id,
//           control_id: _control_id,
//           detail_id: _detail_id,
//         }

//         res.send(_status).status(200) //?
//       } else {
//         return console.error()
//       }
//     }
//   } catch (error) {
//     console.log(error)
//     res.send(error).status(400)
//   }
// })

router.post("/items", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_items" // tabel name in database
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

/**
 * @swagger
 * /items/items/{id}:
 *   put:
 *     summary: item detail
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update item by id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: The account type name
 *                 example: Savings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return update status
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */

router.put("/items/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_items" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value

    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /items/plan/{id}:
 *   put:
 *     summary: plan detail
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update plan by id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: The account type name
 *                 example: Savings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return update status
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */

router.post("/plan", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_items_plan" // tabel name in database
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

router.put("/plan/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_items_plan" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value

    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /items/control/{id}:
 *   put:
 *     summary: item control
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update control by id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: The account type name
 *                 example: Savings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return update status
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */

router.post("/control", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_items_control" // tabel name in database
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

router.put("/control/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_items_control" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value

    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /items/detail/{id}:
 *   put:
 *     summary: items detail
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update detail by id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: The account type name
 *                 example: Savings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: return update status
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */
router.put("/detail/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_items_other_detail" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value

    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

module.exports = router

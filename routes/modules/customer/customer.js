const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const authen = require("../../functions/check_authen")
const funcs = require("../../functions/functions_all")

const db = require("../../../db_config/db_config")

async function genCusCode() {
  const _getLastcuscode = JSON.parse(await funcs.checkCode("customer", ""))

  const _new_run = parseInt(_getLastcuscode.data) + 1
  const _new_code = "C" + _new_run.toString().padStart(6, "0")

  return _new_code
}

/**
 * @swagger
 * /customer/checkcuscode/{cus_code}:
 *   get:
 *     summary: check cus_code
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: cus_code
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

router.get("/checkcuscode/:cus_code", authen, async (req, res, next) => {
  try {
    const _cuscode = req.params.cus_code

    const _res = await funcs.checkCode("customer", _cuscode)
    let _status

    if (JSON.parse(_res).status) {
      _status = "code is duplicated"
      res.send(_status).status(400)
    } else {
      _status = "code is ready"
      res.send(_status).status(200)
    }
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/gencuscode/:cus_code", authen, async (req, res, next) => {
  try {
    res.send(await genCusCode()).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.post("/data", authen, async function (req, res, next) {
  try {
    const _data = req.body

    let _table_name = []

    // console.log("_data", _data)
    const infoData = _data.find((item) => item.tbl === "info").data
    const addressData = _data.find((item) => item.tbl === "address").data
    const contactData = _data.find((item) => item.tbl === "contact").data
    const shiptoData = _data.find((item) => item.tbl === "shipto").data

    // console.log("infoData", infoData, infoData.length)
    // console.log("addressData", addressData)
    // console.log("contactData", contactData, contactData.length)
    // console.log("shiptoData", shiptoData, shiptoData.length)

    // console.log("_data", _data.length)

    let _result = []
    let _tbl = ""
    for (let i = 0; i < _data.length; i++) {
      switch (_data[i].tbl) {
        case "info":
          _tbl = "tb_customer_info"
          break
        case "address":
          _tbl = "tb_customer_address"
          break
        case "contact":
          _tbl = "tb_customer_contract"
          break
        case "shipto":
          _tbl = "tb_customer_shipping"
          break
        default:
          _tbl = "tb_customer_acc"
          break
      }
      const _data_tbl = _data[i].data

      const _res = await funcs.insertTable(_tbl, _data_tbl)
      _result.push({ loop: i, res: _res })
      // console.log(_tbl, _data_tbl)
    }

    res.send(_result).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

//new register customer
/**
 * @swagger
 * /customer/info:
 *   post:
 *     summary: post info
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: info data
 *                 example: Savings
 *     responses:
 *       201:
 *         description: created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     acctype:
 *                       type: string
 *                       example: Savings
 *       400:
 *         description: Bad Request (e.g., validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post("/info", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_info" // tabel name in database
    const _data = req.body // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//get customer data
/**
 * @swagger
 * /customer/info/{opt}/{cus_code}:
 *   get:
 *     summary: info data
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: customer info cus_code
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: json data currency
 *         contents:
 *           application/json:
 *             schema:
 *               # Add your response schema here
 *
 *       404:
 *         description: error
 */

router.get("/info/:opt/:value", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _value = req.params.value

    let _get_sql = ""
    if (_opt === "all") {
      _get_sql = "SELECT * FROM vw_customer_info Order BY id DESC"
    }
    if (_opt === "bycode") {
      _get_sql =
        "SELECT * FROM vw_customer_info WHERE cus_status = 'active' AND cus_code = '" +
        _value +
        "'"
    }

    if (_opt === "bygroup") {
      _get_sql =
        "SELECT * FROM vw_customer_info WHERE cus_status = 'active' AND cus_group_code = '" +
        _value +
        "'"
    }

    if (_opt === "delOnly") {
      _get_sql =
        "SELECT * FROM vw_customer_info  WHERE cus_status = 'inactive' Order BY id DESC"
    }

    if (_opt === "activeOnly") {
      _get_sql =
        "SELECT * FROM vw_customer_info  WHERE cus_status = 'active' Order BY id DESC"
    }

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    console.log(_opt, _get_sql)

    const _result = await db.runSqlCommand(_get_sql)

    // console.log("_result", _result);

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/delinfo", authen, async function (req, res, next) {
  try {
    let _get_sql = "SELECT * FROM vw_customer_info_deleted Order BY id DESC"
    const _result = await db.runSqlCommand(_get_sql)

    // console.log("_result", _result);

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//update data

/**
 * @swagger
 * /customer/info/{id}:
 *   put:
 *     summary: group term update
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update group term by id
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

router.put("/info/:id", authen, async function (req, res, next) {
  try {
    // console.log("PUT permissions");
    //set params from frontend
    const _tableName = "tb_customer_info" // tabel name in database
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

// Start Contract api

/**
 * @swagger
 * /customer/cont:
 *   post:
 *     summary: post contract
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: contrat data
 *                 example: Savings
 *     responses:
 *       201:
 *         description: created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     acctype:
 *                       type: string
 *                       example: Savings
 *       400:
 *         description: Bad Request (e.g., validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

router.post("/cont", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_contract" // tabel name in database
    const _data = req.body // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//get customer data
/**
 * @swagger
 * /customer/cont/{cus_code}:
 *   get:
 *     summary: get contract data
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: cus_code
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

router.get("/cont/:cus_code", authen, async function (req, res, next) {
  try {
    const _cus_code = req.params.cus_code

    _get_sql =
      "SELECT * FROM vw_customer_contact WHERE cus_code = '" + _cus_code + "'"

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//update data

/**
 * @swagger
 * /customer/cont/{id}:
 *   put:
 *     summary: contract update
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update contract by id
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
router.put("/cont/:id", authen, async function (req, res, next) {
  try {
    // console.log("PUT permissions");
    //set params from frontend
    const _tableName = "tb_customer_contract" // tabel name in database
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

router.get("/delcont/:id", authen, async function (req, res, next) {
  try {
    const _id = req.params.id
    let _status = ""
    _get_sql = "DELETE FROM tb_customer_contract WHERE id = '" + _id + "'"

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    console.log(_get_sql)
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }

    console.log("delete", _result)
    //   //console.log("_result",

    res.send(_data).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

router.get("/prefix", authen, async function (req, res, next) {
  try {
    const _get_sql = "SELECT * FROM tb_master_prefix "

    console.log("prefix", _get_sql)

    const _result = await funcs.getTable(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }

    res.send(_data).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

router.put("/deletecus/:id", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_customer_info" // tabel name in database
    const _primaryKey = "id" //pk name
    const _data = req.body // data from frontend
    const _id = req.params.id // pk value
    let _status = "Error"
    // get from cost ref
    const _checkCustomer =
      "SELECT id FROM tb_marketing_cross_ref_relationship WHERE customer_code = '" +
      _data.cus_code +
      "'"
    console.log("_checkCustomer", _checkCustomer)

    const _resCheck = await funcs.getTable(_checkCustomer)
    console.log("_resCheck", _resCheck, _resCheck.id, _resCheck.length)

    if (_resCheck.length > 0) {
      _status = "code use in cross_ref"
      return res.send(_status).status(200)
    } else {
      const _result = await funcs.updateTable(
        _tableName,
        _primaryKey,
        _data,
        _id
      )
      _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
      return res.send(_status).status(200)
    }
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

// Start Acc api

/**
 * @swagger
 * /customer/acc:
 *   post:
 *     summary: post acc
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: acc data
 *                 example: Savings
 *     responses:
 *       201:
 *         description: created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     acctype:
 *                       type: string
 *                       example: Savings
 *       400:
 *         description: Bad Request (e.g., validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

router.post("/acc", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_acc" // tabel name in database
    const _data = req.body // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//get customer data
/**
 * @swagger
 * /customer/acc/{cus_code}:
 *   get:
 *     summary: get account data
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: cus_code
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

router.get("/acc/:cus_code", authen, async function (req, res, next) {
  try {
    const _cus_code = req.params.cus_code
    _get_sql =
      "SELECT * FROM vw_customer_acc WHERE cus_code = '" + _cus_code + "'"

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//update data
/**
 * @swagger
 * /customer/acc/{id}:
 *   put:
 *     summary: acc update
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update acc by id
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

router.put("/acc/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_acc" // tabel name in database
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

// Start Shipping api
/**
 * @swagger
 * /customer/ship:
 *   post:
 *     summary: post shipping
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: shipping data
 *                 example: Savings
 *     responses:
 *       201:
 *         description: created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     acctype:
 *                       type: string
 *                       example: Savings
 *       400:
 *         description: Bad Request (e.g., validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

router.post("/ship", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_shipping" // tabel name in database
    const _data = req.body // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/delship/:id", authen, async function (req, res, next) {
  try {
    const _id = req.params.id
    let _status = ""
    _get_sql = "DELETE FROM tb_customer_shipping WHERE id = '" + _id + "'"

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    console.log(_get_sql)
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }

    console.log("delete", _result)
    //   //console.log("_result",

    res.send(_data).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

//get customer data
/**
 * @swagger
 * /customer/ship/{cus_code}:
 *   get:
 *     summary: get shipping data
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: cus_code
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

router.get("/ship/:cus_code", authen, async function (req, res, next) {
  try {
    const _cus_code = req.params.cus_code
    _get_sql =
      "SELECT * FROM vw_customer_shipping WHERE cus_code = '" + _cus_code + "'"

    console.log("_get_sql", _get_sql)
    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    //   //console.log("_result", _data);
    console.log("_data", _data)

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//update data

/**
 * @swagger
 * /customer/ship/{id}:
 *   put:
 *     summary: shipping update
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update shipping term by id
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

router.put("/ship/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_shipping" // tabel name in database
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

//Start Address API

//code by natharush
/**
 * @swagger
 * /customer/addr:
 *   post:
 *     summary: post address
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               acctype:
 *                 type: string
 *                 description: address data
 *                 example: Savings
 *     responses:
 *       201:
 *         description: created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     acctype:
 *                       type: string
 *                       example: Savings
 *       400:
 *         description: Bad Request (e.g., validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

router.post("/addr", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_address" // tabel name in database
    const _data = req.body // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//Get data
/**
 * @swagger
 * /customer/addr/{cus_code}:
 *   get:
 *     summary: get address data
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: cus_code
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

router.get("/addr/:cus_code", authen, async function (req, res, next) {
  try {
    const _cus_code = req.params.cus_code

    _get_sql =
      "SELECT * FROM vw_customer_address WHERE cus_code = '" + _cus_code + "'"
    const _result = await db.runSqlCommand(_get_sql)
    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//update data
/**
 * @swagger
 * /customer/addr/{id}:
 *   put:
 *     summary: address update
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update address by id
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

router.put("/addr/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_customer_address" // tabel name in database
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
 * /customer/addr/{cus_code}:
 *   get:
 *     summary: get address data
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: cus_code
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

router.get("/genuid", authen, async function (req, res, next) {
  try {
    res.send(await funcs.genUUID()).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})
module.exports = router

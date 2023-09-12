const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const db = require("../../../db_config/db_config")
const authen = require("../../functions/check_authen")
const e = require("cors")
const funcs = require("../../functions/functions_all")

// code by natharush
/**
 * @swagger
 * /master/acctype:
 *   post:
 *     summary: Create new account type
 *     tags: [Master Customer]
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
 *                 description: The account type name
 *                 example: Savings
 *     responses:
 *       201:
 *         description: Account type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account type created successfully
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

router.post("/acctype", authen, async function (req, res, next) {
  try {
    // console.log("post acctype")
    //set params from frontend
    const _tableName = "tb_master_acc_type" // tabel name in database
    const _data = req.body // data from frontend

    // console.log("data acc", _data)

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

/**
 * @swagger
 * /master/acctype:
 *   get:
 *     summary: acctype data
 *     tags: [Master Customer]
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

router.get("/acctype", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_acc_type"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    //console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/acctype/{id}:
 *   put:
 *     summary: update master acctype
 *     tags: [Master Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update master acctype by id
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

router.put("/acctype/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_acc_type" // tabel name in database
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
 * /master/bbank:
 *   post:
 *     summary: update bbank code
 *     tags: [Master Customer]
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
 *                 description: The account type name
 *                 example: Savings
 *     responses:
 *       201:
 *         description: Account type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account type created successfully
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

router.post("/bbank", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_book_bank" // tabel name in database
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

/**
 * @swagger
 * /master/bbank:
 *   get:
 *     summary: book bank data
 *     tags: [Master Customer]
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
router.get("/bbank", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_book_bank"
    const _result = await db.runSqlCommand(_get_sql)

    // console.log("_result", _result)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/bbank/{id}:
 *   put:
 *     summary: update master acctype
 *     tags: [Master Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update master acctype by id
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

router.put("/bbank/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_book_bank" // tabel name in database
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
 * /master/category:
 *   post:
 *     summary: post category
 *     tags: [Master Customer]
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
 *                 description: category data
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

router.post("/category", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_category" // tabel name in database
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

/**
 * @swagger
 * /master/cattegory:
 *   get:
 *     summary: acttegory data
 *     tags: [Master Customer]
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
router.get("/category", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_category"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/category/{id}:
 *   put:
 *     summary: catagory update
 *     tags: [Master Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update category by id
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
router.put("/category/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_category" // tabel name in database
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
 * /master/crterm:
 *   post:
 *     summary: post crterm
 *     tags: [Master Customer]
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
 *                 description: crterm data
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
router.post("/crterm", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_credit_term" // tabel name in database
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

/**
 * @swagger
 * /master/crterm:
 *   get:
 *     summary: crterm data
 *     tags: [Master Customer]
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
router.get("/crterm", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_credit_term"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/crterm/{id}:
 *   put:
 *     summary: credit term update
 *     tags: [Master Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update crtem term by id
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
router.put("/crterm/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_credit_term" // tabel name in database
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
 * /master/currency:
 *   post:
 *     summary: post currency
 *     tags: [Master Customer]
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
 *                 description: currency data
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
router.post("/currency", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_currency" // tabel name in database
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

/**
 * @swagger
 * /master/currency:
 *   get:
 *     summary: currency data
 *     tags: [Master Customer]
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
router.get("/currency", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_currency"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//update data
/**
 * @swagger
 * /master/currency/{id}:
 *   put:
 *     summary: currency term update
 *     tags: [Master Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update currency term by id
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

router.put("/currency/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_currency" // tabel name in database
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
 * /master/group:
 *   post:
 *     summary: post group
 *     tags: [Master Customer]
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
 *                 description: group data
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

router.post("/group", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_master_groups" // tabel name in database
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

/**
 * @swagger
 * /master/group:
 *   get:
 *     summary: group data
 *     tags: [Master Customer]
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
router.get("/group", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_groups"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/group/{id}:
 *   put:
 *     summary: group term update
 *     tags: [Master Customer]
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
router.put("/group/:id", async (req, res, next) => {
  //set params from frontend
  try {
    const _tableName = "tb_master_groups" // tabel name in database
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

// router.get("/ship", authen, async function (req, res, next) {
//   //const id = req.params.id;
//   const _get_sql = "SELECT * FROM tb_master_shipping";
//   const _result = await db.runSqlCommand(_get_sql);

//   let _data = [];
//   if (_result) {
//     _data = JSON.stringify(_result);
//   } else {
//     _data = [{}];
//   }
//   // console.log("_result", _data);

//   res.send(_data).status(200);
// });

router.get("/ship", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_shipping"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/mtod:
 *   post:
 *     summary: post mtod
 *     tags: [Master Customer]
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
 *                 description: mtod data
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
router.post("/mtod", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_master_term_of_delivery" // tabel name in database
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

/**
 * @swagger
 * /master/mtod:
 *   get:
 *     summary: mtod data
 *     tags: [Master Customer]
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
router.get("/mtod", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_term_of_delivery"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /master/mtod/{id}:
 *   put:
 *     summary: master_term_of_delivery update
 *     tags: [Master Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: update master_term_of_delivery by id
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

router.put("/mtod", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_master_term_of_delivery" // tabel name in database
    const _data = req.body // data from frontend

    //call function updateTable
    const _result = await funcs.updateTable(_tableName, _data)

    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

//ดึงทั้งหมด
/**
 * @swagger
 * /master/allcus:
 *   get:
 *     summary: get all customer data
 *     tags: [Master Customer]
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

router.get("/allcus", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    let _table_name = []

    _table_name.push("tb_master_acc_type")
    _table_name.push("tb_master_book_bank")
    _table_name.push("tb_master_category")
    _table_name.push("tb_master_credit_term")
    _table_name.push("tb_master_currency")
    _table_name.push("tb_master_groups")
    _table_name.push("tb_master_shipping")
    _table_name.push("tb_master_term_of_delivery")
    _table_name.push("tb_master_vat")

    let _master_all_data = []
    var _res_data

    for (let i = 0; i < _table_name.length; i++) {
      const e = _table_name[i]
      _res_data = await getAllMaster("SELECT * FROM " + e, e)
      _master_all_data.push(_res_data)
    }

    const _all_data_json = JSON.stringify(_master_all_data)
    // console.log(
    //   "allcus",
    //   _master_all_data[0]
    // )

    res.send(_all_data_json).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

router.get("/cpad", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    let _table_name = []

    _table_name.push("tb_master_country")
    _table_name.push("tb_master_provinces")
    _table_name.push("tb_master_amphures")
    _table_name.push("tb_master_districts")

    let _master_all_data = []
    var _res_data

    for (let i = 0; i < _table_name.length; i++) {
      const e = _table_name[i]
      _res_data = await getAllMaster("SELECT * FROM " + e, e)
      _master_all_data.push(_res_data)
    }

    const _all_data_json = JSON.stringify(_master_all_data)
    // console.log("_all_cpad", _master_all_data[0])

    res.send(_all_data_json).status(200)
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

// router.get("/info", authen, async function (req, res, next) {
//   //const id = req.params.id;
//   const _get_sql = "SELECT *FROM tb_customer_info";
//   const _result = await db.runSqlCommand(_get_sql);

//   let _data = [];
//   if (_result) {
//     _data = JSON.stringify(_result);
//   } else {
//     _data = [{}];
//   }
//   // console.log("_result", _data);
//   res.send(_data).status(200);
// });

// router.post("/info", authen, async function (req, res, next) {
//   //set params from frontend
//   const _tableName = "tb_customer_info"; // tabel name in database
//   const _data = req.body; // data from frontend

//   //call function updateTable
//   const _result = await funcs.insertTable(_tableName, _data);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.put("/info/:id", authen, async function (req, res, next) {
//   //set params from frontend
//   const _tableName = "tb_customer_info"; // tabel name in database
//   const _primaryKey = "id"; //pk name
//   const _data = req.body; // data from frontend
//   const _id = req.params.id; // pk value

//   //call function updateTable
//   const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.get("/cont", authen, async function (req, res, next) {
//   //const id = req.params.id;
//   const _get_sql = "SELECT *FROM tb_customer_info";
//   const _result = await db.runSqlCommand(_get_sql);

//   let _data = [];
//   if (_result) {
//     _data = JSON.stringify(_result);
//   } else {
//     _data = [{}];
//   }
//   // console.log("_result", _data);
//   res.send(_data).status(200);
// });

// router.post("/cont", authen, async function (req, res, next) {
//   //console.log("POST contorl");

//   //set params from frontend
//   const _tableName = "tb_customer_contract"; // tabel name in database
//   const _data = req.body; // data from frontend

//   //call function updateTable
//   const _result = await funcs.insertTable(_tableName, _data);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.put("/cont/:id", authen, async function (req, res, next) {
//   console.log("PUT contorl");

//   //set params from frontend
//   const _tableName = "tb_customer_contract"; // tabel name in database
//   const _primaryKey = "id"; //pk name
//   const _data = req.body; // data from frontend
//   const _id = req.params.id; // pk value

//   //call function updateTable
//   const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.post("/acc", authen, async function (req, res, next) {
//   console.log("POST contorl");

//   //set params from frontend
//   const _tableName = "tb_customer_acc"; // tabel name in database
//   const _data = req.body; // data from frontend

//   //call function updateTable
//   const _result = await funcs.insertTable(_tableName, _data);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.put("/acc/:id", authen, async function (req, res, next) {
//   console.log("PUT contorl");

//   //set params from frontend
//   const _tableName = "tb_customer_acc"; // tabel name in database
//   const _primaryKey = "id"; //pk name
//   const _data = req.body; // data from frontend
//   const _id = req.params.id; // pk value

//   //call function updateTable
//   const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.post("/shipping", authen, async function (req, res, next) {
//   //set params from frontend
//   const _tableName = "tb_customer_shipping"; // tabel name in database
//   const _data = req.body; // data from frontend

//   //call function updateTable
//   const _result = await funcs.insertTable(_tableName, _data);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

// router.put("/shipping/:id", authen, async function (req, res, next) {
//   //set params from frontend
//   const _tableName = "tb_customer_shipping"; // tabel name in database
//   const _primaryKey = "id"; //pk name
//   const _data = req.body; // data from frontend
//   const _id = req.params.id; // pk value

//   //call function updateTable
//   const _result = await funcs.updateTable(_tableName, _primaryKey, _data, _id);

//   //check status
//   let _status = "Error";
//   _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//   res.send(_status).status(200);
// });

router.get("/province", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_provinces"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/amphures/:id", authen, async function (req, res, next) {
  try {
    const id = req.params.id

    const _get_sql =
      "SELECT * FROM tb_master_amphures  WHERE province_id = '" + id + "'"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/districts/:id", authen, async function (req, res, next) {
  try {
    const id = req.params.id
    const _get_sql =
      "SELECT * FROM tb_master_districts WHERE amphure_id = '" + id + "'"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/country", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_country"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

router.get("/country/:id", authen, async function (req, res, next) {
  try {
    const id = req.params.id
    const _get_sql = "SELECT * FROM tb_master_country WHERE code = '" + id + "'"
    const _result = await db.runSqlCommand(_get_sql)

    let _data = []
    if (_result) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    // console.log("_result", _data);

    res.send(_data).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

async function getAllMaster(sql, tableName) {
  try {
    const _result = await db.runSqlCommand(sql)

    let _data = []
    if (_result) {
      _data = [tableName, _result]
    } else {
      _data = [tableName, [{}]]
    }

    return _data
  } catch (error) {
    return error
  }
}

module.exports = router

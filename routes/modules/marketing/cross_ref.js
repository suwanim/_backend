const express = require("express")
const router = express.Router()

const moment = require("moment")
const { v4: uuidv4 } = require("uuid")
const uuid = uuidv4()

const authen = require("../../functions/check_authen")
const eventlog = require("../../functions/event_log")
const db = require("../../../db_config/db_config")
const funcs = require("../../functions/functions_all")

async function ranking(item_code) {
  try {
    const _sql =
      "SELECT * FROM tb_marketing_cross_ref_ranking WHERE item_code = '" +
      item_code +
      "'"
    const _res = await funcs.getTable(_sql)
    return _res
  } catch (error) {
    return error
  }
}

/**
 * @swagger
 * /marketing/crossref/checkrank/{item_code}:
 *   get:
 *     summary: setup rank[] variable data for relationship page
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: item_code
 *         schema:
 *           type: string
 *         required: true
 *         description: check rank by item_code and return ranking[]
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

// router.get("/checkrank/:item_code", authen, async (req, res, next) => {
//   try {
//     const _item_code = req.params.item_code;
//     const _ranking = await ranking(_item_code);
//     let _rank = [];
//     const _maxRank = 100; // The maximum rank value
//     let _newRank = []; // The new rank values

//     _ranking.forEach((e) => {
//       _rank.push(e.rank_value);
//     });

//     for (let i = 1; i <= _maxRank; i++) {
//       if (!_rank.includes(i)) {
//         _newRank.push(i);
//       }
//     }

//     res.send(_newRank).status(200);
//   } catch (error) {
//     res.send(error).status(400);
//   }
// });

router.get("/checkrank/:item_code", authen, async (req, res, next) => {
  try {
    const _item_code = req.params.item_code
    const _ranking = await ranking(_item_code)
    let _rank = []
    const _maxRank = 100 // The maximum rank value
    let _newRank = [] // The new rank values

    _ranking.forEach((e) => {
      _rank.push(e.rank_value)
    })

    for (let i = 1; i <= _maxRank; i++) {
      if (!_rank.includes(i)) {
        _newRank.push({ rank: i })
      }
    }

    res.send(_newRank).status(200)
  } catch (error) {
    res.send(error).status(400)
  }
})

// router.post("/match/:cus_id/:item_code", authen, async (req, res, next) => {
//   try {
//     const _cus_id = req.params.cus_id;
//     const _item_code = req.params.item_code;

//     const _result = await funcs.insertTable(
//       "tb_marketing_cross_ref_relationship",
//       _data
//     );
//     //check status
//     let _status = "Error";
//     _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

//     res.send('Ok').status(200);
//   } catch (error) {
//     res.send(error).status(400);
//   }
// });

//marketing_cross_ref_relationship

//get relationship data
/**
 * @swagger
 * /marketing/crossref/relationship/{opt}/{customer_code}:
 *   get:
 *     summary: relationship data
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: customer_code
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref relationship customer_code
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

router.get(
  "/relationship/:opt/:item_code/:cus_code",
  authen,
  async function (req, res, next) {
    try {
      const _opt = req.params.opt
      const _item_code = req.params.item_code
      const _cus_code = req.params.cus_code
      // console.log("opt", _opt);

      let _get_sql = ""

      switch (_opt) {
        case "all":
          _get_sql = "SELECT * FROM vw_relationship"
          break
        case "by_cuscode":
          _get_sql =
            "SELECT * FROM vw_relationship WHERE customer_code = '" +
            _cus_code +
            "'"
          break
        case "by_itemcode":
          _get_sql =
            "SELECT * FROM vw_relationship WHERE item_code = '" +
            _item_code +
            "'"
          break
        case "by_duo":
          _get_sql =
            "SELECT * FROM vw_relationship WHERE item_code = '" +
            _item_code +
            "' AND customer_code = '" +
            _cus_code +
            "'"
          break
        case "by_cusitem ":
          _get_sql =
            "SELECT * FROM vw_relationship WHERE customer_item_code = '" +
            _item_code +
            "'"
        default:
          _get_sql = "SELECT * FROM vw_relationship"
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
      res.send(_data).status(200)
    } catch (error) {
      // something here
      res.send(error).status(400)
    }
  }
)

//get relationship data
/**
 * @swagger
 * /marketing/crossref/relationship/{opt}/{customer_code}:
 *   get:
 *     summary: relationship data
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: customer_code
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref relationship customer_code
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

router.get(
  "/cross_ref_relationship/:opt/:value",
  authen,
  async function (req, res, next) {
    try {
      const _opt = req.params.opt
      const _value = req.params.value

      let _get_sql = ""

      switch (_opt) {
        case "all":
          _get_sql = "SELECT * FROM vw_marketing_cross_ref_relationship"
          break
        case "by_cuscode":
          _get_sql =
            "SELECT * FROM vw_marketing_cross_ref_relationship WHERE customer_code = '" +
            _value +
            "'"
          break
        case "by_itemcode":
          _get_sql =
            "SELECT * FROM vw_marketing_cross_ref_relationship WHERE item_code = '" +
            _value +
            "'"
          break
        case "by_cusitem ":
          _get_sql =
            "SELECT * FROM vw_marketing_cross_ref_relationship WHERE customer_item_code = '" +
            _value +
            "'"
        default:
          _get_sql = "SELECT * FROM vw_marketing_cross_ref_relationship"
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
      res.send(_data).status(200)
    } catch (error) {
      // something here
      res.send(error).status(400)
    }
  }
)


/**
 * @swagger
 * /marketing/crossref/ratehistory/{item_code}/{cus_code}:
 *   get:
 *     summary: ratehistory data
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: item_code
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: cus_code
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref rate value history
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

router.get(
  "/ratehistory/:item_code/:cus_code",
  authen,
  async function (req, res, next) {
    try {
      const _item_code = req.params.item_code
      const _cus_code = req.params.cus_code
      // console.log("opt", _opt);

      let _get_sql =
        "SELECT * FROM vw_rate_history WHERE item_code = '" +
        _item_code +
        "' AND customer_code = '" +
        _cus_code +
        "'"

      // const _get_sql = "SELECT * FROM tb_master_acc_type";
      const _result = await db.runSqlCommand(_get_sql)
      console.log("_result", _result)
      let _data = []
      if (_result) {
        _data = JSON.stringify(_result)
      } else {
        _data = [{}]
      }
      res.send(_data).status(200)
    } catch (error) {
      console.log("error", error)
      // something here
      res.send(error).status(400)
    }
  }
)

/**
 * @swagger
 * /cross/relationship/{id}:
 *   put:
 *     summary: contract update
 *     tags: [cross]
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
 *                 description: The cross ref relationship
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

router.put("/relationship/:id", authen, async function (req, res, next) {
  //console.log("PUT contorl");
  //set params from frontend
  try {
    //enter code here
    const _tableName = "tb_marketing_cross_ref_relationship" // tabel name in database
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
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//marketing_cross_ref_recive_barcode
/**
 * @swagger
 * /cross/recive_barcode:
 *   post:
 *     summary: post recive_barcode
 *     tags: [cross]
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
 *                 description: recive_barcode data
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

//////////////// tb_marketing_cross_ref_recive_barcode /////////////////////
router.post("/recive_barcode", authen, async function (req, res, next) {
  //console.log("POST contorl");
  //set params from frontend
  try {
    const _tableName = "tb_marketing_cross_ref_recive_barcode" // tabel name in database
    const _data = req.body // data from frontend
    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)
    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")
    res.send(_status).status(200)
  } catch (error) {
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /cross/recive_barcode/{id}:
 *   put:
 *     summary: contract update
 *     tags: [cross]
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
 *                 description: The cross ref recive barcode
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

router.put("/recive_barcode/:id", authen, async function (req, res, next) {
  //console.log("PUT contorl");
  //set params from frontend
  try {
    const _tableName = "tb_marketing_cross_ref_recive_barcode" // tabel name in database
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
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//marketing_cross_ref_rate_value
/**
 * @swagger
 * /cross/rate_value:
 *   post:
 *     summary: post rate_value
 *     tags: [cross]
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
 *                 description: rate_value data
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

//////////////// tb_marketing_cross_ref_rate_value /////////////////////
router.post("/rate_value", authen, async function (req, res, next) {
  //console.log("POST contorl");
  //set params from frontend
  try {
    const _tableName = "tb_marketing_cross_ref_rate_value" // tabel name in database
    const _data = req.body // data from frontend
    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)
    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//get rate_value data
/**
 * @swagger
 * /marketing/crossref/rate_value/{opt}/{relationship_id}:
 *   get:
 *     summary: rate value data
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: relationship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref rate value relationship_id
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

router.get("/rate_value/:opt/:rep_id", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _rep_id = req.params.rep_id

    let _get_sql = ""
    if (_opt === "all") {
      _get_sql = "SELECT * FROM tb_marketing_cross_ref_rate_value"
    } else if (_opt === "by_rep_id") {
      _get_sql =
        "SELECT * FROM tb_marketing_cross_ref_rate_value WHERE relationship_id = '" +
        _rep_id +
        "'"
    }

    const _result = await db.runSqlCommand(_get_sql)
    let _data = []
    if (/*(_opt)*/ _result && _result.length > 0) {
      _data = JSON.stringify(_result)
    } else {
      _data = [{}]
    }
    res.status(200).send(_data)
  } catch (error) {
    // something here
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /marketing/crossref/recive_barcode/{opt}/{relationship_id}:
 *   get:
 *     summary: recive_barcode
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/relationship_id
 *       - in: path
 *         name: relationship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref rate value relationship_id
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

router.get(
  "/resive_barcode/:opt/:rep_id",
  authen,
  async function (req, res, next) {
    try {
      const _opt = req.params.opt
      const _rep_id = req.params.rep_id

      let _get_sql = ""
      if (_opt === "all") {
        _get_sql = "SELECT * FROM tb_marketing_cross_ref_recive_barcode"
      } else if (_opt === "by_rep_id") {
        _get_sql =
          "SELECT * FROM tb_marketing_cross_ref_recive_barcode WHERE relationship_id = '" +
          _rep_id +
          "'"
      }

      const _result = await db.runSqlCommand(_get_sql)
      let _data = []
      if (/*(_opt)*/ _result && _result.length > 0) {
        _data = JSON.stringify(_result)
      } else {
        _data = [{}]
      }
      res.status(200).send(_data)
    } catch (error) {
      // something here
      res.send(error).status(400)
    }
  }
)

////////////////////////////////////////
//  router.get("/rate_value/:id/:opt", authen, async function (req, res, next) {
//   const _opt = req.params.opt;
//   const _id = req.params.id;

//   // let _get_sql = "";

//     if (_id) { _get_sql = "SELECT id FROM tb_marketing_cross_ref_rate_value WHERE id = ?"
//      } else (_opt) ( _get_sql = "SELECT * FROM tb_marketing_cross_ref_rate_value")

//     // if (_opt === "all") {
//     //   _get_sql = "SELECT * FROM tb_marketing_cross_ref_rate_value";
//     // }
//    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
//   const _result = await db.runSqlCommand(_get_sql);

//   // console.log("_result", _result);

//   let _data = [];
//   if (_result) {
//     _data = JSON.stringify(_result);
//   } else {
//     _data = [{}];
//   }
//   //   //console.log("_result", _data);

//   res.send(_data).status(200);

// });

/////////////////////////////////////////////////////
// router.get("/rate_value/:opt/:id", authen, async function (req, res, next) {
//   const _opt = req.params.opt;
//   const _id = req.params.id;

//   let _get_sql = "";
//   if (_opt === "all") {
//     _get_sql = "SELECT * FROM tb_marketing_cross_ref_rate_value";
//   }

//   if (_opt === "bycode") {
//     _get_sql =
//       "SELECT * FROM tb_marketing_cross_ref_rate_value WHERE id = '" + _id + "'";
//   }

//   //   const _get_sql = "SELECT * FROM tb_master_acc_type";
//   const _result = await db.runSqlCommand(_get_sql);

//   // console.log("_result", _result);

//   let _data = [];
//   if (_result) {
//     _data = JSON.stringify(_result);
//   } else {
//     _data = [{}];
//   }
//   //   //console.log("_result", _data);

//   res.send(_data).status(200);
// });

/**
 * @swagger
 * /cross/rate_value/{id}:
 *   put:
 *     summary: contract update
 *     tags: [Margeting]
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
 *                 description: The cross ref rate value
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

router.put("/rate_value/:id", authen, async function (req, res, next) {
  //console.log("PUT contorl");
  //set params from frontend
  try {
    const _tableName = "tb_marketing_cross_ref_rate_value" // tabel name in database
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
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//marketing_cross_ref_ranking
/**
 * @swagger
 * /cross/ranking:
 *   post:
 *     summary: post ranking
 *     tags: [Margeting]
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
 *                 description: ranking data
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

//////////////// tb_marketing_cross_ref_ranking /////////////////////
router.post("/ranking", authen, async function (req, res, next) {
  //console.log("POST contorl");
  //set params from frontend
  try {
    const _tableName = "tb_marketing_cross_ref_ranking" // tabel name in database
    const _data = req.body // data from frontend
    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)
    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//get ranking data
/**
 * @swagger
 * /marketing/crossref/ranking/{opt}/{relationship_id}:
 *   get:
 *     summary: ranking data
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: relationship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref ranking relationship_id
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

router.get(
  "/ranking/:opt/:relationship_id",
  authen,
  async function (req, res, next) {
    try {
      const _opt = req.params.opt
      const _relationship_id = req.params.relationship_id

      let _get_sql = ""
      if (_opt === "all") {
        _get_sql = "SELECT * FROM tb_marketing_cross_ref_ranking"
      }

      if (_opt === "bycode") {
        _get_sql =
          "SELECT * FROM tb_marketing_cross_ref_ranking WHERE relationship_id = '" +
          _relationship_id +
          "'"
      }

      //   const _get_sql = "SELECT * FROM tb_master_acc_type";
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
  }
)

/**
 * @swagger
 * /cross/ranking/{id}:
 *   put:
 *     summary: contract update
 *     tags: [cross]
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
 *                 description: The cross ref ranking
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

router.put("/ranking/:id", authen, async function (req, res, next) {
  try {
    //console.log("PUT contorl");
    //set params from frontend
    const _tableName = "tb_marketing_cross_ref_ranking" // tabel name in database
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
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//marketing_cross_ref_loyalty
/**
 * @swagger
 * /cross/loyalty:
 *   post:
 *     summary: post loyalty
 *     tags: [cross]
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
 *                 description: loyalty data
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

//////////////// tb_marketing_cross_ref_loyalta /////////////////////
router.post("/loyalty", authen, async function (req, res, next) {
  try {
    //console.log("POST contorl");
    //set params from frontend
    const _tableName = "tb_marketing_cross_ref_loyalty" // tabel name in database
    const _data = req.body // data from frontend
    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data)
    //check status
    let _status = "Error"
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error")

    res.send(_status).status(200)
  } catch (error) {
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//get loyalty data
/**
 * @swagger
 * /marketing/crossref/loyalty/{opt}/{relationship_id}:
 *   get:
 *     summary: loyalty data
 *     tags: [Marketing]
 *     parameters:
 *       - in: path
 *         name: opt
 *         schema:
 *           type: string
 *         required: true
 *         description: option all/bycode
 *       - in: path
 *         name: relationship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: marketing cross ref loyalty relationship_id
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

router.get("/loyalty/:opt/:id", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt
    const _id = req.params._id

    let _get_sql = ""
    if (_opt === "all") {
      _get_sql = "SELECT * FROM tb_marketing_cross_ref_loyalty"
    }

    if (_opt === "bycode") {
      _get_sql =
        "SELECT  FROM tb_marketing_cross_ref_loyalty WHERE _id = '" + _id + "'"
    }

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql)

    // console.log("_result", _result);

    res.send(_data).status(200)
  } catch (error) {
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

/**
 * @swagger
 * /cross/loyalty/{id}:
 *   put:
 *     summary: contract update
 *     tags: [cross]
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
 *                 description: The cross ref loyalty
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

router.put("/loyalty/:id", authen, async function (req, res, next) {
  //console.log("PUT contorl");
  //set params from frontend
  try {
    const _tableName = "tb_marketing_cross_ref_loyalty" // tabel name in database
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
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//ดึงทั้งหมด
router.get("/allcross", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    let _table_name = []

    _table_name.push("tb_marketing_cross_ref_relationship")
    _table_name.push("tb_marketing_cross_ref_recive_barcode")
    _table_name.push("tb_marketing_cross_ref_rate_value")
    _table_name.push("tb_marketing_cross_ref_ranking")
    _table_name.push("tb_marketing_cross_ref_loyalty")

    let _all_data = []
    var _res_data

    for (let i = 0; i < _table_name.length; i++) {
      const e = _table_name[i]
      _res_data = await getAllMaster("SELECT * FROM " + e, e)
      _all_data.push(_res_data)
    }

    const _all_data_json = JSON.stringify(_all_data)
    console.log("_all_data_json", _all_data)

    res.send(_all_data_json).status(200)
  } catch (error) {
    // something here
    //res.send(_status).status(400)
    res.send(error).status(400)
  }
})

//new register relationship
/**
 * @swagger
 * /cross/relationship:
 *   post:
 *     summary: register relations
 *     tags: [Cross]
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
router.post("/relationship", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    // data
    // {
    // "relationship": {
    //     "uuid": "62d2970d-685f-4817-bf62-b7e5d177e108",
    //     "item_code": "1122YK4001",
    //     "item_name": "item Name",
    //     "customer_code": "C000004",
    //     "customer_item_code": "code for customer",
    //     "end_user": "admin",
    //     "sale_code": "S0001",
    //     "created_by": "admin"
    //   },
    // "ranking": {
    //     "rank_value": 1
    //   },
    // "loyalty": {
    //     "loyalty_type": "",
    //     "loyalty_value": 1
    //  }
    // }

    let _rank_id, _loyalty_id

    console.log("req.body", req.body.ranking)

    const _data_relation = req.body.relationship
    const _data_rank = req.body.ranking
    const _data_loyalty = req.body.loyalty

    _insertRelationship = await addItems(
      "tb_marketing_cross_ref_relationship",
      _data_relation
    )

    // console.log("_insertRelaitonship", _insertRelationship);

    if (_insertRelationship.affectedRows > 0) {
      let _insertRank = await addItems("tb_marketing_cross_ref_ranking", {
        uuid: _data_relation.uuid,
        relationship_id: _insertRelationship.insertId,
        item_code: _data_relation.item_code,
        rank_value: _data_rank.rank_value,
      })
      _insertRank.affectedRows > 0
        ? (_rank_id = _insertRank.insertId)
        : (_rank_id = 0)

      let _insertLoyalty = await addItems("tb_marketing_cross_ref_loyalty", {
        uuid: _data_relation.uuid,
        relationship_id: _insertRelationship.insertId,
        loyalty_type: _data_loyalty.loyalty_type,
        loyalty_value: _data_loyalty.loyalty_value,
        created_by: _data_relation.created_by,
      })
      _insertLoyalty.affectedRows > 0
        ? (_loyalty_id = _insertLoyalty.insertId)
        : (_loyalty_id = 0)

      const _status = {
        relationship_id: _insertRelationship.insertId,
        rank_id: _rank_id,
        loyalty_id: _loyalty_id,
        created_by: _data_relation.created_by,
      }

      res.send(_status).status(200)
    } else {
      return console.error()
    }
  } catch (error) {
    console.log(error)
    res.send(error).status(400)
  }
})

// ตรวจสอบการมีอยู่ของ item
router.get(
  "/check_itemcode/:item_code",
  authen,
  async function (req, res, next) {
    try {
      const _item_code = req.params.item_code

      const _res = await funcs.checkCode("item", _item_code)
      let _status

      if (JSON.parse(_res).status) {
        _status = "Found"
        res.send(_status).status(200)
      } else {
        _status = "Not Found"
        res.send(_status).status(400)
      }
    } catch (error) {
      res.send(error).status(400)
    }
  }
)

async function addItems(tbname, data) {
  const _res = await funcs.insertTable(tbname, data)

  return _res
}

module.exports = router

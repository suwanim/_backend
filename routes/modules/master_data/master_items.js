const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../../../db_config/db_config");
const authen = require("../../functions/check_authen");
const e = require("cors");
const { join } = require("path");
const { Console } = require("console");

const funcs = require("../../functions/functions_all");

////////////// tb_master_data_location /////////////////////
router.get("/data_location/:opt/:id", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt;
    const _id = req.params.id;

    let _get_sql = "";
    if (_opt === "all") {
      _get_sql = "SELECT * FROM tb_master_data_location";
    }
    if (_opt === "byid") {
      _get_sql =
        "SELECT * FROM tb_master_data_location WHERE id = '" + _id + "'";
    }

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql);

    // console.log("_result", _result);

    let _data = [];
    if (_result) {
      _data = JSON.stringify(_result);
    } else {
      _data = [{}];
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.post("/data_location", authen, async function (req, res, next) {
  try {
    //console.log("POST contorl");
    //set params from frontend
    const _tableName = "tb_master_data_location"; // tabel name in database
    const _data = req.body; // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data);

    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

//update data
router.put("/data_location/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_data_location"; // tabel name in database
    const _primaryKey = "id"; //pk name
    const _data = req.body; // data from frontend
    const _id = req.params.id; // pk value

    //call function updateTable
    const _result = await funcs.updateTable(
      _tableName,
      _primaryKey,
      _data,
      _id
    );

    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

/////////////// tb_master_item_account_product_code ///////////////
router.get(
  "/item_account_product_code/:opt/:id",
  authen,
  async function (req, res, next) {
    try {
      const _opt = req.params.opt;
      const _id = req.params.id;

      let _get_sql = "";
      if (_opt === "all") {
        _get_sql = "SELECT * FROM tb_master_item_account_product_code";
      }
      if (_opt === "byid") {
        _get_sql =
          "SELECT * FROM tb_master_item_account_product_code WHERE id = '" +
          _id +
          "'";
      }

      //   const _get_sql = "SELECT * FROM tb_master_acc_type";
      const _result = await db.runSqlCommand(_get_sql);

      // console.log("_result", _result);

      let _data = [];
      if (_result) {
        _data = JSON.stringify(_result);
      } else {
        _data = [{}];
      }
      //   //console.log("_result", _data);

      res.send(_data).status(200);
    } catch (error) {
      res.send(error).status(400);
    }
  }
);

router.post(
  "/item_account_product_code",
  authen,
  async function (req, res, next) {
    try {
      //console.log("POST contorl");
      //set params from frontend
      const _tableName = "tb_master_item_account_product_code"; // tabel name in database
      const _data = req.body; // data from frontend

      //call function updateTable
      const _result = await funcs.insertTable(_tableName, _data);

      //check status
      let _status = "Error";
      _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

      res.send(_status).status(200);
    } catch (error) {
      res.send(error).status(400);
    }
  }
);

router.put(
  "/item_account_product_code/:id",
  authen,
  async function (req, res, next) {
    try {
      //set params from frontend
      const _tableName = "tb_master_item_account_product_code"; // tabel name in database
      const _primaryKey = "id"; //pk name
      const _data = req.body; // data from frontend
      const _id = req.params.id; // pk value

      //call function updateTable
      const _result = await funcs.updateTable(
        _tableName,
        _primaryKey,
        _data,
        _id
      );

      //check status
      let _status = "Error";
      _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

      res.send(_status).status(200);
    } catch (error) {
      res.send(error).status(400);
    }
  }
);

//////////////////// tb_master_item_family ////////////////
router.get("/item_family/:opt/:id", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt;
    const _id = req.params.id;

    let _get_sql = "";
    if (_opt === "all") {
      _get_sql = "SELECT * FROM tb_master_item_family";
    }
    if (_opt === "byid") {
      _get_sql = "SELECT * FROM tb_master_item_family WHERE id = '" + _id + "'";
    }

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql);

    // console.log("_result", _result);

    let _data = [];
    if (_result) {
      _data = JSON.stringify(_result);
    } else {
      _data = [{}];
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.post("/item_family", authen, async function (req, res, next) {
  try {
    const _tableName = "tb_master_item_family"; // tabel name in database
    const _data = req.body; // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data);

    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.put("/item_family/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_item_family"; // tabel name in database
    const _primaryKey = "id"; //pk name
    const _data = req.body; // data from frontend
    const _id = req.params.id; // pk value

    //call function updateTable
    const _result = await funcs.updateTable(
      _tableName,
      _primaryKey,
      _data,
      _id
    );

    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

/////////////////// tb_master_item_um ///////////////////
router.get("/item_um/:opt/:id", authen, async function (req, res, next) {
  try {
    const _opt = req.params.opt;
    const _id = req.params.id;

    let _get_sql = "";
    if (_opt === "all") {
      _get_sql = "SELECT * FROM tb_master_item_um";
    }
    if (_opt === "byid") {
      _get_sql = "SELECT * FROM tb_master_item_um WHERE id = '" + _id + "'";
    }

    //   const _get_sql = "SELECT * FROM tb_master_acc_type";
    const _result = await db.runSqlCommand(_get_sql);

    // console.log("_result", _result);

    let _data = [];
    if (_result) {
      _data = JSON.stringify(_result);
    } else {
      _data = [{}];
    }
    //   //console.log("_result", _data);

    res.send(_data).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.post("/item_um", authen, async function (req, res, next) {
  try {
    //console.log("POST contorl");
    //set params from frontend
    const _tableName = "tb_master_item_um"; // tabel name in database
    const _data = req.body; // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data);

    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.put("/item_um/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_item_um"; // tabel name in database
    const _primaryKey = "id"; //pk name
    const _data = req.body; // data from frontend
    const _id = req.params.id; // pk value
    //call function updateTable
    const _result = await funcs.updateTable(
      _tableName,
      _primaryKey,
      _data,
      _id
    );
    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

/////////////// tb_master_item_weight_unit ///////////////////////////
router.get(
  "/item_weight_unit/:opt/:id",
  authen,
  async function (req, res, next) {
    try {
      const _opt = req.params.opt;
      const _id = req.params.id;

      let _get_sql = "";
      if (_opt === "all") {
        _get_sql = "SELECT * FROM tb_master_item_weight_unit";
      }
      if (_opt === "byid") {
        _get_sql =
          "SELECT * FROM tb_master_item_weight_unit WHERE id = '" + _id + "'";
      }

      //   const _get_sql = "SELECT * FROM tb_master_acc_type";
      const _result = await db.runSqlCommand(_get_sql);

      // console.log("_result", _result);

      let _data = [];
      if (_result) {
        _data = JSON.stringify(_result);
      } else {
        _data = [{}];
      }
      //   //console.log("_result", _data);

      res.send(_data).status(200);
    } catch (error) {
      res.send(error).status(400);
    }
  }
);

router.post("/item_weight_unit", authen, async function (req, res, next) {
  try {
    //console.log("POST contorl");
    //set params from frontend
    const _tableName = "tb_master_item_weight_unit"; // tabel name in database
    const _data = req.body; // data from frontend

    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data);

    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.put("/item_weight_unit/:id", authen, async function (req, res, next) {
  try {
    //set params from frontend
    const _tableName = "tb_master_item_weight_unit"; // tabel name in database
    const _primaryKey = "id"; //pk name
    const _data = req.body; // data from frontend
    const _id = req.params.id; // pk value
    //call function updateTable
    const _result = await funcs.updateTable(
      _tableName,
      _primaryKey,
      _data,
      _id
    );
    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

//////////////// tb_master_vat /////////////////////
router.post("/vat", authen, async function (req, res, next) {
  try {
    //console.log("POST contorl");
    //set params from frontend
    const _tableName = "tb_master_vat"; // tabel name in database
    const _data = req.body; // data from frontend
    //call function updateTable
    const _result = await funcs.insertTable(_tableName, _data);
    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.get("/vat/", authen, async function (req, res, next) {
  console.log("vatttt");
  try {
    //const id = req.params.id;
    const _get_sql = "SELECT * FROM tb_master_vat";
    const _result = await db.runSqlCommand(_get_sql);

    let _data = [];
    if (_result) {
      _data = JSON.stringify(_result);
    } else {
      _data = [{}];
    }
    // console.log("_result", _data);
    res.send(_data).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.get("/vat/:id", authen, async function (req, res, next) {
  console.log("vatttt");
  try {
    //const id = req.params.id;
    const _get_sql =
      "SELECT * FROM tb_master_vat WHERE id = '" + req.params.id + "'";
    const _result = await db.runSqlCommand(_get_sql);

    let _data = [];
    if (_result) {
      _data = JSON.stringify(_result);
    } else {
      _data = [{}];
    }
    // console.log("_result", _data);
    res.send(_data).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

router.put("/vat/:id", authen, async function (req, res, next) {
  try {
    //console.log("PUT contorl");
    //set params from frontend
    const _tableName = "tb_master_vat"; // tabel name in database
    const _primaryKey = "id"; //pk name
    const _data = req.body; // data from frontend
    const _id = req.params.id; // pk value
    //call function updateTable
    const _result = await funcs.updateTable(
      _tableName,
      _primaryKey,
      _data,
      _id
    );
    //check status
    let _status = "Error";
    _result.affectedRows > 0 ? (_status = "OK") : (_status = "Error");

    res.send(_status).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

//ดึงทั้งหมด
router.get("/masterall", authen, async function (req, res, next) {
  try {
    //const id = req.params.id;
    let _table_name = [];

    _table_name.push("tb_master_item");
    _table_name.push("tb_master_item_account_product_code");
    _table_name.push("tb_master_item_family");
    _table_name.push("tb_master_item_running");
    _table_name.push("tb_master_item_um");
    _table_name.push("tb_master_item_weight_unit");
    _table_name.push("tb_master_vat");

    let _master_all_data = [];
    var _res_data;

    for (let i = 0; i < _table_name.length; i++) {
      const e = _table_name[i];
      _res_data = await funcs.getTables(e, "SELECT * FROM " + e);
      _master_all_data.push(_res_data);
    }

    const _all_data_json = JSON.stringify(_master_all_data);
    // console.log("_all_data_json", _master_all_data);

    res.send(_all_data_json).status(200);

   // console.log('Get All')

  } catch (error) {
    res.send(error).status(400);
  }
});

module.exports = router;

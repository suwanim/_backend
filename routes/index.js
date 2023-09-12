const express = require("express")
const router = express.Router()

const moment = require("moment")
const { v4: uuidv4 } = require("uuid")
const uuid = uuidv4()

const authen = require("./functions/check_authen")
const eventlog = require("./functions/event_log")
const db = require("../db_config/db_config")
const funcs = require("./functions/functions_all")

router.get("/healthcheck", function (req, res, next) {
  try {
    res.send("ok").status(200)
  } catch (error) {
    res.send("bad").status(400)
  }
})

module.exports = router

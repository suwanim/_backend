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

router.post("/checkinv", authen, async function (req, res, next) {
  try {
    const _body = req.body

    //console.log("_body", _body.length)

    const modifiedData = await Promise.all(
      req.body.slice(0).map(async (row, index) => {
        const newRow = []
        for (let i = 0; i < 24; i++) {
          const cell =
            row[i] !== undefined && row[i] !== null
              ? row[i].toString().trim()
              : ""
          const newCellValue = [0, 1, 2].includes(i)
            ? await processCellValue(
                cell,
                req.body[index][7],
                req.body[index][12],
                req.body[index][20]
              )
            : cell

          if (i === 0 && newCellValue.INV_NO !== undefined) {
            newRow.push(newCellValue.INV_NO)
          } else if (i === 1 && newCellValue.INV_DATE !== undefined) {
            newRow.push(newCellValue.INV_DATE)
          } else if (i === 2 && newCellValue.ITEM !== undefined) {
            newRow.push(newCellValue.ITEM)
          } else {
            newRow.push(newCellValue)
          }
        }
        return newRow
      })
    )

    // let _data = []
    // if (_result) {
    //   _data = JSON.stringify(_result)
    // } else {
    //   _data = _body
    // }

    console.log("modifiedData", modifiedData)

    return res.send(modifiedData).status(200)
  } catch (error) {
    console.log(error)
    return res.send("error").status(400)
  }
})

const processCellValue = async (cell, value7, value12, value20) => {
  console.log("cal value", cell, value7, value12, value20)

  if (cell === "") {
    const sql = `
      SELECT INV_NO, INV_DATE, ITEM
      FROM tb_inv
      WHERE value7 = '${value7}' AND value12 = '${value12}' AND value20 = '${value20}'
    `

    try {
      //const rows = await getTable(sql)
      let rowss = { INV_NO: "v0", INV_DATE: "v1", ITEM: "v2" }
      const rows = { length: 1 }

      if (rows.length > 0) {
        return rowss
      } else {
        console.log("No data found.")
        return cell
      }
    } catch (error) {
      console.error("Database query error:", error)
      return "err"
    }
  } else {
    return cell
  }
}

module.exports = router

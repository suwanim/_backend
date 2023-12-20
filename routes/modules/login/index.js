const express = require("express")
const router = express.Router()

const moment = require("moment")
const { v4: uuidv4 } = require("uuid")
const uuid = uuidv4()

const authen = require("../../functions/check_authen")
const eventlog = require("../../functions/event_log")
const db = require("../../../db_config/db_config")
const funcs = require("../../functions/functions_all")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource")
})

router.post("/register", async (req, res) => {
  try {
    let _body = ({
      user_name,
      user_role,
      user_username,
      user_password,
      user_remark,
      user_status,
      user_code,
    } = req.body)

    const _hashedPassword = await bcrypt.hash(user_password, 10)
    _body.user_password = _hashedPassword

    const _data = {
      user_name: user_name,
      user_role: user_role,
      user_username: user_username,
      user_password: _body.user_password,
      user_remark: user_remark,
      user_status: user_status,
      user_code: user_code,
    }

    let _result = await funcs.insertTable("tb_users", _data)

    if (_result.affectedRows > 0) {
      return res.send("Inserted").status(200)
    } else {
      return res.send("Error").status(400)
    }
  } catch (error) {
    console.log("catch", error)

    res.send(error).status(500)
  }
})

router.post("/login", async (req, res) => {
  try {
    const { user_username, user_password } = req.body

    // console.log(user_username, user_password)

    const _query =
      "SELECT * FROM tb_users WHERE user_username = '" + user_username + "'"
    // console.log("_query", _query)

    const _result = await funcs.getTable(_query)

    // console.log("_result", _result[0])

    const _user_password = _result[0].user_password
    if (!_result) {
      return res.sendStatus(401)
    }
    if (await bcrypt.compare(user_password, _user_password)) {
      const _token = jwt.sign({ user_username }, process.env.JWTSECRET)

      const _authenInfo = JSON.stringify({
        token: [_token],
        user_info: _result[0],
      })

      res.cookie("authToken", _authenInfo, { httpOnly: true })
      //res.json({ _token })

      // console.log("_jsonData", _jsonData)

      // ขั้นตอนการแปลงข้อมูลกลับ ฝั่งหน้าบ้าน
      // const _jj = JSON.stringify({
      //   token: [
      //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VzZXJuYW1lIjoidXNlcl91c2VybmFtZSIsImlhdCI6MTY3Nzc2NjYwMH0.GQ5grxWPCxhWn8N3zwRCQRysUgbIkDNn9T3gnIYQY2U",
      //   ],
      //   user_info: {
      //     id: 1,
      //     user_name: "user_name",
      //     user_role: "user_role",
      //     user_username: "user_username",
      //     user_password:
      //       "$2a$10$pmFuvoHv/aD.AfYxOyIKOuls6JAMlUtOGQ6KM7AGHXV4oawCilHfu",
      //     user_mobile: "user_mobile",
      //     user_department: "user_department",
      //     user_level: "user_level",
      //     user_remark: "user_remark",
      //     user_status: "user_status",
      //     user_code: "user_code",
      //   },
      // });
      // const jjObj = JSON.parse(_jj);
      // console.log(jjObj.token[0]);
      // console.log(jjObj.user_info.user_name);

      return res.status(200).send(_authenInfo)
    } else {
      return res.status(401).json({ error: "Invalid credentials" })
    }
  } catch (e) {
    console.log(e)
    res.status(500)
  }
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWTSECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.put("/test", authenticateToken, (req, res) => {
  try {
    console.log("test")
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

router.get("/protected", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      req.user.username,
    ])
    const user = result.rows[0]
    res.json(user)
  } catch {
    res.sendStatus(500)
  }
})

module.exports = router

const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")

const healthcheckRouter = require("./routes/index")
const customerRouter = require("./routes/modules/customer/customer")
const masterRouter = require("./routes/modules/master_data/master_data")
const masterItemRouter = require("./routes/modules/master_data/master_items")
const itemsRouter = require("./routes/modules/items/items")
const marketingCrossRefRouter = require("./routes/modules/marketing/cross_ref")
const marketingForecastRouter = require("./routes/modules/marketing/forecast")
const marketingCoRouter = require("./routes/modules/marketing/co")
const marketingKawainvRouter = require("./routes/modules/marketing/kawasaki_invoice")
const loginRouter = require("./routes/modules/login/index")

const swaggerUi = require("swagger-ui-express")
// const swaggerSpec = require("./swagger.yaml");
const swaggerJsDoc = require("swagger-jsdoc")

const cors = require("cors")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "NST Library API",
    },
    servers: [
      {
        url: "http://localhost:3000/api/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./routes/modules/items/*.js",
    "./routes/modules/master_data/*.js",
    "./routes/modules/customer/*.js",
    "./routes/modules/marketing/*.js",
  ],
}

const specs = swaggerJsDoc(options)

const app = express()

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(path.join(__dirname, "public/images")))
// app.use(
//   cors({
//     origin: "*", // Allow any domain to access your API
//     methods: ["GET", "POST", "PUT"], // Allowed request methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   })
// )
app.use(cors())

app.use("/", healthcheckRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {}))
app.use("/api/customer", customerRouter)
app.use("/api/master", masterRouter)
app.use("/api/masteritem", masterItemRouter)
app.use("/api/items", itemsRouter)
app.use("/api/marketing/crossref", marketingCrossRefRouter)
app.use("/api/marketing/forecast", marketingForecastRouter)
app.use("/api/marketing/co", marketingCoRouter)
app.use("/api/marketing/kawainv", marketingKawainvRouter)
app.use("/api/login", loginRouter)

module.exports = app

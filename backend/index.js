import crypto from "crypto"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import helmet from "helmet"
import mongoose from "mongoose"
import morgan from "morgan"
import multer from "multer"

import { createPost } from "./controllers/posts.js"
import { verifyAccessToken } from "./middleware/auth.js"
import authRoutes from "./routes/auth.js"
import postRoutes from "./routes/posts.js"
import userRoutes from "./routes/users.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))

const assetsDir = path.join(__dirname, "public/assets")
fs.mkdirSync(assetsDir, { recursive: true })
app.use("/assets", express.static(assetsDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, assetsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`)
  },
})
const upload = multer({ storage })

app.post("/post", verifyAccessToken, upload.single("picture"), createPost)

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postRoutes)

const PORT = process.env.PORT
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("mongo connected")
    app.listen(PORT, () => console.log(`listening from ${PORT}`))
  })
  .catch(e => {
    console.log("mongo could not be connected")
    console.log(e.message)
  })

process.on("SIGINT", async () => {
  await mongoose.connection.close()
  process.exit(0)
})

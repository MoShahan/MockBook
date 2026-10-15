import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import helmet from "helmet"
import mongoose from "mongoose"
import morgan from "morgan"

import { errorHandler } from "./middleware/errorHandler.js"
import authRoutes from "./routes/auth.js"
import postRoutes from "./routes/posts.js"
import userRoutes from "./routes/users.js"

dotenv.config()
const app = express()
app.use(express.json({ limit: "1mb" }))

/** Comma-separated browser origins allowed to call this API (e.g. http://localhost:3000). */
const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, false)
    },
    credentials: true,
  })
)
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postRoutes)

app.use(errorHandler)

const PORT = process.env.PORT
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required")
  process.exit(1)
}
if (!process.env.ACCESS_TOKEN_SECRET) {
  console.error("ACCESS_TOKEN_SECRET is required")
  process.exit(1)
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("mongo connected")
    app.listen(PORT, () => console.log(`listening from ${PORT}`))
  })
  .catch(e => {
    console.log("mongo could not be connected")
    console.log(e.message)
    process.exit(1)
  })

process.on("SIGINT", async () => {
  await mongoose.connection.close()
  process.exit(0)
})

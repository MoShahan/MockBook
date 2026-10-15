import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import helmet from "helmet"
import mongoose from "mongoose"
import morgan from "morgan"
import multer from "multer"

import authRoutes from "./routes/auth.js"
import postRoutes from "./routes/posts.js"
import userRoutes from "./routes/users.js"

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postRoutes)

// Multer rejects (file type / size) surface as errors from the upload middleware
app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5MB or smaller" : err.message
    return res.status(400).json({ error: msg })
  }
  if (err instanceof Error && err.message === "Only image uploads are allowed") {
    return res.status(400).json({ error: err.message })
  }
  return next(err)
})

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

import mongoose from "mongoose"

const Schema = mongoose.Schema

const CommentSchema = new Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const PostSchema = new Schema(
  {
    userId: { type: String, required: true },
    description: { type: String, default: "" },
    url: { default: "", type: String },
    likes: { type: Map, of: Boolean },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
)

const Post = mongoose.model("Post", PostSchema)

export default Post

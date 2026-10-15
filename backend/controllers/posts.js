import { uploadImageBuffer } from "../lib/imagekit.js"
import Post from "../models/Post.js"

export const createPost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const description = typeof req.body.description === "string" ? req.body.description : ""

    let url = ""
    if (req.file?.buffer) {
      const uploaded = await uploadImageBuffer(req.file.buffer, req.file.originalname, "/mockbook/posts")
      url = uploaded.url || ""
    }

    const newPost = new Post({ description, userId, url, likes: {}, comments: [] })
    await newPost.save()
    const posts = await Post.find()
    res.status(201).json(posts)
  } catch (e) {
    if (e.message?.includes("IMAGEKIT_PRIVATE_KEY")) {
      return res.status(503).json({ error: "Image upload is not configured" })
    }
    res.status(409).json({ msg: e.message })
  }
}

export const getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find()
    res.status(200).json(posts)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const post = await Post.findById(postId)
    res.status(200).json(post)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params
    const posts = await Post.find({ userId })
    res.status(200).json(posts)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const likePost = async (req, res, next) => {
  try {
    let message = ""
    const { postId } = req.params
    const { userId } = req.body
    const post = await Post.findById(postId)

    const isLiked = post.likes.get(userId)
    if (isLiked) {
      post.likes.delete(userId)
      message = "your like has been removed"
    } else {
      post.likes.set(userId, true)
      message = "you liked this post"
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, { likes: post.likes }, { new: true })

    res.status(200).json({ message, updatedPost })
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

import { uploadImageBuffer } from "../lib/imagekit.js"
import { withAuthors } from "../lib/posts.js"
import Post from "../models/Post.js"

export const createPost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const description = typeof req.body.description === "string" ? req.body.description.trim() : ""

    if (!description && !req.file?.buffer) {
      return res.status(400).json({ error: "Post must include text or an image" })
    }

    let url = ""
    if (req.file?.buffer) {
      const uploaded = await uploadImageBuffer(req.file.buffer, req.file.originalname, "/mockbook/posts")
      url = uploaded.url || ""
    }

    const newPost = new Post({ description, userId, url, likes: {}, comments: [] })
    await newPost.save()
    const posts = await Post.find().sort({ createdAt: -1 })
    res.status(201).json(await withAuthors(posts))
  } catch (e) {
    if (e.message?.includes("IMAGEKIT_PRIVATE_KEY")) {
      return res.status(503).json({ error: "Image upload is not configured" })
    }
    res.status(409).json({ msg: e.message })
  }
}

export const getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
    res.status(200).json(await withAuthors(posts))
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ msg: "Post not found" })
    }
    const [formatted] = await withAuthors([post])
    res.status(200).json(formatted)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params
    const posts = await Post.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(await withAuthors(posts))
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ msg: "Post not found" })
    }

    let message = ""
    const isLiked = post.likes.get(userId)
    if (isLiked) {
      post.likes.delete(userId)
      message = "your like has been removed"
    } else {
      post.likes.set(userId, true)
      message = "you liked this post"
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, { likes: post.likes }, { new: true })
    const [formatted] = await withAuthors([updatedPost])

    res.status(200).json({ message, updatedPost: formatted })
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const addComment = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId } = req.params
    const text = typeof req.body.text === "string" ? req.body.text.trim() : ""
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" })
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "Comment is too long" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ msg: "Post not found" })
    }

    post.comments.push({ userId, text, likes: {} })
    await post.save()

    const [formatted] = await withAuthors([post])
    res.status(201).json({ updatedPost: formatted })
  } catch (e) {
    res.status(409).json({ msg: e.message })
  }
}

export const likeComment = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId, commentId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (!comment.likes) {
      comment.likes = new Map()
    }

    let message = ""
    if (comment.likes.get(userId)) {
      comment.likes.delete(userId)
      message = "Comment like removed"
    } else {
      comment.likes.set(userId, true)
      message = "Comment liked"
    }

    post.markModified("comments")
    await post.save()

    const [formatted] = await withAuthors([post])
    res.status(200).json({ message, updatedPost: formatted })
  } catch (e) {
    next(e)
  }
}

export const editComment = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId, commentId } = req.params
    const text = typeof req.body.text === "string" ? req.body.text.trim() : ""
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" })
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "Comment is too long" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({ error: "You can only edit your own comments" })
    }

    comment.text = text
    post.markModified("comments")
    await post.save()

    const [formatted] = await withAuthors([post])
    res.status(200).json({ message: "Comment updated", updatedPost: formatted })
  } catch (e) {
    next(e)
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId, commentId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({ error: "You can only delete your own comments" })
    }

    comment.deleteOne()
    await post.save()

    const [formatted] = await withAuthors([post])
    res.status(200).json({ message: "Comment deleted", updatedPost: formatted })
  } catch (e) {
    next(e)
  }
}

export const deletePost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    if (String(post.userId) !== String(userId)) {
      return res.status(403).json({ error: "You can only delete your own posts" })
    }

    await Post.findByIdAndDelete(postId)
    res.status(200).json({ message: "Post deleted", postId })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

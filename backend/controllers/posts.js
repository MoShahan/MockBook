import { uploadImageBuffer } from "../lib/imagekit.js"
import {
  likesMapKeys,
  parseLikersPagination,
  resolveLikersPage,
  withAuthors,
} from "../lib/posts.js"
import Post from "../models/Post.js"
import User from "../models/User.js"

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

/** List users who liked a post (from the post likes map keys). Supports ?page=&limit=. */
export const getPostLikers = async (req, res, next) => {
  try {
    const { postId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const pagination = parseLikersPagination(req.query)
    const result = await resolveLikersPage(likesMapKeys(post.likes), pagination)
    res.status(200).json(result)
  } catch (e) {
    next(e)
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

/** List users who liked a comment (from the comment likes map keys). Supports ?page=&limit=. */
export const getCommentLikers = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    const pagination = parseLikersPagination(req.query)
    const result = await resolveLikersPage(likesMapKeys(comment.likes), pagination)
    res.status(200).json(result)
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
    // Drop deleted post from everyone's bookmarks.
    await User.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } })
    res.status(200).json({ message: "Post deleted", postId })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

/** Idempotent save: add post to JWT user's savedPosts (own or others’). */
export const savePost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId } = req.params
    const post = await Post.findById(postId).select("_id")
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: post._id } },
      { new: true }
    ).select("savedPosts")

    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    res.status(200).json({
      message: "Post saved",
      saved: true,
      savedPosts: (user.savedPosts || []).map(id => String(id)),
    })
  } catch (e) {
    next(e)
  }
}

/** Remove post from JWT user's savedPosts. */
export const unsavePost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { postId } = req.params
    const post = await Post.findById(postId).select("_id")
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedPosts: post._id } },
      { new: true }
    ).select("savedPosts")

    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    res.status(200).json({
      message: "Post unsaved",
      saved: false,
      savedPosts: (user.savedPosts || []).map(id => String(id)),
    })
  } catch (e) {
    next(e)
  }
}

/** List posts the JWT user has saved (newest save first). Private to owner. */
export const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const user = await User.findById(userId).select("savedPosts")
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const idsNewestFirst = [...(user.savedPosts || [])].reverse().map(id => String(id))
    if (idsNewestFirst.length === 0) {
      return res.status(200).json([])
    }

    const posts = await Post.find({ _id: { $in: idsNewestFirst } })
    const byId = Object.fromEntries(posts.map(p => [String(p._id), p]))
    const ordered = idsNewestFirst.map(id => byId[id]).filter(Boolean)

    res.status(200).json(await withAuthors(ordered))
  } catch (e) {
    next(e)
  }
}

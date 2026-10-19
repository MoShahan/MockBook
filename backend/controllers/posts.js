import { assertFeatureEnabled } from "../lib/features.js"
import { uploadImageBuffer } from "../lib/imagekit.js"
import { createNotification } from "../lib/notifications.js"
import { pageFromDocs, parseCursorPagination } from "../lib/pagination.js"
import { graphemeLength, POST_DESCRIPTION_MAX } from "../lib/postLimits.js"
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

    await assertFeatureEnabled(req, "postsCreate")

    const description = typeof req.body.description === "string" ? req.body.description.trim() : ""

    if (!description && !req.file?.buffer) {
      return res.status(400).json({ error: "Post must include text or an image" })
    }
    if (graphemeLength(description) > POST_DESCRIPTION_MAX) {
      return res.status(400).json({ error: `Post text must be ${POST_DESCRIPTION_MAX} characters or fewer` })
    }

    let url = ""
    if (req.file?.buffer) {
      await assertFeatureEnabled(req, "postsImages")
      const uploaded = await uploadImageBuffer(req.file.buffer, req.file.originalname, "/xivi/posts")
      url = uploaded.url || ""
    }

    const newPost = new Post({ description, userId, url, likes: {}, comments: [] })
    await newPost.save()
    const [formatted] = await withAuthors([newPost])
    res.status(201).json({ post: formatted })
  } catch (e) {
    if (e.message?.includes("IMAGEKIT_PRIVATE_KEY")) {
      return res.status(503).json({ error: "Image upload is not configured" })
    }
    next(e)
  }
}

/**
 * Home feed. Query `scope`:
 * - `all` (default): every post, newest first
 * - `friends` (alias for personal network): me ∪ accepted friends ∪ users I follow
 */
export const getFeed = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const scopeRaw = typeof req.query.scope === "string" ? req.query.scope.trim().toLowerCase() : "all"
    const scope =
      scopeRaw === "friends" || scopeRaw === "following" || scopeRaw === "network"
        ? "friends"
        : "all"

    const { limit, cursorDate } = parseCursorPagination(req.query)
    const filter = cursorDate ? { createdAt: { $lt: cursorDate } } : {}

    if (scope === "friends") {
      const me = await User.findById(userId).select("friends following")
      if (!me) {
        return res.status(401).json({ error: "Unauthenticated" })
      }
      const authorIds = [
        ...new Set([
          String(userId),
          ...(me.friends || []).map(id => String(id)),
          ...(me.following || []).map(id => String(id)),
        ]),
      ]
      filter.userId = { $in: authorIds }
    }

    const docs = await Post.find(filter).sort({ createdAt: -1 }).limit(limit + 1)
    const { pageDocs, nextCursor, hasMore } = pageFromDocs(docs, limit)
    res.status(200).json({
      posts: await withAuthors(pageDocs),
      nextCursor,
      hasMore,
      scope,
    })
  } catch (e) {
    next(e)
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
    const { limit, cursorDate } = parseCursorPagination(req.query)
    const filter = { userId, ...(cursorDate ? { createdAt: { $lt: cursorDate } } : {}) }
    const docs = await Post.find(filter).sort({ createdAt: -1 }).limit(limit + 1)
    const { pageDocs, nextCursor, hasMore } = pageFromDocs(docs, limit)
    res.status(200).json({
      posts: await withAuthors(pageDocs),
      nextCursor,
      hasMore,
    })
  } catch (e) {
    next(e)
  }
}

export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    await assertFeatureEnabled(req, "likesPosts")

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
      void createNotification({
        recipientId: String(post.userId),
        actorId: userId,
        type: "post_like",
        postId: String(post._id),
      })
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, { likes: post.likes }, { new: true })
    const [formatted] = await withAuthors([updatedPost])

    res.status(200).json({ message, updatedPost: formatted })
  } catch (e) {
    if (e.status === 403 && e.expose) {
      return res.status(403).json({ error: e.message })
    }
    next(e)
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

    await assertFeatureEnabled(req, "commentsCreate")

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

    const added = post.comments[post.comments.length - 1]
    void createNotification({
      recipientId: String(post.userId),
      actorId: userId,
      type: "comment",
      postId: String(post._id),
      commentId: added?._id ? String(added._id) : null,
    })

    const [formatted] = await withAuthors([post])
    res.status(201).json({ updatedPost: formatted })
  } catch (e) {
    if (e.status === 403 && e.expose) {
      return res.status(403).json({ error: e.message })
    }
    next(e)
  }
}

export const likeComment = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    await assertFeatureEnabled(req, "likesComments")

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
      void createNotification({
        recipientId: String(comment.userId),
        actorId: userId,
        type: "comment_like",
        postId: String(post._id),
        commentId: String(comment._id),
      })
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

    await assertFeatureEnabled(req, "commentsEdit")

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

    const isOwner = String(comment.userId) === String(userId)
    const isAdmin = req.user?.role === "admin"
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You can only delete your own comments" })
    }
    // Owner delete respects flag; admin moderation always allowed.
    if (isOwner && !isAdmin) {
      await assertFeatureEnabled(req, "commentsDelete")
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

    const isOwner = String(post.userId) === String(userId)
    const isAdmin = req.user?.role === "admin"
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "You can only delete your own posts" })
    }
    if (isOwner && !isAdmin) {
      await assertFeatureEnabled(req, "postsDelete")
    }

    await Post.findByIdAndDelete(postId)
    // Drop deleted post from everyone's bookmarks.
    await User.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } })
    res.status(200).json({ message: "Post deleted", postId })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

/** Update own post description and/or image (multipart optional `picture`). */
export const updatePost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    await assertFeatureEnabled(req, "postsEdit")

    const { postId } = req.params
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    if (String(post.userId) !== String(userId)) {
      return res.status(403).json({ error: "You can only edit your own posts" })
    }

    const hasDescriptionField = typeof req.body.description === "string"
    const description = hasDescriptionField ? req.body.description.trim() : (post.description || "").trim()

    const removeImageRaw = req.body.removeImage
    const removeImage =
      removeImageRaw === true ||
      removeImageRaw === "true" ||
      removeImageRaw === "1"

    let url = post.url || ""
    if (removeImage) {
      await assertFeatureEnabled(req, "postsImages")
      url = ""
    }
    if (req.file?.buffer) {
      await assertFeatureEnabled(req, "postsImages")
      const uploaded = await uploadImageBuffer(req.file.buffer, req.file.originalname, "/xivi/posts")
      url = uploaded.url || ""
    }

    if (!description && !url) {
      return res.status(400).json({ error: "Post must include text or an image" })
    }
    if (graphemeLength(description) > POST_DESCRIPTION_MAX) {
      return res.status(400).json({ error: `Post text must be ${POST_DESCRIPTION_MAX} characters or fewer` })
    }

    post.description = description
    post.url = url
    await post.save()

    const [formatted] = await withAuthors([post])
    res.status(200).json({ message: "Post updated", updatedPost: formatted })
  } catch (e) {
    if (e.message?.includes("IMAGEKIT_PRIVATE_KEY")) {
      return res.status(503).json({ error: "Image upload is not configured" })
    }
    next(e)
  }
}

/** Idempotent save: add post to JWT user's savedPosts (own or others’). */
export const savePost = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    await assertFeatureEnabled(req, "postsSave")

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

    await assertFeatureEnabled(req, "postsSave")

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

/**
 * Posts the JWT user has liked (Map key = user id).
 * Sorted by post `createdAt` desc (document sort; not “liked at” time).
 */
export const getLikedPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const posts = await Post.find({ [`likes.${userId}`]: true }).sort({ createdAt: -1 })
    res.status(200).json(await withAuthors(posts))
  } catch (e) {
    next(e)
  }
}

/**
 * Distinct posts the JWT user has commented on.
 * Sorted by post `createdAt` desc (not newest-comment time).
 */
export const getCommentedPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const posts = await Post.find({ "comments.userId": String(userId) }).sort({ createdAt: -1 })
    res.status(200).json(await withAuthors(posts))
  } catch (e) {
    next(e)
  }
}

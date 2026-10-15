import Post from "../models/Post.js"

export const createPost = async (req, res, next) => {
  try {
    const { description, userId, url } = req.body
    const newPost = new Post({ description, userId, url, likes: {}, comments: [] })
    await newPost.save()
    const posts = await Post.find()
    res.status(201).json(posts)
  } catch (e) {
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

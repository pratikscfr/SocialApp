const router = require('express').Router();

const Post = require('../models/Posts');
const User = require('../models/Users');

// create a post
router.post('/', async (req, res) => {
  try {
    const newPost = await new Post(req.body);
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      return res.status(200).json('Post updated');
    } else {
      return res.status(403).json('Update only your post');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json('Post deleted');
    } else {
      return res.status(403).json('Can only delete your own post');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// like/dislike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      return res.status(200).json('Post liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      return res.status(200).json('Post disliked');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(200).json(err.message);
  }
});
// get all posts i.e show all posts in timeline
router.get('/timeline/all', async (req, res) => {
  try {
    const currUser = await User.findById(req.body.userId);
    const userPost = await Post.find({ userId: currUser._id });
    const friendPost = await Promise.all(
      currUser.followins.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return res.status(200).json(userPost.concat(...friendPost));
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

module.exports = router;

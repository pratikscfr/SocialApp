const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/Users');

// update user
router.put('/:id', async (req, res) => {
  try {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json('Account Updated');
    } else {
      return res.status(403).json('Cannot update other account');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// delete user
router.delete('/:id', async (req, res) => {
  try {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json('Account Deleted');
    } else {
      return res.status(403).json('Cannot delete other account');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// get a user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, isAdmin, __v, _id, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// follow user
router.put('/:id/follow', async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currUser.updateOne({ $push: { followins: req.params.id } });
        return res.status(200).json('User followed');
      } else {
        return res.status(403).json('You already follow the person');
      }
    } else {
      return res.status(403).json('Cannot follow own account');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});
// unfollow user
router.put('/:id/unfollow', async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currUser.updateOne({ $pull: { followins: req.params.id } });
        return res.status(200).json('User unfollowed');
      } else {
        return res.status(403).json('You do not follow the person');
      }
    } else {
      return res.status(403).json('Cannot unfollow own account');
    }
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

module.exports = router;

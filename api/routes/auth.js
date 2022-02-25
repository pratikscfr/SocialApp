const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/Users');

// Register
router.post('/register', async (req, res) => {
  try {
    // Generate Hashed Password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // create new user
    const user = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    // save user and respond
    await user.save();
    res.status(200).json(user);
    // res.send('OK');
  } catch (err) {
    // console.error(err);
    res.status(500).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json('User Not Found');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json('Wrong Password');
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err.message);
    console.error(err);
  }
});

module.exports = router;

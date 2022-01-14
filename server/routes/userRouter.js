const { Router } = require('express')
const userRouter = Router();
const User = require("../models/User")
const { hash, compare } = require('bcryptjs')

userRouter.post("/register", async (req, res) => {
  try {
    if (req.body.password.length < 6) throw new Error('password is too short')
    if (req.body.username.length < 3) throw new Error("username is too short")
    const hashedPassword = await hash(req.body.password, 10)
    console.log(hashedPassword)
    const user = await new User({
      name: req.body.name,
      username: req.body.username,
      password: hashedPassword,
      sessions: [{ createdAt: new Date() }]
    }).save()
    const session = user.sessions[0]
    res.json({ message: 'user registered', sessionID: session._id, name: user.name })
  } catch(err) {
    res.status(400).json({ message: err.message })
  }
})

// post -> patch 
userRouter.patch("/login", async(req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    const isValid = await compare(req.body.password, user.password)
    if(!isValid) throw new Error("Failed")
    user.sessions.push({ createdAt: new Date() })
    const session = user.sessions[user.sessions.length - 1]
    await user.save()
    res.json({
      message: "user validated",
      sessionId: session._id,
      name: user.name
    })
  } catch(err) {
    res.status(400).json({ message: err.message })
  }
})

userRouter.patch("/logout", async(req, res) => {
  try {
    const { sessionid } = req.headers
    const user = await User.findOne({ "sessions._id": sessionid })
    if(!user) throw new Error("invalid sessionId")
    await User.updateOne(
      { _id: user.id },
      { $pull: { sessions: { _id:sessionid } } }
    )
    res.json({ message: "user is logged out" })
  } catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
})

module.exports = { userRouter }
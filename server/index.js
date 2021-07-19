const { User } = require('./models')

const express = require('express')

const app = express()

app.use(express.json())

app.get('/api/users', async (req, res) => {
  const users = await User.find()
  res.send(users)
})

app.post('/api/register', async (req, res) => {
  // const user = await User.create(req.body)
  const user = await User.create({
    userName: req.body.userName,
    passWord: req.body.passWord,
  })
  res.send(user)
})

// app.delete('/api/register/:id', async (req, res) => {
//   await User.findByIdAndRemove(req.params.id)
//   res.send({
//     status: true
//   })
// })

app.listen(3001, () => {
  console.log('http://localhost:3001');
})
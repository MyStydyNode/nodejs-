const { User } = require('./models')

const express = require('express')

const app = express()

app.use(express.json())

// 获取所有用户
app.get('/api/users', async (req, res) => {
  const users = await User.find()
  res.send(users)
})

// 用户注册接口
app.post('/api/register', async (req, res) => {
  // const user = await User.create(req.body)
  const user = await User.create({
    userName: req.body.userName,
    password: req.body.password,
  })
  res.send(user)
})

// 用户登录接口
app.post('/api/login', async (req, res) => {
  // findOne 表示通过什么内容去找
  const user = await User.findOne({
    userName: req.body.userName
  })

  //首先判断用户名是否存在
  if (!user) {
    // 返回一个中断条件，实际直接 throw error
    return res.status(422).send({
      message: '用户名不存在'
    })
  }

  /**
   * compareSync 同步比较方法，encrypted 表示数据库已经加密的散列的值
   * function compareSync(data: string | Buffer, encrypted: string): boolean
   */
  const isPasswordValid = require('bcrypt').compareSync(
    req.body.password,
    user.password,
  )
  // 再校验密码是否正确
  if (!isPasswordValid) {
    return res.status(422).send({
      message: '密码不正确'
    })
  }
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
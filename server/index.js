const { User } = require('./models')

const express = require('express')

// 生成token
const jwt = require('jsonwebtoken')

const SECRET = 'sdadasdsd343424234gffgf'

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
  // res.send(user)

  /**
   * 进行签名
   * payload 表示进行操作的数据是什么,secretOrPrivateKey 表示密钥
   * function sign(payload: string | object | Buffer, secretOrPrivateKey: Secret, options?: SignOptions)
   * 一般生成的token 告诉服务端签发的token在我们数据库对应的是哪个用户，所有一般最简单的用用户id就可以了
   * 可以通过id 去寻找数据库中是否存在这个用户
   */
  const token = jwt.sign({
    id: String(user._id),
  }, SECRET)
  res.send({
    user,
    token,
  })
})


// express 的中间键
const auth = async (req, res, next) => {
  const raw = String(req.headers.authorization).split(' ').pop()
  const { id } = jwt.verify(raw, SECRET)
  // 找到用户
  req.user = await User.findById(id)
  // next 表示接下来要执行什么东西
  next()
}


// 获取用户个人信息
// app.get('/api/profile', async (req, res) => {
//   const raw = String(req.headers.authorization).split(' ').pop()
//   const { id } = jwt.verify(raw, SECRET)
//   // 找到用户
//   const user = await User.findById(id)
//   return res.send(user)
// })
app.get('/api/profile', auth, async (req, res) => {
  return res.send(req.user)
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
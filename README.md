# nodejs-
##  nodejs（express）的注册，登录和授权

### 知识点

##### 起步

- 首先创建 `package.json` 文件

  ```sh
  $ npm init
  ```

- 安装 express，要安装express的下一个版本，但是没有发布

  ```sh
  $ npm i express@next
  ```

- 安装 mongodb数据库

  ```sh
  $ npm i mongoose
  ```

- 在根目录下创建server.js 文件，且配置好相关配置

  ```js
  const express = require('express')
  
  const app = express()
  
  app.get('/', async (req, res) => {
    res.send('ok')
  })
  
  app.listen(3001, () => {
    console.log('http://localhost:3001');
  })
  ```

- 运行后端接口

  ```sh
  $ nodemon server
  ```

##### 注册密码加密

- bcrypt的散列加密

  - 安装bcrypt

    ```sh
    $ npm i bcrypt
    ```

  - 使用bcrypt

    ```js
    passWord: {
      type: String,
      //设置密码保密性
      set (val) {
        // return val //默认传值且只能写同步方法
        /**
         * hashSync 两个参数，一个为所要转换的值，另一个为加密强度
         * function hashSync(data: string | Buffer, saltOrRounds: string | number): string
         */
        return require('bcrypt').hashSync(val, 10)
      }
    },
    ```

##### 登录密码进行密码校验

```js
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
```

##### 授权

- 在登录那发送token给服务端

  ```js
  // res.send(user)
  res.send({
    user,
    token: 'fake token...'
  })
  ```

- 安装 jsonwebtoken

  ```sh
  $ npm i jdonwebtoken
  ```

- 使用jsonwebtoken

  - 引用
  
    ```js
    // 生成token
    const jwt = require('jsonwebtoken')
    ```
  
  - 代码使用
  
    ```js
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
    ```
  
    ```js
    app.get('/api/profile', async (req, res) => {
      const raw = String(req.headers.authorization).split(' ').pop()
      const { id } = jwt.verify(raw, SECRET)
      // 找到用户
      const user = await User.findById(id)
      return res.send(user)
    })
    ```
  
    ```http
    ### 个人信息
    ### 前提是必须传token,才能知道是谁 
    GET {{url}}/profile
    # Authorization: Bearer 1eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjU5NWExM2E2YzJiMGY3NDMyYjVkNCIsImlhdCI6MTYyNjcwOTAzNH0.wlMz_dk3Mt69bb2Xw2XNmn-d1T7Q3oa5PvJ_0nrMM-I ### JsonWebTokenError: invalid token
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjU5NWExM2E2YzJiMGY3NDMyYjVkNCIsImlhdCI6MTYyNjcwOTAzNH0.wlMz_dk3Mt69bb2Xw2XNmn-d1T7Q3oa5PvJ_0nrMM-I
    ```

### 总结

##### server

###### models.js

```js
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/express-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})

const UserSchema = new mongoose.Schema({
  // userName: String,
  // unique -设置唯一性
  userName: { type: String, unique: true },
  // password: String,
  password: {
    type: String,
    //设置密码保密性
    set (val) {
      // return val //默认传值且只能写同步方法
      /**
       * hashSync 两个参数，一个为所要转换的值，另一个为加密强度
       * function hashSync(data: string | Buffer, saltOrRounds: string | number): string
       */
      return require('bcrypt').hashSync(val, 10)
    }
  },
})
const User = mongoose.model('User', UserSchema)

//删除 User 的集合
// User.db.dropCollection('users')

module.exports = { User }
```

###### index.js

```js
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
```

##### test.http

```http
@url = http://localhost:3001/api
@json = Content-Type: application/json

### 所有用户
GET {{url}}/users
### 注册
POST {{url}}/register
{{json}}

{
  "userName":"user",
  "password":"1111"
}
### 登录
POST {{url}}/login
{{json}}

{
  "userName":"user",
  "password":"1111"
}
### 用户名正确，密码正确
# {
#   "userName":"user",
#   "password":"11111"
# }
### 用户名正确，返回数据正确
# {
#   "userName":"user1",
#   "password":"11111"
# }
### 用户名不正确，没有返回数据

### 删除
# DELETE  {{url}}/register/60f5853c3614a81f7cd0d1bd

### 个人信息
### 前提是必须传token,才能知道是谁 
GET {{url}}/profile
# Authorization: Bearer 1eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjU5NWExM2E2YzJiMGY3NDMyYjVkNCIsImlhdCI6MTYyNjcwOTAzNH0.wlMz_dk3Mt69bb2Xw2XNmn-d1T7Q3oa5PvJ_0nrMM-I ### JsonWebTokenError: invalid token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjU5NWExM2E2YzJiMGY3NDMyYjVkNCIsImlhdCI6MTYyNjcwOTAzNH0.wlMz_dk3Mt69bb2Xw2XNmn-d1T7Q3oa5PvJ_0nrMM-I
```

  


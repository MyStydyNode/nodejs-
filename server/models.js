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
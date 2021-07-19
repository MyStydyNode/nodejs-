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
        return require('bcrypt').hashSync(val)
      }
    },
    ```

    


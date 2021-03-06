let sha1 = require('sha1');
let express = require('express');
let router = express.Router();
let UserModel = require('../../models/users');


router.get('/',function(req, res, next) {
    if(req.session.user){
        req.session.user = null;
        return res.json({
            code:200,
            message:'退出登录成功'
        })
    }else{
        return res.json({
            code:100,
            data:'',
            message:'登陆过期或未登陆'
        })
    }
  });
  
  module.exports = router;


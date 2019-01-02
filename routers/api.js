var express = require("express");
var router = express.Router();
//引入数据模型
var User = require("../models/User");

//定义返回格式
var responseData;
router.use(function(req,res,next){
	responseData = {
		code:0,
		message:""
	}
	next();
})

router.post("/user/register",function(req,res,next){
	//body-parser将解析完的post提交过来的数据已对象的形式挂在req.body	
	console.log(req.body);
	//1：对注册信息进行验证 2：和数据库进行比对
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;

	if(username == ""){
		responseData.code = 1;
		responseData.message = "用户名不能为空";
		res.json(responseData);
		return;
	}
	if(password == ""){
		responseData.code = 2;
		responseData.message = "密码不能为空";
		res.json(responseData);
		return;
	}
	if(password != repassword){
		responseData.code = 3;
		responseData.message = "两次输入的密码不一致";
		res.json(responseData);
		return;
	}

	//判断用户名是否被注册
	User.findOne({
		username:username
	}).then(function(userInfo){
		if(userInfo){
			responseData.code = 4;
			responseData.message = "用户名已经被注册";
			res.json(responseData);
			return;
		}

		var user = new User({
			username:username,
			password:password
		});
		//保存到数据库
		return user.save()
	}).then(function(newUserInfo){
		responseData.message = "注册成功";
		res.json(responseData);
	})
		
})

//添加登陆路由
router.post("/user/login",function(req,res,next){
	var username = req.body.username;
	var password = req.body.password;
	//判断登陆信息
	if(username ==""||password ==""){
		responseData.code = 1;
		responseData.message = "用户名和密码不能为空";
		//返回前端
		res.json(responseData);
		return;
	}
	//信息填完整，和数据库对比
	User.findOne({
		username:username,
		password:password
	}).then(function(userInfo){
			if(!userInfo){
				responseData.code = 2;
				responseData.message = "用户名和密码错误";
				res.json(responseData);
				return;
			}
			//用户名和密码正确
			responseData.message = "登陆成功";
			//将登录信息返回前端
			responseData.userInfo = {
				_id:userInfo._id,
				username:userInfo.username,
				isAdmin:userInfo.isAdmin
				
			}

			//设置cookie
			req.cookies.set("userInfo", JSON.stringify({
				_id: userInfo._id,
				username: userInfo.username,
				isAdmin:userInfo.isAdmin
			}))
			res.json(responseData);
			return;		
	})
})

//退出
router.get("/user/logout",function(req,res){
	//清除cookie
	req.cookies.set("userInfo",null);
	res.json(responseData)
})
//对外暴露
module.exports = router;
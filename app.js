//程序入口文件
//加载express模块
const express = require("express");
//加载模板模块
const swig = require("swig");
//加载数据库模块
const mongoose = require("mongoose");
//加载解析模块
const bodyparser = require("body-parser");
//加载cookies模块
const Cookies = require("cookies");

//引入数据库数据
var User=require("./models/User");
//创建应用application
var app = express();


//设置中间件
app.engine("html",swig.renderFile);


//设置模板文件的存放目录
app.set("views","./views");


//注册所使用的模板引擎 swig =>html
app.set("view engine","html");

//在开发阶段，取消模块缓存。
swig.setDefaults({cache:false});

//设置静态资源的加载路径
app.use("/public",express.static(__dirname + "/public"));

//body-parser设置
app.use(bodyparser.urlencoded({extended:true}));

//设置cookies
app.use(function(req,res,next){
	req.cookies = new Cookies(req,res);
	req.userInfo = {};
	if(req.cookies.get("userInfo")){
		try{
			req.userInfo = JSON.parse(req.cookies.get("userInfo"));
			
		}catch(error){
			console.log(error);
			next();
		}
	}
	next();
	
})

//监听跳转路径
app.use("/",require("./routers/main"));
app.use("/api",require("./routers/api"));
app.use("/admin",require("./routers/admin"));


//连接数据库
mongoose.connect("mongodb://127.0.0.1:27017",function(err){
	if(err){
		console.log("数据库连接失败：" + err);
	}else{
		console.log("数据库连接成功");
		//监听端口号
		app.listen("8081");
		console.log("listen to http://localhost:8081");
	}
})

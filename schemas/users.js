var mongoose = require("mongoose");

//定义用户表结构，对外暴露。
module.exports = new mongoose.Schema({
	username:String,
	password:String,

	//是否是管理员
	isAdmin: {
		type:Boolean,
		default:false
	}
})
// 内容表的结构
var mongoose = require("mongoose");

module.exports = new mongoose.Schema({
	//关联字段--内容分类的id
	category: {
		//类型
		type: mongoose.Schema.Types.ObjectId,
		//引用 声明关联了哪个表
		ref: "Category"
	},
	title: String,
	//简介
	description: {
		type: String,
		default: ""
	},
	//内容
	content: {
		type: String,
		default: ""
	},
	/*
		关联字段 -- 用户的id
	 */
	user: {
		//类型
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	//添加时间
	addTime: {
		type: Date,
		default: new Date()
	},
	// 点击量
	views: {
		type: Number,
		default: 0
	},
	//评论
	comments: {
		type: Array,
		default: []
	}
})




















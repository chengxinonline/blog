var express = require("express");
var router = express.Router();
var Category = require("./../models/Category");
var Content = require("./../models/Content");

//设置通用数据
var data;
router.use(function(req,res,next){
	data = {
		userInfo:req.userInfo,
		categories:[],
		category:req.query.category ||""//当前点击的分类		
	}
	//在这里，读取所有的分类信息，挂在到data上
	Category.find().then(function(categories){
		data.categories = categories;
		next();
	})
})

router.get("/",function(req,res,next){
	data.page = Number(req.query.page || 1);
	data.limit = 2;
	data.pages = 0;
	data.count = 0;

	var where = {};//查询条件
	if(data.category){
		where.category = data.category;
	}
	Content.where(where).count().then(function(count){
		//计算分页
		data.count = count;
		//计算总页数
		data.pages = Math.ceil(count / data.limit);
		//限制出界
		data.page = Math.min(data.page,data.pages);
		data.page = Math.max(data.page,1);
		//计算跳过的条数
		var skip = (data.page - 1) * data.limit;

		if(data.category){
			where.category = data.category;
		}
		return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(["category","user"]);
	}).then(function(contents){
		data.contents = contents;
		res.render("main/index",data);
	})
})

router.get("/view",function(req,res){
	//获取当天文章的id
	var contentId = req.query.contentid || "";//新建表之后，数据库会自动给每一条表里的数据一个id，不明白的时候直接去数据库或者console.log查一下
	//查询内容数据，并渲染
	Content.findOne({
		_id:contentId
	}).populate("user").then(function(content){
		data.content = content;
		content.comments.reverse();//根据时间逆序
		//设置阅读+1
		content.views++;
		content.save();
		res.render("main/view",data);
	})
})

//对外暴露
module.exports = router;
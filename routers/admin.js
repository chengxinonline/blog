var express = require("express");
var router = express.Router();
var User = require("./../models/User");
var Category = require("./../models/Category");
var Content = require("./../models/Content");

//先去进行管理员身份判断
router.use(function(req,res,next){
	if(!req.userInfo.isAdmin){
		res.send("对不起，只有管理员才能进入后台");
		return;
	}else{
		next();
	}
})

router.get("/",function(req,res,next){
	res.render("admin/index",{
		userInfo:req.userInfo
	})
})

//用户管理
router.get("/user",function(req,res,next){
	var page = Number(req.query.page || 1);
	var limit = 2;//每页几个数据
	var pages = 0;//总页数

	//查询注册用户数据库
	User.count().then(function(count){
		pages = Math.ceil(count / limit);

		page = Math.min(page,pages);

		page = Math.max(page,1);

		var skip = (page - 1) * limit;

		User.find().limit(limit).skip(skip).then(function(users){
			res.render("admin/user_index",{
				userInfo:req.userInfo,
				users:users,
				page:page,
				limit:limit,
				count:count,
				pages:pages,
				path:"user"
			})
		})
	})
})

//分类管理下的分类首页
router.get("/category",function(req,res){
	var page = Number(req.query.page || 1);
	var limit = 2;
	var pages = 0;

	//从数据库里将所有信息取出
	Category.count().then(function(count){
		pages = Math.ceil(count / limit);
		page = Math.min(page, pages);
		page = Math.max(page , 1);
		//根据当前页计算跳过多少条数据
		var skip = (page - 1) * limit;
		
		//查询数据库，显示数据
		Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
			res.render("admin/category_index", {
				userInfo: req.userInfo,
				categories: categories,
				page: page,
				count: count,
				pages: pages,
				limit: limit,
				path: "category"
			})
			
		})
	})

})
//分类添加
router.get("/category/add",function(req,res){
	res.render("admin/category_add",{
		userInfo:req.userInfo
	})
})
//通过post请求添加分类提交的数据
router.post("/category/add",function(req,res){
	var name = req.body.name || "";
	if(name == ""){
		res.render("admin/error", {
			userInfo:req.userInfo,
			message:"名称不能为空"
		}) 
		return;
	}

	//验证数据库是否有这个分类
	Category.findOne({
		name:name
	}).then(function(rs){
		if(rs){
			//数据库已经存在这个分类
			res.render("admin/error", {
				userInfo:req.userInfo,
				message:"分类已经存在"
			})
			return Promise.reject();
		}else{
			//不存在此分类，数据库进行保存
			return new Category({
				name:name
			}).save();
		}
	}).then(function(newCategory){
		if(newCategory){
			res.render("admin/success", {
				userInfo:req.userInfo,
				message:"分类保存成功",
				url:"/admin/category"
			})
		}
	});
})

//分类修改
router.get("/category/edit",function(req,res){
	var id = req.query.id || "";
	// console.log(req.query);
	// 获取要修改的分类信息
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"分类信息不存在"
			})
		}else{
			//如果查到了，跳转到修改界面
			
			res.render("admin/category_edit",{
				userInfo:req.userInfo,
				category:category
			})
		}
	})
})

//分类修改保存
router.post("/category/edit",function(req,res){
	//console.log(req.body);
	console.log(req.query);
	//获取需要修改的分类信息
	var id  = req.query.id || "";
	//
	//把post提交来的信息拿到
	var name = req.body.name || "";

	//查询数据库
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"分类信息不存在"
			});
			return Promise.reject();
		}else{
			//当用户没有做任何信息提交时
			if(name == category.name){
				res.render("admin/success",{
					userInfo:req.userInfo,
					message:"修改成功",
					url:"/admin/category"

				})
				return Promise.reject();
			}else{
				//要修改的分类名称是否已经在数据库存在
				return Category.findOne({
					_id:{$ne:id},
					name:name
				})
			}
		}
	}).then(function(sameCategory){
		if(sameCategory){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"数据库中已经存在该分类"
			});
			return Promise.reject();
		}else{
			return Category.update({
				_id:id
			},{
				name:name
			});
		}
	}).then(function(){
		res.render("admin/success",{
			userInfo:res.userInfo,
			message:"修改成功",
			url:"/admin/category"

		})
	})

})



//分类删除
router.get("/category/delete", function(req,res){
	//获取要删除的id
	//console.log(req.query);
	var id = req.query.id || "";
	Category.remove({
		_id:id
	}).then(function(){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"删除成功",
			url:"/admin/category"
		})
	})
})


//内容管理
//内容首页

router.get("/content",function(req,res){
	var page = Number(req.query.page || 1);
	var limit = 2;
	var pages = 0;//总页数
	Content.count().then(function(count){
		//计算总页数
		pages = Math.ceil(count / limit);
		page = Math.min(page,pages);
		page = Math.max(page,1);
		//根据当前页，算跳过多少条数据
		var skip = (page - 1) * limit;
		Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(["category","user"]).then(function(contents){
			res.render("admin/content_index",{
				userInfo:req.userInfo,
				contents:contents,
				page:page,
				count:count,
				pages:pages,
				limit:limit,
				path:"content"
			})
		})
		
	})
})
//内容添加

router.get("/content/add",function(req,res){
	//读取分类信息
	Category.find().sort({_id:-1}).then(function(categories){
		res.render("admin/content_add",{
			userInfo:req.userInfo,
			categories:categories
		})
	})
})
router.post("/content/add",function(req,res){
	//简单验证
	if(req.body.category == ""){
		req.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容分类不能为空"
		})
		return;
	}
	if(req.body.title == ""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容标题不能为空"
		})
		return;
	}
	if(req.body.description == ""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容简介不能为空"
		})
		return;
	}
	if(req.body.content == ""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容不能为空"
		})
		return;
	}
	//保存在数据库中
	new Content({
		category:req.body.category,
		title:req.body.title,
		description:req.body.description,
		content:req.body.content,
		user:req.userInfo._id

	}).save().then(function(result){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"内容保存成功",
			url:"/admin/content"
		})
		return;
	})
})

//内容修改
router.get("/content/edit",function(req,res){
	var id = req.query.id || "";

	var categories = [];//所有分类的数据

	Category.find().sort({id:-1}).then(function(rs){
		categories = rs;
		console.log(categories);
		return Content.findOne({
			_id:id
		}).populate("category");
	}).then(function(content){//查询要修改的数据
		if(!content){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"指定内容不存在"
			})
			return;
		}else{
			res.render("admin/content_edit",{
				userInfo:req.userInfo,
				content:content,
				categories:categories
			})
		}
		
	})
})
//保存修改的内容
router.post("/content/edit", function(req, res){
	var id = req.query.id || "";

	//先做一个简单的验证
	// 简单的验证
	if(req.body.category == ""){
		res.render("admin/error", {
			userInfo: req.userInfo,
			message: "内容分类不能为空"
		})
		return;
	}

	if(req.body.title == ""){
		res.render("admin/error", {
			userInfo: req.userInfo,
			message: "内容标题不能为空"
		})
		return;
	}

	if(req.body.description == ""){
		res.render("admin/error", {
			userInfo: req.userInfo,
			message: "内容简介不能为空"
		})
		return;
	}
	if(req.body.content == ""){
		res.render("admin/error", {
			userInfo: req.userInfo,
			message: "内容不能为空"
		})
		return;
	}
	//更新数据到数据库中
	Content.update({
		_id: id
	}, {
		category: req.body.category,
		title: req.body.title,
		description: req.body.description,
		content: req.body.content
	}).then(function(){
		res.render("admin/success", {
			userInfo: req.userInfo,
			message: '内容修改成功',
			url: "/admin/content"
		})
	})

})

//内容删除
router.get("/content/delete",function(req,res){
	var id  = req.query.id || "";
	Content.remove({
		_id:id
	}).then(function(){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"删除成功",
			url:"/admin/content"
		})
	})
})

//退出
router.get("/content/quit",function(req,res){
	var id  = req.query.id || "";
	res.render("admin/quit",{
		userInfo:req.userInfo,
		message:"退出成功",
		url:"/"
	})
})

//对外暴露
module.exports = router;
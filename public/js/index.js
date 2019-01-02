$(function(){
	//让显示和登录互斥显示
	var $loginBox = $("#loginBox");
	var $registerBox = $("#registerBox");
	var $userInfo = $("#userInfo");

	//点击马上注册，切换到注册的界面
	$loginBox.find("a").on("click", function(){
		$registerBox.show();
		$loginBox.hide();
	})

	$registerBox.find("a").on("click", function(){
		$registerBox.hide();
		$loginBox.show();
	})


	//注册
	$registerBox.find("button").on("click", function(){
		//点击注册按钮，通过ajax提交请求
		$.ajax({
			type: 'POST',
			url: "/api/user/register",
			data: {
				username: $registerBox.find("[name=username]").val(),
				password: $registerBox.find("[name=password]").val(),
				repassword:$registerBox.find("[name=repassword]").val()
			},
			dataType: "json",
			success: function(result){
				//拿到提交完数据以后的回馈
				console.log(result);
				
				$registerBox.find(".colWarning").html(result.message);
				if(!result.code){
					setTimeout(function(){
						//显示登录，隐藏注册
						$registerBox.hide();
						$loginBox.show();

					}, 1000);
					
				}

			},
			error: function(err){
				console.log("请求错误：" + err);
			}
		})
	})


	//登陆
	$loginBox.find("button").on("click",function(){
		//通过ajax请求数据
		$.ajax({
			type:"post",
			url:"api/user/login",
			data:{
				username:$loginBox.find("[name=username]").val(),
				password:$loginBox.find("[name=password]").val()
			},
			datatype:"json",
			success:function(result){
				//在页面上显示信息
				$loginBox.find(".colWarning").html(result.message);
				if(!result.code){
					setTimeout(function(){
						//将用户信息显示在页面上
						$userInfo.find(".username").html(result.userInfo.username);
						location.reload();
					},1000)
				}
			}
		})
	})
	$("#logoutBtn").on("click", function(){
		$.ajax({
			url: "/api/user/logout",
			success: function(result){
				if(!result.code){
					//重载页面
					window.location.reload();
				}
			},
			error: function(err){
				console.log("退出错误：" + err);
			}
		})
	})

//点击提交评论
	$("#messageBtn").click(function(){
		var oValue = $("#messageContent").val().replace(/\s/ig, "");
		if(!oValue){
			alert("评论内容不能为空");
		}else{
			$.ajax({
				type:"post",
				url:"api/comment/post",
				data:{
					contentId:$("#contentId").val(),//评论文本的id
					content:$("messageContent").val()//评论的文本
				},
				success:function(result){
					if(!result.code){
						$("#messageContent").val("");
						window.location.reload();
					}
				}
			})
		}
	})


})






















var mongoose = require("mongoose");
var usersSchema = require("../schemas/users");

//创建一个模型类
module.exports = mongoose.model("User",usersSchema);
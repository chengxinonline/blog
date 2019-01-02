var mongoose = require("mongoose");
var categoriesSchema = require("./../schemas/categories");

//创建一个模型类
module.exports = mongoose.model("Category", categoriesSchema);
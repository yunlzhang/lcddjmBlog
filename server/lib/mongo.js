let config = process.env.NODE_ENV === 'development' ? require('../../config/development') : require('../../config/production')
// let config = require('../../config/production');
let Mongolass = require('mongolass');
let mongolass = new Mongolass();
let mongoose = require('mongoose');
mongolass.connect(config.mongodb);
let moment = require('moment');
let objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
	afterFind: function (results) {
		results.forEach(function (item) {
			item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
		});
		return results;
	},
	afterFindOne: function (result) {
		if (result) {
			result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
		}
		return result;
	}
});


exports.User = mongolass.model('User', {
	name: {
		type: 'string'
	},
	password: {
		type: 'string'
	},
	intro: {
		type: 'string'
	}
});
exports.User.index({
	name: 1
}, {
	unique: true
}).exec(); // 根据用户名找到用户，用户名全局唯一

exports.Post = mongolass.model('Post', {
	author: {
		type: Mongolass.Types.ObjectId
	},
	title: {
		type: String
	},
	cover: {
		type: String
	},
	content: {
		type: String
	},
	tags: {
		type: Array
	},
	// pv: { type: 'number' }
});
exports.Post.index({
	author: 1,
	_id: -1
}).exec(); // 按创建时间降序查看用户的文章列表


exports.Comment = mongolass.model('Comment', {
	author: {
		type: Mongolass.Types.ObjectId
	},
	content: {
		type: String
	},
	postId: {
		type: Mongolass.Types.ObjectId
	}
});
exports.Comment.index({
	postId: 1,
	_id: 1
}).exec(); // 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({
	author: 1,
	_id: 1
}).exec(); // 通过用户 id 和留言 id 删除一个留言

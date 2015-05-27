'use strict';

var config = require('../../config/config');
var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: config.dbPoolSize,
	host: config.dbHost,
	user: config.dbUser,
	password: config.dbPassword,
	database: config.dbSchema
});

module.exports.getConnection = function(cb) {
	pool.getConnection(cb);
};

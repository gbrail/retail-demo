'use strict';

var db = require('../helpers/database');

module.exports.getProducts = function(req, res) {
	getConn(req, res, function(conn, req, res) {
		var offset = 0;
		var limit = 100;
		
		if (req.swagger.params.limit.value) {
			limit = req.swagger.params.limit.value;
		}
		if (req.swagger.params.offset.value) {
			offset = req.swagger.params.offset.value;
		}
		
		var params = [];
		var query = 'select sku, manufacturer, description, color, price from PRODUCTS';
		
		if (req.swagger.params.manufacturer.value) {
			query += joinQuery(params) + ' manufacturer = ?';
			params.push(req.swagger.params.manufacturer.value);
		}
		if (req.swagger.params.color.value) {
			query += joinQuery(params) + ' color = ?';
			params.push(req.swagger.params.color.value);
		}
		if (req.swagger.params.description.value) {
			query += joinQuery(params) + ' description like ?';
			params.push(req.swagger.params.description.value);
		}
		
		query += ' order by sku limit ? offset ?';
		params.push(limit);
		params.push(offset);
		
		console.log('%s %j', query, params); 
		
		conn.query(query, params,
		  function(err, rows) {
			  if (err) {
				  sendDbError(err, res);
			  } else {
				  var newRows = rows.map(fixRow);
				  res.json(newRows);
			  }
		  });
	});
};

function joinQuery(params) {
	if (params.length === 0) {
		return ' where';
	}
	return ' and';
}

module.exports.getProduct = function(req, res) {
	getConn(req, res, function(conn, req, res) {
		var sku = req.swagger.params.sku.value;
		conn.query('select sku, manufacturer, description, color, price from PRODUCTS where sku = ?', [sku],
		  function(err, rows) {
			  if (err) {
				  sendDbError(err, res);
			  } else if (rows.length === 0) {
			  	  res.status(404).json({ message: 'Not found'})
		      } else {
				  var result = fixRow(rows[0]);
				  console.log('Gonna send %j', result);
				  res.json(result);
			  }
		  });
	});
};

module.exports.createProduct = function(req, res) {
	getConn(req, res, function(conn, req, res) {
		var row = parseRow(req.body);
		conn.query('insert into PRODUCTS (sku, manufacturer, description, color, price) values (?, ?, ?, ?, ?)',
		  [row.sku, row.manufacturer, row.description, row.color, row.price],
		  function(err) {
			  if (err) {
				  sendDbError(err, res);
			  } else {
				  res.json(row);
			  }
		  });
	});
};

function fixRow(row) {
	row.price = row.price.toString();
	return row;
}

function parseRow(row) {
	if (row.price) {
		// Take the dollar sign from the price if there is one
		var pp = /^\$(.+)/.exec(row.price);
		if (pp) {
			row.price = pp[1];
		}
	}
	return row;
}

function getConn(req, res, cb) {
	db.getConnection(function(err, conn) {
		if (err) {
			sendDbError(err, res);
		} else {
			cb(conn, req, res);
		}
	});
}

function sendDbError(err, res) {
	var e = { message: err.toString() }
	res.status(500).json(e);
}

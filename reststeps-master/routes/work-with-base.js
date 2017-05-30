var express = require('express');
var router = express.Router();
var _ = require('lodash');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'leralera',
  database : 'mytst',
  multipleStatements: true
});

connection.connect();

router.get('/keyWords', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept");

    connection.query('SELECT Number FROM tbl_document; SELECT keyWords FROM tbl_document', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});

router.post('/abstracts', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept");

    var numbers = req.body['numbers[]'],
        query = '';

    if(typeof(numbers) == 'string') {
      query = 'SELECT Abstract FROM abstracts WHERE (idabstract='+ numbers +');';
    } else {
      for( var i = 0; i < numbers.length; i++) {
        var newQuery = 'SELECT Abstract FROM abstracts WHERE (idabstract='+ numbers[i] +');';
        query += newQuery;
      }
    }       

    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});

router.options('/',function (req,res,next) {
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.sendStatus(200);
});

module.exports = router;
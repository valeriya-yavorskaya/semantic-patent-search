var express = require('express');
var router = express.Router();
var _ = require('lodash');
var xml2js = require('xml2js');
var windows1251 = require('windows-1251');

var parseString = require('xml2js').parseString;

router.data = {
  initTree: null,
}

// router.get('/', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");    

//     mainPath+='../../1.xml';
    
//     var myPath = [];
//     for (var i=0;i<mainPath.length;i++) {
//                 if(mainPath[i]=='\\') {
//                     myPath.push('/');
//                 } else myPath.push(mainPath[i]);
//     }

//     res.send(myPath);

// });

router.post('/', function(req, res, next) {
    var fs = require('fs');

    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Origin", "*");

    router.data.myTreeString = req.body.tree;

    var xml = router.data.myTreeString;
    var res1=0;
    parseString(xml, function (err, result) {
        res1=result;
    });

    var obj = res1; 
    res.send(req.body.tree);

    var encodedData = windows1251.encode(req.body.tree);
    var path = __filename;

    fs.writeFile("../../нирм/URZ/output.sch", encodedData, 'ascii', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    fs.writeFile("../output.xml", encodedData, 'ascii', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

});

router.options('/',function (req,res,next) {
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.sendStatus(200);
});

module.exports = router;
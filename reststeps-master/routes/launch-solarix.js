var express = require('express');
var router = express.Router();
var _ = require('lodash');
var utf8 = require('utf8');
var fs = require('fs');

router.data = {
    userText: null,
}

router.post('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept");

    router.data.userText = req.body.text;
    console.log('try to launch Solarix');
    console.log('user text: ', router.data.userText);

    var encodedData = utf8.encode(router.data.userText);
    fs.writeFile("input.txt", router.data.userText, 'utf8', function(err) { //создание входного файла Solarix
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    var spawn = require('child_process').spawn,
    child = spawn('ParseLine.exe');
 
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        res.send('Solarix was launched');
    });

    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        res.send('Solarix wasn\'t launched');
    });

    child.on('close', function (code) {
        console.log('child process exited with code ' + code);
        res.send('Solarix was launched');
    });

});

router.get('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept");

    router.data.syntaxModelPath = 'out.xml';
    fs.readFile(router.data.syntaxModelPath, 'utf8', function(err, contents) {
        if(err) {
            return console.log(err);
        }
        
        router.data.syntaxModel = contents;
        res.send(router.data.syntaxModel);
    });
});

router.options('/',function (req,res,next) {
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.sendStatus(200);
});

module.exports = router;
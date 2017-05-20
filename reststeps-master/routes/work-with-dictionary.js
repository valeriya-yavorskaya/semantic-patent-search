var express = require('express');
var router = express.Router();
var _ = require('lodash');
var windows1251 = require('windows-1251');
var fs = require('fs');

router.data = {
    dictionary: null,
}

router.post('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept");

    var initialWords = JSON.parse(req.body.words),
        symbol = null,
        string = '',
        word = '',
        words = [],
        synonyms = {};
    console.log(initialWords);

    // router.data.dictionaryPath = '../dic/synmaster/synmaster.txt';
    router.data.dictionaryPath = '../dic/synmaster/example.txt';
    fs.readFile(router.data.dictionaryPath, 'utf8', function(err, contents) {
        if(err) {
            return console.log(err);
        }
        console.log("dictionary loaded");
        // console.log(contents);

        router.data.dictionary = contents;
        for (var i=0;i<router.data.dictionary.length;i++) {
            symbol = router.data.dictionary[i]; 
            if( symbol != '\n') { //не символ конца строки
                if( symbol != '|') { //не символ конца слова
                    word += symbol;
                } else {
                    words.push(word);
                    word = '';
                }                
            } else {
                words.push(word);
                for (var key in initialWords) {
                    for (var k=0;k<words.length;k++) {
                        if(initialWords[key] == words[k]) {
                            synonyms[key] = words;
                        }
                    }
                }
                word = '';
                words = [];
            }
        } 
        res.send(JSON.stringify(synonyms));  
        console.log('synonyms sent');
    });
});

router.options('/',function (req,res,next) {
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.sendStatus(200);
});

module.exports = router;
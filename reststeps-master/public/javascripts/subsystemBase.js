var keyWords = [],
    innerKeyWords = [],
    numbersOfAbstractsToTake = [];

function getKeyWords() {
    $.get('http://localhost:3000/work-with-base/keyWords', {
    }).then(function (res) {
        console.log('keyWords were loaded');
        workWithKeyWords(res);
    }, function (reason) {
        console.log(reason);
    });
};

function getAbstracts(numbersOfAbstractsToTake) {
    $.post('http://localhost:3000/work-with-base/abstracts', {
        numbers: numbersOfAbstractsToTake,
    }).then(function (res) {
        console.log('Abstracts were loaded');
        workWithAbstracts(res);
    }, function (reason) {
        console.log(reason);
    });
};

function workWithAbstracts(queryResult) {
    console.log(queryResult);
    if(queryResult.length == 1) {
        queryResult[0] = [queryResult[0]];
    }
    abstractsArray = joinAbstractsAndNumbers(numbersOfAbstractsToTake, queryResult);
    console.log(abstractsArray);
}

function workWithKeyWords(queryResult) {
    keyWords = joinKeyWordsAndNumbers(queryResult[0], queryResult[1]);
    compareKeyWords(innerKeyWords, keyWords);
    numbersOfAbstractsToTake = [];
    for( var i = 0; i < keyWords.length; i++) { 
        if(keyWords[i].similarity != 0) {
            numbersOfAbstractsToTake[numbersOfAbstractsToTake.length] = keyWords[i].number.Number;
        }
    }
    getAbstracts(numbersOfAbstractsToTake);
}

function compareKeyWords(innerKeyWords, keyWords) {
    for( var i = 0; i < keyWords.length; i++) {
        keyWords[i].similarity = compareArrays(keyWords[i].keyWords, innerKeyWords);
    }
}

function compareArrays(array, innerArray) {
    similarity = 0;
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < innerArray.length; j++) {
            if(array[i] == innerArray[j]) {
                similarity++;
            }
        }
    }
    return similarity;
}

function joinKeyWordsAndNumbers(arrayNumbers, arrayKeyWords) {
    var newKeyWords = [];
    for( var i = 0; i < arrayNumbers.length; i++) {
        newKeyWords[i] = {};
        newKeyWords[i].number = arrayNumbers[i];
        newKeyWords[i].keyWords = arrayKeyWords[i].keyWords.split(',');
        newKeyWords[i].similarity = 0;
    }
    return newKeyWords;
}

function joinAbstractsAndNumbers(arrayNumbers, arrayAbstracts) {
    var newArray = [];
    for( var i = 0; i < arrayNumbers.length; i++) {
        newArray[i] = {};
        newArray[i].number = arrayNumbers[i];
        newArray[i].abstract = arrayAbstracts[i][0].Abstract;
    }
    return newArray;
}

function getInnerKeyWords(array) {
    innerKeyWords = array.split(',');
}
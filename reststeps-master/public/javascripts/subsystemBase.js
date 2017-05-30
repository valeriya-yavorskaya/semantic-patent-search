var innerKeyWords = [];

function getKeyWords() {
    $.get('http://localhost:3000/work-with-base/keyWords', {
    }).then(function (res) {
        console.log('keyWords were loaded');
        workWithBase(res);
    }, function (reason) {
        console.log(reason);
    });
};

function getAbstracts(numberOfPatentsToCompare) {
    $.post('http://localhost:3000/work-with-base/abstracts', {
        numbers: numberOfPatentsToCompare,
    }).then(function (res) {
        console.log('Abstracts were loaded');
        workWithAbstracts(res);
    }, function (reason) {
        console.log(reason);
    });
};

function getModels(numberOfPatentsToCompare) {
    $.post('http://localhost:3000/work-with-base/models', {
        numbers: numberOfPatentsToCompare,
    }).then(function (res) {
        console.log('Models were loaded');
        workWithModels(res);
    }, function (reason) {
        console.log(reason);
    });
};

function workWithBase(queryResult) {
    var numberOfPatentsToCompare = workWithKeyWords(queryResult);
    getModels(numberOfPatentsToCompare);    
}

function workWithModels(queryResult) {
    if(queryResult.length == 1) {
        queryResult[0] = [queryResult[0]];
    }
    var numbersOfAbstractsToTake = [];  
    for(var i = 0; i < queryResult.length; i++) {
        if(queryResult[i][0].semanticModel === null) {
            console.log('model doesn\'t exist');
            numbersOfAbstractsToTake[numbersOfAbstractsToTake.length] = queryResult[i][0].idsemanticModel;
        } else {
            console.log('model exist');
        }
    }
    getAbstracts(numbersOfAbstractsToTake);
}

function workWithAbstracts(queryResult) {
    if(queryResult.length == 1) {
        queryResult[0] = [queryResult[0]];
    }    
    console.log(queryResult);
    var similarityArray = [];
    for(var i = 0; i< queryResult.length; i++) {
        similarityArray[i] = {};
        similarityArray[i].number = queryResult[i][0].idabstract;
        similarityArray[i].syntaxModel = [];
        // similarityArray[i].semanticModel = queryResult[i][0];
        // similarityArray[i].similarity = queryResult[i][0];
    }
    console.log(similarityArray);
}

function workWithKeyWords(queryResult) {
    outerKeyWords = [];
    for (var i = 0; i < queryResult.length; i++) {
        outerKeyWords[i] = {};
        outerKeyWords[i].keyWords = queryResult[i].keyWords.split(','); 
        outerKeyWords[i].number =  queryResult[i].Number;

    }
    compareKeyWords(innerKeyWords, outerKeyWords);
    numberOfPatentsToCompare = [];
    for( var i = 0; i < outerKeyWords.length; i++) { 
        if(outerKeyWords[i].similarity != 0) {
            numberOfPatentsToCompare[numberOfPatentsToCompare.length] = outerKeyWords[i].number;
        }
    }
    return numberOfPatentsToCompare;
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

function getInnerKeyWords(array) {
    innerKeyWords = array.split(',');
}
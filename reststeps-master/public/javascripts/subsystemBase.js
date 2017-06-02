var innerKeyWords = [],
    newModels = {};

var elem = document.createElement('div');
var event = new CustomEvent("modelsWereBuilt");

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

function postModels(newModels) {
    $.post('http://localhost:3000/work-with-base/save-models', {
        models: newModels,
    }).then(function(res) {
        console.log(res);
    }, function(reason) {
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
    console.log(queryResult);
    var numbersOfAbstractsToTake = [];  
    var existingModels = 0;
    for(var i = 0; i < queryResult.length; i++) {
        if(queryResult[i][0].semanticModel === null) {
            console.log('model doesn\'t exist');
            numbersOfAbstractsToTake[numbersOfAbstractsToTake.length] = queryResult[i][0].idsemanticModel;
            getAbstracts(numbersOfAbstractsToTake);
        } else {
            console.log('model exist');
            existingModels++;
            var counter = 0; 
            for(var key in newModels) {
                counter++;
            }
            newModels[counter] = {};
            newModels[counter].model = queryResult[i][0].semanticModel;
            newModels[counter].number = queryResult[i][0].idsemanticModel;
        }
    }
    if( existingModels == queryResult.length ) {
        compareModels();
    }       
    elem.addEventListener("modelsWereBuilt", function(event) {
        compareModels();
    }, false); 
}

function compareModels() {
    console.log('let\'s compare');
}

function workWithAbstracts(queryResult) {
    var similarityArray = []
        semanticModelsArray = [];
    if(queryResult.length == 1) {
        queryResult[0] = [queryResult[0]];
    }

    queryResult.reduce(function(actionsChain, value){
        return actionsChain.then(function(){ 
            return takeSemanticModel(value[0].Abstract, value[0].idabstract);
        });
    }, Promise.resolve()).then(function(res) {   
        postModels(JSON.stringify(newModels));
        elem.dispatchEvent(event);
    });
}

function takeSemanticModel(abstract, number) {
    return new Promise( function(resolve, reject) {
        var newBody = null;
        var p1 = sendText(abstract);
        p1.then(function (res) {
            console.log(res);
            var p2 = takeXML();
                p2.then(function (res) {
                    console.log('syntax model was built');
                    newBody = fileParse(res);
                    hideContainer();
                    var counter = 0; 
                    for(var key in newModels) {
                        counter++;
                    }
                    newModels[counter] = {};
                    newModels[counter].model = newBody;
                    newModels[counter].number = number;              
                    resolve(newBody);
                }, function (reason) {
                    console.log(reason);
                    reject(reason);
                });
        }, function (reason) {
            console.log(reason);
            reject(reason);
        }); 
    });
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
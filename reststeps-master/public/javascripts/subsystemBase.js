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

function getAbstracts(numbersOfPatents) {
    $.post('http://localhost:3000/work-with-base/abstracts', {
        numbers: numbersOfPatents,
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

function takeEntireInfoForPatents(results) {
    $.post('http://localhost:3000/work-with-base/take-entire-info', {
        results: JSON.stringify(results),
    }).then(function(res) {
        for( var i = 0; i < res.length; i++) {
            for( var key in results) {
                if(res[i][0].Number == results[key].number) {
                    res[i][0].Similarity = results[key].similarity.toFixed(2);
                }
            }   
        }
        res.sort(compareObjectsSimilarity);
        displayComparisonResults(res);
    }, function(reason) {
        console.log(reason);
    });
}


function compareObjectsSimilarity(obj1, obj2) {
  return obj2[0].Similarity - obj1[0].Similarity;
}

function workWithBase(queryResult) {
    var numberOfPatentsToCompare = workWithKeyWords(queryResult);
    getModels(numberOfPatentsToCompare);    
}

function workWithModels(queryResult) {
    if(queryResult.length == 1) {
        queryResult[0] = [queryResult[0]];
    }
    var numbersOfAbstractsToTake = [];  
    var existingModels = 0;
    for(var i = 0; i < queryResult.length; i++) {
        if(queryResult[i][0].semanticModel === null) {
            console.log('model doesn\'t exist');
            numbersOfAbstractsToTake[numbersOfAbstractsToTake.length] = queryResult[i][0].idsemanticModel;
            // getAbstracts(numbersOfAbstractsToTake);
        } else {
            console.log('model exist');
            
            var counter = 0; 
            // for(var key in newModels) {
            //     counter++;
            // }
            newModels[existingModels] = {};
            newModels[existingModels].model = queryResult[i][0].semanticModel;
            newModels[existingModels].number = queryResult[i][0].idsemanticModel;
            existingModels++;
        }
    }
    if( existingModels == queryResult.length ) {
        compareOuterModelsWithInnerModel();
    } else {
        getAbstracts(numbersOfAbstractsToTake);
    }   
    elem.addEventListener("modelsWereBuilt", function(event) {
        compareOuterModelsWithInnerModel();
    }, false); 
}

function compareOuterModelsWithInnerModel() {
    console.log('let\'s compare');
    var results = [];
    var newModelsArray = [];

    for(var key in newModels) {
        newModelsArray[key] = newModels[key];
    }

    // Promise.all( newModelsArray.map(myfunc) )
    // .then(function (results)  {
    //     console.log(results);
    // });

    // function myfunc(elem) {
    //     return new Promise (function(resolve,reject) {
    //         console.log('here'); 
    //         var p =  compareModels(elem.model, builtSemanticModel);   
    //         p.then(function(res) {
    //             console.log(res);
    //         })      
    //         resolve(elem); 
    //     });       
    // }

    newModelsArray.reduce(function(actionsChain, value){
        return actionsChain.then(function(){ 
            return new Promise(function(resolve, reject) {
                var promise = compareModels(value.model, builtSemanticModel);
                promise.then(function(res) {
                    var key = results.length;
                    results[key] = {};
                    results[key].number = value.number;
                    results[key].similarity = res;
                    resolve(res);
                }, function(reason) {
                    reject(reason);
                });
            });
        });
    }, Promise.resolve()).then(function(res) {                
        takeEntireInfoForPatents(results);
    });
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
    //    for (var i=0; i<res.length; i++) {
    //        console.log(res[i]);
    //    }
        postModels(JSON.stringify(newModels));
        elem.dispatchEvent(event);
    });

    // Promise.all( queryResult.map(myfunc2) )
    // .then(function (results)  {
    //     console.log(results);
    // });

    // function myfunc2(elem) {
    //     console.log(elem);
    // }
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
/*функция, реализующая подсистему Сравнение*/
function compareModels(file, newBody) {   
     var globalSynonyms = null,
         newXML = file,
         obj = $(newXML);
    
     var takenObjectEdges = makeEdgesInfo(obj); 

     if(newBody=='') alert('Ошибка в рассматриваемом графе ');
     else {
         obj1 = $(newBody);
         /*получение информации о загруженнной семантической модели*/
         returnedValuesOfMakingObj = makeWordsInfo(obj1);
         var innerObjectWords = returnedValuesOfMakingObj[0];
         var innerObjectEdges = makeEdgesInfo(obj1);
     }
     
     /*получение информации о построенной семантической модели*/
     var returnedValuesOfMakingObj = makeWordsInfo(obj);
     var takenObjectWords = returnedValuesOfMakingObj[0];
     var wordsToFindSynonyms = returnedValuesOfMakingObj[1]; 
     var wrds = JSON.stringify(wordsToFindSynonyms);

     var countSimilarityPromise = countSimilarity(innerObjectWords, takenObjectWords, innerObjectEdges, takenObjectEdges, wrds);
     return countSimilarityPromise;
}

function countSimilarity(innerObjectWords, takenObjectWords, innerObjectEdges, takenObjectEdges, wrds) {
    return new Promise(function(resolve, reject) {
        var g = getSynonyms(wrds);
        g.then(function(res) {
            useSynonyms(res);
            var similarityInWords = compareObjectsInWords(innerObjectWords,takenObjectWords)[0];
            console.log(similarityInWords);
            var similarityInEdges = compareObjectsInEdges(innerObjectEdges,takenObjectEdges);
            console.log(similarityInEdges);
            var midSimilarity = (similarityInWords + similarityInEdges) / 2;
            resolve(midSimilarity);
        }, function(reason) {
            console.log(reason);
            reject(reason);
        })
    });
}

    function compareObjectsInWords(innerObject,takenObject) {
        var innerObjectLength = innerObject.length,
            takenObjectLength = takenObject.length,
            smallerObj=null,
            smallerLength=null,
            biggerObj=null,
            biggerLength=null,
            vertexB=null,
            vertexS=null,
            mas1=[],
            mas2=[],
            countOfAllElements=0,
            countOfSimilarElements=0,
            similarity=0,
            repeatitiveFlag = 0,
            repeatitiveCounterForInnerObject = 0,
            repeatitiveCounterForTakenObject = 0,
            repeatitiveCounter = 0,
            synonymsWereApplied = false;

            var repeatitiveInInnerObj = countRepetitive(innerObject);
            var repeatitivePropsInInnerObj = countRepeatitiveProps(innerObject);
            
            var repeatitiveInTakenObj = countRepetitive(takenObject);
            var repeatitivePropsInTakenObj = countRepeatitiveProps(takenObject);

            for (var i=0; i < repeatitiveInInnerObj.length; i++) {
                if( repeatitiveInInnerObj[i].count > 1) {
                    repeatitiveCounterForInnerObject += repeatitiveInInnerObj[i].count;
                }
            }
            if(repeatitiveCounterForInnerObject) {
                for (var key in repeatitivePropsInInnerObj) {
                    repeatitiveCounterForInnerObject += repeatitivePropsInInnerObj[key].count;
                }
            }
            
            for (var i=0; i < repeatitiveInTakenObj.length; i++) {
                if( repeatitiveInTakenObj[i].count > 1) {
                    repeatitiveCounterForTakenObject += repeatitiveInTakenObj[i].count;
                }
            }
            if(repeatitiveCounterForTakenObject) {
                for (var key in repeatitivePropsInTakenObj) {
                    repeatitiveCounterForTakenObject += repeatitivePropsInTakenObj[key].count;
                }
            }

            repeatitiveCounter = repeatitiveCounterForInnerObject + repeatitiveCounterForTakenObject;
            if(repeatitiveCounter) repeatitiveFlag = 1;

            if(innerObjectLength>takenObjectLength) {
                smallerObj = takenObject;
                smallerLength = takenObjectLength;
                biggerObj = innerObject;
                biggerLength = innerObjectLength;
            } else {
                smallerObj = innerObject;
                smallerLength = innerObjectLength;
                biggerObj = takenObject;
                biggerLength = takenObjectLength;
            }

            for (var i=0;i<smallerLength;i++) {
                vertexS = smallerObj[i];
                for(var j=0;j<biggerLength;j++) {
                    vertexB = biggerObj[j];
                    if(vertexS[0]!=vertexB[0]) continue;
                    else {
                        if(vertexS[1] == vertexB[1]) {
                            /*all is good maybe*/                            
                        } else {
                            var returnedValues = applySynonyms(vertexS[1],vertexB[1]);
                            if(returnedValues[0] == 0) {
                                continue;
                            }
                            if(!synonymsWereApplied) synonymsWereApplied = returnedValues[2];
                        }
                        
                    }
                    for(var k=0;k<vertexS.length;k++) {
                        if(typeof(vertexS[k])=='object') {
                            mas1 = (vertexS[k].length>vertexB[k].length) ? vertexB[k] : vertexS[k];
                            mas2 = (vertexS[k].length>vertexB[k].length) ? vertexS[k] : vertexB[k];
                            var mas1Repeatitive = countRepetitive(mas1);
                            var mas2Repeatitive = countRepetitive(mas2);
                            for(var mas1I = 0; mas1I < mas1Repeatitive.length; mas1I++ ) {
                                for(var mas2I = 0; mas2I < mas2Repeatitive.length; mas2I++ ) {
                                    if (mas1Repeatitive[mas1I]['word'] == mas2Repeatitive[mas2I]['word']) {
                                        countOfSimilarElements += mas1Repeatitive[mas1I]['count'] < mas2Repeatitive[mas2I]['count'] ? mas1Repeatitive[mas1I]['count'] : mas2Repeatitive[mas2I]['count'];
                                    } else {
                                        returnedValues = applySynonyms(mas1Repeatitive[mas1I]['word'],mas2Repeatitive[mas2I]['word']);
                                        countOfSimilarElements += returnedValues[0];
                                        if(!synonymsWereApplied) synonymsWereApplied = returnedValues[2];
                                    }
                                }
                            }
                        } else {
                            if(vertexS[k] == vertexB[k]) {
                                countOfSimilarElements++;
                            } else {
                                returnedValues = applySynonyms(vertexS[k],vertexB[k]);
                                countOfSimilarElements += returnedValues[0];
                                if(!synonymsWereApplied) synonymsWereApplied = returnedValues[2];
                            };
                        }
                        
                    }
                }                
            }            
            /*полное число элементов*/
            for(var i=0;i<biggerLength;i++) {
                vertexB = biggerObj[i];
                for(var k=0;k<vertexB.length;k++) {
                    if(typeof(vertexB[k])=='object') {
                        countOfAllElements += vertexB[k].length;
                    } else {
                        countOfAllElements++;
                    }
                }
            }
            if(repeatitiveFlag) countOfSimilarElements -= repeatitiveCounter;
            similarity = (countOfSimilarElements/countOfAllElements)*100;
            if(similarity < 0) similarity = 0;
            return [similarity, synonymsWereApplied];
    }

     /*функция, реализующая подсистему Сравнение для объектов, представляющих собой два набора свойств рёбер, имеющих общую вершину*/
    function compareObjectsInEdges(innerObject,takenObject) {
            takenArray = [],
            pairObj = {},
            innerPair = [],
            takenPair = [],
            pairSimilarity = 0,
            elementsWereSimilar = 0,
            elementOfInnerPair = null,
            elementOfTakenPair = null,
            pairElementsSimilarity = null,
            sumSimilarity = 0;

            /*массив объектов для хранения пар вершин построенной модели*/
            innerArray = innerObject.map( function (pair) {
                pairObj = {};
                pairObj[0] = pair[0];
                pairObj[1] = pair[1];
                return pairObj;
            });

            /*массив объектов для хранения пар вершин загруженной модели*/
            takenArray = takenObject.map( function (pair) {
                pairObj = {};
                pairObj[0] = pair[0];
                pairObj[1] = pair[1];
                pairObj.used = 0;
                pairObj.similarity = 0;
                return pairObj;
            });

            /*перебор всех пар вершин построенной модели*/
            for (var innerIterator = 0; innerIterator < innerArray.length; innerIterator++) {
                innerPair = innerArray[innerIterator];
                /*перебор всех пар вершин загруженной модели*/
                for (var takenIterator = 0; takenIterator < takenArray.length; takenIterator++) {
                    takenPair = takenArray[takenIterator];
                    if (takenPair.used == 2) continue; /*если данная пара уже полностью совпала
                                                         с парой из построенной модели, она больше не рассматривается*/
                    pairSimilarity = 0;
                    elementsWereSimilar = 0;
                    /*перебор вершин пары из построенной модели*/
                    for(var innerPairIterator = 0; innerPairIterator < 2; innerPairIterator++) {
                        elementOfInnerPair = innerPair[innerPairIterator];
                        /*перебор вершин пары из загруженной модели*/
                        for(var takenPairIterator = 0; takenPairIterator < 2; takenPairIterator++) {
                            elementOfTakenPair = takenPair[takenPairIterator];
                            /*получение значения совпадения вершин*/
                            pairElementsSimilarity = compareObjectsInWords([elementOfInnerPair], [elementOfTakenPair])[0];
                            if(pairElementsSimilarity == 100) elementsWereSimilar++; /*если элементы пары полностью совпали, 
                                                                                       это сохраняется в флаге elementsWereSimilar*/
                            pairSimilarity += pairElementsSimilarity; /*суммарное значение совпадения для пары складывается из
                                                                        значений совпадений элементов пары*/
                        }
                    } 
                    pairSimilarity = pairSimilarity > 200 ? 200 : pairSimilarity; /*если суммарное значение совпадения для пары превышает 200, 
                                                                                    то в паре были использованы похожие или совпадающие слова/свойства*/
                    takenPair.similarity = pairSimilarity / 2; /*значение приводится максимуму в 100%*/
                    takenPair.used = elementsWereSimilar; /*значение флага сохраняется в свойстве пары*/
                }
            }       

            sumSimilarity = 0;
            for(var key in takenArray) {
                sumSimilarity += takenArray[key].similarity; /*суммарное значение совпадения всех пар вершин 
                                                               высчитывается для построенной модели по отношению к загруженной*/
            }
            similarity = sumSimilarity / takenArray.length; /*значение нормируется по отношению к числу всех пар вершин*/
            if (similarity == NaN) similarity = 0;
            return similarity;
    }

    /*функция для определения числа повторяющихся элементов объекта*/
    function countRepetitive(objectWords) {
        var type = typeof(objectWords[0]);
        var words = [],
        flag = 0;
        switch(type) {
            case 'object': {
                words[0] = {};
                words[0].word = objectWords[0][1];
                words[0].count = 1;
                for( i = 1; i < objectWords.length; i++) {
                    flag = 0;
                    for( var j=0; j < words.length; j++) {
                        if( objectWords[i][1] == words[j].word ) {
                            words[j].count++;
                            flag = 0;
                            break;
                        } else {
                            flag = 1;
                        }
                    }
                    if(flag) {
                        index = words.length;
                        words[index] = {};
                        words[index].word = objectWords[i][1];
                        words[index].count = 1;
                    }
                    
                }
                break;
            }
            case 'string': {
                words[0] = {};
                words[0].word = objectWords[0];
                words[0].count = 1;
                for( i = 1; i < objectWords.length; i++) {
                    flag = 0;
                    for( var j=0; j < words.length; j++) {
                        if( objectWords[i] == words[j].word ) {
                            words[j].count++;
                            flag = 0;
                            break;
                        } else {
                            flag = 1;
                        }
                    }
                    if(flag) {
                        index = words.length;
                        words[index] = {};
                        words[index].word = objectWords[i];
                        words[index].count = 1;
                    }
                    
                }
                break;
            }
            default: {
                words = [];
            }
        }
        
        return words;
    }

    /*функция для определения повторяющихся свойств элементов*/
    function countRepeatitiveProps(innerObject) {
        var repeatitivePropsInInnerObj = [];
        for(var i=0; i < innerObject.length; i++) {
                for(key in innerObject[i]) {
                    if(typeof(innerObject[i][key]) == 'object') {
                        var repeatitiveArr = countRepetitive(innerObject[i][key]);
                        if(repeatitiveArr.length) {
                            for(var j=0; j< repeatitiveArr.length; j++) {
                                var repeatitiveObj = repeatitiveArr[j];                                
                                var word = repeatitiveObj['word'];
                                var count = repeatitiveObj['count'];
                                if(repeatitivePropsInInnerObj[word]) {
                                    if( repeatitivePropsInInnerObj[word].count > count) {
                                        repeatitivePropsInInnerObj[word].count = count;
                                        repeatitivePropsInInnerObj[word].changed = true;
                                    } 
                                } else {
                                    if(count > 1) {
                                        repeatitivePropsInInnerObj[word] = {};
                                        repeatitivePropsInInnerObj[word].count = count;
                                        repeatitivePropsInInnerObj[word].changed = false;
                                    }
                                }
                            }
                        }
                    }
                }
        }
        for( var key in repeatitivePropsInInnerObj) {
            if(!repeatitivePropsInInnerObj[key].changed) {
                delete(repeatitivePropsInInnerObj[key]);
            }
        }
        return repeatitivePropsInInnerObj;
    }

    /*функция для определения информации о словах, характеризующей каждую модель; на основании этой информации будет производится сравнение слов*/
    function makeWordsInfo(object) {
        var len = object.length,
            nodes = object.find('symbol'),
            globalProps = [],
            nodesLength = nodes.length,
            child = '',
            childEl = '',
            childName = '',
            childValue = '',
            props=[],
            conProps=[],
            valueProps=[],
            text='',
            words = [];
        
        
        for (var i=0;i<nodesLength;i++) {
            node = nodes[i];
            var nodeInfo = getNodeInfo(node);
            props = nodeInfo[0];
            words.push(nodeInfo[1][0]);
            globalProps.push(props);
        }

        return [globalProps,words];
    }

    function getNodeInfo(node) {
        var props=[],
            conProps=[],
            valueProps=[],
            words = [];

            /*заполение массива свойств узла*/
            // props.push(i);
            while((node.children[0].nodeName!='SYMBOL')) { 
                if(node.children[0].nodeName=='CONNECTION') {
                    break;
                }
                child = node.children;
                childEl = child[0];
                childName = childEl.nodeName;
                text = childEl.innerText;
                childValue = text.substring(0,text.indexOf('\n'));
                switch (childName) {
                    case 'TYPE': {
                        props.push(childValue);     
                        break;
                    }
                    case 'NAME': {
                        props.push(childValue);
                        words.push(childValue);    
                        break;
                    }
                    case 'CONTACTNAME': {
                        conProps.push(childValue);
                        break;
                    }
                    case 'PROPERTYVALUE': {
                        valueProps.push(childValue);
                        words.push(childValue);    
                        break;
                    }
                } 
                
                /*определение следующего элемента*/
                if(child[0].children.length!=0) {
                    node = child[0];
                } else {
                    for (var j=0;j<child.length;j++) {
                        if(child[j].children.length!=0) {
                            node = child[j];
                            break;
                        } else {
                            continue;
                        }
                    }
                    if(j==child.length) {
                        break;
                    }
                }
            }
            props.push(conProps);
            props.push(valueProps);
            return [props,words];
    }

    function makeEdgesInfo(object) {
        var smth = [],
            initialConnections = object.find('Connection'),
            connections = [],
            connection = null,
            connectionToSave = [],
            connectionsToUse = [],
            firstNodeInfo = null,
            secondNodeInfo = null,
            newPair = [],
            edgesAndNodes = [];

        for(var i=0; i<initialConnections.length; i++) {
            connection = initialConnections[i];
            firstSymbol = connection.children[0].children[0];
            firstSymbolText = firstSymbol.innerText;
            firstSymbolTextValue = firstSymbolText.substring(0,firstSymbolText.indexOf('\n'));

            secondSymbol = firstSymbol.children[0];
            secondSymbolText = secondSymbol.innerText;
            secondSymbolTextValue = secondSymbolText.substring(0,secondSymbolText.indexOf('\n'));

            connectionToSave = [firstSymbolTextValue, secondSymbolTextValue];   
            connectionsToUse.push(connectionToSave);      
        }

        var symbols = object.find('Symbol');       
        var symbol = null;
        connection = null;
        for(var i=0; i<connectionsToUse.length; i++) {
            for(var j=0; j<symbols.length; j++) {
                connection = connectionsToUse[i];
                symbol = symbols[j];
                //symbol = symbols[j].children[0];
                if((+connection[0]) == j) {
                    firstNodeInfo = getNodeInfo(symbol)[0];
                } if((+connection[1]) == j) {
                    secondNodeInfo = getNodeInfo(symbol)[0];
                }
            }
            newPair = [firstNodeInfo,secondNodeInfo];
            edgesAndNodes.push(newPair);
        }
        
        return edgesAndNodes;
    }

    /*функция применения словаря синонимов для сравнения массивов слов из вершин семнатических моделей*/
    function applySynonyms(a,b) {
        var countOfSimilarElements = 0;
        var countOfAllElements = 0;
        var synonymsWereApplied = false;
        for(var lowerKey in globalSynonyms) {
            var localSynonyms = globalSynonyms[lowerKey];
            var synonymsFlag=0;
            /*определить список синонимов для слова а*/
            for(var lowestKey in localSynonyms) {
                if(a == localSynonyms[lowestKey]) {
                    synonymsFlag = 1;
                }
            }
            if(synonymsFlag) {
                for(var lowestKey in localSynonyms) { 
                    /*если слово b совпало с одним из синонимов слова а */
                    if(b == localSynonyms[lowestKey]) { 
                        countOfSimilarElements++;
                        countOfAllElements++;
                        synonymsWereApplied = true;
                    }
                }
            }
        }
        return [countOfSimilarElements, countOfAllElements, synonymsWereApplied];
    }

    /*функция для передачи списка синонимов в глобальную область видимости после асинхронной загрузки*/
    function useSynonyms(result) {
        var synonyms = JSON.parse(result);
        var obj = {};
        /*убираем повторы в списке синонимов */
        for(var key in synonyms) {
            var synonymStr = synonyms[key]; 
            var name = synonymStr[0];
            obj[name] = synonymStr;
        }
        globalSynonyms = obj;
    };

    function getSynonyms(initialWords) {
        return $.post('http://localhost:3000/work-with-dictionary', {
            words:  initialWords,
        })
    };

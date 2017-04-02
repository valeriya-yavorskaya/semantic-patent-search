/*функция, реализующая подсистему Сравнение*/
function compareModels(file, newBody) {        
     globalSynonyms = null;
     newXML = file;
     var obj = $(newXML);

     /*получение информации о построенной семантической модели*/
     var returnedValuesOfMakingObj = makeWordsInfo(obj);
     var takenObjectWords = returnedValuesOfMakingObj[0];  
     var wordsToFindSynonyms = returnedValuesOfMakingObj[1]; 
     var wrds = JSON.stringify(wordsToFindSynonyms);
     getSynonyms(wrds); 

     var takenObjectEdges = makeEdgesInfo(obj);
     if(newBody=='') alert('Ошибка в рассматриваемом графе ');
     else {
         obj = $(newBody);
         /*получение информации о загруженнной семантической модели*/
         returnedValuesOfMakingObj = makeWordsInfo(obj);
         var innerObjectWords = returnedValuesOfMakingObj[0]; 
         var innerObjectEdges = makeEdgesInfo(obj);
     }

     /*сравнение построенной и загруженной семантических моделей*/
     var similarityInWords = compareObjectsInWords(innerObjectWords,takenObjectWords);
     console.log(similarityInWords);
     var similarityInEdges = compareObjectsInEdges(innerObjectEdges,takenObjectEdges);
     console.log(similarityInEdges);
     var midSimilarity = (similarityInWords + similarityInEdges) / 2;

     var output = document.getElementById('output-result');
     output.innerText = 'Граф №1 и граф №2 схожи на ' + midSimilarity + '%';
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
            similarity=0;

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
                            /*all is normal*/
                        } else {
                            var returnedValues = applySynonyms(vertexS[1],vertexB[1]);
                            if(returnedValues[0] == 0) {
                                continue;
                            }
                        }
                        
                    }
                    for(var k=0;k<vertexS.length;k++) {
                        if(typeof(vertexS[k])=='object') {
                            mas1 = (vertexS[k].length>vertexB[k].length) ? vertexB[k] : vertexS[k];
                            mas2 = (vertexS[k].length>vertexB[k].length) ? vertexS[k] : vertexB[k];
                            // if((mas1.length==0)||(mas2.length==0)) {
                            //     // countOfAllElements++;
                            //     continue;
                            // }
                            for(var l=0;l<mas1.length;l++) {
                                if(mas1[l] == mas1[l+1]) continue;
                                for(var m=0;m<mas2.length;m++) {
                                    if(mas1[l] ==  mas2[m]) {
                                        countOfSimilarElements++;
                                    } else {
                                        returnedValues = applySynonyms(mas1[l],mas2[m]);
                                        countOfSimilarElements += returnedValues[0];
                                    }
                                }
                            }
                        } else {
                            if(vertexS[k]==vertexB[k]) {
                                countOfSimilarElements++;
                            } else {
                                returnedValues = applySynonyms(vertexS[k],vertexB[k]);
                                countOfSimilarElements += returnedValues[0];
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
            similarity = (countOfSimilarElements/countOfAllElements)*100;
            return similarity;
    }

     /*функция, реализующая подсистему Сравнение для объектов, представляющих собой два набора свойств рёбер, имеющих общую вершину*/
    function compareObjectsInEdges(innerObject,takenObject) {
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
            similarCounterForPair = 0,
            sumSimilarityForPair = 0,
            similarityForPair = 0,
            sumSimilarityForObjects = 0,
            similarityForObjects = 0;

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
            for (var i=0;i<biggerLength; i++) {
                biggerObjPair = biggerObj[i];
                for(var j=0; j<smallerLength; j++) {     
                    smallerObjPair = smallerObj[j];

                    similarCounterForPair = 0;
                    sumSimilarityForPair = 0;
                    for(var indBig = 0; indBig<biggerObjPair.length; indBig++) {
                        elementOfBiggerObjectPair = biggerObjPair[indBig];
                        for(var indSmall = 0; indSmall<smallerObjPair.length; indSmall++) {
                            elementOfSmallerObjectPair = smallerObjPair[indSmall];

                            sim = compareObjectsInWords(elementOfBiggerObjectPair, elementOfSmallerObjectPair);
                            if(sim == 100) {
                                /*узлы полностью совпали*/
                                similarCounterForPair++;
                                sumSimilarityForPair += sim;
                            } else {
                                /*узлы частично совпали*/
                                if (sim > 0) {
                                    similarCounterForPair += 0.9; //magic number 
                                    sumSimilarityForPair += sim;
                                }
                            }
                        }
                    }
                    if ((similarCounterForPair == biggerObjPair.length) || (similarCounterForPair > biggerObjPair.length / 2) ) {
                        /*пара 1 совпала или частично совпала с парой 2*/
                        similarityForPair = sumSimilarityForPair / biggerObjPair.length;
                        sumSimilarityForObjects += similarityForPair;
                        console.log(similarCounterForPair);
                    } else {
                        // console.log(similarCounterForPair);
                    }

                }
            }
            similarityForObjects = sumSimilarityForObjects / biggerLength;
            similarity = similarityForObjects;
        return similarity;
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
            words = nodeInfo[1];
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
                symbol = symbols[j].children[0];
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
                    }
                }
            }
        }
        return [countOfSimilarElements, countOfAllElements];
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


    /*функция запроса синонимов с сервера */
    function getSynonyms(initialWords) {
        $.post('http://localhost:8888/work-with-dictionary', {
            words:  initialWords,
        }).then( function (res) {
            useSynonyms(res);
        }, function (reason) {
            console.log(reason);
        });
    };
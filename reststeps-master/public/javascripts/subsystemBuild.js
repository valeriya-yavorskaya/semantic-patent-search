/*функция обработки XML, реализующая подсистему Построение*/
    function fileParse(xml) {
        var initTree = $(xml), /*загруженная синтаксическая модель*/
            oSerializer = new XMLSerializer(),
            xmlString = oSerializer.serializeToString(initTree[0]),
            nodesCount=0,
            nodes=null;
            node=null,
            currentNode=null,
            resultTree=null,
            dbName='C:/Users/Валерия/Documents/диплом_м/нирм/URZ/OED_test1.mdb',
            db=null,
            newSymbol=null,
            newQueryStat=null,
            newConnections=null,
            newText=null,
            newChildSymbol=null,
            versions=null,
            partOfSpeech=null,
            lexeme=null,
            lemma=null,
            edges=null,
            edge=null,
            currX=20,
            currY=-100,
            currWidth=150,
            currHeight=50,
            newRes=0,
            edges=null,
            edge=null,
            par=null,
            child=null,
            newProp=null,
            thisLexeme=null,
            childLexeme=null,
            childPartOfSpeech = null,
            flag=0,
            usedNodes=[],
            smallChildsNodes=null,
            smallChild=null,
            smallChildLexeme=null,
            smallChildPartOfSpeech = null,
            newchild=null,
            newPar=null,
            name = null,
            need = null,
            subordinateClauseflag = 0;
        
        var body = document.getElementById('container'); /*получение элемента с id == container для хранения получаемой семантической модели*/
        var br = document.createElement('p'); /*элемент для получения перехода на новую строку при записи модели*/        

        /*создание открытого узла <Schema>*/
        resultTree = document.createTextNode('<Schema>');
        body.appendChild(resultTree);
        body.appendChild(br);

        /*создание узла <DatabaseName>*/
        db = document.createTextNode('<DatabaseName>');
        body.appendChild(db);

        newText = document.createTextNode(dbName);
        body.appendChild(newText); 
        body.appendChild(br);       

        nodes = initTree.find( "node" ); /*все узлы синтаксической модели*/
        nodesCount = nodes.length; 
        /*задание узлов для хранения информации о узлах семантической модели*/
        buildClause(nodes, nodesCount, body);

        edges = initTree.find('edge');
        /*задание узла <Connections>, содержащего информацию о связях всех узлов семантической модели*/
        addConnections(nodes,edges,body,br,usedNodes);

        /*закрыть узел <Schema>*/
        resultTree = document.createTextNode('</Schema>');
        body.appendChild(resultTree); 
        body.appendChild(br);

        /*создать элемент для хранения текста из временного хранилища семантической модели*/
        var newBody = body.innerText; 
        console.log('file №1 was built');
        /*отправка готовой модели на сервер для сохранения во внешний файл*/
        sendXML(newBody);
        var output = document.getElementById('output-built');
        output.innerText = 'Семантическая модель была построена и сохранена';
        // body.style.visibility = 'hidden';
        body.style.display = 'none';
        return newBody;
    };

    function buildClause(nodes, nodesCount, body) {
        /*пока не перебраны все узлы синтаксической модели*/
        for(var i=0;i<nodesCount;i++) {
            subordinateClauseflag = 0;
             
            /*создание узла <Symbol>*/
            newSymbol = document.createTextNode("<Symbol>");
            /*взять текущий узел из списка узлов синтаксической модели*/
            currentNode = nodes[i];

            /*заполнить переменные для хранения значений о лексеме, рёбрах, части речи и лемме в данном узле*/           
            versions = currentNode.querySelector('version');
            lexeme = currentNode.querySelector('lexeme').textContent;
            edges = currentNode.querySelectorAll('edge');
            partOfSpeech = versions.getAttribute('pos');
            lemma = versions.getAttribute('lemma');

            if((edges.length!=0) && (i > 0)) {
                edge = $(currentNode).prev();
                name = edge[0].getAttribute('name'); 
                if(name == 'SUBORDINATE_CLAUSE_link') {
                    subordinateClauseflag = 1;
                } else {
                    /*узел определённого типа создаётся в зависимости от части речи слова*/
                    addNode(body,currentNode,versions,lexeme,edges,partOfSpeech,lemma,i);
                }                   
            } else {
                addNode(body,currentNode,versions,lexeme,edges,partOfSpeech,lemma,i);
            }            

             if(subordinateClauseflag) {
                var subordinateClause = currentNode.parentNode;

                /*определение союза*/
                children = subordinateClause.querySelectorAll('children');       
                childrenLength =  children.length - 1;
                lastChild = children[childrenLength];
                lastChildNodes = lastChild.querySelectorAll('node');
                lastChildNodesLength = lastChildNodes.length - 1;
                lastChildLastNode = lastChildNodes[lastChildNodesLength];
                lastChildLastNodePos = $(lastChildLastNode).find('version').attr('pos');
                if(lastChildLastNodePos == 'НАРЕЧИЕ') {
                    console.log('here');
                    addNode(body,currentNode,versions,lexeme,edges,partOfSpeech,lemma,i);
                    continue;
                }

                /*определение определяемого слова*/
                var edgeName = null;
                var flag = true;
                var node = currentNode;
                while(flag) {                    
                    var parent = node.parentNode.parentNode.parentNode;
                    edgeName = parent.querySelector('edge').getAttribute('name');
                    if( (edgeName == 'OBJECT_link') || (edgeName == 'SUBJECT_link') ) {
                        flag = false;
                    } else {
                        node = parent.querySelector('node');
                    }
                }
                var masterNode = parent.querySelector('node');

                /*Перезапись свойств*/
                lastChildLastNode.querySelector('lexeme').textContent = masterNode.querySelector('lexeme').textContent  + ' (синт)';

                masterNodeLemma = $(masterNode).find('version').attr('lemma');
                $(lastChildLastNode).find('version').attr('lemma', masterNodeLemma);

                masterNodePos = $(masterNode).find('version').attr('pos');
                $(lastChildLastNode).find('version').attr('pos', masterNodePos);

                var subordinateClauseNodes = $(subordinateClause).find('node');
                var subordinateClauseNodesCount = subordinateClauseNodes.length;
                i += (subordinateClauseNodesCount - 1);
                buildClause(subordinateClauseNodes, subordinateClauseNodesCount, body);
            }                     
        }
    }

    function addNode(body,currentNode,versions,lexeme,edges,partOfSpeech,lemma,i) {
        var flag=0; /*флаг устанавливается для отслеживания частей речи, для которых в семантической модели нужно создать
             узлы "Subject", "Action" или "Relation"*/
        var br = document.createElement('p');
        switch(partOfSpeech){
                case 'СУЩЕСТВИТЕЛЬНОЕ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Subject",body);  
                    flag=1;   
                    usedNodes.push(currentNode);               
                    break;
                }
                case 'МЕСТОИМЕНИЕ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Subject",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                }
                case 'МЕСТОИМ_СУЩ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Subject",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                }
                case 'ГЛАГОЛ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Action",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                }
                case 'ИНФИНИТИВ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Action",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                }
                case 'ПРИЛАГАТЕЛЬНОЕ': {
                    if(edges.length!=0) {
                        edge = $(currentNode).prev();
                        name = edge[0].getAttribute('name');
                        /*хак для определения причастия*/
                        if(name=='ADJ_PARTICIPLE_link') {
                            body.appendChild(newSymbol);  
                            body.appendChild(br); 
                            addChildSymbol("<Type>","Action",body); //Action??
                            flag=1; 
                            usedNodes.push(currentNode); 
                        }                   
                    }
                    break;
                }
                case 'ПРЕДЛОГ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Relation",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                }
                case 'СОЮЗ': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Relation",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                } 
                case 'ЧАСТИЦА': {
                    body.appendChild(newSymbol);  
                    body.appendChild(br); 
                    addChildSymbol("<Type>","Relation",body);
                    flag=1; 
                    usedNodes.push(currentNode);  
                    break;
                }
                
            }

            /*если флаг был выставлен, для созданного выше узла определяются обязательные свойства, 
            влияющие на отображение в программе URZ*/
            if(flag) {
                addChildSymbol("<Name>",lexeme,body); //lemma, lexeme
                addChildSymbol("<PosX>",currY,body); //currX
                addChildSymbol("<PosY>",currX,body); //currY
                addChildSymbol("<Width>",currWidth,body);
                addChildSymbol("<Height>",currHeight,body);
                addChildSymbol("<PropertiesVisualization>",'NameValue',body);
                addChildSymbol("<BackgroundColor>",16777215,body);
                addChildSymbol("<VertLinePosX>",45,body);

                newQueryStat = document.createTextNode("<Query>");  
                body.appendChild(newQueryStat); 
                body.appendChild(br);
                /*задание дполнительных свойств для отображения семантической модели в программе URZ*/
                addQueryStat(newQueryStat,body);
            }

            /*если флаг был выставлен, определяются семантические свойства данного узла, 
            представленные связанными с ним пригалательными и деепричастиями*/
            addingProperties:
            if(flag) {
                for(var j=0;j<edges.length;j++) {
                    edge = edges[j];
                    edgeName = edges[j].getAttribute('name');
                    child = edge.nextSibling.nextSibling;
                    par = edge.parentElement.parentElement;
                    parLexeme = par.querySelector('lexeme').textContent;
                    childLexeme = child.querySelector('lexeme').textContent;  
                    childPartOfSpeech = child.querySelector('version').getAttribute('pos');  
                    if(childPartOfSpeech == 'ПУНКТУАТОР') break addingProperties;
                    lemma = child.querySelector('version').getAttribute('lemma'); 
                    
                    /*если значение свойства "имя ребра" для текущего узла - прилагательное или деепричастие*/
                    if( ( (edgeName=='ATTRIBUTE_link')||(edgeName=='NEXT_ADJECTIVE_link') ) && (parLexeme==lexeme) ) {
                        
                        newProp = document.createTextNode('<Property>');
                        body.appendChild(newProp); 
                        body.appendChild(br);
                        //addChildSymbol("<PropertyId>",'-1',body);      
                        addChildSymbol("<PropertyName>",'св'+i,body); 
                        addChildSymbol("<PropertyValue>",lemma,body); 
                        addChildSymbol("<PropertyHeight>",'10',body); 

                        /*если необходимо рассмотреть однородные идущие друг за другом прилагательные или деепричастия*/
                        smallChildsNodes = child.querySelectorAll('edge');
                        for(var q=0;q<smallChildsNodes.length;q++) {
                            smallChildEdgeName = smallChildsNodes[q].getAttribute('name');
                            if (smallChildEdgeName == 'SUBORDINATE_CLAUSE_link') break;
                            smallChild = smallChildsNodes[q].nextSibling.nextSibling;
                            smallChildPartOfSpeech = smallChild.querySelector('version').getAttribute('pos'); 
                            if(smallChildPartOfSpeech == 'ПУНКТУАТОР') continue;                            
                            smallChildLexeme = smallChild.querySelector('lexeme').textContent;
                            smallChildLemma = smallChild.querySelector('version').getAttribute('lemma'); 

                            addChildSymbol('<Property>','',body);  
                            addChildSymbol("<PropertyName>",'св'+(i+q+1-0),body); 
                            addChildSymbol("<PropertyValue>",smallChildLemma,body); 
                            addChildSymbol("<PropertyHeight>",'10',body); 
                        }        
                    }
                }
            }

            /*если флаг был выставлен, определяются связи текущего узла на основании связанных с ним рёбер*/
            if(flag) { 
                for(var w=0;w<edges.length;w++) {                    
                    par = edges[w].parentElement.parentElement;
                    parLexeme = par.querySelector('lexeme').textContent;
                    edgeName = edges[w].getAttribute('name');
                    if((edgeName=='ATTRIBUTE_link')||(edgeName=='NEXT_ADJECTIVE_link')||(edgeName=='PUNCTUATION_link')) {
                       //console.log('no'); 
                    } else {
                        if((parLexeme == lexeme)) {
                            /*добавление контакта по выбранному ребру */
                            addContacts(edges[w],body);
                        }
                    }
                }                
            } 

            /*смещение каждого нового узла изменяется для удобства просмотра готовой модели в программе URZ*/
            currY-=100; 
    }

    /*функция добавления дочернего узла*/
    function addChildSymbol(elementName,text,body) {
        var newChildSymbol = document.createTextNode(elementName),
            newText = document.createTextNode(text),
            lineBreak = document.createElement('p');

        body.appendChild(newChildSymbol); 
        body.appendChild(newText); 
        body.appendChild(lineBreak);   
        
    }

    /*функция для задания дполнительных свойств для отображения семантической модели в программе URZ*/
    function addQueryStat(newQueryStat,body) {
        var newChildSymbol = null,
            newText = null,
            lineBreak = document.createElement('p');

        newChildSymbol = document.createTextNode('<ConditionItems>');
        newText = document.createTextNode('');
        body.appendChild(newText);    
        body.appendChild(newChildSymbol); 
        newChildSymbol = document.createTextNode('</ConditionItems>');
        body.appendChild(newChildSymbol); 
        body.appendChild(lineBreak);

        newChildSymbol = document.createTextNode('<TotalVerity>');
        body.appendChild(newChildSymbol); 
        newText = document.createTextNode('Positive');
        body.appendChild(newText); 
        body.appendChild(lineBreak);              
    }

     /*функция задания контактов узла на основании связанных с ним рёбер*/
    function addContacts(edge,body) {
        var edgeName=null,
            nodeName=null;
                edgeName = edge.getAttribute('name');
                nodeName = document.createTextNode("<Contact>");  
                body.appendChild(nodeName);

                /*определяется "подчинённый" элемент относительно данного ребра*/
                child = edge.nextSibling.nextSibling;
                caseType = child.querySelector('version').getAttribute('coordStateName');
                
                /*в зависимости от падежа определяются вопросные слова*/
                switch(caseType) {
                    case 'NOMINATIVE_CASE_ru': {
                        who = 'Кто';
                        what = 'Что';                    
                        break;
                    }
                    case 'GENITIVE_CASE_ru': {
                        who = 'Кого';
                        what = 'Чего';                    
                        break;
                    } 
                    case 'DATIVE_CASE_ru': {
                        who = 'Кому';
                        what = 'Чему';                    
                        break;
                    }
                    case 'ACCUSATIVE_CASE_ru': {
                        who = 'Кого';
                        what = 'Что';                    
                        break;
                    }
                    case 'INSTRUMENTAL_CASE_ru': {
                        who = 'Кем';
                        what = 'Чем';                    
                        break;
                    }
                    case 'PREPOSITIVE_CASE_ru': {
                        who = 'Ком';
                        what = 'Чём';                    
                        break;
                    }
                    default: {
                        what = 'Что';
                        who = 'Кто';
                    }
                }
                
                /*в зависимости от типа ребра определяется положение связи при отображении в программе URZ и тип вопросного слова*/
                switch(edgeName) {
                    case 'OBJECT_link': {
                         addChildSymbol('<ContactName>',what,body);
                         addChildSymbol('<ContactPosType>','Top',body);
                         addChildSymbol('<ContactPosValue>','0,1',body);
                        break;
                    }
                    case 'SUBJECT_link': {
                        addChildSymbol('<ContactName>',what,body);
                        addChildSymbol('<ContactPosType>','Top',body);
                        addChildSymbol('<ContactPosValue>','0,2',body);
                        break;
                    }
                    case 'RIGHT_GENITIVE_OBJECT_link': {
                        addChildSymbol('<ContactName>','Кон1',body);
                        addChildSymbol('<ContactPosType>','Right',body);
                        addChildSymbol('<ContactPosValue>','0,3',body);
                        break;
                    }
                    case 'PREPOS_ADJUNCT_link' : {
                        addChildSymbol('<ContactName>','Кон2',body);
                        addChildSymbol('<ContactPosType>','Left',body);
                        addChildSymbol('<ContactPosValue>','0,4',body);
                        break;
                    }
                    case 'RIGHT_LOGIC_ITEM_link' : {
                        addChildSymbol('<ContactName>','Кон3',body);
                        addChildSymbol('<ContactPosType>','Top',body);
                        addChildSymbol('<ContactPosValue>','0,5',body);
                        break;
                    }
                    case 'NEXT_COLLOCATION_ITEM_link' : {
                        addChildSymbol('<ContactName>','Чему',body);
                        addChildSymbol('<ContactPosType>','Top',body);
                        addChildSymbol('<ContactPosValue>','0,6',body);
                        break;
                    }
                    case 'INFINITIVE_link' : {
                        addChildSymbol('<ContactName>','Что делать',body);
                        addChildSymbol('<ContactPosType>','Top',body);
                        addChildSymbol('<ContactPosValue>','0,7',body);
                        break;
                    }
                    case 'NEGATION_PARTICLE_link' : {
                        addChildSymbol('<ContactName>','Кон4',body);
                        addChildSymbol('<ContactPosType>','Top',body);
                        addChildSymbol('<ContactPosValue>','0,8',body);
                        break;
                    }
                    case 'SUBORDINATE_CLAUSE_link' : {
                        break;
                    }
                    case 'NEXT_CLAUSE_link' : {
                        addChildSymbol('<ContactName>','Кон6',body);
                        addChildSymbol('<ContactPosType>','Left',body);
                        addChildSymbol('<ContactPosValue>','0,1',body);
                        break;
                    }
                    default: {
                        break;
                    }
                }
    }

    /*функция для добавления узла <Connections> к семантической модели*/
    function addConnections(nodes,edges,body,br,usedNodes) {
        var edge = null,
            par = null,
            child = null,
            attr = null,
            firstSymbolIndex = null,
            secondSymbolIndex = null,
            edgeName = null,
            flag = 0,
            newEdges=[],
            cntr=0;
        
        /*пройти по списку всех рёбер синтаксической модели и сохранить в списке newEdges те, 
        которые ведут к отдельному узлу*/
        for (var l=0;l<edges.length;l++) {
           edge = edges[l];
           edgeName = edges[l].getAttribute('name');
           if( (edgeName == 'ATTRIBUTE_link') || (edgeName == 'NEXT_ADJECTIVE_link') || (edgeName == 'SUBORDINATE_CLAUSE_link') ) {
                //console.log('no');
           } else {
               newEdges.push(edge);
           }
        }

        flag=0;
        for(var i=0;i<newEdges.length;i++) {
            edge = newEdges[i];
            edgeName = newEdges[i].getAttribute('name');

            /*пропустить вершину, если в ней содержится информация об знаке препинания*/
            // if ( (edgeName == 'PUNCTUATION_link') || (edgeName == 'NEXT_COLLOCATION_ITEM_link') ) continue;

            /*определение элементов, связанных данным ребром; 
            родительским считается элемент, расположенный выше по иерархии узлов синтаксической модели*/
            
            par = edge.parentElement.parentElement;
            // if(par.querySelector('version').getAttribute('pos') == 'ПУНКТУАТОР') {
            //     if(edgeName == 'SUBORDINATE_CLAUSE_link') {
            //         var newPar = par.parentElement.parentElement;
            //         par = newPar;
            //     } else {
            //         continue;
            //     }
            // }
            
            child = edge.nextSibling.nextSibling;
            if(child.querySelector('version').getAttribute('pos') == 'ПУНКТУАТОР') {
                if(child.children[2]) {
                    var newChild = child.children[2].querySelector('node');
                    child = newChild;
                } else continue;
            }
            // if(edgeName == 'SUBORDINATE_CLAUSE_link') {
            //     children = child.querySelectorAll('children');
            //     childrenLength =  children.length - 1;
            //     lastChild = children[childrenLength];
            //     lastChildNodes = lastChild.querySelectorAll('node');
            //     lastChildNodesLength = lastChildNodes.length - 1;
            //     lastChildLastNode = lastChildNodes[lastChildNodesLength];
            //     child = lastChildLastNode;
            // }

            caseType = child.querySelector('version').getAttribute('coordStateName');
            
            /*назначить вопросные слова в зависисмости от падежа*/
            switch(caseType) {
                case 'NOMINATIVE_CASE_ru': {
                    who = 'Кто';
                    what = 'Что';                    
                    break;
                }
                case 'GENITIVE_CASE_ru': {
                    who = 'Кого';
                    what = 'Чего';                    
                    break;
                } 
                case 'DATIVE_CASE_ru': {
                    who = 'Кому';
                    what = 'Чему';                    
                    break;
                }
                case 'ACCUSATIVE_CASE_ru': {
                    who = 'Кого';
                    what = 'Что';                    
                    break;
                }
                case 'INSTRUMENTAL_CASE_ru': {
                    who = 'Кем';
                    what = 'Чем';                    
                    break;
                }
                case 'PREPOSITIVE_CASE_ru': {
                    who = 'Ком';
                    what = 'Чём';                    
                    break;
                }
                default: {
                    what = 'Что';
                    who = 'Кто';
                }
            }

            /*перебор списка использованных вершин; для вершин, связанных данным ребром, определяются индексы 
            относительно верхнего узла синтаксической модели*/
            for(var j=0;j<usedNodes.length;j++) {
                if(usedNodes[j]==child) {
                    secondSymbolIndex = j;
                } 
                if(usedNodes[j]==par) {
                    firstSymbolIndex = j;
                }
            }

            /*когда индексы определены, к модели добавляются узлы для определённой выше связи*/
            addChildSymbol('<Connection>',"",body);
            addChildSymbol('<ConnectionType>',"Straight",body);
            addChildSymbol('<FirstSymbolIndex>',firstSymbolIndex,body);
            addChildSymbol('<SecondSymbolIndex>',secondSymbolIndex,body);

            /*в зависимости от типа ребра определяется положение связи при отображении в программе URZ и тип вопросного слова*/
            switch(edgeName) {
                case 'OBJECT_link': {
                    addChildSymbol('<FirstSymbolContact>',what,body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,1',body);
                    break;
                }
                case 'SUBJECT_link': {
                    addChildSymbol('<FirstSymbolContact>',what,body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,2',body);                    
                    break;
                }
                case 'RIGHT_GENITIVE_OBJECT_link': {
                    addChildSymbol('<FirstSymbolContact>','Кон1',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,3',body);
                    break;
                }
                case 'PREPOS_ADJUNCT_link' : {
                    addChildSymbol('<FirstSymbolContact>','Кон2',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,4',body);
                    break;
                }
                case 'RIGHT_LOGIC_ITEM_link' : {
                    addChildSymbol('<FirstSymbolContact>','Кон3',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,5',body);
                    break;
                }
                case 'NEXT_COLLOCATION_ITEM_link' : {
                    addChildSymbol('<FirstSymbolContact>','Чему',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,6',body);
                    break;
                }
                case 'INFINITIVE_link' : {
                    addChildSymbol('<FirstSymbolContact>','Что делать',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,7',body);
                    break;
                }
                case 'NEGATION_PARTICLE_link' : {
                    addChildSymbol('<FirstSymbolContact>','Кон4',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Top',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,8',body);
                    break;
                }
                case 'SUBORDINATE_CLAUSE_link' : {
                    break;
                }
                case 'NEXT_CLAUSE_link' : {
                    addChildSymbol('<FirstSymbolContact>','Кон6',body);
                    addChildSymbol('<SecondSymbolContactPosType>','Left',body);
                    addChildSymbol('<SecondSymbolContactPosValue>','0,1',body);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }

    /*асинхронная отправка XML на сервер*/
    function sendXML(thisTree) {
        $.post('http://localhost:3000/work-with-xml', {
                tree:  thisTree,
            }).then(function (res) {
                console.log('file №1 was saved');
            }, function (reason) {
                console.log(reason);
        });

    };

    function sendText(userText) {
        $.post('http://localhost:3000/launch-solarix', {
                text:  userText,
            }).then(function (res) {
                console.log(res);
                takeXML();
            }, function (reason) {
                console.log(reason);
        });
    };

    function takeXML() {
        $.get('http://localhost:3000/launch-solarix', {
            }).then(function (res) {
                console.log('syntax model was built');
                fileParse(res);
            }, function (reason) {
                console.log(reason);
        });

    };
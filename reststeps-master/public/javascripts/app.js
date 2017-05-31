window.onload = function() {
    var newBody = null;

    /*Подготовительная функция, отвечающая за запуск основной функции - чтения XML-файла с синтаксической моделью при готовности страницы */
    $(document).ready( function() {
        var btn = document.getElementById('take-graph');
        var body = document.getElementById('container');
        /*инициализация чтения XML-файла с синтаксической моделью */
        body.style.visibility = 'visible';
        /*установка обработка события нажатия кнопки чтения XML-файла с синтаксической моделью */
        if(btn) {
            btn.addEventListener("click", getFile = function(file) {
                $(btn).attr('disabled',true);
                var newFile = document.getElementById('userGraph').files[0];
                var reader = new FileReader();
                /*создание асинхронного обработчика чтения XML*/
                    reader.onload = function(event) {
                        newXML = event.target.result;
                        console.log('initial graph was loaded');
                        /* вызов подсистемы Построение */ 
                        var promise = new Promise( function(resolve, reject) {
                            /*создать элемент для хранения текста из временного хранилища семантической модели*/
                            newBody = fileParse(newXML);
                            /*отправка готовой модели на сервер для сохранения во внешний файл*/
                            var p = sendXML(newBody); 
                            p.then(function (res) {
                                console.log('file №1 was saved');
                                resolve(res);
                            }, function (reason) {
                                console.log(reason);
                                reject(reason);
                            });
                        });  

                        promise.then(function(res) {
                            displayBuildingResult();
                        });                      
                    }
                    reader.onerror = function(event) {
                        console.error("Файл не может быть прочитан! код " + event.target.error.code);
                        alert('Ошибка чтения файла! Попробуйте ещё раз');
                    };
                    reader.readAsText(newFile);
            },false);
        }
    });

    var btn = document.getElementById('take-xml');
        /*установка обработчика нажатия кнопки сравнения семантических моделей*/
    if(btn) {    
        btn.addEventListener("click", compare = function() {
            $(btn).attr('disabled',true);
            var newFile = document.getElementById('userFile').files[0];
               var reader = new FileReader();
               /*создание асинхронного обработчика чтения XML*/
                reader.onload = function(event) {
                    var loadedFile = event.target.result;                                       
                    console.log('file №2 was loaded');
                    /* Вызов подсистемы Сравнение */
                    compareModels(loadedFile, newBody); 
                }
                
                reader.onerror = function(event) {
                    console.error("Файл не может быть прочитан! код " + event.target.error.code);
                    alert('Ошибка чтения файла! Попробуйте ещё раз');
                };
                
                reader.readAsText(newFile,'CP1251');
        },false);
    }

    var btn2 = document.getElementById('reload');
    if(btn2) {
        /*установка обработчика события нажатия кнопки очистки поля ввода*/
        btn2.addEventListener("click", function() { 
            location.reload();
        });
    }

    var btn3 = document.getElementById('take-text');
    if(btn3) {    
        btn3.addEventListener("click", compare = function() {
            $(btn3).attr('disabled',true);
            var newFile = document.getElementById('userText').files[0];
               var reader = new FileReader();
               /*создание асинхронного обработчика чтения txt*/
                reader.onload = function(event) {
                    var loadedFile = event.target.result;                                       
                    console.log('text file was loaded');
                    /* Вызов подсистемы Построение */
                    var p1 = sendText(loadedFile);        
                    p1.then(function (res) {
                            console.log(res);
                            var p2 = takeXML();
                            p2.then(function (res) {
                                    console.log('syntax model was built');
                                    var newBody = fileParse(res);
                                    displayBuildingResult();
                                }, function (reason) {
                                    console.log(reason);
                            });
                        }, function (reason) {
                            console.log(reason);
                    });                                                        
                }
                
                reader.onerror = function(event) {
                    console.error("Файл не может быть прочитан! код " + event.target.error.code);
                    alert('Ошибка чтения файла! Попробуйте ещё раз');
                };
                
                reader.readAsText(newFile,'utf-8');
        },false);
    }

    var btn4 = document.getElementById('find-patents');
    if(btn4) {    
        btn4.addEventListener("click", function() {
            $(btn4).attr('disabled',true);
            getKeyWords();
        });
    }

    var textField1 = document.getElementById('input-keywords');
    if(textField1) {
        textField1.addEventListener('blur', function(event) {
            getInnerKeyWords(event.target.value);
        });
    }

    function hideContainer() {
        var body = document.getElementById('container');
        body.style.display = 'none';
    }

    function displayBuildingResult() {
        hideContainer();
        console.log('file №1 was built');
        var output = document.getElementById('output-built');
        output.innerText = 'Семантическая модель была построена и сохранена';
    }
}
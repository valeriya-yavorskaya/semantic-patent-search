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
                        newBody = fileParse(newXML);
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
                    sendText(loadedFile);
                }
                
                reader.onerror = function(event) {
                    console.error("Файл не может быть прочитан! код " + event.target.error.code);
                    alert('Ошибка чтения файла! Попробуйте ещё раз');
                };
                
                reader.readAsText(newFile,'utf-8');
        },false);
    }

}
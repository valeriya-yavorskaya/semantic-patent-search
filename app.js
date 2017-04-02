window.onload = function() {
    var newBody = null;

    /*Подготовительная функция, отвечающая за запуск основной функции - чтения XML-файла с синтаксической моделью при готовности страницы */
    $(document).ready( function() {
        var btn = document.getElementById('take-graph');
        var body = document.getElementById('container');
        /*инициализация чтения XML-файла с синтаксической моделью */
        body.style.visibility = 'visible';
        /*установка обработка события нажатия кнопки чтения XML-файла с синтаксической моделью */
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
                };
                reader.readAsText(newFile);
        },false);
    });

    var btn = document.getElementById('take-xml');
        /*установка обработчика нажатия кнопки сравнения семантических моделей*/
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
                };
                
                reader.readAsText(newFile,'CP1251');
        },false);

    var btn2 = document.getElementById('reload');
        /*установка обработчика события нажатия кнопки очистки поля ввода*/
        btn2.addEventListener("click", function() { 
            location.reload();
    });

}

//Custom HTTP Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest(); // создали экземпляр и получили методы
                xhr.open('GET', url); // делаем запрос на сервер 
                xhr.addEventListener('load', () => { // если событие load(успешно)
        
                    if (Math.floor(xhr.status / 100) !==2) { 
                        cb(`Error, status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const responce = JSON.parse(xhr.responseText); // преобразовываем ответ в формат JSON
                    cb(null, responce);
                });
        
                xhr.addEventListener('error', () => {
                    cb(`Error, status code: ${xhr.status}`, xhr); //сообщить если общение с сервером прошло не успешно
                });
                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest(); // создали экземпляр и получили методы
                xhr.open('POST', url); // делаем запрос на сервер 
                xhr.addEventListener('load', () => { // если событие load(успешно)
        
                    if (Math.floor(xhr.status / 100) !==2) { 
                        cb(`Error, status code: ${xhr.status}`, xhr);
                        return;
                    }
        
                    const responce = JSON.parse(xhr.responseText); // преобразовываем ответ в формат JSON
                    cb(null, responce);
                });
        
                xhr.addEventListener('error', () => {
                    cb(`Error, status code: ${xhr.status}`, xhr); //сообщить если общение с сервером прошло не успешно
                });
        
                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
//Init Http module
const http = customHttp();




const newsService = (function (){ // это самовызывающаяся функция
    const apiKey = 'f287b9280627447f83e4943bb48ec575'; //API ключ ресурса
    const apiUrl = 'https://newsapi.org/v2' ; // адрес запроса
    
    // весь модуль будет возвращать объект с двумя методами: возвращение topHeadlines новостей по заданому запросу и получение всех новостей по заданному запросу
    return {
        topHeadlines(country = 'us', cb) { // принимает страну по запросу и колбек, который выполнится когда запрос отработает
            http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
                cb
            );
        },
        everything(query, cb){// так же строку которую мы вводим при поиске тобишь запрос и колбек, который выполнится когда запрос отработает
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        },
    };

})();


// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];


form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
});


//init selects

document.addEventListener('DOMContentLoaded', function () {// 1)когда загрузится домконтентлоадер
    M.AutoInit();
    loadNews(); //2) вызываем функцию loadNews
});


//Load news function
function loadNews() {
    showLoader();
    const country = countrySelect.value;
    //console.log(country);
    const searchText = searchInput.value;

    if (!searchText) {
        newsService.topHeadlines(country, onGetResponce);
    } else {
        newsService.everything(searchText, onGetResponce);
    }
    
}

// function on get responce from service
function onGetResponce(err, res) { // 4) колбек onGetResponce получает результат = Артиклы
    removePreLoader();

    if (err) {
        showAlert(err, 'error-msg');
        return;
    }

    console.log(res.articles);

    if (!res.articles.length) {
        //show empty message
        return;
    }
    renderNews(res.articles);   // 4) и передаем их в renderNews
}


//function render news
function renderNews(news) { 
    const newsContainer = document.querySelector('.news-container .row'); //5) renderNews определяет контейнер 
    if (newsContainer.children.length) { // если есть дочерние элементы
        clearContainer(newsContainer); //то очищаем
    }
    let fragment = ''; //8) и конкатенируется с переменной fragment


    news.forEach(newsItem => {  //5) и перебирает новости. на каждой итерации вызывает функцию newsTemplate
        const el = newsTemplate(newsItem); //5) которая на основе одного объекта новости newsItem 
        fragment += el; //7) разметка сохраняется в переменной el 
        
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment); // 8) после вставлем все в container
}

//Function clear container
function clearContainer(container) {
    let  child = container.lastElementChild;
    while(child) { //если есть дочерние елементы у контейнера
        container.removeChild(child); //передаем child который хотим удалить
        child = container.lastElementChild; // когда все элементы удалятся здесь будет null и цикл закончится
    }

}

// формируем темплейт на основе одной новости
function newsTemplate({urlToImage, title, url, description}) {// 6) сформирует разметку одной новости
    //console.log(urlToImage);
    return `
        <div class="col s12 m6">
            <div class="card">
                <div class="card-image">
                    <img src="${urlToImage}">
                    <span class="card-title">${title || ''}</span>
                </div>
                <div class="card-content">
                    <p>${description || ''}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Read more</a>
                </div>
            </div>
        </div>
    `;
    
}


function showAlert(msg, type = 'sucsess') {
    M.toast({html:msg, classes: type});

}

//Show loader function
function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `
          <div class="progress">
              <div class="indeterminate"></div>
          </div>
        `,
    );
}

//Remove loader function
function removePreLoader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    };
}
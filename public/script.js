
var STORAGE_ID = 'weatherChat';
var cityWeatherArray = [];

// This will stringify and save our entire city-weather array.
var _saveToLocalStorage = function () {
    localStorage.setItem(STORAGE_ID, JSON.stringify(cityWeatherArray));
};

// This will get our city-weather array out of local storage and convert them back to JS objects
// or, if none exists, it will simply return an empty array.
var _getFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
};

  // update city weather array from local storage soon as the page loads
cityWeatherArray = _getFromLocalStorage();


var updateCityPost = function () {
    console.log("in update:");

    $('.city-temp-list').empty();


    for (var i = 0; i < cityWeatherArray.length; i++) {

        console.log("in loop:");
        console.log(cityWeatherArray[i]);
        console.log(Math.round(cityWeatherArray[i].temp.tCelsius));

        var weather = `
<div class="city-weather">
    <div class="header">
       <h3>${cityWeatherArray[i].name.toUpperCase()} </h3> <a role="button" class="remove-city-weather"> <i class="fa fa-trash"></i> </a>
    </div> 
  <p>${Math.round(cityWeatherArray[i].temp.tCelsius) + " °C " + Math.round(cityWeatherArray[i].temp.tFahrenheit) + " °F " + cityWeatherArray[i].date} </p>
  <form class="comments-container" >
    <ul class="comments-list"> 
    </ul>
    <div class="comments-form" >
       <input type="text" class="comment-name form-control" placeholder="Comment about the weather in ${cityWeatherArray[i].name.toUpperCase()}"> 
       <button type="button" class="btn btn-sm btn-primary add-comment">Post Comment</button>
    </div>
   </form>
<div>
    `;
        console.log(weather);
        $('.city-temp-list').append(weather);
    }
 
}

// using API
var fetch = function (city) {
    $.get({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=d703871f861842b79c60988ccf3b17ec",
        success:// yourFunction		
            function (data) {
                console.log('in fetch:');
                console.log(data);

                var d = new Date();
                var month = d.getUTCMonth() + 1; //months from 1-12
                var day = d.getUTCDate();
                var year = d.getUTCFullYear();
                var h = (d.getHours() < 10 ? '0' : '') + d.getHours();
                var m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                var date = h + ":" + m + " on " + day + "/" + month + "/" + year;

                var cityPost = {
                    name: data.name,
                    temp: {
                        tCelsius: data.main.temp, //  Celsius
                        tFahrenheit: data.main.temp * 9 / 5 + 32 //  Fahrenheit
                    },
                    date: date
                };

                console.log(cityPost);

                createCityPost(cityPost);
                updateCityPost();
            },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("not found");
            console.log(textStatus);
            $('.errorMsg').text("Not found.").fadeOut(4000);;
        }

    });
}



var createCityPost = function (cityPost) {
    console.log("in create:")
    cityWeatherArray.push(cityPost);
    console.log(cityWeatherArray);
    // save
    _saveToLocalStorage();
}

var createComment = function (text, cityIndex) {

}

var removeCityPost = function ($clickedCityPost, index) {
    cityWeatherArray.splice(index, 1);
    // store
    _saveToLocalStorage();
    $clickedCityPost.remove();
    console.log("done remove");
}





// Event Handlers below

$('.button-get-temp').on('click', function () {
    var city = $('#city-name').val();
    fetch(city);
})

$('.city-temp-list').on('click', '.remove-city-weather', function () {
    var $clickedItem = $(this).closest('.city-weather');
    var index = $clickedItem.index();
    removeCityPost($clickedItem, index);
})

$('.city-temp-list').on('click', '.add-comment', function () {
    var text = $(this).siblings('.comment-name').val();
    var $commentsList = $(this).closest('.comments-form').siblings('.comments-list');
    console.log(text);
    console.log($commentsList);
    $commentsList.append(`<li class="comment" > ${text} </li>`);
})

updateCityPost();
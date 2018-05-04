
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

// update city-weather array from local storage soon as the page loads
cityWeatherArray = _getFromLocalStorage();

$('.load').hide();

var updateCityPost = function () {
    console.log("in update:");

    $('.city-temp-list').empty();

    for (var i = 0; i < cityWeatherArray.length; i++) {

        console.log("in loop:");
        console.log(cityWeatherArray[i]);

        var weather = `
<div class="city-weather">
    <div class="header">
       <h3><strong>${cityWeatherArray[i].name}</strong> </h3> <a role="button" class="remove-city-weather"> <i class="fa fa-trash"></i> </a>
    </div> 
  <p class="temp-date" >${cityWeatherArray[i].temp.tCelsius + " °C " + cityWeatherArray[i].temp.tFahrenheit + " °F " + cityWeatherArray[i].date} </p>
  <div class="comments-container" >
    <ul class="comments-list rounded"> 
    </ul>
    <form class="comments-form" >
       <input type="text" class="comment-name form-control" placeholder="Comment about the weather in ${cityWeatherArray[i].name}"> 
       <button type="submit" class="btn btn-sm btn-success add-comment">Post Comment</button>
    </form>
    <p class="errorMsgComm"> You can't enter empty comment</p>
   </div>
</div>
    `;
        $('.city-temp-list').append(weather);
    }

}

// using API
var fetch = function (city) {
    $.get({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=d703871f861842b79c60988ccf3b17ec",

        beforeSend: function () {
            $('.load').show();
        },
        success:// yourFunction		
            function (data) {
                console.log('in fetch:');
                console.log(data);

                $('.load').hide();

                var d = new Date();
                var date = (d.getHours() < 10 ? '0' : '') + d.getHours() + ":"
                    + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + " on " +
                    d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

                var cityPost = {
                    name: data.name,
                    temp: {
                        tCelsius: Math.round(data.main.temp), //  Celsius
                        tFahrenheit: Math.round(data.main.temp * 1.8 + 32) //  Fahrenheit
                    },
                    date: date,
                    comments: []
                };

                console.log("cityPost");
                console.log(cityPost);

                createCityPost(cityPost);
                updateCityPost();
                updateComments();
            },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("not found");
            console.log(textStatus);
            $('.load').hide();
            $('.errorMsg').text("Not found.").css("display", "block").fadeOut(4000);

        }

    });
}



var createCityPost = function (cityPost) {
    console.log("in create:")
    cityWeatherArray.unshift(cityPost);
    // save
    _saveToLocalStorage();
}

var createComment = function (text, cityPostIndex) {
    var comment = { text: text };
    // pushing the comment into the correct cityWerater array
    cityWeatherArray[cityPostIndex].comments.push(comment);
    // save
    _saveToLocalStorage();
    //render comments 
    updateComments();
}

var removeCityPost = function ($clickedCityPost, index) {
    cityWeatherArray.splice(index, 1);
    // store
    _saveToLocalStorage();
    $clickedCityPost.remove();
    console.log("done remove");
}

var updateComments = function () {
    //empty all the comments - from all city-posts!!!
    $('.comments-list').empty();

    for (var i = 0; i < cityWeatherArray.length; i += 1) {
        // the current post in the iteration
        var cityPost = cityWeatherArray[i];

        // finding the "post" element in the page that is "equal" to the
        // current post index we're iterating on
        var $cityPost = $('.city-temp-list').find('.city-weather').eq(i);

        // iterate through each comment in our post's comments array
        for (var j = 0; j < cityPost.comments.length; j += 1) {
            // the current comment in the iteration
            var comment = cityPost.comments[j];

            // append the comment to the post we wanted to comment on
            $cityPost.find('.comments-list').append(
                // '<li class="comment">' + comment.text + '</li>'
                '<p class="comment">' + comment.text + '</p>'
            );
        };
    };
}



// Event Handlers below

$('.button-get-temp').on('click keyup', function () {
    event.preventDefault();
    if (event.keyCode === 13 || event.type === 'click') {
        var city = $('#city-name').val();
        if (city === '')
            // $('.errorMsg').text("Please enter city name").css("display", "block").fadeOut(4000);
            $('.errorMsg').text("Please enter city name").show().fadeOut(4000);

        else
            fetch(city);
    }
})

$('.city-temp-list').on('click', '.remove-city-weather', function () {
    var $clickedItem = $(this).closest('.city-weather');
    var index = $clickedItem.index();
    removeCityPost($clickedItem, index);
})

$('.city-temp-list').on('click keyup', '.add-comment', function (event) {
    event.preventDefault();
    // var text = $(this).siblings('.comment-name').val();
    // if (text !== '') {
    //     if (event.keyCode === 13 || event.type === 'click') {
    //         var $commentsList = $(this).closest('.comments-form').siblings('.comments-list');
    //         // finding the index of the cityPost in the page...will use it in #createComment
    //         var cityPostIndex = $(this).closest('.city-weather').index();
    //         createComment(text, cityPostIndex);
    //         $(this).siblings('.comment-name').val("");
    //     }
    // }
    // else
    //     $('.errorMsgComm').show().fadeOut(4000);
    if (event.keyCode === 13 || event.type === 'click') {
        var text = $(this).siblings('.comment-name').val();
        if (text !== '') {
            var $commentsList = $(this).closest('.comments-form').siblings('.comments-list');
            // finding the index of the cityPost in the page...will use it in #createComment
            var cityPostIndex = $(this).closest('.city-weather').index();
            createComment(text, cityPostIndex);
            $(this).siblings('.comment-name').val("");
        }
        else
        $(this).closest('.comments-form').siblings('.errorMsgComm').show().fadeOut(4000);
    }

})

updateCityPost();
updateComments();
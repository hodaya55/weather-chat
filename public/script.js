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

// using API
var fetch = function (city) {
    $.get({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=d703871f861842b79c60988ccf3b17ec",
        beforeSend: function () {
            $('.load').show();
        },
        success: function (data) {
            $('.load').hide();
            var i = createCityPost(data);
            updatePost(i);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            $('.load').hide();
            $('.errorMsg').text("Not found.").show().fadeOut(4000);
        }
    });
}

var updateAllCityPost = function () {
    console.log("in update all posts:");
    $('.city-temp-list').empty();

    for (var i = 0; i < cityWeatherArray.length; i++) {
        var cityObj = cityWeatherArray[i];
        var weather = `
        <div class="city-weather">
        <div class="header">
           <h3><strong>${cityObj.name}</strong> </h3> <a role="button" class="remove-city-weather"> <i class="fa fa-trash"></i> </a>
        </div>
        <ul class="list" >`;
        if (typeof cityObj.details !== 'undefined') {
            for (let j = 0; j < cityObj.details.length; j++) {
                weather +=
                `<div class="li-inner-post">
                <div class="line" >
                <p class="temp-date" >${cityObj.details[j].temp.tCelsius + " °C " + cityObj.details[j].temp.tFahrenheit + " °F "
                    + cityObj.details[j].date + " " + cityObj.details[j].temp.description + " "}
                     <img src="http://openweathermap.org/img/w/${cityObj.details[j].temp.icon}.png"> </p>
                <a role="button" class="remove-inner-post"> <i class="fa fa-times-circle"></i> </a>
                </div>

                <div class="comments-container" >
                 <ul class="comments-list rounded">
                </ul>
               <form class="comments-form" >
                 <input type="text" class="comment-name form-control" placeholder="Comment about the weather in ${cityObj.name}">
                 <button type="submit" class="btn btn-sm btn-success add-comment">Post Comment</button>
               </form>
                <p class="errorMsgComm"> You can't enter empty comment.</p>
               </div>
               </div>`;
            }

        }
        weather += `</ul> </div>`;

        $('.city-temp-list').append(weather);

    }

}

// update per single post city
var updatePost = function (i) {
    console.log("index that returns from createPost: " + i);

    cityObj = cityWeatherArray[0];

    var li =
        '<div class="li-inner-post">' +
        '<div class="line" >' +
        '<p class="temp-date" >' + cityObj.details[0].temp.tCelsius + " °C "
        + cityObj.details[0].temp.tFahrenheit + " °F "
        + cityObj.details[0].date + " " + cityObj.details[0].temp.description + " " +
        '<img src="http://openweathermap.org/img/w/' + cityObj.details[0].temp.icon + '.png"> </p>' +
        '<a role="button" class="remove-inner-post"> <i class="fa fa-times-circle"></i> </a>' +
        '</div>' +
        '<div class="comments-container" >' +
        '<ul class="comments-list rounded">' +
        '</ul>' +
        '<form class="comments-form" >' +
        '<input type="text" class="comment-name form-control" placeholder="Comment about the weather in ' + cityObj.name + '">' +
        '<button type="submit" class="btn btn-sm btn-success add-comment">Post Comment</button></form>' +
        "<p class='errorMsgComm'> You can't enter empty comment.</p></div>";

    if (i === -1) { // new serach city
        var weather =
                    `<div class="city-weather"> <div class="header">
                    <h3><strong>${cityObj.name}</strong> </h3> <a role="button" class="remove-city-weather"> <i class="fa fa-trash"></i> </a> </div>
                    <ul class="list">` + li + `</ul> </div>  </div>`;
        $('.city-temp-list').prepend(weather);
    }
    else { // will append the new weather to the exist city name post
        var $existCityPost = $('.city-temp-list').find('.city-weather').eq(i).children('.list');
        weather = li + `</div > `;
        $existCityPost.prepend(weather);
        var cityPost = $('.city-temp-list').find('.city-weather').eq(i);
        $('.city-temp-list').prepend(cityPost);
    }

}

/*******Create*******/
var createCityPost = function (data) {
    console.log("in create post:");

    // return the index of the exist city name in cityWeatherArray
    // otherwise-(new city post) return -1
    var index = cityWeatherArray.findIndex(function (e) {
        return (data.name === e.name)
    });

    var d = new Date();
    var date = (d.getHours() < 10 ? '0' : '') + d.getHours() + ":" +
        (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + " on " +
        d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

    if (index === -1) { // new city name
        var cityPost = {
            name: data.name,
            details: [{
                temp: {
                    tCelsius: Math.round(data.main.temp), //  Celsius
                    tFahrenheit: Math.round(data.main.temp * 1.8 + 32), //  Fahrenheit
                    icon: data.weather[0].icon,
                    description: data.weather[0].description
                },
                date: date,
                comments: []
            }]
        };
        cityWeatherArray.unshift(cityPost);
    }
    else { // exist city name
        cityWeatherArray[index].details.unshift({
            temp: {
                tCelsius: Math.round(data.main.temp), //  Celsius
                tFahrenheit: Math.round(data.main.temp * 1.8 + 32), //  Fahrenheit
                icon: data.weather[0].icon,
                description: data.weather[0].description
            },
            date: date,
            comments: []
        });

        //in order to display first the exist city post ,in page after update.
        cityWeatherArray.unshift(cityWeatherArray[index]);
        cityWeatherArray.splice(index + 1, 1);
    }

    _saveToLocalStorage();

    console.log("all the array: ");
    console.log(cityWeatherArray);

    return index;
}

var createComment = function (text, $cityPost, $cityPostComment, $commentsList) {
    console.log("in create comment:");
    console.log("indexPost: " + $cityPost.index());
    console.log("indexComment: " + $cityPostComment.index());

    var comment = { text: text };
    // pushing the comment into the correct cityWerater array
    // by finding the index of the cityPost and the current comments in the page...
    cityWeatherArray[$cityPost.index()].details[$cityPostComment.index()].comments.push(comment);
    _saveToLocalStorage();
    $commentsList.append('<p class="comment"> <i class="fa fa-comments-o"></i>' + '"' + text + '" </p>');
}

var removeCityPost = function ($clickedCityPost, index) {
    cityWeatherArray.splice(index, 1);
    _saveToLocalStorage();
    $clickedCityPost.remove();
    console.log("done remove");
}

/***** Update Comments*****/
var updateAllComments = function () {
    console.log("in update all comments:");
    //empty all the comments - from all city-posts
    $('.comments-list').empty();
    for (var i = 0; i < cityWeatherArray.length; i++) {
        // the current post in the iteration
        var cityPost = cityWeatherArray[i];
        // finding the "post" element in the page that is "equal" to the
        // current post index we're iterating on
        var $cityPost = $('.city-temp-list').find('.city-weather').eq(i);
        for (var k = 0; k < cityPost.details.length; k++) {
            var $commentPost = $cityPost.children().find('.li-inner-post').eq(k);
            if (typeof cityPost.details[k].comments !== 'undefined') {
                var detail = cityPost.details[k];
                // iterate through each comment in our post's comments array
                for (var j = 0; j < detail.comments.length; j++) {
                    // the current comment in the iteration
                    var comment = detail.comments[j];
                    // append the comment to the current post we wanted to comment on
                    $commentPost.find('.comments-list').append(
                        '<p class="comment"> <i class="fa fa-comments-o"></i>' +
                        '"' + comment.text + '" </p>'
                    );
                }
            }
        }
    }
}

// update comments of one post on the page - *not used*
var updateComments = function (text, $commentsList) {
    console.log("in update comments:");
    // $commentsList.empty();
    $commentsList.append('<p class="comment"> <i class="fa fa-comments-o"></i>' + '"' + text + '" </p>');
}


// ****Event Handlers below**** //
$('.button-get-temp').on('click keyup', function (event) {
    event.preventDefault();
    if (event.keyCode === 13 || event.type === 'click') {
        var city = $('#city-name').val();
        if (city === '')
            $('.errorMsg').text("Please enter city name").show().fadeOut(4000);
        else
            fetch(city);
    }
})

function doConfirm(msg, yesFn, noFn) {
    var confirmBox = $("#confirmBox");
    confirmBox.find(".message").text(msg);
    confirmBox.find(".yes,.no").unbind().click(function () {
        confirmBox.hide();
    });
    confirmBox.find(".yes").click(yesFn);
    confirmBox.find(".no").click(noFn);
    confirmBox.show();
}

$('.city-temp-list').on('click', '.remove-city-weather', function () {
    var $clickedItem = $(this).closest('.city-weather');
    var index = $clickedItem.index();

    doConfirm("Are you sure?",
        function yes() {
            removeCityPost($clickedItem, index);
        },
        function no() {
            return;
        });
})

// delete inner post in the city-weather post
$('.city-temp-list').on('click', '.remove-inner-post', function () {
    var $cityPost = $(this).closest('.city-weather');
    var $currentInnerComment = $(this).closest('.li-inner-post');
    var index = $cityPost.index();
    cityWeatherArray[index].details.splice($currentInnerComment.index(), 1);
    var count = $currentInnerComment.parent('.list').children().length - 1;
    $currentInnerComment.remove();
    console.log("done remove inner post");
    console.log(count);
    if (count === 0) {
        $cityPost.remove();
        cityWeatherArray.splice(index, 1);
    }

    _saveToLocalStorage();
})

$('.city-temp-list').on('click keyup', '.add-comment', function (event) {
    event.preventDefault();
    if (event.keyCode === 13 || event.type === 'click') {
        var text = $(this).siblings('.comment-name').val();
        if (text !== '') {
            var $cityPostComment = $(this).closest('.li-inner-post');
            var $cityPost = $(this).closest('.city-weather');
            var $commentsList = $(this).closest('.comments-form').siblings('.comments-list');
            createComment(text, $cityPost, $cityPostComment, $commentsList);
            $(this).siblings('.comment-name').val("");
        } else
            $(this).closest('.comments-form').siblings('.errorMsgComm').show().fadeOut(4000);
    }
})

// ****delete comment****
$('.city-temp-list').on('click', '.comment', function () {
    var $cityPostComment = $(this).closest('.li-inner-post');
    var $cityPost = $(this).closest('.city-weather');
    cityWeatherArray[$cityPost.index()].details[$cityPostComment.index()].comments.splice($(this).index(), 1);
    $(this).remove();
    _saveToLocalStorage();
    // deleteComment($cityPost, $cityPostComment);
})

// ****Sort By**** //
$('.sortByName, .sortByTemp , .sortByDate').on('click', function () {
    var id = $(this).attr('id');
    cityWeatherArray = cityWeatherArray.sort(function (a, b) {
        switch (id) {
            case "1":
                console.log('in sort name');
                var x = a["name"];
                var y = b["name"];
                break;
            case "2":
                x = a["details"][0]["temp"]["tCelsius"];
                y = b["details"][0]["temp"]["tCelsius"];
                break;
            case "3":
                x = a["details"][0].date;
                y = b["details"][0].date;
                break;
        }
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    updateAllCityPost();
    updateAllComments();
});

// update all posts and comments as soon as the page loads
updateAllCityPost();
updateAllComments();
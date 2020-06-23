// prep the document for load
$(document).ready(function() {
  // event listener on the search button
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");
    // invoke the search weather function with a search value of an empty string
    searchWeather(searchValue);
  });
// wait for click prompt 
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });
// create a list-item , add class to it and add text content to the item
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    // apped the list item to the unordered list
    $(".history").append(li);
  }
  
  function searchWeather(searchValue) {
    // ajax call to the openweathermap api
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=2ac2ebf2300093dfc5316a5d43f3d603&units=imperial",
      dataType: "json",
      success: function(data) {
        // create history link for this search
        // if searchValue is not in the history array
        if (history.indexOf(searchValue) === -1) {
          // push the searchValue variable into the history array
          history.push(searchValue);
          // we set stringified search value in localStorage to the key history
          window.localStorage.setItem("history", JSON.stringify(history));
          
          console.log(data)
          // run the makeRow function while passing it searchValue as a parameter
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
        
        // create h3 text with current city name and date
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // create div to hold search content 
        var card = $("<div>").addClass("card");
        // create text for the wind speed
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // create text for the humidity
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        // create text for the temperature
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // create a div to hold the current weather icon
        var cardBody = $("<div>").addClass("card-body");
        // create image tag to display the correct weather icon
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        
        // append the weather icon to the end of the title text
        title.append(img);
        // append the content of the card to the card body
        cardBody.append(title, temp, humid, wind);
        // append the card body to the main weather card
        card.append(cardBody);
        // append the main weather card to the #today container
        $("#today").append(card);
        // call follow-up api endpoints
        
        // create variable for giphy search term based on weather description
        weatherGif = data.weather[0].description;

        // call giphy API to get a gif based on weather description
        var giphyURL = "https://api.giphy.com/v1/gifs/random?tag="+ weatherGif + "&api_key=5B5V04Mv9Cc91t58fVPRXATgeTwTn91g&rating=pg";

        $.ajax({
          url: giphyURL,
          method: "GET"
        }).then(function(gifphyData) {
          console.log(gifphyData);
          displayedGif = gifphyData.data.images.downsized_medium.url;
          // Other options for gif image
          // fixed_height_small_url
          // images.downsized_medium.url
          // image_original_url
          
          var gifTitle = $("<h3>").addClass("card-title").text("Gifs for your Weather");
          // create card div to hold gif content
          var gifCard = $("<div>").addClass("card");
          // create an image element with the gif as the source image
          var gifImage = $("<img>").attr("src", displayedGif);
          // append the title to the card
          gifCard.append(gifTitle);
          // append the image tag to the card
          gifCard.append(gifImage);
          // append the weather gif card to the #today container
          $("#today").append(gifCard);
        });
        
        getForecast(searchValue);

        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
// Create function to call Weather API and get serach parameters
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=2ac2ebf2300093dfc5316a5d43f3d603&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  // function to get the UV index with lat and lon as parameters
  function getUVIndex(lat, lon) {
    // ajax call to pull from the openweathermap API
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=2ac2ebf2300093dfc5316a5d43f3d603&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      // on a successful call, we run this function with data as a parameter
      success: function(data) {
        // variable to store the paragraph tag html content
        var uv = $("<p>").text("UV Index: ");
        // variable to store a span tag with text content equal to the value of the data we pulled
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        console.log(data);
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // Create a funtion that pulls the description from the OpenWeather API call and searches for a related gif in the Giphy API. Add the gif to the page for the user
  function getWeatherGif(description) {
    // 
  }


  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});

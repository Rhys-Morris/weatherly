import cities from "cities.json";

// ---------- GLOBAL VARIABLES -----------

console.log(cities);

const weekdays = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const weatherIcons = {
  "01d": "../source/img/clear-day.svg",
  "01n": "../source/img/clear-night.svg",
  "02d": "../source/img/partly-cloudy-day.svg",
  "02n": "../source/img/partly-cloudy-night.svg",
  "03d": "../source/img/cloudy.svg",
  "03n": "../source/img/cloudy.svg",
  "04d": "../source/img/partly-cloudy-day.svg",
  "04n": "../source/img/partly-cloudy-night.svg",
  "09d": "../source/img/partly-cloudy-day-drizzle.svg",
  "09n": "../source/img/partly-cloudy-night-drizzle.svg",
  "10d": "../source/img/rain.svg",
  "10n": "../source/img/rain.svg",
  "11d": "../source/img/thunderstorms.svg",
  "11n": "../source/img/thunderstorms.svg",
  "13d": "../source/img/snow.svg",
  "13n": "../source/img/snow.svg",
  "50d": "../source/img/mist.svg",
  "50n": "../source/img/mist.svg",
};

let filteredCities = [];

// HTML Elements
const searchInput = document.querySelector(".header__search__input");
const resultsBox = document.querySelector(".header__search__results");

// ---------- API REQUESTS -----------

const getCurrentLocation = function () {
  navigator.geolocation.getCurrentPosition((data) => {
    const { latitude, longitude } = data.coords;
    getWeather(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );
    getForecast(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exlude=minutely,hourly&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );
  });
};

const getWeather = function (url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // DELETE WHEN FINISHED
      renderCurrentLocation(data.name);
      renderCurrentTemperature(convertToCelsius(data.main.temp));
      renderWeatherDescription(data.weather[0].description);
      renderIcon(data.weather[0].icon);
      renderHumidity(data.main.humidity);
      renderFeelsLike(data.main["feels_like"]);
      renderWind(data.wind.speed);
    })
    .catch((err) =>
      console.error("Error whilst attempting to fetch weather data")
    );
};

const getForecast = function (url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // DELETE WHEN FINISHED
      renderForecast(getCurrentDay(), data);
      renderUv(data.current.uvi);
      renderSunrise(data.current.sunrise);
      renderSunset(data.current.sunset);
    })
    .catch((err) =>
      console.error("Error whilst attempting to fetch weather data")
    );
};

// ----------- RENDER FUNCTIONS -----------

// MAIN DISPLAY

const renderCurrentLocation = function (location) {
  const locationDisplay = document.querySelector(".main-display__location");
  locationDisplay.textContent = location;
};

const renderCurrentTemperature = function (temperature) {
  const temperatureDisplay = document.querySelector(
    ".main-display__temperature"
  );
  temperatureDisplay.textContent = `${temperature}°C`;
};

const renderWeatherDescription = function (weather) {
  const descriptionDisplay = document.querySelector(
    ".main-display__description"
  );
  weather = weather
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1, word.length))
    .join(" ");
  descriptionDisplay.textContent = weather;
};

const renderIcon = function (icon) {
  const locationDisplay = document.querySelector(".main-display__location");
  const widget = document.createElement("img");
  widget.className = "main-display__widget";
  widget.src = weatherIcons[icon];
  locationDisplay.parentNode.insertBefore(widget, locationDisplay.nextSibling);
};

const renderHumidity = function (humidity) {
  const humidityDisplay = document.querySelector(".main-display__humidity");
  humidityDisplay.innerHTML = `<span>Humidity:</span> ${humidity}%`;
};

const renderFeelsLike = function (temperature) {
  const temperatureDisplay = document.querySelector(
    ".main-display__feels-like"
  );
  temperatureDisplay.innerHTML = `<span>Feels Like:</span> ${convertToCelsius(
    temperature
  )}°C`;
};

const renderWind = function (wind) {
  const windDisplay = document.querySelector(".main-display__wind");
  windDisplay.innerHTML = `<span>Wind speed:</span> ${wind}km/hr`;
};

const renderUv = function (uv) {
  const uvDisplay = document.querySelector(".main-display__uv");
  uvDisplay.innerHTML = `<span>UV Index:</span> ${uv}`;
};

const renderSunrise = function (sunrise) {
  const sunriseDisplay = document.querySelector(".main-display__sunrise");
  const timeString = convertTimestamp(sunrise * 1000);
  sunriseDisplay.innerHTML = `<span>Sunrise: </span> ${timeString}`;
};

const renderSunset = function (sunset) {
  const sunsetDisplay = document.querySelector(".main-display__sunset");
  const timeString = convertTimestamp(sunset * 1000);
  sunsetDisplay.innerHTML = `<span>Sunset: </span> ${timeString}`;
};

// FORECAST

const renderForecast = function (currentDay, data) {
  // Set loop to populate correct CSS class

  let positionInForecast = 0;
  for (let i = 1; i < 6; i++) {
    // Populate forecast containers
    let targetDay = document.querySelector(`.forecast__card__day--${i}`);
    let targetTemperature = document.querySelector(
      `.forecast__card__temperature--${i}`
    );

    if (positionInForecast == 0) {
      targetDay.textContent = "Today";
    } else {
      targetDay.textContent = weekdays[currentDay];
    }
    targetTemperature.textContent = `${convertToCelsius(
      data.daily[positionInForecast].temp.max
    )}°C `;

    // Create Widget
    let widget = document.createElement("img");
    widget.className = "forecast__card__icon__widget";
    widget.src = weatherIcons[data.daily[positionInForecast].weather[0].icon];
    targetDay.parentNode.insertBefore(widget, targetDay.nextSibling);

    // Increment current day
    currentDay++;
    if (currentDay == 7) {
      currentDay = 0;
    }

    // Increment position in forecast
    positionInForecast++;
  }
};

// Render City information

const renderResult = function (city) {
  const result = document.createElement("div");
  result.className = "header__search__results__city";
  result.textContent = `${city.name}, ${city.country}`;

  // Add latitude and longitude as data attributes
  result.dataset.latitide = Number(city.lat).toFixed(4);
  result.dataset.longitude = Number(city.lng).toFixed(4);

  // Append to results div
  resultsBox.appendChild(result);

  // Add event listener - if clicked
  result.addEventListener("click", function () {
    // Remove widgets
    document
      .querySelectorAll(".forecast__card")
      .forEach((card) => card.removeChild(card.childNodes[2]));
    document
      .querySelector(".main-display__main")
      .removeChild(document.querySelector(".main-display__widget"));

    console.log(this);

    // Call weather API with new location
    getWeather(
      `https://api.openweathermap.org/data/2.5/weather?lat=${this.dataset.latitide}&lon=${this.dataset.longitude}&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );
    getForecast(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${this.dataset.latitide}&lon=${this.dataset.longitude}&exlude=minutely,hourly&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );

    // Remove results
    resultsBox.innerHTML = "";
  });
};

// ----- HELPER FUNCTIONS -----

const convertToCelsius = function (kelvin) {
  return Math.round(kelvin - 273.15);
};

const convertToFahrenheit = function (kelvin) {
  const celsius = convertToCelsius(kelvin);
  return Math.round(celsius * (9 / 5) + 32);
};

const getCurrentDay = function () {
  const currentDate = new Date();
  return currentDate.getDay();
};

const convertTimestamp = function (timestamp) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes()}`;
};

// ------ APPLICATION LOGIC -----

// Get weather Data for current location - if not possible, default to Melbourne, Aus

getCurrentLocation();

// ----- EVENT LISTENERS -----

searchInput.addEventListener("keyup", () => {
  const selectedCity = searchInput.value.toLowerCase();

  // If empty remove all results and return
  if (selectedCity == "") {
    resultsBox.innerHTML = "";
    return;
  }

  // Filter possible cities and reduce ot list of ten
  filteredCities = cities
    .filter((city) => city.name.toLowerCase().match(selectedCity))
    .slice(0, 10);
  console.log(filteredCities);

  // Empty search results prior to repopulating
  resultsBox.innerHTML = "";

  // Render new result for each city
  filteredCities.forEach(function (city) {
    renderResult(city);
  });
});

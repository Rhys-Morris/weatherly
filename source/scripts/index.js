// ----- GLOBAL VARIABLES -----

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
  "clear sky": "../source/img/clear-day.svg",
  "broken clouds": "../source/img/partly-cloudy-day.svg",
};
const searchSubmit = document.querySelector(".search__submit");
const searchInput = document.querySelector(".search__input");

// ----- API REQUESTS -----

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
      renderIcon(data.weather[0].description);
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
    })
    .catch((err) =>
      console.error("Error whilst attempting to fetch weather data")
    );
};

// ----- RENDER FUNCTIONS -----

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

const renderIcon = function (weather) {
  const locationDisplay = document.querySelector(".main-display__location");
  const widget = document.createElement("img");
  widget.className = "main-display__widget";
  widget.src = weatherIcons[weather];
  locationDisplay.parentNode.insertBefore(widget, locationDisplay.nextSibling);
};

const renderHumidity = function (humidity) {
  const humidityDisplay = document.querySelector(".main-display__humidity");
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
};

const renderFeelsLike = function (temperature) {
  const temperatureDisplay = document.querySelector(
    ".main-display__feels-like"
  );
  temperatureDisplay.textContent = `Feels Like: ${convertToCelsius(
    temperature
  )}°C`;
};

const renderWind = function (wind) {
  const windDisplay = document.querySelector(".main-display__wind");
  windDisplay.textContent = `Wind speed: ${wind}km/hr`;
};

const renderForecast = function (currentDay, data) {
  // Set loop to populate correct CSS class

  let positionInForecast = 0;
  for (let i = 1; i < 6; i++) {
    // Increment the day

    currentDay++;
    if (currentDay == 7) {
      currentDay = 0;
    }

    // Populate forecast containers
    let targetDay = document.querySelector(`.forecast__card__day--${i}`);
    let targetTemperature = document.querySelector(
      `.forecast__card__temperature--${i}`
    );
    let targetIcon = document.querySelector(`.forecast__card__icon--${i}`);
    if (positionInForecast == 0) {
      targetDay.textContent = "Today";
    } else {
      targetDay.textContent = weekdays[currentDay];
    }
    targetTemperature.textContent = `${convertToCelsius(
      data.daily[positionInForecast].temp.max
    )}°C `;
    positionInForecast++;
  }
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

// ------ APPLICATION LOGIC -----

// Get weather Data for current location - if not possible, default to Melbourne, Aus

getCurrentLocation();

// ----- EVENT LISTENERS -----

searchSubmit.addEventListener("click", () => {
  const city = searchInput.value;
  getWeather(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=16c3e8bb211544cefedaf6ff65aa87c5`
  );
});

// ---------- GLOBAL VARIABLES -----------

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

let displayCelsius = true;

// HTML Elements
const searchInput = document.querySelector(".header__search__input");
const resultsBox = document.querySelector(".header__search__results");
const temperatureToggle = document.querySelector(".header__toggle");
const wrapperDiv = document.querySelector(".wrapper");

// ADJUST FOR SCREEN SIZE

if (window.screen.width < 750) {
  document.querySelector(".header__toggle__fahrenheit").textContent = "°F";
  document.querySelector(".header__toggle__celsius").textContent = "°C";
}

// ---------- API REQUESTS -----------

const loadStart = function () {
  getWeather(
    `https://api.openweathermap.org/data/2.5/weather?lat=-37.81&lon=144.93&appid=16c3e8bb211544cefedaf6ff65aa87c5`
  );
  getForecast(
    `https://api.openweathermap.org/data/2.5/onecall?lat=-37.81&lon=144.93&exlude=minutely,hourly&appid=16c3e8bb211544cefedaf6ff65aa87c5`
  );
};

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
      renderCurrentLocation(data.name, data.sys.country);
      renderCurrentTemperature(convertToCelsiusFromKelvin(data.main.temp));
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

      renderForecast(getCurrentDay(), data);
      renderUv(data.daily[0].uvi);
      renderSunrise(data.current.sunrise, data.timezone);
      renderSunset(data.current.sunset, data.timezone);

      // Reveal app on first load
      if ((wrapperDiv.style.visibility = "hidden"))
      wrapperDiv.style.visibility = "visible";
    })
    .catch((err) =>
      console.error("Error whilst attempting to fetch weather data")
    );
};

// ----------- RENDER FUNCTIONS -----------

// MAIN DISPLAY

const renderCurrentLocation = function (location, country) {
  const locationDisplay = document.querySelector(
    ".main-display__location__text"
  );
  locationDisplay.textContent = location;
  const locationFlag = document.createElement("img");

  locationFlag.className = "main-display__location__country";
  locationFlag.src = `https://www.countryflags.io/${country}/flat/64.png`;
  locationDisplay.parentNode.appendChild(locationFlag);
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
  const humidityDisplay = document.querySelector(
    ".main-display__humidity__text"
  );
  humidityDisplay.innerHTML = `<span>Humidity:</span> ${humidity}%`;
};

const renderFeelsLike = function (temperature) {
  const temperatureDisplay = document.querySelector(
    ".main-display__feels-like__text"
  );
  temperatureDisplay.innerHTML = `Feels Like:  ${convertToCelsiusFromKelvin(
    temperature
  )}°C`;
};

const renderWind = function (wind) {
  const windDisplay = document.querySelector(".main-display__wind__text");
  windDisplay.innerHTML = `Wind speed:   ${wind}km/hr`;
};

const renderUv = function (uv) {
  const uvDisplay = document.querySelector(".main-display__uv__text");
  uvDisplay.innerHTML = `UV Index:   ${uv}`;
};

const renderSunrise = function (sunrise, timezone) {
  const sunriseDisplay = document.querySelector(".main-display__sunrise__text");
  const timeString = convertTimestamp(sunrise * 1000, timezone);
  sunriseDisplay.innerHTML = `Sunrise:  ${timeString}`;
};

const renderSunset = function (sunset, timezone) {
  const sunsetDisplay = document.querySelector(".main-display__sunset__text");
  const timeString = convertTimestamp(sunset * 1000, timezone);
  sunsetDisplay.innerHTML = `Sunset:  ${timeString}`;
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
    targetTemperature.textContent = `${convertToCelsiusFromKelvin(
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
  const resultText = document.createElement("span");
  const resultFlag = document.createElement("img");

  resultText.textContent = `${city.name}`;
  resultFlag.src = `https://www.countryflags.io/${city.country}/flat/24.png`;

  // Add latitude and longitude as data attributes
  result.dataset.latitide = Number(city.lat).toFixed(4);
  result.dataset.longitude = Number(city.lng).toFixed(4);

  // Append to results div
  result.appendChild(resultText);
  result.appendChild(resultFlag);
  resultsBox.appendChild(result);

  // Add event listener - if clicked                    // THIS NEEDS TO BE DELEGATED TO PARENT
  result.addEventListener("click", function () {
    // Remove widgets
    document
      .querySelectorAll(".forecast__card")
      .forEach((card) => card.removeChild(card.childNodes[2]));
    document
      .querySelector(".main-display__main")
      .removeChild(document.querySelector(".main-display__widget"));

    // Call weather API with new location
    getWeather(
      `https://api.openweathermap.org/data/2.5/weather?lat=${this.dataset.latitide}&lon=${this.dataset.longitude}&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );
    getForecast(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${this.dataset.latitide}&lon=${this.dataset.longitude}&exlude=minutely,hourly&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );

    // Remove results & current flag
    resultsBox.innerHTML = "";
    const flag = document.querySelector(".main-display__location__country");
    flag.parentNode.removeChild(flag);
  });
};

// ----- HELPER FUNCTIONS -----

const convertToCelsiusFromKelvin = function (kelvin) {
  return Math.round(kelvin - 273.15);
};

const convertToCelsiusFromFahrenheit = function (fahrenheit) {
  return Math.round((fahrenheit - 32) * (5 / 9));
};

const convertToFahrenheitFromCelsius = function (celsius) {
  return Math.round(celsius * (9 / 5) + 32);
};

const convertDisplayToFahrenheit = function (target) {
  let temp = Number(target.textContent.split("°")[0]);
  let fahrenheitConversion = convertToFahrenheitFromCelsius(temp);
  target.textContent = String(fahrenheitConversion) + "°F";
};

const convertDisplayToCelsius = function (target) {
  let temp = Number(target.textContent.split("°")[0]);
  let celsiusConversion = convertToCelsiusFromFahrenheit(temp);
  target.textContent = String(celsiusConversion) + "°C";
};

const getCurrentDay = function () {
  const currentDate = new Date();
  return currentDate.getDay();
};

const convertTimestamp = function (timestamp, timezone) {
  let date = new Date(timestamp);
  date = date.toLocaleTimeString("en-UK", { timeZone: timezone });
  date = date.split(":");

  // Get am or pm from string and remove seconds
  let twelveHourTime = date[2].split(" ")[1];

  date.splice(1, 1);

  return date.join(":");
};

// ------ APPLICATION LOGIC -----

// Load Melbourne or current location

loadStart();

// getCurrentLocation();  // Currently not using Geolocation API

if (window.screen.width < 750) {
  document.querySelector(".header__toggle__fahrenheit").textContent = "°F";
  document.querySelector(".header__toggle__celsius").textContent = "°C";
}

// ----- EVENT LISTENERS -----

searchInput.addEventListener("keyup", () => {
  const selectedCity = searchInput.value.toLowerCase();

  // If empty remove all results and return
  if (selectedCity == "") {
    resultsBox.innerHTML = "";
    return;
  }

  fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json')
    .then(res => res.json())
    .then(cities => {
      return cities
      .filter((city) => city.name.toLowerCase().match(selectedCity))
      .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
      .slice(0, 10);
    }).then(filteredCities => {
        // Empty search results prior to repopulating
        resultsBox.innerHTML = "";

        filteredCities.forEach(function (city) {
          renderResult(city);
        })
    });
});

//  Toggle Celsius/Fahrenheit

temperatureToggle.addEventListener("click", (e) => {
  // HTML Elements to target
  const mainDisplayTemp = document.querySelector(".main-display__temperature");
  const forecastTemps = document.querySelectorAll(
    ".forecast__card__temperature"
  );
  const feelsLikeElement = document.querySelector(
    ".main-display__feels-like__text"
  );
  const fahrenheitElement = document.querySelector(
    ".header__toggle__fahrenheit"
  );
  const celsiusElement = document.querySelector(".header__toggle__celsius");

  // Get temp out of feels like string
  let feelsLikeTemp = feelsLikeElement.textContent.split("°")[0].split("");
  feelsLikeTemp = feelsLikeTemp.slice(-2, feelsLikeTemp.length).join("");

  // If clicking on already active - return
  if (e.target.classList.contains("header__toggle__active")) return;

  // If not clicking on Celsius or Fahrenheit - return
  if (
    !e.target.classList.contains("header__toggle__celsius") &&
    !e.target.classList.contains("header__toggle__fahrenheit")
  )
    return;

  if (displayCelsius) {
    convertDisplayToFahrenheit(mainDisplayTemp);
    forecastTemps.forEach((temp) => {
      convertDisplayToFahrenheit(temp);
    });
    feelsLikeElement.textContent = `Feels Like: ${convertToFahrenheitFromCelsius(
      Number(feelsLikeTemp)
    )}°F`;
  } else {
    convertDisplayToCelsius(mainDisplayTemp);
    forecastTemps.forEach((temp) => {
      convertDisplayToCelsius(temp);
      feelsLikeElement.textContent = `Feels Like: ${convertToCelsiusFromFahrenheit(
        Number(feelsLikeTemp)
      )}°C`;
    });
  }

  displayCelsius = !displayCelsius;
  celsiusElement.classList.toggle("header__toggle__active");
  fahrenheitElement.classList.toggle("header__toggle__active");
});

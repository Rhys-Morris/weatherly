// ----- API REQUESTS -----

const getCurrentLocation = function () {
  navigator.geolocation.getCurrentPosition((data) => {
    const { latitude, longitude } = data.coords;
    getWeather(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=16c3e8bb211544cefedaf6ff65aa87c5`
    );
  });
};

const getWeather = function (url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      displayCurrentLocation(data.name);
      getCurrentTemperature(data);
    })
    .catch((err) => console.error("Error"));
};

const displayCurrentLocation = function (location) {
  const locationDisplay = document.querySelector(".location");
  locationDisplay.textContent = location;
};

const getCurrentTemperature = function (location) {
  console.log(
    `The current temperature is: ${convertToCelsius(location.main.temp)}C`
  );
};

// ----- HELPER FUNCTIONS -----

const convertToCelsius = function (kelvin) {
  return Math.round(kelvin - 273.15);
};

const convertToFahrenheit = function (kelvin) {
  const celsius = convertToCelsius(kelvin);
  return Math.round(celsius * (9 / 5) + 32);
};

// ------ APPLICATION LOGIC -----

// Get weather Data for current location - if not possible, default to Melbourne, Aus

getCurrentLocation();

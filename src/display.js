import { Unit } from "./logic.js";

import clearDay from "@meteocons/svg/fill/clear-day.svg";
import clearNight from "@meteocons/svg/fill/clear-night.svg";
import cloudy from "@meteocons/svg/fill/cloudy.svg";
import fog from "@meteocons/svg/fill/fog.svg";
import partlyCloudyDay from "@meteocons/svg/fill/partly-cloudy-day.svg";
import partlyCloudyNight from "@meteocons/svg/fill/partly-cloudy-night.svg";
import rain from "@meteocons/svg/fill/rain.svg";
import snow from "@meteocons/svg/fill/snow.svg";
import umbrella from "@meteocons/svg/fill/umbrella-wind.svg";

import humidity from "@meteocons/svg/fill/humidity.svg";
import pressureHigh from "@meteocons/svg/fill/pressure-high.svg";
import pressureLow from "@meteocons/svg/fill/pressure-low.svg";
import wind from "@meteocons/svg/fill/wind.svg";
import sunrise from "@meteocons/svg/fill/sunrise.svg";
import sunset from "@meteocons/svg/fill/sunset.svg";
import uv from "@meteocons/svg/fill/uv-index.svg";

import empty from "@meteocons/svg/fill/moon-full.svg";

const icons = {
  "clear-day": clearDay,
  "clear-night": clearNight,
  cloudy,
  fog,
  "partly-cloudy-day": partlyCloudyDay,
  "partly-cloudy-night": partlyCloudyNight,
  rain,
  snow,
  wind: umbrella,
  humidity,
  pressureHigh,
  pressureLow,
  windBox: wind,
  sunrise,
  sunset,
  uv,
  empty,
};

document.querySelectorAll(".loading-animation").forEach((svg) => {
  svg.innerHTML = `
    <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="15" r="15" cx="40" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="15" r="15" cx="100" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="15" r="15" cx="160" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle>
  `;
});

export const loadPage = (logic) => {
  const title = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const populateData = (data) => {
    const location = document.querySelector(".location .name");
    location.innerText = title(data.location);
    const temp = document.querySelector(".main .info .temperature");
    temp.innerHTML = `${logic.data.temperature[logic.unit].toFixed(1)} &deg;${logic.unit == Unit.F ? "F" : "C"}`;
    const weatherIcon = document.querySelector(".weather-icon .icon");
    weatherIcon.src = icons[data.icon];
    const summary = document.querySelector(".summary");
    summary.innerText = data.summary;

    for (const name of ["humidity", "sunrise", "sunset", "uv"]) {
      const icon = document.querySelector(`.${name} .icon`);
      icon.src = icons[name];
      const value = document.querySelector(`.${name} .info .value`);
      let dataVal = data[name];
      if (["sunrise", "sunset"].includes(name))
        dataVal = dataVal.substring(0, dataVal.length - 3);
      value.innerText = dataVal;
    }
    const windIcon = document.querySelector(".wind .icon");
    windIcon.src = icons.windBox;
    const windVal = document.querySelector(".wind .info .value");
    windVal.innerText = data.wind;
    const pressureIcon = document.querySelector(".pressure .icon");
    pressureIcon.src =
      data.pressure >= 1020 ? icons.pressureHigh : icons.pressureLow;
    const pressureVal = document.querySelector(".pressure .info .value");
    pressureVal.innerText = data.pressure;
  };

  const toggle = document.querySelector(".unit-toggle");
  toggle.innerHTML = `${logic.unit == Unit.F ? "F" : "C"}`;
  toggle.addEventListener("click", () => {
    logic.toggleUnit();
    const temp = document.querySelector(".main .info .temperature");
    const unitHtml = `${logic.unit == Unit.F ? "F" : "C"}`;
    temp.innerHTML = `${logic.data.temperature[logic.unit].toFixed(1)} &deg;${unitHtml}`;
    toggle.innerHTML = unitHtml;
  });

  const search = document.querySelector("#search-bar");
  search.addEventListener("keydown", (e) => {
    if (!["Space", "Enter"].includes(e.key)) return;
    const value = search.value.trim();
    if (value === "") return;
    setData(value);
  });

  const errorModal = document.querySelector(".error");
  errorModal.addEventListener("click", (event) => {
    const rect = errorModal.getBoundingClientRect();
    const isClickOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (isClickOutside) {
      errorModal.classList.remove("open");
      errorModal.close();
    }
  });
  const errorConfirm = document.querySelector(".confirm");
  errorConfirm.addEventListener("click", () => {
    errorModal.classList.remove("open");
    errorModal.close();
  });

  const setData = (location) => {
    const container = document.querySelector(".container");
    container.classList.add("loading");
    const originalData = logic.data;
    logic
      .getLocationData(location)
      .then((data) => {
        data = logic.parseData(data);
        logic.data = data;
        populateData(data);
        search.value = "";
        search.blur();
        localStorage["initial"] = data.location;
      })
      .catch((error) => {
        console.log(error);
        const message = document.querySelector(".message");
        if (error.message == 400)
          message.innerText = "The location entered is invalid.";
        else if (error.message === "Failed to fetch")
          message.innerText = "No network connection.";
        else message.innerText = "An unknown error occured.";
        errorModal.classList.add("open");
        errorModal.showModal();
        populateData(originalData);
      })
      .finally(() => {
        container.classList.remove("loading");
      });
  };

  setData(logic.initial);
};

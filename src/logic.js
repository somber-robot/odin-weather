export const Unit = Object.freeze({ F: 0, C: 1 });

const url =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const key = "JTMT55S82NW9ZWE7Z74E2PTTA";

export class LogicHandler {
  constructor() {
    this.unit = Unit.F;
    this.data = {
      location: "--------",
      temperature: [0, 0],
      summary: "--------",
      icon: "empty",
      humidity: 0,
      pressure: 0,
      wind: 0.0,
      sunrise: "--:--",
      sunset: "--:--",
      uv: 0,
    };
    this.initial = "abuja";
    this.init();
  }

  storageFree = () => {
    let storage;
    try {
      storage = window.localStorage;
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        e.name === "QuotaExceededError" &&
        storage &&
        storage.length !== 0
      );
    }
  };

  init = () => {
    if (!this.storageFree()) return;
    if (!localStorage.getItem("unit")) {
      localStorage["unit"] = Unit.F;
      localStorage["initial"] = "abuja";
    }
    this.unit = localStorage["unit"];
    this.initial = localStorage["initial"];
  };

  async getLocationData(location) {
    const response = await fetch(url + location + "?key=" + key);
    if (!response.ok) throw Error(response.status);
    return response.json();
  }

  convertToC = (temp) => Math.round((temp - 32) * (5 / 9) * 10) / 10;

  parseData(data) {
    let today = data.days[0];
    return {
      location: data.address,
      temperature: [today.temp, this.convertToC(today.temp)],
      summary: today.conditions,
      icon: today.icon,
      humidity: today.humidity,
      pressure: today.pressure,
      wind: today.windspeed,
      sunrise: today.sunrise,
      sunset: today.sunset,
      uv: today.uvindex,
    };
  }

  toggleUnit = () => {
    this.unit = this.unit == Unit.F ? Unit.C : Unit.F;
    localStorage["unit"] = this.unit;
  };
}

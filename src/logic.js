const Unit = Object.freeze({ F: 0, C: 1 });

const url =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const key = "JTMT55S82NW9ZWE7Z74E2PTTA";

export class LogicHandler {
  constructor() {
    this.unit = Unit.F;
  }

  async getLocationData(location) {
    const response = await fetch(url + location + "?key=" + key);
    if (response.status !== 200) throw Error(response.status);
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
}

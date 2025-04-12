import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  temp: number;
  description: string;
  icon: string;
  date: Date;
  feelsLike: number;
  humidity: number;

  constructor(city: string, temp: number, description: string, icon: string, date: Date, feelsLike: number, humidity: number) {
    this.city = city;
    this.temp = temp;
    this.description = description;
    this.icon = icon;
    this.date = date;
    this.feelsLike = feelsLike;
    this.humidity = humidity;
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseUrl: string;
  private geoUrl: string;
  private apiKey: string;
  private cityName: string = '';

  constructor() {
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    this.geoUrl = 'https://api.openweathermap.org/geo/1.0/direct';
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.geoUrl}?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch geolocation data');
    const data = await res.json();
    if (!data[0]) throw new Error('City not found');
    return data[0];
  }

  // Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon
    };
  }

  // Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return this.cityName;
  }

  // Create buildWeatherQuery method
  private buildWeatherQuery({ lat, lon }: Coordinates): string {
    return `${this.baseUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    return await res.json();
  }

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const data = response.list[0]; // current/next 3-hour block
    return new Weather(
      response.city.name,
      data.main.temp,
      data.weather[0].description,
      data.weather[0].icon,
      new Date(data.dt_txt),
      data.main.feels_like,
      data.main.humidity
    );
  }

  // Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, data: any[]): Weather[] {
    const forecast: Weather[] = [currentWeather];
    const nextDays = data.filter((item: any, index: number) => item.dt_txt.includes('12:00:00') && index !== 0);
    nextDays.slice(0, 4).forEach((item) => {
      forecast.push(
        new Weather(
          this.cityName,
          item.main.temp,
          item.weather[0].description,
          item.weather[0].icon,
          new Date(item.dt_txt),
          item.main.feels_like,
          item.main.humidity
        )
      );
    });
    return forecast;
  }

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;

    const coords = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coords);
    const currentWeather = this.parseCurrentWeather(weatherData);
    return this.buildForecastArray(currentWeather, weatherData.list);
  }
}

export default new WeatherService();

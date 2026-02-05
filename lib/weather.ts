import axios from 'axios';

export interface WeatherData {
  date: string;
  temperature: number;
  condition: string;
  precipitation_probability: number;
  wind_speed: number;
  humidity: number;
  is_suitable_for_service: boolean;
  rain_alert: boolean;
}

export interface WeatherForecast {
  location: string;
  forecast: WeatherData[];
}

// Using OpenWeatherMap API (free tier)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

export const getWeatherForecast = async (
  city: string = 'Johannesburg',
  days: number = 7
): Promise<WeatherForecast | null> => {
  if (!WEATHER_API_KEY) {
    console.warn('Weather API key not configured');
    return null;
  }

  try {
    // Get 5-day forecast (free tier limit)
    const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
      params: {
        q: `${city},ZA`, // South Africa
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: Math.min(days * 8, 40), // 8 data points per day (every 3 hours)
      },
    });

    const forecastData = response.data;
    const dailyForecasts: WeatherData[] = [];

    // Group by date and take midday reading
    const dateGroups: Record<string, any[]> = {};

    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      dateGroups[date].push(item);
    });

    // Process each day
    Object.entries(dateGroups).forEach(([date, readings]) => {
      // Find midday reading (around 12:00)
      const middayReading = readings.find((r) => {
        const hour = new Date(r.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }) || readings[0];

      const precipitation = middayReading.pop || 0;
      const rainAlert = precipitation > 30; // More than 30% chance of rain

      const weatherData: WeatherData = {
        date,
        temperature: Math.round(middayReading.main.temp),
        condition: middayReading.weather[0].main,
        precipitation_probability: Math.round(precipitation),
        wind_speed: Math.round(middayReading.wind.speed * 3.6), // Convert m/s to km/h
        humidity: middayReading.main.humidity,
        is_suitable_for_service: precipitation < 50 && middayReading.wind.speed < 8,
        rain_alert: rainAlert,
      };

      dailyForecasts.push(weatherData);
    });

    return {
      location: city,
      forecast: dailyForecasts.slice(0, days),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

export const getSaturdayWeather = async (city: string = 'Johannesburg'): Promise<WeatherData | null> => {
  const forecast = await getWeatherForecast(city, 7);
  if (!forecast) return null;

  // Find next Saturday
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  const saturdayDate = nextSaturday.toISOString().split('T')[0];

  const saturdayWeather = forecast.forecast.find((day) => day.date === saturdayDate);
  return saturdayWeather || null;
};

export const checkWeatherForBooking = async (
  bookingDate: string,
  city: string = 'Johannesburg'
): Promise<{
  suitable: boolean;
  rainAlert: boolean;
  recommendation: string;
  weather?: WeatherData;
}> => {
  const forecast = await getWeatherForecast(city, 7);

  if (!forecast) {
    return {
      suitable: true,
      rainAlert: false,
      recommendation: 'Weather data unavailable. Service will proceed as scheduled.',
    };
  }

  const dayWeather = forecast.forecast.find((day) => day.date === bookingDate);

  if (!dayWeather) {
    return {
      suitable: true,
      rainAlert: false,
      recommendation: 'Weather forecast not available for this date.',
    };
  }

  let recommendation = '';

  if (dayWeather.rain_alert) {
    recommendation = `⚠️ Rain forecasted (${dayWeather.precipitation_probability}% chance). We recommend adding our Rain Repel ceramic upgrade (R120) for enhanced water protection.`;
  } else if (!dayWeather.is_suitable_for_service) {
    recommendation = `Weather conditions may not be optimal. Consider rescheduling or adding protective treatments.`;
  } else if (dayWeather.condition === 'Clear' && dayWeather.temperature > 25) {
    recommendation = `Perfect conditions for service! Sunny and ${dayWeather.temperature}°C - ideal for polymer curing.`;
  } else {
    recommendation = `Good conditions for service. ${dayWeather.condition}, ${dayWeather.temperature}°C.`;
  }

  return {
    suitable: dayWeather.is_suitable_for_service,
    rainAlert: dayWeather.rain_alert,
    recommendation,
    weather: dayWeather,
  };
};

// Proactive weather alerts for upcoming bookings
export const shouldOfferRainRepel = (weather: WeatherData): boolean => {
  return weather.precipitation_probability > 30 || weather.condition.toLowerCase().includes('rain');
};

export const getWeatherBasedUpsell = (weather: WeatherData): {
  shouldOffer: boolean;
  product: string;
  price: number;
  reason: string;
} | null => {
  if (shouldOfferRainRepel(weather)) {
    return {
      shouldOffer: true,
      product: 'Rain Repel Ceramic Upgrade',
      price: 120,
      reason: `${weather.precipitation_probability}% chance of rain forecasted. Enhanced hydrophobic protection recommended.`,
    };
  }

  if (weather.temperature > 30) {
    return {
      shouldOffer: true,
      product: 'UV Protection Boost',
      price: 150,
      reason: `High UV index (${weather.temperature}°C). Extra UV protection will prevent paint fade.`,
    };
  }

  if (weather.wind_speed > 30) {
    return {
      shouldOffer: true,
      product: 'Dust Guard Sealant',
      price: 100,
      reason: `Windy conditions (${weather.wind_speed}km/h). Extra sealant will protect against airborne contaminants.`,
    };
  }

  return null;
};

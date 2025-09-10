import { useState, useEffect } from 'react';
import { Cloud, Droplets, Thermometer, Wind, Search, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const WEATHER_API_KEY = "76e2744e2ea54d4492e152146251009";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
      };
    }>;
  };
}

export const WeatherSection = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('Delhi');
  const [searchCity, setSearchCity] = useState('');
  const { toast } = useToast();

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${cityName}&days=3&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setCity(cityName);
      
      toast({
        title: "Weather Updated",
        description: `Weather data for ${data.location.name} loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please check the city name.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeather(searchCity.trim());
      setSearchCity('');
    }
  };

  if (loading && !weatherData) {
    return (
      <Card className="card-farming">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Cloud className="w-5 h-5" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="mt-2 text-muted-foreground">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-farming">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Cloud className="w-5 h-5" />
          Weather Forecast
        </CardTitle>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <Input
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !searchCity.trim()}
            className="px-4"
          >
            {loading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {weatherData ? (
          <>
            {/* Current Weather */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">
                  {weatherData.location.name}, {weatherData.location.region}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {weatherData.current.temp_c}°C
                  </div>
                  <div className="text-muted-foreground">
                    {weatherData.current.condition.text}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Feels like {weatherData.current.feelslike_c}°C
                  </div>
                </div>
                <img 
                  src={`https:${weatherData.current.condition.icon}`}
                  alt={weatherData.current.condition.text}
                  className="w-16 h-16"
                />
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Humidity</div>
                  <div className="font-semibold">{weatherData.current.humidity}%</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Wind Speed</div>
                  <div className="font-semibold">{weatherData.current.wind_kph} km/h</div>
                </div>
              </div>
            </div>

            {/* 3-Day Forecast */}
            <div>
              <h4 className="font-semibold text-primary mb-3">3-Day Forecast</h4>
              <div className="space-y-2">
                {weatherData.forecast.forecastday.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https:${day.day.condition.icon}`}
                        alt={day.day.condition.text}
                        className="w-8 h-8"
                      />
                      <div>
                        <div className="font-medium">
                          {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {day.day.condition.text}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {day.day.maxtemp_c}° / {day.day.mintemp_c}°
                      </div>
                      <div className="text-sm text-blue-600 flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        {day.day.daily_chance_of_rain}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No weather data available. Please search for a city.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
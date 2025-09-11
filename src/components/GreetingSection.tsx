import { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Mic, Cloud, Leaf, Bug, MessageCircle, AlertTriangle, Calendar, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GreetingSectionProps {
  onSectionChange?: (section: string) => void;
}

export const GreetingSection = ({ onSectionChange }: GreetingSectionProps) => {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState<typeof Sun>(Sun);
  const [weather, setWeather] = useState<any>(null);
  const [seasonalTip, setSeasonalTip] = useState('');
  
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      const farmerName = "Gowtham"; // This could be dynamic from user context
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting(`Good Morning ${farmerName}`);
        setIcon(Sunrise);
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting(`Good Afternoon ${farmerName}`);
        setIcon(Sun);
      } else {
        setGreeting(`Good Evening ${farmerName}`);
        setIcon(Moon);
      }
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Fetch weather for alerts
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=76e2744e2ea54d4492e152146251009&q=Bangalore&aqi=no`
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(weatherInterval);
  }, []);

  // Set seasonal tips based on current month
  useEffect(() => {
    const month = new Date().getMonth();
    const tips = {
      0: "January: Prepare your fields for Rabi crop harvesting. Monitor for late blight in wheat.",
      1: "February: Good time for harvesting wheat and barley. Start preparing for summer crops.",
      2: "March: Ideal time for summer crop sowing like maize, cotton, and sugarcane.",
      3: "April: Continue summer crop care. Ensure adequate irrigation as temperatures rise.",
      4: "May: Pre-monsoon preparations. Check drainage systems and prepare for Kharif sowing.",
      5: "June: Monsoon season begins! Perfect time for rice, cotton, and sugarcane sowing.",
      6: "July: Monitor crop growth closely. Watch for pest attacks due to high humidity.",
      7: "August: Peak growing season. Ensure proper fertilization and pest management.",
      8: "September: Harvest time for early Kharif crops. Prepare for post-monsoon care.",
      9: "October: Major harvest season. Store grains properly and prepare for Rabi sowing.",
      10: "November: Ideal time for wheat, barley, and mustard sowing. Cool weather benefits crops.",
      11: "December: Monitor Rabi crops. Protect from cold damage and ensure proper irrigation."
    };
    setSeasonalTip(tips[month]);
  }, []);

  const quickActions = [
    { icon: Cloud, label: 'Check Weather', section: 'weather', color: 'text-blue-500' },
    { icon: Leaf, label: 'Analyze Plant', section: 'plant-analyzer', color: 'text-green-500' },
    { icon: Bug, label: 'Pest Control', section: 'pest-fertilizer', color: 'text-orange-500' },
    { icon: MessageCircle, label: 'AI Assistant', section: 'chatbot', color: 'text-purple-500' }
  ];

  const getWeatherAlert = () => {
    if (!weather) return null;
    
    const temp = weather.current?.temp_c;
    const condition = weather.current?.condition?.text?.toLowerCase();
    const humidity = weather.current?.humidity;

    if (temp > 40) {
      return {
        type: 'danger',
        message: `Extreme heat alert (${temp}°C)! Ensure adequate irrigation and protect plants from heat stress.`
      };
    }
    if (condition?.includes('rain') || condition?.includes('drizzle')) {
      return {
        type: 'warning',
        message: `Rain expected! Protect harvested crops and ensure proper drainage in fields.`
      };
    }
    if (humidity > 85) {
      return {
        type: 'info',
        message: `High humidity (${humidity}%)! Monitor crops for fungal diseases and ensure proper ventilation.`
      };
    }
    return null;
  };

  const weatherAlert = getWeatherAlert();
  
  const Icon = icon;
  
  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="card-farming text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">{greeting}</h2>
            <p className="text-muted-foreground">Welcome back to your farming dashboard</p>
          </div>
        </div>
      </div>

      {/* Weather-Based Alerts */}
      {weatherAlert && (
        <Alert className={`border-l-4 ${
          weatherAlert.type === 'danger' ? 'border-red-500 bg-red-50' :
          weatherAlert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
          'border-blue-500 bg-blue-50'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {weatherAlert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Voice Assistant Quick Actions */}
      <Card className="card-farming">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Mic className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.section}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary/5"
                onClick={() => onSectionChange?.(action.section)}
              >
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Advice */}
      <Card className="card-farming">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            Seasonal Farming Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {seasonalTip}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Weather Summary */}
      {weather && (
        <Card className="card-farming">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Thermometer className="w-5 h-5" />
              Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{weather.current?.temp_c}°C</p>
                <p className="text-sm text-muted-foreground">{weather.current?.condition?.text}</p>
                <p className="text-xs text-muted-foreground">{weather.location?.name}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Humidity: {weather.current?.humidity}%</p>
                <p>Wind: {weather.current?.wind_kph} km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
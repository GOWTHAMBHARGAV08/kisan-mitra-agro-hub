import { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Mic, Cloud, Leaf, Bug, MessageCircle, AlertTriangle, Calendar, Thermometer, MicOff, Volume2, CloudRain, Wind, Droplets } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
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

  // Voice assistant functions
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        
        // Process voice commands
        const command = transcript.toLowerCase();
        if (command.includes('weather') || command.includes('temperature')) {
          onSectionChange?.('weather');
        } else if (command.includes('plant') || command.includes('analyze')) {
          onSectionChange?.('plant-analyzer');
        } else if (command.includes('pest') || command.includes('fertilizer')) {
          onSectionChange?.('pest-fertilizer');
        } else if (command.includes('chat') || command.includes('assistant')) {
          onSectionChange?.('chatbot');
        }
      };
      
      recognition.start();
    }
  };

  const stopListening = () => setIsListening(false);

  const weatherAlert = getWeatherAlert();
  
  const Icon = icon;
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Greeting Section */}
      <div className="dashboard-card text-center p-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary icon-bounce" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {greeting} 🌱
            </h2>
            <p className="text-muted-foreground text-lg">Welcome back to your intelligent farming dashboard</p>
          </div>
        </div>
      </div>

      {/* Enhanced Weather-Based Alerts */}
      {weatherAlert && (
        <Alert className={`border-l-4 rounded-2xl p-6 shadow-lg ${
          weatherAlert.type === 'danger' ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100' :
          weatherAlert.type === 'warning' ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100' :
          'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100'
        }`}>
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="font-semibold text-lg ml-2">
            {weatherAlert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Voice Assistant Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            Voice Assistant Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-8">
            {quickActions.map((action) => (
              <Button
                key={action.section}
                variant="outline"
                className="h-24 p-6 flex flex-col items-center justify-center gap-3 border-2 hover:border-primary/50 transition-all duration-300 group rounded-2xl"
                onClick={() => onSectionChange?.(action.section)}
              >
                <action.icon className={`w-8 h-8 ${action.color} icon-bounce group-hover:scale-110`} />
                <span className="text-sm font-semibold">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Voice Controls */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-800">Voice Assistant</span>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isListening 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? "Stop" : "Speak"}
                </Button>
              </div>
            </div>
            {transcript && (
              <div className="mt-4 p-4 bg-white/70 rounded-xl border border-green-200">
                <p className="text-gray-700 font-medium">
                  🎤 You said: <span className="text-green-700 italic">"{transcript}"</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Seasonal Advice */}
      <Card className="dashboard-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            🌾 Seasonal Farming Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl border-l-4 border-green-500 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-green-800 text-lg mb-2">Expert Seasonal Guidance</h4>
                <p className="text-green-700 text-base leading-relaxed">
                  {seasonalTip}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Current Weather Summary */}
      {weather && (
        <Card className="dashboard-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              Current Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                <Thermometer className="w-8 h-8 text-red-500 mx-auto mb-3 icon-bounce" />
                <p className="text-red-600 font-medium mb-1">Temperature</p>
                <p className="text-red-800 font-bold text-2xl">{weather.current?.temp_c}°C</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-3 icon-bounce" />
                <p className="text-blue-600 font-medium mb-1">Humidity</p>
                <p className="text-blue-800 font-bold text-2xl">{weather.current?.humidity}%</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <Wind className="w-8 h-8 text-gray-500 mx-auto mb-3 icon-bounce" />
                <p className="text-gray-600 font-medium mb-1">Wind Speed</p>
                <p className="text-gray-800 font-bold text-2xl">{weather.current?.wind_kph} km/h</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <CloudRain className="w-8 h-8 text-green-500 mx-auto mb-3 icon-bounce" />
                <p className="text-green-600 font-medium mb-1">Condition</p>
                <p className="text-green-800 font-bold text-lg">{weather.current?.condition?.text}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-sm">📍 {weather.location?.name}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
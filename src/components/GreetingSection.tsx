import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Cloud, Sunrise, Sunset, CloudRain, Mic, MicOff, Wind, Thermometer, Droplets, MapPin, Leaf, MessageCircle, ShoppingCart, Phone, Globe, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface GreetingSectionProps {
  onSectionChange?: (section: string) => void;
}

export const GreetingSection = ({ onSectionChange }: GreetingSectionProps) => {
  const [greeting, setGreeting] = useState('');
  const [currentIcon, setCurrentIcon] = useState<any>(Sun);
  const [weather, setWeather] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting('Good Morning, Farmer!');
        setCurrentIcon(Sunrise);
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting('Good Afternoon, Farmer!');
        setCurrentIcon(Sun);
      } else {
        setGreeting('Good Evening, Farmer!');
        setCurrentIcon(Moon);
      }
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=76e2744e2ea54d4492e152146251009&q=Bangalore&aqi=no`
        );
        const data = await response.json();
        setWeather({
          temperature: data.current?.temp_c,
          humidity: data.current?.humidity,
          windSpeed: data.current?.wind_kph,
          condition: data.current?.condition?.text,
          location: data.location?.name
        });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000);
    return () => clearInterval(weatherInterval);
  }, []);

  const quickAccessTiles = [
    { 
      icon: Leaf, 
      title: 'Crop Care', 
      description: 'Plant health analysis',
      section: 'plant-analyzer', 
      gradient: 'from-emerald-500 to-green-600' 
    },
    { 
      icon: CloudRain, 
      title: 'Weather', 
      description: 'Real-time forecast',
      section: 'weather', 
      gradient: 'from-blue-500 to-sky-600' 
    },
    { 
      icon: ShoppingCart, 
      title: 'Store', 
      description: 'Seeds & fertilizer',
      section: 'pest-fertilizer', 
      gradient: 'from-amber-500 to-orange-600' 
    },
    { 
      icon: MessageCircle, 
      title: 'AI Assistant', 
      description: 'Get farming advice',
      section: 'chatbot', 
      gradient: 'from-purple-500 to-indigo-600' 
    }
  ];

  const supportLinks = [
    { icon: Phone, label: 'Helpline', subtitle: '1800-XXX-XXXX' },
    { icon: Globe, label: 'Govt Schemes', subtitle: 'View benefits' },
    { icon: Users, label: 'Community', subtitle: 'Join WhatsApp' }
  ];

  const farmingTips = [
    "Rotate crops to reduce fungal infections and improve soil health",
    "Irrigate early morning to save water and reduce disease risk",
    "Use organic compost to enhance soil fertility naturally",
    "Monitor plants daily for early pest and disease detection",
    "Plant companion crops to naturally repel pests",
    "Maintain proper spacing between plants for better air circulation"
  ];

  const todaysTip = farmingTips[new Date().getDate() % farmingTips.length];

  const getWeatherAlert = () => {
    if (!weather) return null;
    
    const temp = weather.temperature;
    const humidity = weather.humidity;

    if (temp > 40) {
      return `Extreme heat alert (${temp}°C)! Ensure adequate irrigation and protect plants from heat stress.`;
    }
    if (weather.condition?.toLowerCase().includes('rain')) {
      return `Rain expected! Protect harvested crops and ensure proper drainage in fields.`;
    }
    if (humidity > 85) {
      return `High humidity (${humidity}%)! Monitor crops for fungal diseases and ensure proper ventilation.`;
    }
    return null;
  };

  const weatherAlert = getWeatherAlert();

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
          toast.success('Opening Weather section');
        } else if (command.includes('plant') || command.includes('analyze')) {
          onSectionChange?.('plant-analyzer');
          toast.success('Opening Plant Analyzer');
        } else if (command.includes('pest') || command.includes('fertilizer')) {
          onSectionChange?.('pest-fertilizer');
          toast.success('Opening Pest & Fertilizer section');
        } else if (command.includes('chat') || command.includes('assistant')) {
          onSectionChange?.('chatbot');
          toast.success('Opening AI Assistant');
        }
      };
      
      recognition.start();
    }
  };

  const stopListening = () => setIsListening(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="text-center space-y-6 py-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16">
            <img 
              src="/lovable-uploads/3ad415cf-80f1-4add-92a5-d08cd8333756.png" 
              alt="KisanMitra Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-orange-600">Kisan</span>
              <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">Mitra</span>
            </h1>
            <p className="text-lg text-emerald-600 font-medium">Growing Crops, Growing Smiles</p>
          </div>
        </div>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered farming assistant for crop care, weather updates, and farm support.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            size="lg" 
            className="btn-farming text-lg px-8 py-6 h-auto"
            onClick={() => onSectionChange?.('plant-analyzer')}
          >
            <Leaf className="h-6 w-6 mr-3" />
            Start Plant Health Check
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 h-auto border-2 border-primary/30 hover:bg-primary/10"
            onClick={() => onSectionChange?.('chatbot')}
          >
            <MessageCircle className="h-6 w-6 mr-3" />
            Ask AI Assistant
          </Button>
        </div>
      </div>

      {/* Weather Alert */}
      {weatherAlert && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50/90 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-orange-600" />
              <p className="font-medium text-orange-800">{weatherAlert}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Tiles */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-foreground">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickAccessTiles.map((tile, index) => (
            <Card 
              key={tile.section} 
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur-sm border-2 hover:border-primary/30 overflow-hidden"
              onClick={() => onSectionChange?.(tile.section)}
            >
              <div className={`h-2 bg-gradient-to-r ${tile.gradient}`}></div>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${tile.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <tile.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{tile.title}</h3>
                <p className="text-sm text-muted-foreground">{tile.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Weather Snapshot */}
      {weather && (
        <Card className="bg-gradient-to-r from-blue-50/90 to-sky-50/90 border-blue-200 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <CloudRain className="h-6 w-6" />
                Weather Snapshot
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSectionChange?.('weather')}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                See Full Forecast
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-blue-800">{weather.temperature}°C</p>
                <p className="text-sm text-blue-600">Temperature</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-800">{weather.humidity}%</p>
                <p className="text-sm text-blue-600">Humidity</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wind className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-blue-800">{weather.windSpeed}</p>
                <p className="text-sm text-blue-600">Wind (km/h)</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-lg font-bold text-blue-800">{weather.condition}</p>
                <p className="text-sm text-blue-600">Condition</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farming Tip of the Day */}
      <Card className="bg-gradient-to-r from-green-50/90 to-emerald-50/90 border-green-200 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-6 w-6" />
            Farming Tip of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
            <p className="text-green-800 font-medium text-lg leading-relaxed">{todaysTip}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Support Links */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Quick Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportLinks.map((link, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Assistant - Simplified */}
      <Card className="bg-gradient-to-r from-purple-50/90 to-indigo-50/90 border-purple-200 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-700">Voice Commands</h3>
                <p className="text-sm text-purple-600">Say "Go to weather" or "Open plant analyzer"</p>
              </div>
            </div>
            <Button 
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              className={`transition-all duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'btn-farming'}`}
            >
              {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isListening ? 'Stop' : 'Listen'}
            </Button>
          </div>
          {transcript && (
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-purple-800">"{transcript}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
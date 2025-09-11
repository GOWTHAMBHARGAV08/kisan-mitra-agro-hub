import { useState, useEffect } from 'react';
import { 
  Cloud, 
  Leaf, 
  Bug, 
  MessageCircle, 
  Home,
  User,
  Thermometer,
  Lightbulb,
  CloudRain
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { id: 'home', title: 'Home', icon: Home },
  { id: 'weather', title: 'Weather', icon: CloudRain },
  { id: 'plant-analyzer', title: 'Plant Health', icon: Leaf },
  { id: 'pest-fertilizer', title: 'Pest & Fertilizer', icon: Bug },
  { id: 'chatbot', title: 'AI Assistant', icon: MessageCircle },
];

const farmingTips = [
  "Irrigate early morning to save water",
  "Rotate crops to reduce fungal infections",
  "Use organic compost for soil health",
  "Monitor plants daily for pests",
  "Plant companion crops naturally",
  "Maintain proper plant spacing"
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const [weather, setWeather] = useState<any>(null);
  const [currentTip, setCurrentTip] = useState('');

  useEffect(() => {
    // Set daily farming tip
    const tipIndex = new Date().getDate() % farmingTips.length;
    setCurrentTip(farmingTips[tipIndex]);

    // Fetch weather data
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=76e2744e2ea54d4492e152146251009&q=Bangalore&aqi=no`
        );
        const data = await response.json();
        setWeather({
          temperature: data.current?.temp_c,
          condition: data.current?.condition?.text
        });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
  }, []);

  return (
    <Sidebar
      side="left"
      className={`${state === "collapsed" ? "w-16" : "w-72"} bg-gradient-to-b from-green-50/80 to-white border-r-2 border-primary/20`}
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* Farmer Greeting Section */}
        {state !== "collapsed" && (
          <div className="mb-6 text-center space-y-3">
            <div className="flex justify-center mb-2">
              <img 
                src="/lovable-uploads/3ad415cf-80f1-4add-92a5-d08cd8333756.png" 
                alt="KisanMitra Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-primary">👨‍🌾 Namaste Farmer!</p>
              <p className="text-xs text-muted-foreground">Ready to grow today?</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.id)}
                    className={`${
                      activeSection === item.id 
                        ? 'bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-lg transform scale-105' 
                        : 'bg-white/60 hover:bg-white/80 hover:shadow-md hover:scale-105 text-foreground'
                    } transition-all duration-300 rounded-xl p-3 h-auto border border-primary/10 backdrop-blur-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activeSection === item.id 
                          ? 'bg-white/20' 
                          : 'bg-primary/10'
                      }`}>
                        <item.icon className={`w-5 h-5 ${
                          activeSection === item.id ? 'text-white' : 'text-primary'
                        }`} />
                      </div>
                      {state !== "collapsed" && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Info Widget */}
        {state !== "collapsed" && (
          <div className="mt-auto space-y-3">
            {/* Weather Snapshot */}
            {weather && (
              <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded-full bg-blue-100">
                      <CloudRain className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-xs font-semibold text-blue-700">Weather</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-3 w-3 text-orange-500" />
                      <span className="text-sm font-bold text-blue-800">{weather.temperature}°C</span>
                    </div>
                    <p className="text-xs text-blue-600 truncate max-w-20">{weather.condition}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Farming Tip */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-full bg-green-100">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-green-700">Daily Tip</h4>
                </div>
                <p className="text-xs text-green-800 leading-relaxed">{currentTip}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
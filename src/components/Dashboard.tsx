import { GreetingSection } from './GreetingSection';
import { WeatherSection } from './WeatherSection';
import { PlantAnalyzer } from './PlantAnalyzer';
import { PestFertilizerRecommendations } from './PestFertilizerRecommendations';
import { MultilangChatbot } from './MultilangChatbot';
import { Button } from '@/components/ui/button';

const kisanmitraLogoUrl = '/lovable-uploads/273328c3-7e26-4565-9948-7f20159d8eb5.png';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {

  return (
    <div className="min-h-screen bg-gradient-nature farming-pattern">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12">
                <img 
                  src={kisanmitraLogoUrl} 
                  alt="KisanMitra Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">KisanMitra</h1>
                <p className="text-xs text-muted-foreground">Growing Crops, Growing Smiles</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="rounded-full border-primary/30 hover:bg-primary/5"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Greeting Section */}
        <GreetingSection />

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Weather Section */}
          <WeatherSection />
          
          {/* Plant Analyzer */}
          <PlantAnalyzer />
        </div>

        {/* Pest & Fertilizer Recommendations */}
        <div className="mb-8">
          <PestFertilizerRecommendations />
        </div>

        {/* Enhanced Multilingual Chatbot */}
        <div className="max-w-4xl mx-auto">
          <MultilangChatbot />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10">
                <img 
                  src={kisanmitraLogoUrl} 
                  alt="KisanMitra Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-primary">KisanMitra</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Contact: support@kisanmitra.com | +91-XXXXXXXXXX</p>
              <p>© 2025 KisanMitra. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
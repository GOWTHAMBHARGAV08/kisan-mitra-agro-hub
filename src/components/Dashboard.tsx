import { useState } from 'react';
import { GreetingSection } from './GreetingSection';
import { WeatherSection } from './WeatherSection';
import { PlantAnalyzer } from './PlantAnalyzer';
import { PestFertilizerRecommendations } from './PestFertilizerRecommendations';
import { MultilangChatbot } from './MultilangChatbot';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const kisanmitraLogoUrl = '/lovable-uploads/3ad415cf-80f1-4add-92a5-d08cd8333756.png';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState('home');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <GreetingSection onSectionChange={setActiveSection} />;
      case 'weather':
        return <WeatherSection />;
      case 'plant-analyzer':
        return <PlantAnalyzer onNavigateToStore={() => setActiveSection('pest-fertilizer')} />;
      case 'pest-fertilizer':
        return <PestFertilizerRecommendations />;
      case 'chatbot':
        return <MultilangChatbot />;
      default:
        return <GreetingSection onSectionChange={setActiveSection} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-nature farming-pattern flex">
        {/* Sidebar */}
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
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
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="bg-white/50 hover:bg-white/70 border border-primary/30" />
                  <Button 
                    variant="outline" 
                    onClick={onLogout}
                    className="rounded-full border-primary/30 hover:bg-primary/5"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {renderActiveSection()}
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

      </div>
    </SidebarProvider>
  );
};
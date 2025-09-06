import { useState } from 'react';
import { Send, MessageCircle, Cloud, Bug, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const kisanmitraLogoUrl = '/lovable-uploads/273328c3-7e26-4565-9948-7f20159d8eb5.png';
const GEMINI_API_KEY = 'AIzaSyAkTptgpGBlZgKzcuzveRFgKNcXiVhpvaM';

const features = [
  {
    icon: Cloud,
    title: 'Weather & Climate',
    description: 'Future climate prediction & real-time weather forecast',
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    icon: Bug,
    title: 'Pest & Disease Control',
    description: 'Smart pest detection & fertilizer recommendations',
    color: 'bg-red-50 text-red-600',
    borderColor: 'border-red-200'
  },
  {
    icon: ShoppingCart,
    title: 'Agricultural Store',
    description: 'Buy seeds, fertilizers & farming tools online',
    color: 'bg-green-50 text-green-600',
    borderColor: 'border-green-200'
  }
];

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'bot',
      message: 'Hello! I\'m your AI farming assistant. How can I help you with farming, weather, crops, or agricultural guidance today? 🌱'
    }
  ]);
  const { toast } = useToast();

  const callGeminiAPI = async (message: string): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are KisanMitra, an AI farming assistant specializing in Indian agriculture. Provide helpful, practical advice about farming, crops, weather, pest control, fertilizers, and agricultural practices. Keep responses concise and farmer-friendly. User question: ${message}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process your question. Please try again.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'I\'m having trouble connecting right now. Please check your internet connection and try again.';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isLoading) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setIsLoading(true);

    // Add user message
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    
    try {
      // Get AI response from Gemini
      const aiResponse = await callGeminiAPI(userMessage);
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: aiResponse
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try asking your question again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Welcome to KisanMitra 🌱
          </h1>
          <p className="text-lg text-muted-foreground">Your AI Farming Partner</p>
        </div>

        {/* ChatBot Section */}
        <div className="card-farming mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">AI Assistant Chat</h2>
          </div>
          
          {/* Chat History */}
          <div className="bg-muted/30 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-3">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-xl ${
                    chat.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-foreground border border-border/50'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything about farming, weather, or crops..."
              className="flex-1 rounded-xl border-border/50 focus:border-primary"
              disabled={isLoading}
            />
            <Button type="submit" className="btn-farming px-6" disabled={isLoading || !chatMessage.trim()}>
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="card-farming cursor-pointer group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${feature.color} ${feature.borderColor} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
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
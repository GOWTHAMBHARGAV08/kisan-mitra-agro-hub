import { useState, useRef } from 'react';
import { Send, MessageCircle, Camera, Upload, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const GEMINI_API_KEY = 'AIzaSyAkTptgpGBlZgKzcuzveRFgKNcXiVhpvaM';

interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  image?: string;
  language?: string;
}

const languages = {
  english: { code: 'en', name: 'English', prompt: 'Respond in English' },
  hindi: { code: 'hi', name: 'हिंदी (Hindi)', prompt: 'Respond in Hindi language' },
  tamil: { code: 'ta', name: 'தமிழ் (Tamil)', prompt: 'Respond in Tamil language' },
  telugu: { code: 'te', name: 'తెలుగు (Telugu)', prompt: 'Respond in Telugu language' },
  kannada: { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', prompt: 'Respond in Kannada language' },
  bengali: { code: 'bn', name: 'বাংলা (Bengali)', prompt: 'Respond in Bengali language' },
  marathi: { code: 'mr', name: 'मराठी (Marathi)', prompt: 'Respond in Marathi language' },
  gujarati: { code: 'gu', name: 'ગુજરાતી (Gujarati)', prompt: 'Respond in Gujarati language' },
  malayalam: { code: 'ml', name: 'മലയാളം (Malayalam)', prompt: 'Respond in Malayalam language' },
  punjabi: { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', prompt: 'Respond in Punjabi language' },
  odia: { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', prompt: 'Respond in Odia language' }
};

export const MultilangChatbot = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'bot',
      message: 'Hello! I\'m your AI farming assistant. I can help you in multiple Indian languages. How can I assist you with farming, weather, crops, or agricultural guidance today? 🌱\n\nYou can also share photos of your crops, pests, or plant diseases for better assistance! 📸',
      language: 'english'
    }
  ]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const callGeminiAPI = async (message: string, imageBase64?: string, language: string = 'english'): Promise<string> => {
    try {
      const languagePrompt = languages[language as keyof typeof languages]?.prompt || 'Respond in English';
      
      const systemPrompt = `You are KisanMitra, an AI farming assistant specializing in Indian agriculture. ${languagePrompt}. Provide helpful, practical advice about farming, crops, weather, pest control, fertilizers, and agricultural practices. Keep responses concise and farmer-friendly.`;

      const modelName = imageBase64 ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: imageBase64 ? [
              {
                text: `${systemPrompt} Analyze this image and provide helpful advice. User question: ${message}`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ] : [{
              text: `${systemPrompt} User question: ${message}`
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

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      
      toast({
        title: "Image uploaded",
        description: "Image ready to send. Add a message or send directly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive"
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removeSelectedImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatMessage.trim() && !selectedImage) || isLoading) return;

    const userMessage = chatMessage.trim() || "Please analyze this image";
    const imageToSend = selectedImage;
    
    setChatMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    setChatHistory(prev => [...prev, { 
      type: 'user', 
      message: userMessage,
      image: imageToSend,
      language: selectedLanguage
    }]);
    
    try {
      let aiResponse: string;
      
      if (imageToSend) {
        const response = await fetch(imageToSend);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", { type: "image/jpeg" });
        const imageBase64 = await convertImageToBase64(file);
        aiResponse = await callGeminiAPI(userMessage, imageBase64, selectedLanguage);
      } else {
        aiResponse = await callGeminiAPI(userMessage, undefined, selectedLanguage);
      }
      
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: aiResponse,
        language: selectedLanguage
      }]);
      
      if (imageToSend) {
        URL.revokeObjectURL(imageToSend);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try asking your question again.',
        language: selectedLanguage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-farming">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <MessageCircle className="w-5 h-5" />
          AI Assistant Chat
        </CardTitle>
        
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languages).map(([key, lang]) => (
                <SelectItem key={key} value={key}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chat History */}
        <div className="bg-muted/30 rounded-lg p-4 h-80 overflow-y-auto space-y-3">
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
                {chat.image && (
                  <div className="mb-2">
                    <img 
                      src={chat.image} 
                      alt="Uploaded image" 
                      className="rounded-lg max-w-full h-auto max-h-32 object-cover"
                    />
                  </div>
                )}
                <div className="whitespace-pre-wrap">{chat.message}</div>
                {chat.language && chat.language !== 'english' && (
                  <div className="text-xs opacity-70 mt-1">
                    {languages[chat.language as keyof typeof languages]?.name}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-foreground border border-border/50 px-4 py-2 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Selected image" 
              className="rounded-lg max-h-32 border border-border/50"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              onClick={removeSelectedImage}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Chat Input */}
        <div className="space-y-3">
          {/* Image Upload Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border-primary/30 hover:bg-primary/5"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              className="rounded-full border-primary/30 hover:bg-primary/5"
              disabled={isLoading}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={selectedImage ? 
                "Describe what you want to know about this image..." : 
                "Ask me anything about farming in your preferred language..."
              }
              className="flex-1 rounded-xl border-border/50 focus:border-primary"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="btn-farming px-6" 
              disabled={isLoading || (!chatMessage.trim() && !selectedImage)}
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};
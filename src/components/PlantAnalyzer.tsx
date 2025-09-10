import { useState, useRef } from 'react';
import { Leaf, Upload, Camera, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GEMINI_API_KEY = 'AIzaSyAkTptgpGBlZgKzcuzveRFgKNcXiVhpvaM';

interface AnalysisResult {
  status: 'healthy' | 'diseased' | 'pest' | 'nutrient_deficiency';
  confidence: number;
  description: string;
  recommendations: string[];
  severity?: 'low' | 'medium' | 'high';
}

export const PlantAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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

  const analyzeWithGemini = async (imageBase64: string): Promise<AnalysisResult> => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are an expert plant pathologist. Analyze this plant image and provide a detailed health assessment. Return your analysis in JSON format with the following structure:
{
  "status": "healthy|diseased|pest|nutrient_deficiency", 
  "confidence": 0-100,
  "description": "detailed description of what you observe",
  "recommendations": ["specific actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "severity": "low|medium|high" (only if status is not healthy)
}

Focus on:
- Plant diseases (fungal, bacterial, viral)
- Pest damage and identification
- Nutrient deficiencies
- Growth abnormalities
- Leaf discoloration or spots
- Overall plant health

Be specific about treatments, fertilizers, pesticides, or care instructions suitable for Indian farming conditions.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      throw new Error('No analysis result received');
    }

    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } else {
        // Fallback parsing
        return {
          status: 'diseased',
          confidence: 75,
          description: aiResponse,
          recommendations: ['Consult with local agricultural expert', 'Monitor plant closely'],
          severity: 'medium'
        };
      }
    } catch (error) {
      // Fallback result
      return {
        status: 'diseased',
        confidence: 60,
        description: aiResponse,
        recommendations: ['Consult with local agricultural expert'],
        severity: 'medium'
      };
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalysisResult(null);
      
      toast({
        title: "Image uploaded",
        description: "Click 'Analyze Plant' to get health assessment.",
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

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], "plant.jpg", { type: "image/jpeg" });
      const imageBase64 = await convertImageToBase64(file);
      
      const result = await analyzeWithGemini(imageBase64);
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Plant health assessment is ready.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const removeImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
      setAnalysisResult(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'diseased':
      case 'pest':
      case 'nutrient_deficiency':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Leaf className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'diseased':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pest':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'nutrient_deficiency':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="card-farming">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Leaf className="w-5 h-5" />
          Plant Health Analyzer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="text-center space-y-4">
          {!selectedImage ? (
            <>
              <p className="text-muted-foreground mb-4">
                Upload a photo of your plant to get instant health analysis
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border-primary/30 hover:bg-primary/5"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="rounded-full border-primary/30 hover:bg-primary/5"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Plant to analyze" 
                  className="rounded-lg max-h-64 border border-border/50"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  onClick={removeImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <Button
                onClick={analyzeImage}
                disabled={analyzing}
                className="btn-farming w-full"
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Analyzing Plant...
                  </div>
                ) : (
                  'Analyze Plant Health'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4 mt-6">
            <div className={`p-4 rounded-lg border ${getStatusColor(analysisResult.status)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(analysisResult.status)}
                <span className="font-semibold capitalize">
                  {analysisResult.status.replace('_', ' ')}
                </span>
                <span className="text-sm">({analysisResult.confidence}% confidence)</span>
              </div>
              {analysisResult.severity && (
                <div className="text-sm mb-2">
                  Severity: <span className="font-semibold">{analysisResult.severity.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-2">Analysis Description</h4>
              <p className="text-muted-foreground">{analysisResult.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
      </CardContent>
    </Card>
  );
};
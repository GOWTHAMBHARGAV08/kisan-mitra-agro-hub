import { useState, useRef } from 'react';
import { Leaf, Upload, Camera, X, CheckCircle, AlertTriangle, Bug, Pill, Shield, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GEMINI_API_KEY = 'AIzaSyAkTptgpGBlZgKzcuzveRFgKNcXiVhpvaM';

interface AnalysisResult {
  plantName: string;
  status: 'healthy' | 'diseased' | 'pest' | 'nutrient_deficiency';
  confidence: number;
  description: string;
  diseaseDetected?: string;
  recommendations: string[];
  precautions: string[];
  severity?: 'low' | 'medium' | 'high';
}

interface ProductRecommendation {
  name: string;
  description: string;
  type: 'pesticide' | 'fertilizer';
}

interface DiseaseRecommendations {
  pesticides: ProductRecommendation[];
  fertilizers: ProductRecommendation[];
}

export const PlantAnalyzer = ({ onNavigateToStore }: { onNavigateToStore?: () => void }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'treatments' | 'products'>('analysis');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Disease to product mapping
  const getDiseaseRecommendations = (disease: string): DiseaseRecommendations => {
    const diseaseMap: Record<string, DiseaseRecommendations> = {
      'leaf spot': {
        pesticides: [
          { name: 'Copper Fungicide', description: 'Controls fungal leaf spot diseases', type: 'pesticide' },
          { name: 'Neem Oil', description: 'Organic treatment for leaf spots', type: 'pesticide' }
        ],
        fertilizers: [
          { name: 'Balanced NPK Fertilizer', description: 'Strengthens plant immunity', type: 'fertilizer' },
          { name: 'Potassium Rich Fertilizer', description: 'Improves disease resistance', type: 'fertilizer' }
        ]
      },
      'blight': {
        pesticides: [
          { name: 'Carbendazim', description: 'Systemic fungicide for blight control', type: 'pesticide' },
          { name: 'Mancozeb', description: 'Protective fungicide for blight', type: 'pesticide' }
        ],
        fertilizers: [
          { name: 'Organic Compost', description: 'Improves soil health and plant vigor', type: 'fertilizer' },
          { name: 'Calcium Fertilizer', description: 'Strengthens cell walls against blight', type: 'fertilizer' }
        ]
      },
      'rust': {
        pesticides: [
          { name: 'Propiconazole', description: 'Effective against rust diseases', type: 'pesticide' },
          { name: 'Sulfur Dust', description: 'Organic rust control', type: 'pesticide' }
        ],
        fertilizers: [
          { name: 'Nitrogen Fertilizer', description: 'Promotes healthy leaf growth', type: 'fertilizer' },
          { name: 'Iron Chelate', description: 'Prevents iron deficiency', type: 'fertilizer' }
        ]
      },
      'powdery mildew': {
        pesticides: [
          { name: 'Potassium Bicarbonate', description: 'Organic powdery mildew control', type: 'pesticide' },
          { name: 'Triforine', description: 'Systemic mildew fungicide', type: 'pesticide' }
        ],
        fertilizers: [
          { name: 'Phosphorus Fertilizer', description: 'Improves root development', type: 'fertilizer' },
          { name: 'Micronutrient Mix', description: 'Boosts overall plant health', type: 'fertilizer' }
        ]
      }
    };

    // Default recommendations for unknown diseases
    const defaultRecommendations: DiseaseRecommendations = {
      pesticides: [
        { name: 'Multi-Purpose Fungicide', description: 'Broad spectrum disease control', type: 'pesticide' },
        { name: 'Neem Oil Spray', description: 'Organic pest and disease control', type: 'pesticide' }
      ],
      fertilizers: [
        { name: 'Complete NPK Fertilizer', description: 'Balanced nutrition for plant health', type: 'fertilizer' },
        { name: 'Organic Compost', description: 'Natural soil enrichment', type: 'fertilizer' }
      ]
    };

    // Try to match disease name (case insensitive, partial match)
    const diseaseLower = disease.toLowerCase();
    for (const [key, recommendations] of Object.entries(diseaseMap)) {
      if (diseaseLower.includes(key) || key.includes(diseaseLower)) {
        return recommendations;
      }
    }

    return defaultRecommendations;
  };

  const handleBuyProduct = (productName: string) => {
    toast({
      title: "Redirecting to Store",
      description: `Taking you to purchase ${productName}`,
    });
    if (onNavigateToStore) {
      onNavigateToStore();
    }
  };

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
  "plantName": "name of the plant species identified",
  "status": "healthy|diseased|pest|nutrient_deficiency", 
  "confidence": 0-100,
  "description": "detailed description of what you observe",
  "diseaseDetected": "specific disease name if any" (only if status is not healthy),
  "recommendations": ["specific treatment 1", "treatment 2", "treatment 3"],
  "precautions": ["preventive step 1", "preventive step 2", "preventive step 3"],
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
          plantName: 'Unknown Plant',
          status: 'diseased',
          confidence: 75,
          description: aiResponse,
          recommendations: ['Consult with local agricultural expert', 'Monitor plant closely'],
          precautions: ['Regular monitoring', 'Proper watering'],
          severity: 'medium'
        };
      }
    } catch (error) {
      // Fallback result
      return {
        plantName: 'Unknown Plant',
        status: 'diseased',
        confidence: 60,
        description: aiResponse,
        recommendations: ['Consult with local agricultural expert'],
        precautions: ['Regular monitoring'],
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

        {/* Analysis Results with Tabs */}
        {analysisResult && (
          <div className="space-y-6 mt-6">
            {/* Plant Name Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🌱</div>
                <div>
                  <h3 className="text-lg font-bold text-green-700">Plant Identified</h3>
                  <p className="text-green-600 font-semibold text-lg">{analysisResult.plantName}</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
              <Button
                variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('analysis')}
                className="rounded-b-none font-medium"
              >
                🦠 Disease Info
              </Button>
              <Button
                variant={activeTab === 'treatments' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('treatments')}
                className="rounded-b-none font-medium"
              >
                💊 Treatments
              </Button>
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('products')}
                className="rounded-b-none font-medium"
              >
                🛒 Buy Products
              </Button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  {/* Disease Detection */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">🦠</div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Disease Analysis</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {analysisResult.status === 'healthy' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-semibold">
                              {analysisResult.diseaseDetected || 'No Disease Detected'}
                            </span>
                            {analysisResult.severity && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                analysisResult.severity === 'high' ? 'bg-red-100 text-red-700' :
                                analysisResult.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {analysisResult.severity.toUpperCase()} SEVERITY
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm pl-11">{analysisResult.description}</p>
                      <div className="mt-3 text-center text-sm text-muted-foreground">
                        Analysis Confidence: {analysisResult.confidence}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'treatments' && (
                <div className="space-y-4">
                  {/* Remedies */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">💊</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-blue-700 mb-3">Recommended Treatments</h3>
                          <ul className="space-y-3">
                            {analysisResult.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-blue-700 font-medium">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Precautions */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">⚠️</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-orange-700 mb-3">Safety Precautions</h3>
                          <ul className="space-y-3">
                            {analysisResult.precautions.map((precaution, index) => (
                              <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                                <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                                <span className="text-orange-700 font-medium">{precaution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'products' && analysisResult.diseaseDetected && (
                <div className="space-y-4">
                  {(() => {
                    const recommendations = getDiseaseRecommendations(analysisResult.diseaseDetected || '');
                    return (
                      <>
                        {/* Pest Control Products */}
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="text-2xl">🐛</div>
                              <div>
                                <h3 className="text-lg font-bold text-green-700">Pest Control Products</h3>
                                <p className="text-sm text-gray-600">Recommended pesticides for your plant disease</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {recommendations.pesticides.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-green-800">{product.name}</h4>
                                    <p className="text-sm text-green-600">{product.description}</p>
                                  </div>
                                  <Button
                                    onClick={() => handleBuyProduct(product.name)}
                                    className="btn-farming ml-3"
                                    size="sm"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Buy Now
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Fertilizer Products */}
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="text-2xl">🌱</div>
                              <div>
                                <h3 className="text-lg font-bold text-blue-700">Fertilizer Products</h3>
                                <p className="text-sm text-gray-600">Recommended fertilizers to strengthen your plant</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {recommendations.fertilizers.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-blue-800">{product.name}</h4>
                                    <p className="text-sm text-blue-600">{product.description}</p>
                                  </div>
                                  <Button
                                    onClick={() => handleBuyProduct(product.name)}
                                    className="btn-farming ml-3"
                                    size="sm"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Buy Now
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'products' && !analysisResult.diseaseDetected && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">🌿</div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Plant Looks Healthy!</h3>
                    <p className="text-gray-600">No specific products needed at this time. Continue regular care and monitoring.</p>
                  </CardContent>
                </Card>
              )}
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
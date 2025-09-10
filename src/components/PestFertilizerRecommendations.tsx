import { useState } from 'react';
import { Bug, Zap, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Recommendation {
  pestControl: {
    commonPests: string[];
    organicSolutions: string[];
    chemicalSolutions: string[];
    preventiveMeasures: string[];
  };
  fertilizer: {
    primaryFertilizers: string[];
    organicOptions: string[];
    applicationTiming: string[];
    dosage: string;
  };
}

const cropRecommendations: Record<string, Recommendation> = {
  rice: {
    pestControl: {
      commonPests: ['Brown Plant Hopper', 'Stem Borer', 'Leaf Folder', 'Rice Bug'],
      organicSolutions: ['Neem oil spray', 'Trichoderma application', 'Pheromone traps', 'Biological control agents'],
      chemicalSolutions: ['Imidacloprid', 'Chlorpyrifos', 'Cartap hydrochloride', 'Thiamethoxam'],
      preventiveMeasures: ['Proper water management', 'Resistant varieties', 'Crop rotation', 'Clean cultivation']
    },
    fertilizer: {
      primaryFertilizers: ['Urea (46-0-0)', 'DAP (18-46-0)', 'Potash (0-0-60)', 'Complex NPK (10-26-26)'],
      organicOptions: ['Farmyard manure', 'Compost', 'Green manure', 'Vermicompost'],
      applicationTiming: ['Basal dose at transplanting', 'First top dress at 15-20 DAT', 'Second top dress at 40-45 DAT'],
      dosage: '120 kg N, 60 kg P2O5, 40 kg K2O per hectare'
    }
  },
  wheat: {
    pestControl: {
      commonPests: ['Aphids', 'Termites', 'Army Worm', 'Wheat Weevil'],
      organicSolutions: ['Neem cake', 'Sticky traps', 'Bacillus thuringiensis', 'Companion planting'],
      chemicalSolutions: ['Dimethoate', 'Malathion', 'Cypermethrin', 'Imidacloprid'],
      preventiveMeasures: ['Seed treatment', 'Timely sowing', 'Proper irrigation', 'Weed management']
    },
    fertilizer: {
      primaryFertilizers: ['Urea (46-0-0)', 'DAP (18-46-0)', 'NPK (12-32-16)', 'Single Super Phosphate'],
      organicOptions: ['Well-rotted manure', 'Compost', 'Bone meal', 'Mustard cake'],
      applicationTiming: ['Full P & K at sowing', 'Half N at sowing', 'Remaining N at crown root initiation'],
      dosage: '120 kg N, 60 kg P2O5, 40 kg K2O per hectare'
    }
  },
  cotton: {
    pestControl: {
      commonPests: ['Bollworm', 'Aphids', 'Jassids', 'Thrips', 'White Fly'],
      organicSolutions: ['Bt cotton varieties', 'Nuclear Polyhedrosis Virus', 'Trichogramma release', 'Neem extract'],
      chemicalSolutions: ['Spinosad', 'Emamectin benzoate', 'Acetamiprid', 'Profenofos'],
      preventiveMeasures: ['Pink bollworm resistant varieties', 'Refuge crop', 'Pheromone traps', 'Border crops']
    },
    fertilizer: {
      primaryFertilizers: ['Urea (46-0-0)', 'DAP (18-46-0)', 'Potash (0-0-60)', 'NPK (19-19-19)'],
      organicOptions: ['Farmyard manure', 'Cotton cake', 'Castor cake', 'Vermicompost'],
      applicationTiming: ['Basal at sowing', '30 days after sowing', '60 days after sowing', 'At flowering stage'],
      dosage: '150 kg N, 75 kg P2O5, 75 kg K2O per hectare'
    }
  },
  tomato: {
    pestControl: {
      commonPests: ['Fruit Borer', 'Leaf Miner', 'Whitefly', 'Aphids', 'Thrips'],
      organicSolutions: ['Bacillus thuringiensis', 'Yellow sticky traps', 'Neem oil', 'Marigold companion planting'],
      chemicalSolutions: ['Abamectin', 'Spiromesifen', 'Diafenthiuron', 'Thiamethoxam'],
      preventiveMeasures: ['Crop rotation', 'Resistant varieties', 'Mulching', 'Proper spacing']
    },
    fertilizer: {
      primaryFertilizers: ['NPK (19-19-19)', 'Calcium nitrate', 'Potassium sulphate', 'Magnesium sulphate'],
      organicOptions: ['Compost', 'Vermicompost', 'Bone meal', 'Seaweed extract'],
      applicationTiming: ['Basal before transplanting', '15 days after transplanting', 'At flowering', 'Fruit development'],
      dosage: '200 kg N, 100 kg P2O5, 150 kg K2O per hectare'
    }
  },
  maize: {
    pestControl: {
      commonPests: ['Fall Army Worm', 'Stem Borer', 'Shoot Fly', 'Cutworm'],
      organicSolutions: ['Trichogramma cards', 'Metarhizium anisopliae', 'Neem seed kernel extract', 'Bird perches'],
      chemicalSolutions: ['Spinetoram', 'Chlorantraniliprole', 'Emamectin benzoate', 'Cypermethrin'],
      preventiveMeasures: ['Early sowing', 'Seed treatment', 'Inter-cropping', 'Pheromone traps']
    },
    fertilizer: {
      primaryFertilizers: ['Urea (46-0-0)', 'DAP (18-46-0)', 'Potash (0-0-60)', 'Zinc sulphate'],
      organicOptions: ['Farmyard manure', 'Compost', 'Poultry manure', 'Green manure'],
      applicationTiming: ['Basal at sowing', '30 days after sowing', '50 days after sowing'],
      dosage: '150 kg N, 75 kg P2O5, 50 kg K2O per hectare'
    }
  }
};

export const PestFertilizerRecommendations = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pest' | 'fertilizer'>('pest');

  const recommendation = selectedCrop ? cropRecommendations[selectedCrop] : null;

  return (
    <Card className="card-farming">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bug className="w-5 h-5" />
          Pest Control & Fertilizer Recommendations
        </CardTitle>
        
        <div className="mt-4">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rice">Rice</SelectItem>
              <SelectItem value="wheat">Wheat</SelectItem>
              <SelectItem value="cotton">Cotton</SelectItem>
              <SelectItem value="tomato">Tomato</SelectItem>
              <SelectItem value="maize">Maize/Corn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!selectedCrop ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a crop to get specific pest control and fertilizer recommendations</p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex bg-muted/30 rounded-lg p-1">
              <Button
                variant={activeTab === 'pest' ? 'default' : 'ghost'}
                className={`flex-1 ${activeTab === 'pest' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveTab('pest')}
              >
                <Bug className="w-4 h-4 mr-2" />
                Pest Control
              </Button>
              <Button
                variant={activeTab === 'fertilizer' ? 'default' : 'ghost'}
                className={`flex-1 ${activeTab === 'fertilizer' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveTab('fertilizer')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Fertilizers
              </Button>
            </div>

            {/* Content */}
            {activeTab === 'pest' && recommendation && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Common Pests for {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendation.pestControl.commonPests.map((pest, index) => (
                      <div key={index} className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium border border-red-200">
                        {pest}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-600 mb-3">🌿 Organic Solutions</h4>
                  <ul className="space-y-2">
                    {recommendation.pestControl.organicSolutions.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">⚗️ Chemical Solutions</h4>
                  <ul className="space-y-2">
                    {recommendation.pestControl.chemicalSolutions.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">🛡️ Preventive Measures</h4>
                  <ul className="space-y-2">
                    {recommendation.pestControl.preventiveMeasures.map((measure, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{measure}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'fertilizer' && recommendation && (
              <div className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">📊 Recommended Dosage</h4>
                  <p className="text-muted-foreground">{recommendation.fertilizer.dosage}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">🧪 Primary Fertilizers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendation.fertilizer.primaryFertilizers.map((fertilizer, index) => (
                      <div key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200">
                        {fertilizer}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-600 mb-3">🌱 Organic Options</h4>
                  <ul className="space-y-2">
                    {recommendation.fertilizer.organicOptions.map((option, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-600 mb-3">⏰ Application Timing</h4>
                  <ul className="space-y-2">
                    {recommendation.fertilizer.applicationTiming.map((timing, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-muted-foreground">{timing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
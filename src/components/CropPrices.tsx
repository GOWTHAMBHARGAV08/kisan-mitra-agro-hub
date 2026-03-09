import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, TrendingDown, Minus, IndianRupee, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CropPricesProps {
  state: string;
  district: string;
}

interface CropPrice {
  name: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// Simulated local crop prices based on region
const getCropPrices = (state: string, district: string): CropPrice[] => {
  const basePrices: Record<string, CropPrice[]> = {
    default: [
      { name: 'Cotton', price: 6620, unit: 'per quintal', trend: 'up', change: 2.3 },
      { name: 'Chillies', price: 14500, unit: 'per quintal', trend: 'up', change: 5.1 },
      { name: 'Rice (Paddy)', price: 2183, unit: 'per quintal', trend: 'stable', change: 0.2 },
      { name: 'Wheat', price: 2275, unit: 'per quintal', trend: 'down', change: -1.1 },
      { name: 'Soybean', price: 4600, unit: 'per quintal', trend: 'up', change: 3.8 },
      { name: 'Groundnut', price: 5850, unit: 'per quintal', trend: 'stable', change: 0.5 },
      { name: 'Turmeric', price: 13200, unit: 'per quintal', trend: 'up', change: 4.2 },
      { name: 'Maize', price: 2090, unit: 'per quintal', trend: 'down', change: -0.9 },
    ],
    'andhra pradesh': [
      { name: 'Cotton', price: 6750, unit: 'per quintal', trend: 'up', change: 2.8 },
      { name: 'Chillies', price: 15200, unit: 'per quintal', trend: 'up', change: 6.2 },
      { name: 'Rice (Paddy)', price: 2250, unit: 'per quintal', trend: 'stable', change: 0.4 },
      { name: 'Groundnut', price: 5950, unit: 'per quintal', trend: 'up', change: 1.5 },
      { name: 'Turmeric', price: 13800, unit: 'per quintal', trend: 'up', change: 5.0 },
      { name: 'Maize', price: 2150, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Bengal Gram', price: 5230, unit: 'per quintal', trend: 'down', change: -1.2 },
      { name: 'Sunflower', price: 6200, unit: 'per quintal', trend: 'up', change: 2.0 },
    ],
    'telangana': [
      { name: 'Cotton', price: 6680, unit: 'per quintal', trend: 'up', change: 2.5 },
      { name: 'Chillies', price: 14800, unit: 'per quintal', trend: 'up', change: 4.8 },
      { name: 'Rice (Paddy)', price: 2200, unit: 'per quintal', trend: 'up', change: 1.2 },
      { name: 'Turmeric', price: 13500, unit: 'per quintal', trend: 'up', change: 4.5 },
      { name: 'Maize', price: 2100, unit: 'per quintal', trend: 'stable', change: 0.1 },
      { name: 'Soybean', price: 4700, unit: 'per quintal', trend: 'up', change: 3.2 },
      { name: 'Red Gram', price: 6800, unit: 'per quintal', trend: 'down', change: -0.8 },
      { name: 'Groundnut', price: 5900, unit: 'per quintal', trend: 'stable', change: 0.6 },
    ],
    'maharashtra': [
      { name: 'Cotton', price: 6550, unit: 'per quintal', trend: 'stable', change: 0.5 },
      { name: 'Soybean', price: 4800, unit: 'per quintal', trend: 'up', change: 4.1 },
      { name: 'Sugarcane', price: 3150, unit: 'per tonne', trend: 'up', change: 2.0 },
      { name: 'Wheat', price: 2300, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Onion', price: 2800, unit: 'per quintal', trend: 'down', change: -3.5 },
      { name: 'Groundnut', price: 5800, unit: 'per quintal', trend: 'up', change: 1.8 },
      { name: 'Jowar', price: 3180, unit: 'per quintal', trend: 'stable', change: 0.2 },
      { name: 'Bajra', price: 2500, unit: 'per quintal', trend: 'up', change: 1.5 },
    ],
    'karnataka': [
      { name: 'Cotton', price: 6600, unit: 'per quintal', trend: 'up', change: 1.9 },
      { name: 'Chillies', price: 14200, unit: 'per quintal', trend: 'up', change: 3.5 },
      { name: 'Rice (Paddy)', price: 2180, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Ragi', price: 3846, unit: 'per quintal', trend: 'up', change: 2.2 },
      { name: 'Maize', price: 2050, unit: 'per quintal', trend: 'down', change: -1.3 },
      { name: 'Groundnut', price: 5750, unit: 'per quintal', trend: 'stable', change: 0.4 },
      { name: 'Arecanut', price: 52000, unit: 'per quintal', trend: 'up', change: 3.0 },
      { name: 'Coffee', price: 9500, unit: 'per quintal', trend: 'up', change: 5.5 },
    ],
    'tamil nadu': [
      { name: 'Rice (Paddy)', price: 2220, unit: 'per quintal', trend: 'up', change: 1.0 },
      { name: 'Groundnut', price: 5900, unit: 'per quintal', trend: 'up', change: 2.0 },
      { name: 'Sugarcane', price: 3200, unit: 'per tonne', trend: 'stable', change: 0.5 },
      { name: 'Cotton', price: 6580, unit: 'per quintal', trend: 'up', change: 1.5 },
      { name: 'Turmeric', price: 13600, unit: 'per quintal', trend: 'up', change: 4.8 },
      { name: 'Banana', price: 1800, unit: 'per quintal', trend: 'down', change: -2.0 },
      { name: 'Coconut', price: 2600, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Maize', price: 2080, unit: 'per quintal', trend: 'stable', change: 0.1 },
    ],
    'punjab': [
      { name: 'Wheat', price: 2350, unit: 'per quintal', trend: 'up', change: 1.8 },
      { name: 'Rice (Paddy)', price: 2203, unit: 'per quintal', trend: 'stable', change: 0.5 },
      { name: 'Cotton', price: 6700, unit: 'per quintal', trend: 'up', change: 2.0 },
      { name: 'Maize', price: 2120, unit: 'per quintal', trend: 'stable', change: 0.2 },
      { name: 'Sugarcane', price: 3100, unit: 'per tonne', trend: 'up', change: 1.5 },
      { name: 'Potato', price: 1500, unit: 'per quintal', trend: 'down', change: -4.0 },
      { name: 'Mustard', price: 5050, unit: 'per quintal', trend: 'up', change: 3.0 },
      { name: 'Barley', price: 1735, unit: 'per quintal', trend: 'stable', change: 0.4 },
    ],
    'madhya pradesh': [
      { name: 'Soybean', price: 4650, unit: 'per quintal', trend: 'up', change: 3.5 },
      { name: 'Wheat', price: 2280, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Cotton', price: 6580, unit: 'per quintal', trend: 'up', change: 1.8 },
      { name: 'Chillies', price: 14000, unit: 'per quintal', trend: 'up', change: 3.0 },
      { name: 'Maize', price: 2070, unit: 'per quintal', trend: 'down', change: -0.5 },
      { name: 'Gram', price: 5100, unit: 'per quintal', trend: 'stable', change: 0.2 },
      { name: 'Mustard', price: 5100, unit: 'per quintal', trend: 'up', change: 2.5 },
      { name: 'Lentil', price: 6000, unit: 'per quintal', trend: 'up', change: 1.8 },
    ],
    'gujarat': [
      { name: 'Cotton', price: 6700, unit: 'per quintal', trend: 'up', change: 2.5 },
      { name: 'Groundnut', price: 5950, unit: 'per quintal', trend: 'up', change: 2.2 },
      { name: 'Wheat', price: 2290, unit: 'per quintal', trend: 'stable', change: 0.4 },
      { name: 'Cumin', price: 42000, unit: 'per quintal', trend: 'up', change: 6.0 },
      { name: 'Castor', price: 5800, unit: 'per quintal', trend: 'down', change: -1.5 },
      { name: 'Bajra', price: 2500, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Onion', price: 2600, unit: 'per quintal', trend: 'down', change: -2.8 },
      { name: 'Sesame', price: 14500, unit: 'per quintal', trend: 'up', change: 3.5 },
    ],
    'rajasthan': [
      { name: 'Wheat', price: 2260, unit: 'per quintal', trend: 'stable', change: 0.3 },
      { name: 'Mustard', price: 5150, unit: 'per quintal', trend: 'up', change: 3.2 },
      { name: 'Bajra', price: 2550, unit: 'per quintal', trend: 'up', change: 1.5 },
      { name: 'Cumin', price: 43000, unit: 'per quintal', trend: 'up', change: 5.5 },
      { name: 'Gram', price: 5200, unit: 'per quintal', trend: 'stable', change: 0.2 },
      { name: 'Guar', price: 5500, unit: 'per quintal', trend: 'up', change: 4.0 },
      { name: 'Cotton', price: 6550, unit: 'per quintal', trend: 'up', change: 1.5 },
      { name: 'Groundnut', price: 5800, unit: 'per quintal', trend: 'stable', change: 0.5 },
    ],
  };

  const stateKey = state?.toLowerCase() || '';
  return basePrices[stateKey] || basePrices['default'];
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export const CropPrices = ({ state, district }: CropPricesProps) => {
  const prices = getCropPrices(state, district);
  const locationLabel = district && state ? `${district}, ${state}` : state || 'India';

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-amber-800 text-lg sm:text-xl">
            <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6" />
            Local Crop Prices
          </CardTitle>
          <Badge variant="outline" className="text-xs sm:text-sm border-amber-300 text-amber-700 bg-amber-50">
            <MapPin className="h-3 w-3 mr-1" />
            {locationLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Indicative mandi prices · Updated daily</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {prices.map((crop) => (
            <div
              key={crop.name}
              className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-100 hover:border-amber-300 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-foreground truncate">{crop.name}</p>
                <p className="text-xs text-muted-foreground">{crop.unit}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="text-right">
                  <p className="font-bold text-sm sm:text-base text-foreground">₹{crop.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendIcon trend={crop.trend} />
                    <span className={`text-xs font-medium ${
                      crop.trend === 'up' ? 'text-green-600' : crop.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {crop.change > 0 ? '+' : ''}{crop.change}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise } from 'lucide-react';

export const GreetingSection = () => {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState<typeof Sun>(Sun);
  
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      const farmerName = "Gowtham"; // This could be dynamic from user context
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting(`Good Morning ${farmerName}`);
        setIcon(Sunrise);
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting(`Good Afternoon ${farmerName}`);
        setIcon(Sun);
      } else {
        setGreeting(`Good Evening ${farmerName}`);
        setIcon(Moon);
      }
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const Icon = icon;
  
  return (
    <div className="card-farming text-center mb-6">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">{greeting}</h2>
          <p className="text-muted-foreground">Welcome back to your farming dashboard</p>
        </div>
      </div>
    </div>
  );
};
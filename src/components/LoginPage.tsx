import { useState } from 'react';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import farmingBg from '@/assets/farming-bg.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in real app, this would be proper authentication
    if (formData.emailOrPhone && formData.password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 farming-pattern relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${farmingBg})` }}
      />
      
      {/* Login Card */}
      <div className="card-farming w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
            🌱
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">KisanMitra</h1>
          <p className="text-muted-foreground">Smart Farming, Simple Solutions</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone" className="text-sm font-medium">
              Email or Phone Number
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {formData.emailOrPhone.includes('@') ? (
                  <Mail className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Phone className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Enter email or phone"
                value={formData.emailOrPhone}
                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pr-10 h-12 rounded-xl border-border/50 focus:border-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button type="submit" className="btn-farming w-full h-12 text-base">
            Login to Dashboard
          </Button>

          {/* Additional Actions */}
          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-full border-primary/30 hover:bg-primary/5"
            >
              Create New Account
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full"
            >
              Forgot Password?
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
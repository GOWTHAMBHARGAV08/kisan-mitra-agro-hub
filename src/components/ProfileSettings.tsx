import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Phone, Tractor, Save, Loader2, Globe, LogOut, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LANGUAGES } from '@/constants/languages';

interface ProfileData {
  display_name: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  farm_name: string;
  farm_size: string;
  crop_types: string;
  preferred_language: string;
}

const emptyProfile: ProfileData = {
  display_name: '',
  phone: '',
  address: '',
  state: '',
  district: '',
  farm_name: '',
  farm_size: '',
  crop_types: '',
  preferred_language: 'english',
};

export const ProfileSettings = () => {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('display_name, phone, address, state, district, farm_name, farm_size, crop_types, preferred_language')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          phone: data.phone || '',
          address: data.address || '',
          state: data.state || '',
          district: data.district || '',
          farm_name: data.farm_name || '',
          farm_size: data.farm_size || '',
          crop_types: data.crop_types || '',
          preferred_language: data.preferred_language || 'english',
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Not authenticated');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name.trim() || null,
        phone: profile.phone.trim() || null,
        address: profile.address.trim() || null,
        state: profile.state.trim() || null,
        district: profile.district.trim() || null,
        farm_name: profile.farm_name.trim() || null,
        farm_size: profile.farm_size.trim() || null,
        crop_types: profile.crop_types.trim() || null,
        preferred_language: profile.preferred_language || 'english',
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated successfully!');
    }
    setSaving(false);
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary to-emerald-600 flex items-center justify-center text-white shadow-lg">
          <User className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
      </div>

      {/* Personal Details */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <User className="h-5 w-5 text-primary" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Full Name</Label>
            <Input
              id="display_name"
              value={profile.display_name}
              onChange={e => updateField('display_name', e.target.value)}
              placeholder="Enter your full name"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              maxLength={15}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={e => updateField('state', e.target.value)}
                placeholder="e.g. Karnataka"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={profile.district}
                onChange={e => updateField('district', e.target.value)}
                placeholder="e.g. Bangalore Rural"
                maxLength={50}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={e => updateField('address', e.target.value)}
              placeholder="Village / Town"
              maxLength={200}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferred Language */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Preferred Language
          </CardTitle>
          <p className="text-xs text-muted-foreground">This will be used as the default language in Plant Health Analyzer and AI Assistant.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => updateField('preferred_language', lang.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                  profile.preferred_language === lang.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/50 bg-white/50 text-foreground hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                {profile.preferred_language === lang.value && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="truncate">{lang.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Farm Details */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Tractor className="h-5 w-5 text-primary" />
            Farm Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm_name">Farm Name</Label>
              <Input
                id="farm_name"
                value={profile.farm_name}
                onChange={e => updateField('farm_name', e.target.value)}
                placeholder="e.g. Green Acres"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farm_size">Farm Size</Label>
              <Input
                id="farm_size"
                value={profile.farm_size}
                onChange={e => updateField('farm_size', e.target.value)}
                placeholder="e.g. 5 acres"
                maxLength={50}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crop_types">Crops Grown</Label>
            <Input
              id="crop_types"
              value={profile.crop_types}
              onChange={e => updateField('crop_types', e.target.value)}
              placeholder="e.g. Rice, Wheat, Sugarcane"
              maxLength={200}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full btn-farming text-lg py-6 h-auto"
      >
        {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>

      <Button
        variant="destructive"
        onClick={async () => { await supabase.auth.signOut(); }}
        className="w-full text-lg py-6 h-auto rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <LogOut className="h-5 w-5 mr-2" />
        Logout
      </Button>
    </div>
  );
};

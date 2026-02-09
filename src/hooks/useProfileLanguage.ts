import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfileLanguage = () => {
  const [profileLanguage, setProfileLanguage] = useState<string>('english');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.preferred_language) {
        setProfileLanguage(data.preferred_language);
      }
      setLoading(false);
    };
    fetchLanguage();
  }, []);

  return { profileLanguage, loading };
};

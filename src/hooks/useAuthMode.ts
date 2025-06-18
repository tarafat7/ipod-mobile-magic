
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface UserProfile {
  full_name: string;
  username: string;
  email: string;
}

export const useAuthMode = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initialData, setInitialData] = useState<{ fullName: string; username: string; email: string }>({
    fullName: '',
    username: '',
    email: ''
  });

  useEffect(() => {
    const checkEditMode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      
      if (mode === 'edit') {
        setIsEditMode(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username, email')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setInitialData({
              fullName: profile.full_name || '',
              username: profile.username || '',
              email: profile.email || user.email || ''
            });
          }
        }
      }
    };

    checkEditMode();
  }, []);

  return { isEditMode, currentUser, initialData };
};

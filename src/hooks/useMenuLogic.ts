
import { useState, useEffect } from 'react';
import { getMenuItems } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';

export const useMenuLogic = () => {
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
      
      // Check auth status
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };

    loadMenuItems();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session);
      loadMenuItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    menuItems,
    isSignedIn
  };
};


import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (userData: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return null;
      }

      if (data?.user && !data.session) {
        // User needs to confirm email
        return { needsConfirmation: true };
      }

      // User is signed up and logged in
      return { needsConfirmation: false };
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading, error, setError };
};

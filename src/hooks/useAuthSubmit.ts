
import { supabase } from '../integrations/supabase/client';

export const useAuthSubmit = () => {
  const handleEditSubmit = async (
    formData: { fullName: string; email: string; password: string },
    currentUser: any
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          email: formData.email
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      if (formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (passwordError) throw passwordError;
      }

      if (formData.email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return { handleEditSubmit };
};


import { useState } from 'react';

export const useUserState = () => {
  const [isSharedView, setIsSharedView] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  return {
    isSharedView,
    setIsSharedView,
    currentUser,
    setCurrentUser
  };
};

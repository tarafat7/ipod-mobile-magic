
interface UseMenuButtonActionsProps {
  isInMyFiveView: boolean;
  isInSettingsView: boolean;
  currentScreen: string;
  setIsInMyFiveView: (inView: boolean) => void;
  setSelectedMyFiveSong: (index: number) => void;
  setIsInSettingsView: (inView: boolean) => void;
  setSelectedSettingsItem: (index: number) => void;
  setCurrentScreen: (screen: string) => void;
  setSelectedMenuItem: (index: number) => void;
}

export const useMenuButtonActions = ({
  isInMyFiveView,
  isInSettingsView,
  currentScreen,
  setIsInMyFiveView,
  setSelectedMyFiveSong,
  setIsInSettingsView,
  setSelectedSettingsItem,
  setCurrentScreen,
  setSelectedMenuItem
}: UseMenuButtonActionsProps) => {

  const handleMenuClick = () => {
    if (isInMyFiveView) {
      setIsInMyFiveView(false);
      setSelectedMyFiveSong(0);
    } else if (isInSettingsView) {
      setIsInSettingsView(false);
      setSelectedSettingsItem(0);
    } else if (currentScreen !== 'menu') {
      setCurrentScreen('menu');
      setSelectedMenuItem(0);
    }
  };

  return { handleMenuClick };
};


import { usePlaybackState } from './usePlaybackState';
import { useScreenState } from './useScreenState';
import { useSettingsState } from './useSettingsState';
import { useMyFiveState } from './useMyFiveState';
import { useUserState } from './useUserState';

export const useIPodState = () => {
  const playbackState = usePlaybackState();
  const screenState = useScreenState();
  const settingsState = useSettingsState();
  const myFiveState = useMyFiveState();
  const userState = useUserState();

  return {
    ...playbackState,
    ...screenState,
    ...settingsState,
    ...myFiveState,
    ...userState
  };
};

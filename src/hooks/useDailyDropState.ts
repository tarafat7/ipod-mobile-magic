
import { useState } from 'react';

export const useDailyDropState = () => {
  const [isInDailyDropView, setIsInDailyDropView] = useState(false);
  const [selectedDailyDropItem, setSelectedDailyDropItem] = useState(0);

  const enterDailyDropView = () => {
    setIsInDailyDropView(true);
    setSelectedDailyDropItem(0);
  };

  const exitDailyDropView = () => {
    setIsInDailyDropView(false);
    setSelectedDailyDropItem(0);
  };

  const handleDailyDropItemChange = (index: number) => {
    setSelectedDailyDropItem(index);
  };

  return {
    isInDailyDropView,
    selectedDailyDropItem,
    enterDailyDropView,
    exitDailyDropView,
    handleDailyDropItemChange,
    setIsInDailyDropView,
    setSelectedDailyDropItem
  };
};

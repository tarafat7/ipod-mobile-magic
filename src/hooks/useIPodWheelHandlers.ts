
import { useState, useCallback } from 'react';

interface WheelHandlersProps {
  navigation: any;
}

export const useIPodWheelHandlers = ({ navigation }: WheelHandlersProps) => {
  const [lastAngle, setLastAngle] = useState<number | null>(null);

  const handleWheelMove = useCallback((e: React.MouseEvent) => {
    const wheelElement = e.currentTarget as HTMLElement;
    const rect = wheelElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    const normalizedAngle = ((angle * 180) / Math.PI + 360) % 360;
    
    if (lastAngle !== null) {
      let angleDiff = normalizedAngle - lastAngle;
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const threshold = 25;
      if (Math.abs(angleDiff) < threshold) {
        return;
      }
      
      const isClockwise = angleDiff > 0;
      navigation.handleWheelNavigation(isClockwise);
    }
    
    setLastAngle(normalizedAngle);
  }, [lastAngle, navigation]);

  const handleWheelLeave = useCallback(() => {
    setLastAngle(null);
  }, []);

  return {
    handleWheelMove,
    handleWheelLeave
  };
};


import React from 'react';
import { Settings } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Settings size={32} className="text-gray-600 mb-3" />
      <h3 className="font-bold text-lg mb-2">Settings</h3>
      <p className="text-sm text-gray-600 leading-tight">
        Configure your<br />
        FivePod settings
      </p>
    </div>
  );
};

export default SettingsScreen;

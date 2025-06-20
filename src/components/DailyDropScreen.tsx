
import React from 'react';

const DailyDropScreen: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-orange-600 rounded-md"></div>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-1">The Daily Drop</h3>
      <p className="text-sm text-gray-600 text-center leading-tight">
        Discover new music<br />every day
      </p>
    </div>
  );
};

export default DailyDropScreen;

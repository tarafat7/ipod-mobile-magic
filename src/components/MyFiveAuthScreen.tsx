
import React from 'react';
import { User, UserPlus } from 'lucide-react';

interface MyFiveAuthScreenProps {
  selectedOption: number;
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

const MyFiveAuthScreen: React.FC<MyFiveAuthScreenProps> = ({
  selectedOption,
  onSignInClick,
  onSignUpClick
}) => {
  const options = [
    { label: 'Sign In', icon: User, action: onSignInClick },
    { label: 'Sign Up', icon: UserPlus, action: onSignUpClick }
  ];

  return (
    <div className="h-full flex">
      {/* Left panel with options */}
      <div className="w-1/2 bg-white border-r border-gray-300 relative">
        {/* Battery indicator */}
        <div className="absolute top-2 right-2">
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
        
        <div className="p-2">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold">My Five</span>
          </div>
          
          <div className="space-y-0">
            {options.map((option, index) => (
              <div
                key={option.label}
                className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${
                  selectedOption === index
                    ? 'text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedOption === index ? '#3398d8' : 'transparent'
                }}
                onClick={option.action}
              >
                <span>{option.label}</span>
                {selectedOption === index && (
                  <span className="text-white">▶</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel with preview */}
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          {selectedOption === 0 ? (
            <>
              <User size={32} className="text-gray-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">Sign In</h3>
              <p className="text-sm text-gray-600 leading-tight">
                Access your existing<br />
                FivePod account
              </p>
            </>
          ) : (
            <>
              <UserPlus size={32} className="text-blue-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">Sign Up</h3>
              <p className="text-sm text-gray-600 leading-tight">
                Create a new<br />
                FivePod account
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyFiveAuthScreen;

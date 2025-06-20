
import React from 'react';
import { ScrollArea } from './ui/scroll-area';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="h-full bg-white">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="text-sm leading-relaxed text-gray-800 space-y-4">
            <div>
              <h2 className="font-bold text-base mb-2">Privacy Policy</h2>
              <p className="text-xs text-gray-600 mb-4">Effective: June 2025</p>
            </div>
            
            <p>
              FivePod is a small music-sharing site built for fun, not for harvesting your data. That said, here's what we collect and how it's used:
            </p>
            
            <div>
              <h3 className="font-bold mb-2">What We Collect</h3>
              
              <div className="mb-3">
                <h4 className="font-semibold">Usernames</h4>
                <p>Just the name you choose when creating your profile.</p>
              </div>
              
              <div className="mb-3">
                <h4 className="font-semibold">Your Five Songs</h4>
                <p>The links you paste in (Spotify, Apple Music, YouTube, etc.) to display on your profile.</p>
              </div>
              
              <div className="mb-3">
                <h4 className="font-semibold">Optional Friends List</h4>
                <p>If you choose to add other users to your sidebar, we store those usernames so you can see their five songs.</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">What We Don't Collect</h3>
              <p className="mb-2">We don't collect your email, real name, IP address, or any sensitive personal info.</p>
              <p className="mb-2">We don't use cookies to track you around the web.</p>
              <p>We don't sell or share your data with advertisers or third parties. Ever.</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">How We Use Your Data</h3>
              <p className="mb-2">Your username and songs are used to generate your public profile page.</p>
              <p>If you add friends, their usernames are stored so you can easily access their profiles.</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Deleting Your Data</h3>
              <p>Want your profile and songs removed? Just select 'Delete Account' in Settings and we'll take care of it no questions asked.</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Changes to This Policy</h3>
              <p>If anything changes, we'll update this page and keep it just as clear and human as it is now.</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PrivacyPolicyScreen;

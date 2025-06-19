
import React from 'react';
import { Music } from 'lucide-react';
import { Friend, SpotifyTrackInfo } from '../types/friends';

interface FriendSongsPreviewProps {
  selectedFriend: Friend | null;
  selectedFriendSongs: SpotifyTrackInfo[];
  isLoadingSongs: boolean;
}

const FriendSongsPreview: React.FC<FriendSongsPreviewProps> = ({
  selectedFriend,
  selectedFriendSongs,
  isLoadingSongs
}) => {
  return (
    <div className="w-1/2 pl-6">
      {selectedFriend ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {selectedFriend.full_name}'s Five
          </h2>
          {isLoadingSongs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading songs...</p>
            </div>
          ) : selectedFriendSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Music size={48} className="mx-auto mb-4 text-gray-300" />
              <p>{selectedFriend.full_name} hasn't added their five songs yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedFriendSongs.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => window.open(song.spotifyUrl, '_blank')}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                    {song.albumArt ? (
                      <img 
                        src={song.albumArt} 
                        alt={`${song.name} album art`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {song.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Music size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Select a friend to see their songs</p>
        </div>
      )}
    </div>
  );
};

export default FriendSongsPreview;

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (channelId) {
      fetchChannel();
    }
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2222/api/channels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch channel');
      const channels = await response.json();
      const currentChannel = channels.find(c => c.id === parseInt(channelId));
      setChannel(currentChannel);
    } catch (error) {
      console.error('Error fetching channel:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            {channel ? `#${channel.name}` : `User `}
          </h1>
        </div>
      </div>
    </header>
  );
}

export default Header;

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
    const { channelId, userId } = useParams();  // Get both channel and user IDs from URL
    const [channel, setChannel] = useState(null);
  const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          if (!channelId && !userId) return;
    
          try {
            const token = localStorage.getItem('token');
            const headers = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            };
    
            if (channelId) {
              const response = await fetch(`http://localhost:2222/api/channels/${channelId}`, { headers });
              if (!response.ok) throw new Error('Failed to fetch channel');
              const data = await response.json();
              setChannel(data);
              setUser(null);  // Reset user when viewing channel
            } else if (userId) {
              const response = await fetch(`http://localhost:2222/api/users/${userId}`, { headers });
              if (!response.ok) throw new Error('Failed to fetch user');
              const data = await response.json();
              setUser(data);
              setChannel(null);  // Reset channel when viewing DM
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
      }, [channelId, userId]);

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
            {channel ? `#${channel.name}` : user?.name}
          </h1>
        </div>
      </div>
    </header>
  );
}

export default Header;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileBar from './UserProfileBar';

function Sidebar({ userData }) {
  const { user, token } = useAuth();

  const [channels, setChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const currentUserData = directMessages.find(u => u.id === user?.id);

  useEffect(() => {
    const fetchData = async () => {
        console.log('fd')
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
      try {
 // Fetch both channels and users
        const [channelsRes, usersRes] = await Promise.all([
          fetch('http://localhost:2222/api/channels', { headers }),
          fetch('http://localhost:2222/api/users', { headers })
        ]);

        if (!channelsRes.ok) throw new Error('Failed to fetch channels');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const channelsData = await channelsRes.json();
        const usersData = await usersRes.json();

        setChannels(channelsData);
        // Transform users data to match DM format
        setDirectMessages(usersData.map(user => ({
            id: user.id,
            name: user.username,
            photo: user.photo,
            online: Date.now()-user.lastSeen < 5000,
          })));
      } catch (error) {
        console.error('Error fetching channels:', error);
        // TODO: Handle error state
      }
    };
    fetchData();
    setInterval(fetchData,5000);
  }, []);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:2222/api/channels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newChannelName })
      });

      if (!response.ok) throw new Error('Failed to create channel');
      
      // Refresh channels list
      const updatedChannelsRes = await fetch('http://localhost:2222/api/channels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedChannels = await updatedChannelsRes.json();
      setChannels(updatedChannels);

      // Reset form
      setNewChannelName('');
      setShowNewChannelDialog(false);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (displayName) formData.append('displayName', displayName);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await fetch('http://localhost:2222/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      // Reset form
      setShowProfileDialog(false);
    //   setDisplayName('');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="bg-slack-aubergine w-64 flex-shrink-0 text-white">


      {/* Profile Edit Dialog */}
      {showProfileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    fetch('http://localhost:2222/api/users/profile', {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ name: e.target.value })
                    });
                  }}
                  className="w-full px-3 py-2 border rounded text-gray-900"
                  placeholder="Enter display name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-gray-900"
                />
                {avatarPreview && (
                  <div className="mt-2">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDialog(false);
                    setAvatarPreview(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Chatty</h1>
      </div>
      
      <div className="p-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold">Channels</h2>
            <button
              className="text-gray-400 hover:text-white text-xl font-semibold px-2 rounded hover:bg-slack-purple"
              onClick={() => setShowNewChannelDialog(true)}
            >
              +
            </button>
          </div>
          {channels.map(channel => (
            <Link
              key={channel.id}
              to={`/channel/${channel.id}`}
              className="block px-2 py-1 hover:bg-slack-purple rounded"
            >
              # {channel.name}
            </Link>
          ))}
        </div>

        {/* New Channel Dialog */}
        {showNewChannelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a new channel</h3>
              <form onSubmit={handleCreateChannel}>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="w-full px-3 py-2 border rounded text-gray-900 mb-4"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewChannelDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create Channel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-sm font-semibold mb-2">Direct Messages</h2>
          {directMessages.map(dm => (
            <Link
              key={dm.id}
              to={`/dm/${dm.id}`}
              className="block px-2 py-1 hover:bg-slack-purple rounded"
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-3 -mt-1 text-xs -translate-y-0.5 ${dm.online ? 'text-green-500' : 'text-gray-500'}`}>●</span>
              {dm.name}
            </Link>
          ))}
        </div>
              {/* Profile Button */}
      <div className="p-4 border-t border-slack-purple mt-auto">
        <button
          onClick={() => setShowProfileDialog(true)}
          className="w-full text-left rounded hover:bg-slack-purple flex items-center"
        >
          <span>Edit Profile</span>
        </button>
      </div>
      </div>
      
      <UserProfileBar 
        name={currentUserData?.name}
        photo={currentUserData?.photo}
      />
    </div>
  );
}

export default Sidebar;

// import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useParams } from 'react-router-dom';
import Channel from '../../pages/Channel';
import DirectMessage from '../../pages/DirectMessage';
import Profile from '../../pages/Profile';
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';



function Layout() {
    const { channelId,userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchUserData = async (userId) => {

        try {
            const response = await fetch(`http://localhost:2222/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch user');
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };

    const fetchMessages = async (channelId, userId, init) => {
        try {

            let endpoint;
            if (channelId) {
                endpoint = `http://localhost:2222/api/messages/channel/${channelId}`;
            } else if (userId) {
                endpoint = `http://localhost:2222/api/messages/dm/${userId}`;
            } else {
                setMessages([]);
                setLoading(false);

                return;
            }
            const lastFetch = localStorage.getItem(`lastFetch${channelId}`) || 0;
            const response = await fetch(`${endpoint}?lastFetch=${init? 0:lastFetch}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            if (userId) {
                // For DMs, fetch recipient data
                const userResponse = await fetch(`http://localhost:2222/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch recipient data');
                const recipientData = await userResponse.json();
                
                const mappedMessages = data.map(message => ({
                    ...message,
                    userId: message.senderId,
                    recipientName: recipientData.name,
                    recipientId: parseInt(userId)
                }));
                setMessages(mappedMessages);
            } else {
                if (data.noChange) {
                    return;
                }
                // For channels, messages can be used directly
                setMessages(data);
                localStorage.setItem(`lastFetch${channelId}`, Date.now());
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch immediately on mount or ID change
        fetchMessages(channelId, userId, true);

        // Set up interval for subsequent fetches
        const intervalId = setInterval(() => {
            fetchMessages(channelId, userId);

        }, 500);

        // Clean up interval on unmount or when IDs change
        return () => clearInterval(intervalId);
    }, [channelId, userId]);

    return (
        <div className="h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto bg-white">
                    <Routes>
                        <Route path="/" element={<Profile />} />
                        <Route 
                            path="/channel/:channelId" 
                            element={<Channel messages={messages} loading={loading} channelId={channelId} setMessages={setMessages} fetchUserData={fetchUserData} />} 
                        />
                        <Route 
                            path="/dm/:userId" 
                            element={<DirectMessage messages={messages} loading={loading} userId={userId} setMessages={setMessages} fetchUserData={fetchUserData} />} 
                        />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default Layout;

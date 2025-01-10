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
import ThreadModal from '../ThreadModal';
import SearchModal from '../SearchModal';


function Layout() {
    const { channelId, userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [parentMessage, setParentMessage] = useState(null);
    const { token, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const fetchUserData = async (userId) => {
        console.log('fud', userId)
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

        
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await fetch(`http://localhost:2222/api/users/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error('Failed to fetch user');
                setUsers(await response.json());
            } catch (error) {
                console.error('Error fetching user:', error);
                return null;
            }
        };

        if (token) {
            fetchAllUsers();
            setInterval(fetchAllUsers, 5000);
        }
    }, []);

    return (
        <div className="h-screen flex">
            <Sidebar 
                users={users.map(user => ({
                    ...user,
                    photo: user.photo,
                    online: Date.now()-user.lastSeen < 5000,
                }))}
                setIsSearchOpen={setIsSearchOpen}
            />
            <div className="flex-1 flex flex-col">
                <Header onSearchOpen={() => setIsSearchOpen(true)} />
                <main className="flex-1 overflow-auto bg-white">
                    <Routes path="*">
                        <Route path="/profile" element={<Profile />} />
                        <Route 
                            path="/channel/:channelId" 
                            element={<Channel messages={messages} loading={loading} channelId={channelId} setMessages={setMessages} users={users} setParentMessage={setParentMessage} />} 
                        />
                        <Route 
                            path="/dm/:userId" 
                            element={<DirectMessage messages={messages} loading={loading} userId={userId} setMessages={setMessages} users={users} setParentMessage={setParentMessage} />} 
                        />
                    </Routes>
                </main>
            </div>
            {parentMessage && <ThreadModal
                isOpen={parentMessage}
                onClose={() => setParentMessage(null)}
                parentMessage={parentMessage}
                users={users} 
                token={token}
                userId={user.id}
            />}
            
            <SearchModal
                isOpen={isSearchOpen}
                setIsOpen={setIsSearchOpen}
                users={users}
                token={token}
            />
        </div>
    );
}

export default Layout;

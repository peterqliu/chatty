import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import Message from './Message';

export default function ThreadModal({ isOpen, onClose, parentMessage, users, token, userId }) {
  const [newMessage, setNewMessage] = useState('');
  const [threadMessages, setThreadMessages] = useState([]);

  const fetchThreadData = async () => {
    try {
      const response = await fetch(`http://localhost:2222/api/threadMessages/${parentMessage.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setThreadMessages(data);
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
  };

  useEffect(() => {
    if (isOpen && parentMessage?.id && parentMessage.threadCount > 0) {
      fetchThreadData();
    }
  }, [isOpen, parentMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handle submit', userId)
    fetch(`http://localhost:2222/api/threadMessages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: newMessage,
        parentId: parentMessage.id,
        userId
      })
    })
      .then(response => response.json())
      .then(data => {
        setThreadMessages(data);
        setNewMessage('');
      })
      .catch(error => console.error('Error posting thread message:', error));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="max-h-[80vh] overflow-y-auto">
          <Message
            message={parentMessage}
            user={users[parentMessage.userId-1]}
            isThreadView={true}
            activeReactionMessage={parentMessage}
          />
          
          <div className="flex justify-between items-center mb-4">
            <MessageList messages={threadMessages} users={users} token={token} isThreadView={true} />
          </div>
          
          <div className="border-b pb-4 mb-4">
            <p className="font-medium">{parentMessage?.userName}</p>
            <p>{parentMessage?.content}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full border rounded p-2 mb-4"
            placeholder="Write a reply..."
            rows="3"
          />
        </form>
      </div>
    </div>
  );
} 

// const response = await fetch(`http://localhost:2222/api/users/${userId}`, {
//   headers: {
//       'Authorization': `Bearer ${token}`
//   }
// });

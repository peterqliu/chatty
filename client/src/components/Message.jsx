import UserAvatar from './UserAvatar';
import MessageReactions from './MessageReactions';

function Message({ 
  message, 
  user,     
  setParentMessage, 
  activeReactionMessage, 
  setActiveReactionMessage,
  token,
  isThreadView = false
}) {

    const handleReaction = async (messageId, emoji) => {
        try {
          // Toggle the reaction and wait for it to complete
          const toggleResponse = await fetch('http://localhost:2222/api/toggleReaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              messageId,
              emoji
            })
          });
  
          if (!toggleResponse.ok) {
            throw new Error('Failed to toggle reaction');
          }
  
          // Wait for the toggle response to be processed. can optimistically update the message to this
          const newMessage = await toggleResponse.json();
  
        } catch (error) {
          console.error('Error handling reaction:', error);
        }
        
        setActiveReactionMessage(null);
      };
  return (
    <div className="group hover:bg-gray-50 px-4 py-2 -mx-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <UserAvatar user={user} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-gray-900">
                {user?.name || `User ${message.userId}`}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="relative">
              {setActiveReactionMessage && <button 
                className="text-gray-400 hover:text-gray-600 text-sm mr-2"
                onClick={() => setActiveReactionMessage(activeReactionMessage === message.id ? null : message.id)}
              >
                React
              </button>}
              {setParentMessage && !message.threadCount && <button 
                className="text-gray-400 hover:text-gray-600 text-sm"
                onClick={() => setParentMessage(message)}
              >
                <span>Reply</span>
              </button>}
              {activeReactionMessage === message.id && (
                <div className="absolute bottom-full right-0 mb-1 bg-white shadow-lg rounded-lg border p-2 flex space-x-2 z-10">
                  <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'heart')}>❤️</button>
                  <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'thumbsUp')}>👍</button>
                  <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'thumbsDown')}>👎</button>
                  <button className="hover:bg-gray-100 p-1 rounded" onClick={() => handleReaction(message.id, 'smile')}>😊</button>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-900 font-light whitespace-pre-wrap text-base">{message.text}</p>
          
          <div className="flex items-center space-x-2">
            {!isThreadView && <MessageReactions 
              message={message} 
              onReaction={handleReaction} 
            />}
            {message.threadCount > 0 && !isThreadView && (
              <button 
                className="text-sm px-2 py-0.5 bg-gray-100 hover:bg-gray-200 transition-colors mt-1 text-blue-600 border border-blue-400 rounded"
                onClick={() => setParentMessage(message)}
              >
                {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message; 
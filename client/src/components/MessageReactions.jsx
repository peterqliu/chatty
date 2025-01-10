import { useAuth } from '../context/AuthContext';

function MessageReactions({ message, onReaction }) {
  const { userId } = useAuth();

  if (!message.reactions || Object.keys(message.reactions).length === 0) {
    return null;
  }
  
  const getEmojiForType = (type) => {
    const emojiMap = {
      heart: '❤️',
      thumbsUp: '👍',
      thumbsDown: '👎',
      smile: '😊'
    };
    return emojiMap[type];
  };

  return (
    <div className="mt-1 flex gap-2">
      {Object.entries(message.reactions).map(([emoji, userIds]) => (
        <button
          key={`${message.id}-${emoji}`}
          onClick={() => onReaction(message.id, emoji)}
          className={`text-sm px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors
            ${userIds.includes(userId) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
        >
          {getEmojiForType(emoji)} {userIds.length}
        </button>
      ))}
    </div>
  );
}

export default MessageReactions; 
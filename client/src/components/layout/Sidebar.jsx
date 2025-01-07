import { Link } from 'react-router-dom';

function Sidebar() {
  const channels = [
    { id: 1, name: 'general' },
    { id: 2, name: 'random' },
  ];

  const directMessages = [
    { id: 1, name: 'John Doe', online: true },
    { id: 2, name: 'Jane Smith', online: false },
  ];

  return (
    <div className="bg-slack-aubergine w-64 flex-shrink-0 text-white">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Slack Clone</h1>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-2">Channels</h2>
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

        <div>
          <h2 className="text-sm font-semibold mb-2">Direct Messages</h2>
          {directMessages.map(dm => (
            <Link
              key={dm.id}
              to={`/dm/${dm.id}`}
              className="block px-2 py-1 hover:bg-slack-purple rounded"
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${dm.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              {dm.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../UserAvatar';

function UserProfileBar({ name, photo }) {
  return (
    <div className="user-profile">
      <UserAvatar 
        user={{ name, photo }}
        className="w-8 h-8"
      />
      <span className="user-name">{name}</span>

      <style jsx>{`
        .user-profile {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 240px;
          padding: 1rem;
          background: var(--sidebar-bg);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-name {
          color: var(--text-color);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default UserProfileBar; 
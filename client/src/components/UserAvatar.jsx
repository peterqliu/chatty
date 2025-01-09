function UserAvatar({ user, className = "w-9 h-9" }) {
  return (
    <img
      src={user?.photo ? `http://localhost:2222/uploads/${user.photo}` : `https://ui-avatars.com/api/?name=${
        encodeURIComponent((user?.name || 'U').charAt(0))
      }&background=random`}
      alt={user?.name || 'User'}
      className={`${className} rounded object-cover`}
    />
  );
}

export default UserAvatar; 
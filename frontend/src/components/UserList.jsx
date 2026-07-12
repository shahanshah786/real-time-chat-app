// components/UserList.jsx
// Sidebar showing who's currently online (bonus feature).

export default function UserList({ onlineUsers, currentUser }) {
  return (
    <aside className="user-list">
      <h3>Online ({onlineUsers.length})</h3>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user}>
            <span className="status-dot online" />
            {user} {user === currentUser && <em>(you)</em>}
          </li>
        ))}
      </ul>
    </aside>
  );
}

import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const fetchUsers = () => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(data => setUsers(data.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async () => {
    await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    setName("");
    setEmail("");
    fetchUsers(); // refresh list
  };

  return (
    <div>
      <h1>Users</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button onClick={createUser}>Add User</button>
      
    </div>
  );
}

export default App;
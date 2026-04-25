import { useEffect, useState } from "react";

function App() {
  // Correctly define state for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }) // Now both exist!
      });

      if (response.ok) {
        alert("User registered successfully!");
        setEmail(""); // Clear the inputs
        setPassword("");
      } else {
        alert("Registration failed.");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register User</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Correct setter
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Correct setter
      />

      <button onClick={createUser}>Add User</button>
    </div>
  );
}

export default App;
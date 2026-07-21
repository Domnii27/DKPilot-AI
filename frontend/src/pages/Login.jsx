import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useState } from "react";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/users/login",
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      const user = response.data.user;

      if (token && user) {
        localStorage.setItem("token", token);

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(user)
        );

        alert("Login Successful");
        navigate("/dashboard");
      } else {
        alert("Invalid login response");
      }

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert("Invalid Email or Password");
      } else {
        alert("Backend connection failed");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>DKPilot AI</h1>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

        <p>
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
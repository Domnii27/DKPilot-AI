import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>DKPilot AI</h2>

      <div className="menu">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
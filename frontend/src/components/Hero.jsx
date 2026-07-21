import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <h1>Automate Your Business with AI 🚀</h1>
      <p>
        DKPilot AI helps businesses automate daily tasks using Artificial Intelligence.
      </p>

      <button onClick={() => navigate("/login")}>
        Get Started
      </button>
    </section>
  );
}

export default Hero;
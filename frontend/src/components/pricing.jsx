function Pricing() {
  return (
    <section className="pricing">
      <h2>Pricing Plans</h2>

      <div className="cards">
        <div className="card">
          <h3>Basic</h3>
          <h1>₹499</h1>
          <p>1 AI Automation</p>
          <button>Choose Plan</button>
        </div>

        <div className="card">
          <h3>Pro</h3>
          <h1>₹999</h1>
          <p>5 AI Automations</p>
          <button>Choose Plan</button>
        </div>

        <div className="card">
          <h3>Enterprise</h3>
          <h1>₹1999</h1>
          <p>Unlimited Automations</p>
          <button>Choose Plan</button>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
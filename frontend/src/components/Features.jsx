import FeatureCard from "./FeatureCard";

function Features() {
  return (
    <section className="features">
      <h2>Our Features</h2>

      <div className="cards">
        <FeatureCard
          title="AI Assistant"
          desc="Automate your daily tasks using AI."
        />

        <FeatureCard
          title="Email Automation"
          desc="Send emails automatically."
        />

        <FeatureCard
          title="Analytics Dashboard"
          desc="Track your business performance."
        />
      </div>
    </section>
  );
}

export default Features;
import React from "react";
import HeroImage from "./assets/hero_section.png";
import MidImage from "./assets/Mid_Image.png";
import MeetTeam from "./assets/Meet_the_team.png";
import SuccessMetrics from "./assets/Success_Metrics.png";
import ContactForm from "./assets/Contact_Form.png";

import "./App.css";

const App = () => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Let's create something great together.</h1>
        <img src={HeroImage} alt="Hero" className="hero-image" />
      </section>

      {/* Who We Are Section */}
      <section className="who-we-are">
        <h2 className="section-title">Who we are</h2>
        <p className="section-description">
          We work hand-in-hand with our clients to ensure their digital
          transformation is positioned for long-term success.
        </p>
        <img src={MidImage} alt="Who We Are" className="section-image" />
      </section>

      {/* Meet the Team Section */}
      <section className="team">
        <h2 className="section-title">Meetttttt the heroes behind the magic</h2>
        <img src={MeetTeam} alt="Team" className="team-image" />
      </section>

      {/* Success Metrics Section */}
      <section className="success-metrics">
        <img src={SuccessMetrics} alt="Metrics" className="metrics-image" />
      </section>

      {/* Contact Form Section */}
      <section className="contact-form">
        <h2 className="section-title">We'd love to hear from you</h2>
        <img src={ContactForm} alt="Contact Form" className="form-image" />
      </section>
    </div>
  );
};

export default App;

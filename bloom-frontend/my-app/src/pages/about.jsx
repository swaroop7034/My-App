import React from "react";
import "../css/about.css";

// Team data
const teamMembers = [
  {
    name: "Amal Saji",
    role: "Project Lead + Frontend developer",
    description: "Guides the team and oversees project development.",
  },
  {
    name: "Swaroop Sundar S",
    role: "Backend Developer",
    description: "Handles server-side logic and database integration.",
  },
  {
    name: "Shebin shad",
    role: "Backend Developer",
    description: "Handles server-side logic and database integration.",
  },
  {
    name: "Mehrin A",
    role: "UI/UX Designer",
    description: "  Designs user-friendly interfaces and experiences.",
  },
  {
    name: "Fida Fathima",
    role: "UI/UX Designer",
    description: "  Designs user-friendly interfaces and experiences.",
  },
  {
    name: "Devana Madhusoodanan",
    role: "Frontend Developer",
    description: "  Develops responsive and interactive user interfaces.",
  },
];

export default function About() {
  return (
    <div className="about-page">
      <h1 className="about-title">
        About <span className="highlight">Bloom Watch 🌸</span>
      </h1>
      <p className="about-intro">
        Understanding the intricate patterns of nature through cutting-edge
        <br />
        Earth observation technology and the science of phenology.
      </p>

      {/* Phenology Section */}
  <div className="about-container">
  <h1>What is Phenology?</h1>
  <p>
    Phenology is the study of cyclic and seasonal natural phenomena,
    especially in relation to climate and plant and animal life. It’s one
    of nature’s most sensitive indicators of climate change.
  </p>

  <div className="horizontal-container">
    <div className="section-box">
      <h3>📈 Why It Matters</h3>
      <ul>
        <li>Tracks ecosystem responses to climate change</li>
        <li>Helps predict agricultural timing and yields</li>
        <li>Monitors biodiversity and species migration</li>
        <li>Informs conservation and management strategies</li>
      </ul>
    </div>

    <div className="section-box">
      <h3>🌍 Global Impact</h3>
      <ul>
        <li>Affects food security worldwide</li>
        <li>Influences pollinator populations</li>
        <li>Impacts tourism and cultural events</li>
        <li>Guides climate adaptation strategies</li>
      </ul>
    </div>
  </div>
</div>


      {/* NASA Space Apps Challenge */}
      <div className="about-container">
        <div className="section-box">
          <h2>🏅 NASA Space Apps Challenge</h2>
          <p>
            BloomWatch was developed as part of the NASA Space Apps Challenge,
            a global hackathon that brings together teams to solve challenges
            using NASA’s open data.
          </p>

          <div className="horizontal-container">
            <div className="section-box">
              <h3>Challenge Details</h3>
              <p>
                Difficulty: <span className="difficulty-badge">Advanced</span>
              </p>
              <p>
                Subjects:{" "}
                <span className="subjects-badge">
                  Earth Science • Data Visualization • Climate Change • Phenology • Remote Sensing
                </span>
              </p>
            </div>

            <div className="section-box">
              <h3>Our Approach</h3>
              <ul>
                <li>Leveraged NASA Earth observation data</li>
                <li>Created intuitive data visualizations</li>
                <li>Built responsive, accessible interface</li>
                <li>Focused on global phenology patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <section className="team-section">
        <h2>Our Team</h2>
        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div className="team-member" key={index}>
              <div className="member-icon">👥</div>
              <div className="member-name">{member.name}</div>
              <div className="member-role">{member.role}</div>
              <div className="member-desc">{member.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
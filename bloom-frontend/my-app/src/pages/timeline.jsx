import { useRef } from "react";
import "../css/timeline.css";

const months = [
  { short: "Jan", full: "January" },
  { short: "Feb", full: "February" },
  { short: "Mar", full: "March" },
  { short: "Apr", full: "April" },
  { short: "May", full: "May" },
  { short: "Jun", full: "June" },
  { short: "Jul", full: "July" },
  { short: "Aug", full: "August" },
  { short: "Sep", full: "September" },
  { short: "Oct", full: "October" },
  { short: "Nov", full: "November" },
  { short: "Dec", full: "December" },
];

const blooms = [
  {
    title: "Cherry Blossoms in Japan",
    desc: "The iconic sakura season begins across Japan, starting in southern regions and moving north.",
    month: "March",
    location: "Japan",
  },
  {
    title: "Lavender Fields in France",
    desc: "Provence's lavender fields reach their peak bloom, creating stunning purple landscapes.",
    month: "May",
    location: "France",
  },
  {
    title: "Hibiscus Flowers in Thailand",
    desc: "The tropical rainforests of Thailand host vibrant hibiscus blooms, making them a popular destination for tourists.",
    month: "Aug",
    location: "Thailand",
  },{
    title: "Palm Trees in Indonesia",
    desc: "The tropical rainforests of Indonesia host vibrant hibiscus blooms, making them a popular destination for tourists.",
    month: "Nov",
    location: "Indonesia",
  },{
    title: "Palm Trees in Indonesia",
    desc: "The tropical rainforests of Indonesia host vibrant hibiscus blooms, making them a popular destination for tourists.",
    month: "Nov",
    location: "Indonesia",
  }
];

export default function Timeline() {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="timeline-wrapper">
      <h1>
        <span className="highlight">Phenology</span> Timeline
      </h1>
      <p className="timeline-desc">
        Follow the natural rhythm of flowering seasons around the world. Explore when <br />
        and where different species reach their peak bloom throughout the year.
      </p>

      <div className="timeline-container">
        <button className="arrow-btn left" onClick={scrollLeft}>&#9664;</button>

        <div className="months-carousel" ref={carouselRef}>
          {months.map((month) => (
            <div
              key={month.short}
              className={`month-circle ${
                ["Mar", "May", "Jul", "Aug"].includes(month.short)
                  ? "active"
                  : ""
              }`}
            >
              <div className="month-short">{month.short}</div>
              <div className="month-full">{month.full}</div>
            </div>
          ))}
        </div>

        <button className="arrow-btn right" onClick={scrollRight}>&#9654;</button>
      </div>

      <h2>Annual Bloom Calendar</h2>
      <div className="bloom-list">
        {blooms.map((bloom, i) => (
          <div key={i} className="bloom-item">
            <div className="bloom-info">
              <h3>{bloom.title}</h3>
              <p>{bloom.desc}</p>
            </div>
            <div className="bloom-meta">
              <span className="bloom-month">{bloom.month}</span>
              <span className="bloom-location">{bloom.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

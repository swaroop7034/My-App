import React, { useState } from "react";
import "../css/bloom.css";

const Bloom = () => {
  const [startDate, setStartDate] = useState("");
  const [latLon, setLatLon] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [backendResponse, setBackendResponse] = useState(null);

  const handleSubmit = async () => {
    if (!locationName || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      // Get latitude and longitude for locationName
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`
      );
      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        alert("Location not found");
        return;
      }

      const lat = geoData[0].lat;
      const lon = geoData[0].lon;
      setLatLon({ lat, lon });

      const payload = {
        startDate,
        endDate,
        lat: lat.toString(),
        lon: lon.toString(),
        locationName
      };

      console.log("Sending payload to backend:", payload);

      // Send to backend
      const response = await fetch("http://localhost:3000/bloom-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Backend error:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Backend response:", result);
      setBackendResponse(result);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bloom-container">
      <h2>Bloom Prediction</h2>

      <div className="input-fields">
        <input
          type="text"
          placeholder="Enter location name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleSubmit}>Predict Bloom</button>
      </div>

      {latLon && (
        <div className="coordinates-box">
          <p><strong>Latitude:</strong> {latLon.lat}</p>
          <p><strong>Longitude:</strong> {latLon.lon}</p>
        </div>
      )}

      {backendResponse && (
        <div className="response-box">
          <h3>Bloom Prediction Result</h3>
          <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Bloom;

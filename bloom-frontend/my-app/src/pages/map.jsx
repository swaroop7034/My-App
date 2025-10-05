import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../css/map.css";

const API_BASE = import.meta.env.VITE_API_BASE;

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 6);
  return null;
}

const Maps = () => {
  const [locationName, setLocationName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coords, setCoords] = useState([20, 0]);
  const [latLon, setLatLon] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const handleSearch = async () => {
    if (!locationName || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(4);
        const lon = parseFloat(data[0].lon).toFixed(4);

        setCoords([lat, lon]);
        setLatLon({ lat, lon });

        const payload = {
          startDate,
          endDate,
          lat: lat.toString(),
          lon: lon.toString(),
          locationName
        };

        sendToBackend(payload);
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendToBackend = async (payload) => {
    try {
      console.log("Sending to backend:", payload);

      const response = await fetch(`${API_BASE}/climate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

      if (!response.ok) {
        console.error("Backend error:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Backend climate response:", result);
      setBackendResponse(result);
    } catch (error) {
      console.error("Error sending to backend:", error);
    }
  };

  // Add NDVI Heatmap
  useEffect(() => {
    if (mapInstance && backendResponse && backendResponse.ndviTrend && latLon) {
      // Remove existing heat layer
      mapInstance.eachLayer(layer => {
        if (layer.options && layer.options.pane === "markerPane") return;
        if (layer instanceof L.HeatLayer) {
          mapInstance.removeLayer(layer);
        }
      });

      const heatPoints = backendResponse.ndviTrend.map(ndviPoint => [
        parseFloat(latLon.lat),
        parseFloat(latLon.lon),
        ndviPoint.value // NDVI intensity (0–1)
      ]);

      const heatLayer = L.heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: "brown",
          0.4: "yellow",
          0.6: "lime",
          0.8: "green"
        }
      });

      heatLayer.addTo(mapInstance);
    }
  }, [backendResponse, latLon, mapInstance]);

  return (
    <div className="map-container">
      <h2 className="map-title">World Map Climate Viewer</h2>

      {/* Input fields */}
      <div className="input-container">
        <input
          type="text"
          value={locationName}
          placeholder="Enter location name"
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
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Coordinates display */}
      {latLon && (
        <div className="coordinates">
          <strong>Latitude:</strong> {latLon.lat} &nbsp; | &nbsp;
          <strong>Longitude:</strong> {latLon.lon}
        </div>
      )}

      {/* Map */}
      <div className="map-box">
        <MapContainer
          center={coords}
          zoom={6}
          style={{ height: "500px", width: "100%" }}
          whenCreated={setMapInstance}
        >
          <ChangeView center={coords} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={coords}>
            <Popup>{locationName || "Center of the world 🌍"}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Climate data box */}
      {backendResponse && (
        <div className="climate-box">
          <h3>Climate Data for {locationName}</h3>

          <div className="climate-section">
            <h4>🌡 Current Metrics</h4>
            <p><strong>Avg Temperature:</strong> {backendResponse.currentMetrics?.avgTemperature || "-" } °C</p>
            <p><strong>Total Precipitation:</strong> {backendResponse.currentMetrics?.totalPrecipitation || "-" } mm</p>
            <p><strong>Avg Precipitation:</strong> {backendResponse.currentMetrics?.avgPrecipitation || "-" } mm/day</p>
            <p><strong>Days Above 15°C:</strong> {backendResponse.currentMetrics?.daysAbove15C || "-" }</p>
            <p><strong>Days With Rain:</strong> {backendResponse.currentMetrics?.daysWithRain || "-" }</p>
          </div>

          <div className="climate-section">
            <h4>📜 Historical Metrics</h4>
            <p><strong>Avg Temperature:</strong> {backendResponse.historicalMetrics?.avgTemperature || "-" } °C</p>
            <p><strong>Total Precipitation:</strong> {backendResponse.historicalMetrics?.totalPrecipitation || "-" } mm</p>
            <p><strong>Avg Precipitation:</strong> {backendResponse.historicalMetrics?.avgPrecipitation || "-" } mm/day</p>
            <p><strong>Days Above 15°C:</strong> {backendResponse.historicalMetrics?.daysAbove15C || "-" }</p>
            <p><strong>Days With Rain:</strong> {backendResponse.historicalMetrics?.daysWithRain || "-" }</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;

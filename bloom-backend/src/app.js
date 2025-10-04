import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import nasaAPI from "./config/nasaApi.js"; // your existing NASA API file
import { getObservations } from "./controller/iNaturalistcontroller.js";
import { getHistoricalNDVI } from "./controller/ndvicontroller.js";
import { getGLOBEObservations } from "./controller/globecontroller.js";
import { getBloomStatus } from "./controller/bloomcontroller.js";
dotenv.config();

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("NASA + iNaturalist API Server is running.");
});


// ============================================
// ROUTES
// ============================================

// Health check
app.get("/", (req, res) => {
  res.send({ status: "API running" });
});

// Get climate data
app.post("/climate", async (req, res) => {
  try {
    const { startDate, endDate, lat, lon } = req.body;
    const data = await nasaAPI.fetchClimateData(startDate, endDate, lat, lon);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get NDVI historical data returns NDVI and EVI
app.post("/ndvi", getHistoricalNDVI);

// Bloom status
app.post("/bloom-status", getBloomStatus);

// GLOBE observations
app.post("/globe", getGLOBEObservations);

// iNaturalist Observations
app.post("/inaturalist", getObservations );

export default app;
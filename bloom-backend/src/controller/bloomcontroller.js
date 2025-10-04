import { fetchClimateData, fetchHistoricalNDVI, calculateClimateMetrics } from "../config/nasaApi.js";
import { formatDateToMDY, shiftDate } from "../utils/utils.js";
import { fetchObservations } from "../config/iNaturalistApi.js";
import { processObservations } from "./iNaturalistcontroller.js";
import { fetchSpeciesDetails } from "../config/geminiApi.js";

export async function getBloomStatus(req, res) {
  try {
    const { startDate, endDate, lat, lon, locationName } = req.body;

    const years = Array.from({ length: 7 }, (_, i) => new Date(endDate).getFullYear() - i).reverse();

    // Run APIs concurrently
    const [
      currentClimate,
      historicalClimate,
      {data: ndviData , tiffUrl},
      observations
    ] = await Promise.all([
      fetchClimateData(shiftDate(startDate, 30), endDate, lat, lon),
      fetchClimateData(shiftDate(startDate, 30 + 365), shiftDate(endDate, 365), lat, lon),
      fetchHistoricalNDVI(formatDateToMDY(startDate), formatDateToMDY(endDate), lat, lon, locationName),
      fetchObservations({
        lat,
        lon,
        radius: 10,
        startDate,
        endDate,
        years
      })
    ]);

    // Climate metrics
    const currentMetrics = calculateClimateMetrics(currentClimate);
    const historicalMetrics = calculateClimateMetrics(historicalClimate);

    // NDVI average & trend
    if (!Array.isArray(ndviData)) {
      console.error("NDVI data is not an array:", ndviData);
      throw new Error("Invalid NDVI data format");
    }

    const avgNDVI =
      ndviData.length > 0
        ? ndviData.reduce((sum, d) => sum + (d.ndvi || 0), 0) / ndviData.length
        : 0;
    const ndviTrend = ndviData.map(d => ({ date: d.date, value: d.ndvi }));

    // Species processing
    const processedSpecies = processObservations(observations, years);
    const topSpecies = processedSpecies.slice(0, 10);

    // Bloom decision scoring
    let score = 0;
    if (currentMetrics.avgTemperature > historicalMetrics.avgTemperature + 1) score += 2;
    else if (currentMetrics.avgTemperature > historicalMetrics.avgTemperature) score += 1;
    else score -= 1;

    if (currentMetrics.totalPrecipitation >= historicalMetrics.totalPrecipitation * 0.8 &&
        currentMetrics.totalPrecipitation <= historicalMetrics.totalPrecipitation * 1.2) {
      score += 1;
    } else {
      score -= 1;
    }

    if (avgNDVI > 0.6) score += 3;
    else if (avgNDVI > 0.4) score += 1;
    else score -= 1;

    if (ndviData && ndviData.length >= 3) {
      const last3 = ndviData.slice(-3).map(d => d.ndvi);
      if (last3[2] > last3[1] && last3[1] > last3[0]) score += 2;
      else if (last3[2] < last3[1]) score -= 1;
    }

    const tempAnomaly = currentMetrics.avgTemperature - historicalMetrics.avgTemperature;
    const precipAnomaly = currentMetrics.totalPrecipitation - historicalMetrics.totalPrecipitation;
    if (Math.abs(tempAnomaly) < 2 && Math.abs(precipAnomaly) < 20) score += 1;

    // Bloom status
    let bloomStatus = "Unlikely to Bloom";
    let confidence = 0;
    if (score >= 5) {
      bloomStatus = "Likely to Bloom";
      confidence = 80 + score * 3;
    } else if (score >= 3) {
      bloomStatus = "Possibly Blooming";
      confidence = 50 + score * 2;
    } else {
      bloomStatus = "Unlikely to Bloom";
      confidence = 30 + score * 2;
    }

    // FIRST species or fallback to Gemini AI famous bloom
    let firstSpecies = topSpecies[0] || null;

    if (firstSpecies && firstSpecies.common_name) {
      const details = await fetchSpeciesDetails(firstSpecies.common_name);
      firstSpecies.details = details;
    } else {
      const details = await fetchSpeciesDetails("", lat, lon); // ask Gemini AI for famous bloom
      firstSpecies = {
        id: null,
        name: "Famous Flowering Plant",
        common_name: "Unknown",
        years: [],
        count: 0,
        photos: [],
        details
      };
    }

    const response = {
      success: true,
      bloomStatus,
      confidence: Math.min(confidence, 100),
      currentMetrics,
      historicalMetrics,
      avgNDVI,
      ndviTrend,
      score,
      tiffUrl,
      topSpecies: [firstSpecies]
    };

    res.json(response);

  } catch (error) {
    console.error("Error in getBloomStatus:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

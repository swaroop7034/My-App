import * as nasaApi from "../config/nasaApi.js";
import { formatDateToMDY } from "../utils/utils.js";

export async function getHistoricalNDVI(req, res) {
  try {
    const { startDate, endDate, lat, lon, locationName} = req.body;

    const start = formatDateToMDY(startDate);
    const end = formatDateToMDY(endDate);

    if (!locationName || !lat || !lon || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const data = await nasaApi.fetchHistoricalNDVI(start, end, lat, lon, locationName);
    res.json(data);
  } catch (err) {
    console.error("NDVI fetch error:", err);
    res.status(500).json({ error: err.message });
  }
}

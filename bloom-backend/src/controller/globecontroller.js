import { fetchGLOBEObservations } from "../config/nasaApi.js";
import { radiusToBBox } from "../utils/utils.js";
export async function getGLOBEObservations(req, res) {
  try {
    const { startDate, endDate, lat, lon, radius } = req.body;

    let bbox = null;
    if (lat && lon && radius) {
      bbox = radiusToBBox(lat, lon, radius);
    }

    const data = await fetchGLOBEObservations(startDate, endDate, lat, lon, bbox);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in getGLOBEObservations:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

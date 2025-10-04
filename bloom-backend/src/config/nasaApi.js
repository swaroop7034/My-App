import { parse } from "csv-parse/sync";   // npm install csv-parse
import GeoTIFF from "geotiff";           // npm install geotiff
import fetch from "node-fetch";
import dotenv from "dotenv";
import { radiusToBBox } from "../utils/utils.js";

dotenv.config();

// ============================================
// NASA EARTHDATA CREDENTIALS
// ============================================
const NASA_USERNAME = process.env.NASA_USERNAME ;
const NASA_PASSWORD = process.env.NASA_PASSWORD ;
// ============================================
// 2. NASA POWER API (Climate Data - No Auth)
// ============================================

/**
 * Fetch climate data (temperature, precipitation) for bloom prediction
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} startDate - Format: YYYYMMDD
 * @param {string} endDate - Format: YYYYMMDD
 * @returns {Promise<Object>} Climate data
 */
export async function fetchClimateData(startDate, endDate, lat, lon) {

  const start = startDate.replace(/-/g,"");;
  const end = endDate.replace(/-/g,"");
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?` +
    `parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR&` +
    `community=AG&` +
    `longitude=${lon}&` +
    `latitude=${lat}&` +
    `start=${start}&` +
    `end=${end}&` +
    `format=JSON`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`POWER API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      location: { lat, lon },
      dateRange: { start: startDate, end: endDate },
      temperature: data.properties.parameter.T2M,
      temperatureMax: data.properties.parameter.T2M_MAX,
      temperatureMin: data.properties.parameter.T2M_MIN,
      precipitation: data.properties.parameter.PRECTOTCORR
    };
  } catch (error) {
    console.error('Error fetching POWER API data:', error);
    throw error;
  }
}

// ============================================
// 3. NASA AppEEARS API (NDVI Time Series)
// ============================================

const APPEEARS_BASE = "https://appeears.earthdatacloud.nasa.gov/api";

/**
 * Get authentication token for AppEEARS
 */
export async function getAppEEARSToken() {
  if (!NASA_USERNAME || !NASA_PASSWORD) {
    throw new Error("NASA_USERNAME and NASA_PASSWORD must be set in .env");
  }
  const username = NASA_USERNAME;
  const password = NASA_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  const response = await fetch(`${APPEEARS_BASE}/login`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`
    }
  });


  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AppEEARS login failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Submit NDVI data extraction task to AppEEARS
 */
export async function submitNDVITask(startDate, endDate, lat, lon, locationName) {
  const token = await getAppEEARSToken();
  
  const taskRequest = {
    task_type: "point",
    task_name: `bloom_${locationName}_${Date.now()}`,
    params: {
      dates: [
        {
          startDate: startDate,
          endDate: endDate
        }
      ],
      layers: [
        {
          product: "MOD13Q1.061",
          layer: "_250m_16_days_NDVI"
        },
        {
          product: "MOD13Q1.061",
          layer: "_250m_16_days_EVI"
        }
      ],
      coordinates: [  
        {
          id: locationName,
          latitude: lat,
          longitude: lon,
          category: "bloom_location"
        }],
        outputs: [
          {
            file_type: "csv",
            projection_name: "geographic"
          },
          {
            file_type: "geotiff",
            projection_name: "geographic"
          }
        ]
    }
  };

  const response = await fetch(`${APPEEARS_BASE}/task`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(taskRequest)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AppEEARS task submission failed: ${errorText}`);
  }

  const result = await response.json();
  return {
    taskId: result.task_id,
    token: token
  };
}

/**
 * Check AppEEARS task status
 */
export async function checkTaskStatus(taskId, token) {
  const response = await fetch(`${APPEEARS_BASE}/task/${taskId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to check task status: ${response.status}`);
  }

  const data = await response.json();
  return data.status; // "pending", "processing", "done", "error"
}

/**
 * Download completed NDVI data
 */
export async function downloadNDVIData(taskId, token) {
  // First get the bundle (list of files)
  const bundleResponse = await fetch(`${APPEEARS_BASE}/bundle/${taskId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!bundleResponse.ok) {
    throw new Error(`Failed to get bundle: ${bundleResponse.status}`);
  }

  const bundle = await bundleResponse.json();
  
  // Find the CSV file with NDVI data
  const csvFile = bundle.files.find(f => f.file_name.includes('.csv'));
  
  if (!csvFile || !csvFile.file_id) {
    console.error("Bundle files:", bundle.files);
    throw new Error("No CSV file found in task results");
  }

  // Download the CSV
  const dataResponse = await fetch(
    `${APPEEARS_BASE}/bundle/${taskId}/${csvFile.file_id}`,
    { 
      headers: { "Authorization": `Bearer ${token}` } 
    }
  );

  if (!dataResponse.ok) {
    throw new Error(`Failed to download data: ${dataResponse.status}`);
  }

  const csvText = await dataResponse.text();

  // Parse CSV into structured data using csv-parse
  const records = parse(csvText, { 
    columns: true, 
    skip_empty_lines: true,
    trim: true
  });

  const data = records.map(row => ({
    date: row["Date"],
    ndvi: parseFloat(row["MOD13Q1_061__250m_16_days_NDVI"]),
    evi: parseFloat(row["MOD13Q1_061__250m_16_days_EVI"])
  }));

  // Find GeoTIFF file
  const tiffFile = bundle.files.find(f => f.file_name.includes(".tif"));
  let tiffUrl = null;

  if (tiffFile && tiffFile.file_id) {
    tiffUrl = `${APPEEARS_BASE}/bundle/${taskId}/${tiffFile.file_id}`;
  }

  return { data, tiffUrl };
}

/**
 * Complete workflow: Submit task, poll status, download data
 */
export async function fetchHistoricalNDVI(startDate, endDate, lat, lon, locationName) {
  console.log(`Fetching NDVI for ${locationName}...`);
  
  // Submit task
  const { taskId, token } = await submitNDVITask(startDate, endDate, lat, lon, locationName);
  console.log(`Task submitted: ${taskId}`);
  
  // Poll status every 10 seconds
  let status = "pending";
  let attempts = 0;
  while (status !== "done" && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 20000));
    status = await checkTaskStatus(taskId, token);
    console.log(`Task status: ${status}`);
    attempts++;
    
    if (status === "error") {
      throw new Error("Task failed");
    }
  }
    return await downloadNDVIData(taskId, token);
}

// ============================================
// 4. GLOBE Observer API (Citizen Science)
// ============================================

/**
 * Fetch citizen science bloom observations from GLOBE
 */
export async function fetchGLOBEObservations(startDate, endDate, lat, lon, radius = 30) {

  const bbox = radiusToBBox(lat, lon, radius);

  let url = `https://api.globe.gov/search/v1/measurement/protocol/measureddate/?` +
    `protocols=land_covers&` +
    `startdate=${startDate}&` +
    `enddate=${endDate}&` +
    `geojson=TRUE&sample=TRUE&` +
    `bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/stream+json" // Ensures proper JSON parsing
      }
    });

    if (!response.ok) {
      throw new Error(`GLOBE API error: ${response.status}`);
    }

    const data = await response.json();

    return data.features.map(obs => ({
      id: obs.properties.measurementId,
      date: obs.properties.measuredDate,
      location: {
        lat: obs.geometry.coordinates[1],
        lon: obs.geometry.coordinates[0]
      },
      landCover: obs.properties.landCoverClassifications,
      comments: obs.properties.comments || obs.properties.landcoversFieldNotes || "",
      photoUrls: [
        obs.properties.landcoversDownwardPhotoUrl,
        obs.properties.landcoversEastPhotoUrl,
        obs.properties.landcoversNorthPhotoUrl,
        obs.properties.landcoversSouthPhotoUrl,
        obs.properties.landcoversWestPhotoUrl,
        obs.properties.landcoversUpwardPhotoUrl
      ].filter(url => url && url !== "null") // remove empty or null URLs
    }));
  } catch (error) {
    console.error('Error fetching GLOBE data:', error);
    return [];
  }
}

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

/**
 * Format date for API calls
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatDateCompact(date) {
  return date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
}

/**
 * Get date range for historical comparison
 */
export function getDateRange(daysBack = 30) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysBack);
  
  return {
    start: formatDate(start),
    end: formatDate(end),
    startCompact: formatDateCompact(start),
    endCompact: formatDateCompact(end)
  };
}

/**
 * Get same period from previous year
 */
export function getPreviousYearDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  
  // Shift to previous year
  end.setFullYear(end.getFullYear() - 1);
  start.setFullYear(start.getFullYear() - 1);
  
  return {
    start: formatDate(start),
    end: formatDate(end),
    startCompact: formatDateCompact(start),
    endCompact: formatDateCompact(end)
  };
}

/**
 * Calculate average climate metrics for bloom analysis need to move to controller
 */
export function calculateClimateMetrics(climateData) {
  const temps = Object.values(climateData.temperature).filter(v => v !== -999);
  const precip = Object.values(climateData.precipitation).filter(v => v !== -999);
  
  return {
    avgTemperature: temps.reduce((a, b) => a + b, 0) / temps.length,
    totalPrecipitation: precip.reduce((a, b) => a + b, 0),
    avgPrecipitation: precip.reduce((a, b) => a + b, 0) / precip.length,
    daysAbove15C: temps.filter(t => t > 15).length,
    daysWithRain: precip.filter(p => p > 0).length
  };
}
export default {
  fetchClimateData,
  calculateClimateMetrics,
  fetchHistoricalNDVI,
  fetchGLOBEObservations,
  formatDate,
  formatDateCompact,
  getDateRange,
  getPreviousYearDateRange
};
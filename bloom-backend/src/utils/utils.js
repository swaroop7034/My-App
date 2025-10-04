function radiusToBBox(lat, lon, radiusKm) {
  const earthRadiusKm = 6371;

  const latDiff = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lonDiff = (radiusKm / earthRadiusKm) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

  return {
    minLat: lat - latDiff,
    maxLat: lat + latDiff,
    minLon: lon - lonDiff,
    maxLon: lon + lonDiff
  };
}

// Convert YYYY-MM-DD → MM-DD-YYYY
function formatDateToMDY(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${month}-${day}-${year}`;
}


export function shiftDate(dateStr, daysBack) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

export { radiusToBBox, formatDateToMDY };
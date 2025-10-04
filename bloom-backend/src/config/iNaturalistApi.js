import fetch from "node-fetch";

const BASE_URL = "https://api.inaturalist.org/v1";

export async function fetchObservations({ lat, lon, radius = 50, startDate, endDate, years }) {
  let allObservations = [];

  for (let year of years) {
    const start = startDate.replace(/^\d{4}/, year);
    const end = endDate.replace(/^\d{4}/, year);

    const url = new URL(`${BASE_URL}/observations`);
    url.searchParams.append("lat", lat);
    url.searchParams.append("lng", lon);
    url.searchParams.append("radius", radius);
    url.searchParams.append("d1", start);
    url.searchParams.append("d2", end);
    url.searchParams.append("per_page", 200);
    url.searchParams.append("order", "desc");
    url.searchParams.append("order_by", "observed_on");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`iNaturalist API error: ${res.statusText}`);
    const data = await res.json();

    allObservations.push(...data.results);
  }

  return allObservations;
}

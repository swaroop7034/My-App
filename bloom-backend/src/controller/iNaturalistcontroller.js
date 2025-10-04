import { fetchObservations } from "../config/iNaturalistApi.js";

export function processObservations(observations, years) {
  const speciesMap = new Map();

  observations.forEach(obs => {
    const year = new Date(obs.observed_on).getFullYear();
    if (!years.includes(year)) return;

    if (!obs.taxon?.id || !obs.taxon?.preferred_common_name) return;

    const commonName = obs.taxon.preferred_common_name.trim();
    if (!commonName) return; // skip if no common name

    // ✅ Filter to only Flowering plants
     if (obs.taxon.iconic_taxon_name !== "Plantae") return;
    if (obs.taxon.rank !== "species") return;
    if (!obs.taxon?.taxon_schemes?.some(s => s.name.toLowerCase().includes("angiosperm"))) return;

    const id = obs.taxon.id;
    if (!speciesMap.has(id)) {
      speciesMap.set(id, {
        id,
        name: obs.taxon.name,
        common_name: commonName,
        years: [],
        count: 0,
        photos: []
      });
    }

    const speciesData = speciesMap.get(id);
    if (!speciesData.years.includes(year)) {
      speciesData.years.push(year);
      speciesData.count++;
    }

    const photoUrl = obs.photos?.[0]?.url?.replace("square", "medium");
    if (photoUrl && !speciesData.photos.includes(photoUrl)) {
      speciesData.photos.push(photoUrl);
    }
  });

  speciesMap.forEach(s => {
    s.priority = s.photos.length;
  });

  let sortedSpecies = Array.from(speciesMap.values());

  // Sort by count descending, then priority descending
  sortedSpecies.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.priority - a.priority;
  });

  return sortedSpecies;
}

// Express Controller
export async function getObservations(req, res) {
  try {
    const { lat, lon, radius, startDate, endDate } = req.body;

    if (!lat || !lon || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }

    const baseYear = new Date(endDate).getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => baseYear - i).reverse();

    const observations = await fetchObservations({
      lat,
      lon,
      radius,
      startDate,
      endDate,
      years
    });

    const processed = processObservations(observations, years);

    res.json({
      success: true,
      yearsAnalyzed: years,
      topSpecies: processed.slice(0, 10) // return top 10 species
    });
  } catch (err) {
    console.error("iNaturalist error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export default { getObservations };
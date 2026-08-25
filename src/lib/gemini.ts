export interface CityItem {
  name: string;
  country: string;
  region: "Europe" | "Asia & Middle East" | "Americas" | "Africa & Oceania";
  tagline: string;
  rating?: number;
}

export const CITIES_DATA: CityItem[] = [
  // Europe
  { name: "Rome", country: "Italy", region: "Europe", tagline: "The Eternal City: gladiators, baroque fountains & pasta" },
  { name: "Lisbon", country: "Portugal", region: "Europe", tagline: "Sun-drenched hills, pastéis & fado alleys" },
  { name: "Athens", country: "Greece", region: "Europe", tagline: "Ancient cradle of democracy & rooftop vistas" },
  { name: "Vienna", country: "Austria", region: "Europe", tagline: "Imperial palaces, grand cafes & classical melody" },
  { name: "Paris", country: "France", region: "Europe", tagline: "Haussmannian boulevards, haute cuisine & art meccas" },
  { name: "Barcelona", country: "Spain", region: "Europe", tagline: "Gaudí masterpieces, Mediterranean beaches & tapas bars" },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", tagline: "Canal rings, Golden Age masters & cycling culture" },
  { name: "Prague", country: "Czech Republic", region: "Europe", tagline: "City of a Hundred Spires, gothic castles & pilsner" },
  { name: "Berlin", country: "Germany", region: "Europe", tagline: "Dynamic counter-culture, techno clubs & historic icons" },
  { name: "Budapest", country: "Hungary", region: "Europe", tagline: "Thermal baths, grand Danube panoramas & ruin bars" },
  { name: "Madrid", country: "Spain", region: "Europe", tagline: "Royal palaces, Golden Art Triangle & lively plazas" },
  { name: "Florence", country: "Italy", region: "Europe", tagline: "Renaissance treasures, Duomo views & Tuscan truffles" },
  { name: "Venice", country: "Italy", region: "Europe", tagline: "Floating labyrinth, gondola canals & Byzantine marble" },
  { name: "Edinburgh", country: "Scotland", region: "Europe", tagline: "Volcanic castle crags, medieval closes & whisky vaults" },
  { name: "Dublin", country: "Ireland", region: "Europe", tagline: "Georgian doors, literary giants & lively pub sessions" },
  { name: "Copenhagen", country: "Denmark", region: "Europe", tagline: "Nordic gastronomy, hygge harbors & modern design" },
  { name: "Stockholm", country: "Sweden", region: "Europe", tagline: "Archipelago islands, Gamla Stan & regal waterways" },
  { name: "Oslo", country: "Norway", region: "Europe", tagline: "Fjord-edge saunas, Munch galleries & sleek architecture" },
  { name: "Helsinki", country: "Finland", region: "Europe", tagline: "Art nouveau streets, sea fortresses & sauna culture" },
  { name: "Warsaw", country: "Poland", region: "Europe", tagline: "Resilient historic center, Chopin parks & modern energy" },
  { name: "London", country: "United Kingdom", region: "Europe", tagline: "West End theaters, royal parks & multicultural cuisine" },
  { name: "Seville", country: "Spain", region: "Europe", tagline: "Flamenco roots, Alcázar tiles & orange blossom courtyards" },
  { name: "Porto", country: "Portugal", region: "Europe", tagline: "Terraced vineyards, azulejo facades & Douro riverfront" },
  { name: "Munich", country: "Germany", region: "Europe", tagline: "Bavarian beer gardens, alpine gateways & royal halls" },
  { name: "Dubrovnik", country: "Croatia", region: "Europe", tagline: "Adriatic stone ramparts, terracotta roofs & sea cliffs" },
  { name: "Reykjavik", country: "Iceland", region: "Europe", tagline: "Geothermal springs, midnight sun & aurora skies" },

  // Asia & Middle East
  { name: "Tokyo", country: "Japan", region: "Asia & Middle East", tagline: "Futuristic neon, ancient shrines & Michelin culinary wizardry" },
  { name: "Kyoto", country: "Japan", region: "Asia & Middle East", tagline: "Thousand-gate shrines, zen rock gardens & geisha districts" },
  { name: "Seoul", country: "South Korea", region: "Asia & Middle East", tagline: "K-culture vanguard, royal palaces & 24hr street markets" },
  { name: "Bangkok", country: "Thailand", region: "Asia & Middle East", tagline: "Gilded temples, street-food legends & floating markets" },
  { name: "Singapore", country: "Singapore", region: "Asia & Middle East", tagline: "Futuristic supertrees, botanic reserves & hawker feasts" },
  { name: "Taipei", country: "Taiwan", region: "Asia & Middle East", tagline: "Night market culinary hubs, misty tea mountains & temples" },
  { name: "Hong Kong", country: "China", region: "Asia & Middle East", tagline: "Victoria Harbour skyline, dim sum teahouses & harbor ferries" },
  { name: "Dubai", country: "United Arab Emirates", region: "Asia & Middle East", tagline: "Skyline marvels, luxury deserts & gold souks" },
  { name: "Istanbul", country: "Turkey", region: "Asia & Middle East", tagline: "Bosphorus straits, Byzantine domes & spice bazaar aromas" },
  { name: "Hanoi", country: "Vietnam", region: "Asia & Middle East", tagline: "Old Quarter alleys, French-colonial villas & egg coffee" },
  { name: "Bali (Denpasar)", country: "Indonesia", region: "Asia & Middle East", tagline: "Sacred sea temples, emerald rice terraces & ocean breaks" },

  // Americas
  { name: "Montreal", country: "Canada", region: "Americas", tagline: "Cobblestone charm, bilingual festival culture & bagels" },
  { name: "New York City", country: "United States", region: "Americas", tagline: "Broadway stages, Central Park vistas & borough culture" },
  { name: "San Francisco", country: "United States", region: "Americas", tagline: "Golden Gate mists, historic cable cars & bay seafood" },
  { name: "Vancouver", country: "Canada", region: "Americas", tagline: "Coastal rainforests, mountain horizons & Pacific dining" },
  { name: "Mexico City", country: "Mexico", region: "Americas", tagline: "Aztec ruins, muralist art & culinary street royalty" },
  { name: "Buenos Aires", country: "Argentina", region: "Americas", tagline: "Tango saloons, belle-époque mansions & world-class steakhouses" },
  { name: "Rio de Janeiro", country: "Brazil", region: "Americas", tagline: "Copacabana waves, Corcovado peaks & samba rhythms" },
  { name: "Cusco", country: "Peru", region: "Americas", tagline: "Incan stone masonry, Andean textiles & Sacred Valley gateway" },
  { name: "Chicago", country: "United States", region: "Americas", tagline: "Architectural river cruises, deep-dish pizza & jazz clubs" },

  // Africa & Oceania
  { name: "Cape Town", country: "South Africa", region: "Africa & Oceania", tagline: "Table Mountain summits, penguin coves & Cape winelands" },
  { name: "Marrakech", country: "Morocco", region: "Africa & Oceania", tagline: "Jemaa el-Fnaa medina, riad courtyards & cedar spice souks" },
  { name: "Cairo", country: "Egypt", region: "Africa & Oceania", tagline: "Giza pyramids, Nile feluccas & Grand Egyptian Museum" },
  { name: "Sydney", country: "Australia", region: "Africa & Oceania", tagline: "Opera House sails, Bondi ocean pools & coastal walks" },
  { name: "Melbourne", country: "Australia", region: "Africa & Oceania", tagline: "Laneway street art, artisan coffee culture & Victorian arcades" },
  { name: "Auckland", country: "New Zealand", region: "Africa & Oceania", tagline: "Harbor volcanoes, Polynesian art & Hauraki wine escapes" },
];

export const CITIES = CITIES_DATA.map((c) => c.name);

const GUIDE_PROXY_URL = "https://gemini-proxy-boldstudio.vercel.app/api/authority-guide";

export async function generateGuide(city: string): Promise<string> {
  try {
    const response = await fetch(GUIDE_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.content || "";
  } catch (error) {
    console.error(`Error generating guide for ${city}:`, error);
    throw error;
  }
}

import { GoogleGenAI } from "@google/genai";

// Helper to initialize Gemini client safely
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

// Master prompt builder
export function buildGuidePrompt(city: string): string {
  return `
You are an Elite Travel Editor, Local Historian, and Master Guide Writer for Travel Blueprint & Curated Editorial Archive (Level 9 Local Guide Authority).
Season Context: Spring 2026.

Write a complete, bespoke, and deeply actionable destination travel guide for **${city}** that answers EVERY realistic question a traveler has before visiting.

CRITICAL INSTRUCTIONS:
1. HEADINGS MUST BE BESPOKE & EVOCATIVE: Do NOT use cookie-cutter, repetitive headings like "Best Time to Visit ${city}" or "Neighborhoods in ${city}". Write tailored headings reflecting ${city}'s specific landmarks, geography, cuisine, seasons, and personality.
2. FAQS MUST BE 100% SPECIFIC TO ${city}: DO NOT write generic FAQ questions (like "Is it safe" or "Why hire a guide"). Write 5 REAL, highly searched, city-specific questions.

Formatting Rules:
- Use semantic HTML <h2> tags for the 10 main section headings.
- Use semantic HTML <h3> tags for sub-sections, neighborhood titles, itinerary days, and FAQ questions.
- Use clean HTML <p> tags for paragraphs, <ul>/<li> for bullet lists, <blockquote> for editorial pullouts, and <strong> for bold highlights.
- Seamlessly incorporate the target semantic entities: "Precipitation", "Shoulder Season", "Peak Tourist Density", "Accommodation Cost Surges", "Neighborhoods", "Culinary", "Museum Passes", "Transit Logistics".
- Do NOT use placeholder brackets like [City Name]. Always explicitly use "${city}".

Structure Requirements:

1. Summary & Essential Quick Facts (The TL;DR)
<p><strong>Discover</strong> ${city} through the eyes of an insider. (Write a 2-sentence punchy, evocative opening hook starting with the verb Discover or Explore, capturing what makes ${city} unique in 2026).</p>
<p>
<strong>Primary Language:</strong> [Specific primary language and English proficiency in ${city}]<br>
<strong>Local Currency:</strong> [Specific local currency name & symbol]<br>
<strong>Ideal Length of Stay:</strong> [Specific recommended duration, e.g. 4 to 5 Days]<br>
<strong>Walkability Score:</strong> [Score out of 10 and terrain commentary]<br>
<strong>Signature Experience:</strong> [A singular, unforgettable must-do local experience in ${city}]
</p>

2. <h2>[Bespoke heading on ${city}'s seasons & crowds, e.g. "When to Experience ${city}: Sweet Spot Months, Precipitation & Evading Summer Density"]</h2>
<p>Write an in-depth breakdown of the "Sweet Spot" travel months. Discuss the winter-to-spring Shoulder Season transition, exact monthly precipitation benchmarks (average mm and rain days per month), temperatures in °C and °F, daylight hours, and tactical strategies to evade peak tourist density.</p>

3. <h2>[Bespoke heading on ${city}'s quarters, e.g. "From Historic Cobblestones to Bohemian Alleys: The Best ${city} Neighborhoods & Where to Stay"]</h2>
<p>Provide a curated breakdown of 4 to 5 distinct quarters/districts in ${city}.</p>
For EACH neighborhood, use:
<h3>[Neighborhood Name] — [Evocative Vibe / Personality]</h3>
<p><strong>Atmosphere & Vibe:</strong> Detailed description of street life, architecture, cafes, and energy.</p>
<p><strong>Best For:</strong> [First-time visitors, Foodies, Nightlife lovers, Families, Couples, Boutique lovers]</p>
<p><strong>Where to Stay:</strong>
<ul>
<li><strong>Luxury:</strong> [Specific top-tier hotel in ${city}]</li>
<li><strong>Mid-Range Boutique:</strong> [Specific character-rich boutique hotel in ${city}]</li>
<li><strong>Budget / Value:</strong> [Specific stylish value hotel or design hostel in ${city}]</li>
</ul>
</p>

4. <h2>[Bespoke heading on ${city}'s landmarks & arts, e.g. "Iconic Monuments, Secret Courtyards & World-Class Museums: ${city}'s Cultural Treasures"]</h2>
<p>Detail the top 6 must-visit cultural sights, historic monuments, architectural wonders, and museums in ${city}.</p>
<p>For each major attraction, provide insider advice on:
<ul>
<li>Timed-entry reservations, booking windows, and discount passes (e.g. city museum pass).</li>
<li>Best times of day to beat crowds and optimal photography viewpoints.</li>
<li>Hidden gems located within walking distance that most tourists overlook.</li>
</ul>
</p>

5. <h2>[Bespoke heading on ${city}'s culinary soul, e.g. "Wood-Fired Bakeries, Historic Food Markets & Petiscos: ${city}'s Gastronomic Capital"]</h2>
<p>Explore the culinary identity of ${city}:</p>
<ul>
<li><strong>Must-Try Signature Dishes:</strong> 4 iconic dishes/treats you must taste with mouthwatering descriptions.</li>
<li><strong>Signature Drinks & Beverages:</strong> Local craft beers, regional wines, cocktails, coffees, or special drinks.</li>
<li><strong>Historic Markets & Dining Quarters:</strong> The premier public food markets, dining alleys, and traditional institutions.</li>
<li><strong>Dining Etiquette & Tipping:</strong> Typical gratuity percentages, dining hours, reservation requirements, and average meal costs.</li>
</ul>

6. <h2>[Bespoke heading for the master itinerary, e.g. "The Curated 3-Day & 5-Day Blueprint: Maximizing Every Moment in ${city}"]</h2>
<p>A step-by-step master plan with morning, afternoon, evening recommendations, and seamless transport & cafe pitstops between activities:</p>
<h3>Day 1: Historic Foundations, Iconic Landmarks & Sunset Panoramas</h3>
<p><strong>Morning:</strong> Specific morning sights, breakfast bakery, and starting walking route.<br>
<strong>Midday Transit & Cafe Pitstop:</strong> 🚇 <em>Transit:</em> Specific metro line, tram route, or scenic walking route to connect quarters. • ☕ <em>Cafe / Lunch:</em> Specific named cafe or bistro with signature item to order.<br>
<strong>Afternoon:</strong> Key museum or historic quarter exploration with optimal timed-entry advice.<br>
<strong>Evening Transit & Aperitivo:</strong> 🚋 <em>Transit:</em> Transit connection to evening quarter. • 🍷 <em>Golden Hour / Drink:</em> Specific named terrace, wine bar, or scenic lookout.<br>
<strong>Evening:</strong> Atmospheric dinner at a specific named local institution and evening stroll.</p>

<h3>Day 2: Arts, Cultural Quarters & Local Food Trail</h3>
<p><strong>Morning:</strong> Artisan bakeries, indie boutiques, and morning cultural sight.<br>
<strong>Midday Transit & Cafe Pitstop:</strong> 🚇 <em>Transit:</em> Specific transit connection/bus/metro. • ☕ <em>Cafe / Lunch:</em> Named specialty coffee bar or market food stall.<br>
<strong>Afternoon:</strong> Public market food tasting, street art quarter, or scenic park stroll.<br>
<strong>Evening Transit & Aperitivo:</strong> 🚋 <em>Transit:</em> Funicular/tram/subway route. • 🍷 <em>Aperitivo / Pastry:</em> Named craft cocktail lounge or historic tea room.<br>
<strong>Evening:</strong> Top culinary dinner institution with signature dish highlight.</p>

<h3>Day 3: Panorama Views, Hidden Alleys & Iconic Architecture</h3>
<p><strong>Morning:</strong> Scenic viewpoint summit, waterfront, or historic architectural walk.<br>
<strong>Midday Transit & Cafe Pitstop:</strong> 🚇 <em>Transit:</em> Transit advice or ferry/tram. • ☕ <em>Cafe / Lunch:</em> Named neighborhood bistro or sandwich counter.<br>
<strong>Afternoon:</strong> Off-the-beaten-path neighborhood, craft workshops, or design district.<br>
<strong>Evening Transit & Aperitivo:</strong> 🚋 <em>Transit:</em> Easy transit link. • 🍷 <em>Sunset Drinks:</em> Named rooftop bar or wine cellar.<br>
<strong>Evening:</strong> Farewell gourmet dinner and evening nightlife spot.</p>

<h3>Bonus 5-Day Extension: Top Day Trips</h3>
<p>Detail 2 to 3 incredible day trips within 1-2 hours of ${city} with exact train lines, travel duration, and highlights.</p>

7. <h2>[Bespoke heading for getting around, e.g. "Navigating ${city}: Airport Express, Public Transit & Pedestrian Routes"]</h2>
<p>Essential transportation guidance:</p>
<ul>
<li><strong>Airport & Train Station Connections:</strong> Express trains, flat-rate airport taxis, and bus routes.</li>
<li><strong>Public Transit System:</strong> How to navigate the metro, trams, and buses, including contactless payments and multi-day transit passes.</li>
<li><strong>Walkability & Bike Rentals:</strong> Pedestrian-friendly streets, elevation/hills advice, and bike-share programs.</li>
</ul>

8. <h2>[Bespoke heading for 2026 events, e.g. "Festivals, Open-Air Spectacles & Cultural Milestones: ${city} in 2026"]</h2>
<p>Write an evocative breakdown highlighting at least 3 specific annual festivals, open-air cultural spectacles, or public celebrations happening in ${city} during 2026, including their seasonal timing and cultural significance.</p>

9. <h2>[Bespoke heading for budget & travel economy, e.g. "The ${city} Travel Economy: High-Season Surges, Hotel Rates & Daily Budgets"]</h2>
<p>Detailed analysis of travel costs in ${city}:</p>
<ul>
<li><strong>Accommodation Cost Surges:</strong> Percentage price surges in hotels during peak summer and major festival periods versus the shoulder season.</li>
<li><strong>Daily Budget Tiers:</strong> Realistic daily spending per person for Budget, Mid-Range, and Luxury tiers.</li>
<li><strong>Everyday Price Benchmarks:</strong> Average costs for coffee, casual lunch, 3-course dinner with wine, and a single transit ride.</li>
</ul>

10. <h2>[Bespoke heading for FAQs, e.g. "Local Knowledge & Essential ${city} FAQs"]</h2>
Write 5 HIGHLY SPECIFIC, REAL-WORLD QUESTIONS THAT TRAVELERS ACTUALLY ASK ABOUT ${city}:
- Focus on unique city rules, language etiquette, payment habits, transport quirks, scam/safety hotspots, and seasonal tips.
- For EACH question, write:
<h3>[City-Specific Question]</h3>
<p>[Detailed, insider answer packed with concrete advice, local names, and actionable tips.]</p>

Write in a vivid, authoritative Level 9 Local Guide voice with rich cultural storytelling and practical precision.
`;
}

// Fallback guide generator in case of missing API key or offline execution
export function getFallbackGuide(city: string): string {
  return `
<p><strong>Discover</strong> ${city} through the eyes of an insider. Experience timeless architecture, rich local gastronomic traditions, and vibrant cultural quarters across the city in Spring 2026.</p>
<p>
<strong>Primary Language:</strong> Local National Language & High English Proficiency<br>
<strong>Local Currency:</strong> Local Currency<br>
<strong>Ideal Length of Stay:</strong> 4 to 5 Days<br>
<strong>Walkability Score:</strong> 8.5/10 (Extremely pedestrian-friendly historic center)<br>
<strong>Signature Experience:</strong> Exploring hidden artisan alleys, historic landmarks, and tasting authentic seasonal specialties.
</p>

<h2>When to Experience ${city}: Sweet Spot Months, Precipitation & Evading Crowds</h2>
<p>Spring (April to June) and early Autumn (September to October) represent the undisputed sweet spot for visiting ${city}. During shoulder season, temperatures range comfortably between 16°C and 23°C (61°F–73°F), with moderate rainfall averaging 45mm across 7 monthly rain days. Peak summer density surges from late June through August, driving hotel rates up by 40–60%.</p>

<h2>From Historic Quarters to Bohemian Alleys: The Best ${city} Neighborhoods & Where to Stay</h2>
<p>Discover the most evocative quarters in ${city} for every travel style:</p>

<h3>Historic Old Quarter — Timeless Charm & Cobblestones</h3>
<p><strong>Atmosphere & Vibe:</strong> Century-old architecture, lively public squares, and hidden courtyard cafes.</p>
<p><strong>Best For:</strong> First-time visitors, architecture lovers, and romantic strolls.</p>
<p><strong>Where to Stay:</strong>
<ul>
<li><strong>Luxury:</strong> Grand Heritage Palace Hotel</li>
<li><strong>Mid-Range Boutique:</strong> The Old Town Artisan Suites</li>
<li><strong>Budget / Value:</strong> City Center Design Rooms</li>
</ul>
</p>

<h3>Arts & Culture Quarter — Bohemian Boutiques & Galleries</h3>
<p><strong>Atmosphere & Vibe:</strong> Vibrant street murals, independent vinyl shops, specialty coffee roasters, and evening wine terraces.</p>
<p><strong>Best For:</strong> Foodies, creatives, and nightlife enthusiasts.</p>
<p><strong>Where to Stay:</strong>
<ul>
<li><strong>Luxury:</strong> Avant-Garde Boutique Hotel</li>
<li><strong>Mid-Range Boutique:</strong> Bohemian Loft Suites</li>
<li><strong>Budget / Value:</strong> Urban Social Hostel</li>
</ul>
</p>

<h2>Iconic Monuments, Secret Courtyards & World-Class Museums: ${city}'s Cultural Treasures</h2>
<p>Top cultural highlights and insider timing strategies in ${city}:</p>
<ul>
<li><strong>The Central Cathedral & Historic Basilica:</strong> Book early morning timed tickets (08:30 AM) to experience serene morning light through stained glass.</li>
<li><strong>The National Art Museum:</strong> Purchase the city museum pass in advance to skip general admission queues.</li>
<li><strong>The Historic Citadel & Viewpoint:</strong> Visit 45 minutes before sunset for 360-degree golden hour panoramas over the rooftops.</li>
</ul>

<h2>Wood-Fired Bakeries, Food Markets & Local Dishes: ${city}'s Gastronomic Soul</h2>
<p>The culinary landscape of ${city} is defined by seasonal freshness and heritage recipes:</p>
<ul>
<li><strong>Must-Try Signature Dishes:</strong> Authentic handmade local pasta/stew, artisan wood-fired pastries, regional cheese boards, and signature savory street pies.</li>
<li><strong>Signature Drinks:</strong> Regional wines, craft roasted espresso, and local botanical aperitifs.</li>
<li><strong>Historic Public Markets:</strong> Visit the central market before 11:00 AM for fresh tastings from local producers.</li>
<li><strong>Dining Etiquette & Tipping:</strong> 10% service gratuity is customary for great table service; lunch is typically served 12:30–15:00 and dinner from 19:30 onwards.</li>
</ul>

<h2>The Curated 3-Day & 5-Day Blueprint: Maximizing Every Moment in ${city}</h2>
<p>Your step-by-step master plan with seamless transit connections:</p>

<h3>Day 1: Historic Foundations, Iconic Landmarks & Sunset Panoramas</h3>
<p><strong>Morning:</strong> Begin with fresh espresso and pastries at a historic square bakery before touring the central historic cathedral.<br>
<strong>Midday Transit & Cafe Pitstop:</strong> 🚇 <em>Transit:</em> Central Metro Line 1 (10 mins) to the riverside quarter. • ☕ <em>Cafe / Lunch:</em> Artisan Kitchen for signature local lunch bowls.<br>
<strong>Afternoon:</strong> Stroll through ancient cobblestone alleys and visit the National Art & History Gallery.<br>
<strong>Evening Transit & Aperitivo:</strong> 🚋 <em>Transit:</em> Scenic tram along the waterfront. • 🍷 <em>Golden Hour / Drink:</em> Panorama Rooftop Bar for sunset spritz.<br>
<strong>Evening:</strong> Savor a candlelit dinner at a celebrated heritage bistro followed by an evening illuminated square walk.</p>

<h3>Day 2: Arts, Cultural Quarters & Local Food Trail</h3>
<p><strong>Morning:</strong> Explore boutique artisan workshops, specialty coffee roasters, and indie craft studios in the arts district.<br>
<strong>Midday Transit & Cafe Pitstop:</strong> 🚇 <em>Transit:</em> Tram Line 3 to the Central Market Hall. • ☕ <em>Cafe / Lunch:</em> Market Food Hall for freshly prepared gourmet bites.<br>
<strong>Afternoon:</strong> Taste regional specialties, visit the contemporary photography center, and stroll through the royal botanical gardens.<br>
<strong>Evening Transit & Aperitivo:</strong> 🚋 <em>Transit:</em> Short funicular or bus to the hilltop terrace. • 🍷 <em>Aperitivo / Pastry:</em> Historic Wine Cellar for regional vintage pours.<br>
<strong>Evening:</strong> Dinner at a modern farm-to-table culinary institution.</p>

<h3>Day 3: Panorama Views, Hidden Alleys & Iconic Architecture</h3>
<p><strong>Morning:</strong> Climb to the scenic hilltop citadel for sweeping morning skyline vistas over the river.<br>
<strong>Midday Transit & Cafe Pitstop:</strong> 🚇 <em>Transit:</em> Harbor ferry or scenic bus line. • ☕ <em>Cafe / Lunch:</em> Waterfront Bistro for grilled seasonal fare.<br>
<strong>Afternoon:</strong> Discover hidden cloistered courtyards and visit the design & architecture museum.<br>
<strong>Evening Transit & Aperitivo:</strong> 🚋 <em>Transit:</em> Direct metro connection back to the historic center. • 🍷 <em>Sunset Drinks:</em> Riverside Terrace for signature cocktails.<br>
<strong>Evening:</strong> Farewell multi-course tasting dinner celebrating the finest local gastronomy.</p>

<h3>Bonus 5-Day Extension: Top Day Trips</h3>
<p>Enjoy scenic day trips within 1 hour by train: picturesque medieval village valleys, coastal seaside cliffs, and historic wine estate vineyards.</p>

<h2>Navigating ${city}: Airport Express, Public Transit & Pedestrian Routes</h2>
<p>Transit advice for effortless mobility in ${city}:</p>
<ul>
<li><strong>Airport Connections:</strong> The dedicated Airport Express train connects the terminals to Central Station in 25 minutes.</li>
<li><strong>Public Transit:</strong> Modern metro, tram, and bus networks accept contactless credit card tap-to-pay on all turnstiles.</li>
<li><strong>Walkability:</strong> The central core is predominantly pedestrianized with designated bicycle lanes throughout.</li>
</ul>

<h2>Festivals, Open-Air Spectacles & Cultural Milestones in 2026</h2>
<p>Key annual highlights in 2026 include the Spring International Arts Festival (May), the Summer Open-Air Cinema & Music Series (July), and the Autumn Harvest Gastronomy Fair (October).</p>

<h2>The ${city} Travel Economy: High-Season Surges & Daily Budgets</h2>
<p>Financial benchmarks for planning your visit:</p>
<ul>
<li><strong>Accommodation Surges:</strong> Summer hotel rates peak at 35–50% above shoulder season averages.</li>
<li><strong>Daily Budget Tiers:</strong> Budget traveler: $65–$90/day; Mid-range comfort: $150–$240/day; Luxury: $450+/day.</li>
<li><strong>Everyday Benchmarks:</strong> Espresso: $2.50; Casual bistro lunch: $16; 3-course dinner with wine: $50; Transit single ticket: $2.20.</li>
</ul>

<h2>Local Knowledge & Essential ${city} FAQs</h2>

<h3>What is the most common tourist mistake in ${city}?</h3>
<p>Arriving at major historical monuments without advance timed-entry reservations during peak months, resulting in 2-hour queue delays that could easily be avoided online.</p>

<h3>How accessible is contactless payment across ${city}?</h3>
<p>Nearly 98% of businesses, taxis, and public transit turnstiles accept contactless credit cards and Apple/Google Pay, though keeping €15–20 cash for small street vendors is recommended.</p>

<h3>What is the local dining and tipping etiquette?</h3>
<p>Dinner hours start later than North American standards (typically around 19:30–20:00). A 5–10% gratuity for attentive service is appreciated but not mandatory.</p>

<h3>Is tap water safe to drink in ${city}?</h3>
<p>Yes, municipal tap water in ${city} meets top international standards and is crystal clear, safe, and delicious.</p>

<h3>What is the best way to get to day trip destinations?</h3>
<p>The national rail network is fast, clean, and punctual, with frequent departures directly from the central train station.</p>
  `;
}

// Main generation function used by both Express server and Vercel serverless functions
export async function generateDestinationGuide(city: string): Promise<{ content: string; source: "gemini" | "fallback"; warning?: string }> {
  const trimmedCity = city.trim();
  const ai = getGeminiClient();

  if (!ai) {
    console.warn(`[Guide Service] GEMINI_API_KEY is not set. Serving curated fallback guide for "${trimmedCity}".`);
    return {
      content: getFallbackGuide(trimmedCity),
      source: "fallback",
      warning: "Server is running in offline preview mode (GEMINI_API_KEY not configured in environment variables)."
    };
  }

  try {
    const prompt = buildGuidePrompt(trimmedCity);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const content = response.text || "";
    if (!content.trim()) {
      throw new Error("Empty response received from Gemini API");
    }

    return {
      content,
      source: "gemini"
    };
  } catch (error: any) {
    console.error(`[Guide Service] Gemini API generation error for "${trimmedCity}":`, error?.message || error);
    // Graceful fallback on API failure with warning
    return {
      content: getFallbackGuide(trimmedCity),
      source: "fallback",
      warning: `Gemini API call failed (${error?.message || "Check API key and quota"}). Displaying curated destination guide.`
    };
  }
}

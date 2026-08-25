import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, Calendar, Wallet, Info, Search, Menu, X, 
  ChevronRight, Copy, Download, Sparkles, CheckCircle2, 
  BarChart3, Globe, Zap, FileText, Plus, Compass, Clock, 
  Building, Utensils, Train, ShieldCheck, HelpCircle,
  Printer, Check, RefreshCw, Bookmark, Share2, Layers,
  ThermometerSun, ChevronDown, ChevronUp, Award, Eye, Code, BookOpen,
  UserCheck, AlertTriangle, Lightbulb, ThumbsUp, Coffee,
  Languages, DollarSign, Footprints, Landmark, Tag,
  ExternalLink, MessageSquare, Star, ArrowUpRight, Hash,
  Send, Users, CheckSquare, Sun, Sunset, Moon, Map, Edit3
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { generateGuide, CITIES_DATA, CityItem } from "@/lib/gemini";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HowItWorksModal } from "@/components/HowItWorksModal";

interface CachedGuides {
  [key: string]: string;
}

type RegionType = "All" | "Europe" | "Asia & Middle East" | "Americas" | "Africa & Oceania";
type ViewMode = "blog" | "blueprint" | "raw";

const REGIONS: RegionType[] = ["All", "Europe", "Asia & Middle East", "Americas", "Africa & Oceania"];

interface DaySchedule {
  title: string;
  dayNumber: number | string;
  morning?: string;
  middayTransit?: string;
  middayCafe?: string;
  afternoon?: string;
  eveningTransit?: string;
  eveningAperitivo?: string;
  evening?: string;
  rawText?: string;
}

interface ParsedFAQ {
  question: string;
  answer: string;
}

function extractSectionBlock(text: string, labelPattern: string): string {
  // Matches <strong>Morning:</strong> or <b>Morning:</b> or **Morning:** or <strong>Morning Exploration:</strong>
  const startRegexStr = `(?:<strong>|<b>|\\*\\*)\\s*(?:${labelPattern})[\\s\\S]*?(?:<\\/strong>|<\\/b>|\\*\\*)`;
  // Looks ahead only for the next known structural section label or heading or end of string
  const endRegexStr = `(?=(?:<strong>|<b>|\\*\\*)\\s*(?:Morning|Midday|Afternoon|Evening|Late Afternoon|Aperitivo|Golden Hour|Bonus|Day Trips|Day \\d+)[:<\\*]|<h[1-6]|$)`;
  
  const regex = new RegExp(`${startRegexStr}([\\s\\S]*?)${endRegexStr}`, "i");
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1]
      .replace(/^[\s:—–-]+/, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

// Parse structured Itinerary from guide
function parseItineraryFromGuide(guide: string): DaySchedule[] {
  if (!guide) return [];
  
  const schedules: DaySchedule[] = [];
  
  const dayPatterns = [
    { num: 1, regex: /<h3[^>]*>(Day 1:[^<]*)<\/h3>([\s\S]*?)(?=<h3[^>]*>Day 2|<h2|$)/i, defaultTitle: "Historic Foundations & Highlights" },
    { num: 2, regex: /<h3[^>]*>(Day 2:[^<]*)<\/h3>([\s\S]*?)(?=<h3[^>]*>Day 3|<h2|$)/i, defaultTitle: "Arts, Cultural Quarters & Food Trail" },
    { num: 3, regex: /<h3[^>]*>(Day 3:[^<]*)<\/h3>([\s\S]*?)(?=<h3[^>]*>Bonus|<h3[^>]*>Day 4|<h2|$)/i, defaultTitle: "Panorama Views & Hidden Gems" },
  ];

  for (const { num, regex, defaultTitle } of dayPatterns) {
    const match = guide.match(regex);
    if (match) {
      const text = match[2];
      const morning = extractSectionBlock(text, "Morning(?:\\s+Exploration|\\s+Highlights)?");
      const middayRaw = extractSectionBlock(text, "Midday\\s+Transit(?:\\s+&\\s+Cafe(?:\\s+Pitstop)?)?|Transit\\s+&\\s+Cafe|Midday\\s+Pitstop|Midday");
      const afternoon = extractSectionBlock(text, "Afternoon(?:\\s+Culture|\\s+Highlights)?");
      const eveningPitstopRaw = extractSectionBlock(text, "Evening\\s+Transit(?:\\s+&\\s+Aperitivo)?|Late\\s+Afternoon\\s+Transit|Aperitivo(?:\\s+&\\s+Pastry)?|Golden\\s+Hour");
      const evening = extractSectionBlock(text, "(?:Evening|Nightlife|Dinner)(?!\\s*Transit)");

      let middayTransit = "";
      let middayCafe = "";
      if (middayRaw) {
        if (middayRaw.includes("•")) {
          const parts = middayRaw.split("•");
          middayTransit = parts[0]?.replace(/Transit:?/i, "").replace(/🚇/g, "").trim();
          middayCafe = parts[1]?.replace(/(?:Cafe\s*(?:\/|\&)?\s*Lunch|Pitstop|Lunch|Cafe):?/i, "").replace(/☕/g, "").trim();
        } else {
          middayTransit = middayRaw.replace(/Transit:?/i, "").replace(/🚇/g, "").trim();
        }
      }

      let eveningTransit = "";
      let eveningAperitivo = "";
      if (eveningPitstopRaw) {
        if (eveningPitstopRaw.includes("•")) {
          const parts = eveningPitstopRaw.split("•");
          eveningTransit = parts[0]?.replace(/Transit:?/i, "").replace(/🚋/g, "").trim();
          eveningAperitivo = parts[1]?.replace(/(?:Golden\s*Hour\s*(?:\/|\&)?\s*Drink|Sunset\s*Drinks|Aperitivo\s*(?:\/|\&)?\s*Pastry|Aperitivo|Drinks):?/i, "").replace(/[🍷🥐🍹]/g, "").trim();
        } else {
          eveningTransit = eveningPitstopRaw.replace(/Transit:?/i, "").replace(/🚋/g, "").trim();
        }
      }

      schedules.push({
        dayNumber: num,
        title: match[1].replace(/Day \d+:\s*/i, "").trim() || defaultTitle,
        morning: morning || undefined,
        middayTransit: middayTransit || undefined,
        middayCafe: middayCafe || undefined,
        afternoon: afternoon || undefined,
        eveningTransit: eveningTransit || undefined,
        eveningAperitivo: eveningAperitivo || undefined,
        evening: evening || undefined,
        rawText: text
      });
    }
  }

  // Extract Bonus Day Trips
  const bonusMatch = guide.match(/<h3[^>]*>(Bonus[^<]*|Day Trips[^<]*)<\/h3>([\s\S]*?)(?=<h2|$)/i);
  if (bonusMatch) {
    const text = bonusMatch[2];
    schedules.push({
      dayNumber: "4-5",
      title: "Scenic Day Trips & Regional Excursions",
      morning: text.replace(/<[^>]*>/g, " ").trim(),
      rawText: text
    });
  }

  return schedules;
}

// Parse City-Specific FAQs from guide
function parseFaqsFromGuide(guide: string): ParsedFAQ[] {
  if (!guide) return [];
  
  // Locate FAQ section
  const faqSectionMatch = guide.match(/<h2[^>]*>.*?(?:FAQ|Frequently Asked Questions|Local Knowledge).*?<\/h2>([\s\S]*?)(?=<h2|$)/i);
  const faqText = faqSectionMatch ? faqSectionMatch[1] : guide;

  const faqs: ParsedFAQ[] = [];
  const questionMatches = [...faqText.matchAll(/<h3[^>]*>(.*?)<\/h3>([\s\S]*?)(?=<h3|<h2|$)/gi)];

  for (const match of questionMatches) {
    const question = match[1].replace(/<[^>]*>/g, "").trim();
    const answer = match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (question.length > 5 && answer.length > 10) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

export default function App() {
  const [brandName, setBrandName] = useState("Travel Blueprint");
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandInput, setBrandInput] = useState("Travel Blueprint");

  const [citiesList, setCitiesList] = useState<CityItem[]>(CITIES_DATA);
  const [selectedCity, setSelectedCity] = useState<string>("Montreal");
  const [cachedGuides, setCachedGuides] = useState<CachedGuides>({});
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionType>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("blog");
  
  // Custom City Modal
  const [customCityInput, setCustomCityInput] = useState("");
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  
  // How It Works Modal
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  
  // Guide Inquiry Modal
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryDates, setInquiryDates] = useState("Spring 2026");
  const [inquiryGuests, setInquiryGuests] = useState("2 Travelers");
  const [inquiryFocus, setInquiryFocus] = useState("Food, History & Hidden Alleys");

  // Selected Day in Itinerary Blueprint View
  const [activeBlueprintDay, setActiveBlueprintDay] = useState<number | string>(1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // UI toast and copied states
  const [copiedState, setCopiedState] = useState(false);
  const [copiedBlueprintState, setCopiedBlueprintState] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedFavorites, setSavedFavorites] = useState<string[]>([]);

  const currentCityObj = useMemo(() => {
    return citiesList.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()) || {
      name: selectedCity,
      country: "Global Destination",
      region: "Custom",
      tagline: "Comprehensive 360° Authority Travel & Itinerary Guide"
    };
  }, [citiesList, selectedCity]);

  const filteredCities = useMemo(() => {
    return citiesList.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                            city.country.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesRegion = selectedRegion === "All" || city.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [citiesList, searchQuery, selectedRegion]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleGenerateGuide = useCallback(async (city: string, forceRefresh = false) => {
    if (cachedGuides[city] && !forceRefresh) return;
    
    setLoading(true);
    try {
      const content = await generateGuide(city);
      if (content) {
        setCachedGuides(prev => ({ ...prev, [city]: content }));
      }
    } catch (error) {
      console.error(`Failed to generate guide for ${city}:`, error);
      showNotification(`Error generating guide for ${city}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [cachedGuides]);

  useEffect(() => {
    handleGenerateGuide(selectedCity);
  }, [selectedCity, handleGenerateGuide]);

  const handleBatchGenerate = async () => {
    setIsBatchGenerating(true);
    setBatchProgress(0);
    
    const targetCities = filteredCities.map(c => c.name);
    const citiesToGenerate = targetCities.filter(city => !cachedGuides[city]);
    
    if (citiesToGenerate.length === 0) {
      setIsBatchGenerating(false);
      return;
    }

    let completed = 0;

    for (const city of citiesToGenerate) {
      try {
        const content = await generateGuide(city);
        if (content) {
          setCachedGuides(prev => ({ ...prev, [city]: content }));
        }
      } catch (error) {
        console.error(`Batch error for ${city}:`, error);
      }
      completed++;
      setBatchProgress(Math.round((completed / citiesToGenerate.length) * 100));
    }
    
    setIsBatchGenerating(false);
    showNotification(`Batch generated guides for ${completed} destinations!`);
  };

  const handleAddCustomCity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCity = customCityInput.trim();
    if (!trimmedCity) return;

    const existing = citiesList.find(c => c.name.toLowerCase() === trimmedCity.toLowerCase());
    if (!existing) {
      const newCity: CityItem = {
        name: trimmedCity,
        country: customCountryInput.trim() || "International",
        region: "Europe",
        tagline: "Custom Travel Destination & Master Itinerary"
      };
      setCitiesList(prev => [newCity, ...prev]);
    }
    
    setSelectedCity(trimmedCity);
    setCustomCityInput("");
    setCustomCountryInput("");
    setShowAddCityModal(false);
  };

  const copyToClipboard = (text: string, label = "Content") => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    showNotification(`✓ ${label} copied to clipboard!`);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const currentGuide = cachedGuides[selectedCity];

  // Parsed Itinerary & FAQs
  const parsedItinerary = useMemo(() => {
    return parseItineraryFromGuide(currentGuide || "");
  }, [currentGuide]);

  const parsedFaqs = useMemo(() => {
    return parseFaqsFromGuide(currentGuide || "");
  }, [currentGuide]);

  const copyItineraryBlueprintAction = () => {
    if (!currentGuide) return;
    let blueprintText = `# 🗺️ ${selectedCity} Master Itinerary Blueprint (Spring 2026)\n*Curated by ${brandName} Authority*\n\n`;
    if (parsedItinerary.length > 0) {
      parsedItinerary.forEach((d) => {
        blueprintText += `## Day ${d.dayNumber}: ${d.title}\n`;
        if (d.morning) blueprintText += `🌅 **Morning (08:30 – 12:30):** ${d.morning}\n`;
        if (d.middayTransit || d.middayCafe) {
          if (d.middayTransit) blueprintText += `🚇 **Midday Transit:** ${d.middayTransit}\n`;
          if (d.middayCafe) blueprintText += `☕ **Café / Lunch Pitstop:** ${d.middayCafe}\n`;
        }
        if (d.afternoon) blueprintText += `☀️ **Afternoon (13:00 – 17:30):** ${d.afternoon}\n`;
        if (d.eveningTransit || d.eveningAperitivo) {
          if (d.eveningTransit) blueprintText += `🚋 **Evening Transit:** ${d.eveningTransit}\n`;
          if (d.eveningAperitivo) blueprintText += `🍷 **Golden Hour / Aperitivo:** ${d.eveningAperitivo}\n`;
        }
        if (d.evening) blueprintText += `🌙 **Evening (18:30 – Late):** ${d.evening}\n`;
        blueprintText += `\n`;
      });
    } else {
      blueprintText += currentGuide;
    }
    navigator.clipboard.writeText(blueprintText);
    setCopiedBlueprintState(true);
    showNotification(`✓ ${selectedCity} Itinerary Blueprint copied to clipboard!`);
    setTimeout(() => setCopiedBlueprintState(false), 2500);
  };

  const downloadGuide = (city: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${city.replace(/\s+/g, '_')}_Travel_Guide_2026.md`;
    document.body.appendChild(element);
    element.click();
    showNotification(`Downloading ${city} Travel Guide (.md)...`);
  };

  const toggleStepDone = (id: string) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleFavorite = (city: string) => {
    setSavedFavorites(prev => {
      const isFav = prev.includes(city);
      const updated = isFav ? prev.filter(c => c !== city) : [...prev, city];
      showNotification(isFav ? `Removed ${city} from saved destinations` : `Saved ${city} to your bookmarks!`);
      return updated;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Comprehensive Entity Detection
  const entities = useMemo(() => {
    const text = currentGuide?.toLowerCase() || "";
    return [
      { name: "Precipitation & Rain Benchmarks", key: "precipitation", found: text.includes("precipitation") || text.includes("rainfall") || text.includes("mm") },
      { name: "Shoulder Season Transition", key: "shoulder", found: text.includes("shoulder season") || text.includes("sweet spot") },
      { name: "Peak Tourist Density", key: "density", found: text.includes("tourist density") || text.includes("peak") || text.includes("crowd") },
      { name: "Accommodation Cost Surges", key: "surges", found: text.includes("accommodation cost") || text.includes("surge") || text.includes("hotel") },
      { name: "Neighborhoods & Where to Stay", key: "neighborhoods", found: text.includes("neighborhood") || text.includes("district") || text.includes("quarter") },
      { name: "Curated Master Itineraries", key: "itinerary", found: text.includes("day 1") || text.includes("itinerary") || text.includes("day 2") },
      { name: "Culinary Culture & Markets", key: "culinary", found: text.includes("culinary") || text.includes("dining") || text.includes("dish") || text.includes("food") },
      { name: "Museum Passes & Timed Entry", key: "museums", found: text.includes("museum") || text.includes("timed-entry") || text.includes("pass") },
    ];
  }, [currentGuide]);

  const authorityScore = useMemo(() => {
    if (!currentGuide) return 0;
    const foundCount = entities.filter(e => e.found).length;
    return Math.round((foundCount / entities.length) * 100);
  }, [currentGuide, entities]);

  // Dynamically extract the bespoke city-specific headings
  const dynamicHeadings = useMemo(() => {
    if (!currentGuide) return [];
    const h2Matches = [...currentGuide.matchAll(/<h2[^>]*>(.*?)<\/h2>|##\s+(.*?)(?:\n|$)/gi)];
    return h2Matches.map((m, idx) => {
      const rawTitle = m[1] || m[2] || `Section ${idx + 1}`;
      const cleanTitle = rawTitle.replace(/<[^>]*>/g, "").trim();
      return {
        index: idx + 1,
        title: cleanTitle,
      };
    });
  }, [currentGuide]);

  // Clean Markdown/HTML intro and body separation
  const parsedBlogSections = useMemo(() => {
    if (!currentGuide) return { intro: "", body: "" };

    const firstH2Match = currentGuide.match(/<h2[^>]*>|##\s+/i);
    if (firstH2Match && firstH2Match.index !== undefined) {
      const intro = currentGuide.substring(0, firstH2Match.index).trim();
      const body = currentGuide.substring(firstH2Match.index).trim();
      return { intro, body };
    }

    return { intro: "", body: currentGuide };
  }, [currentGuide]);

  return (
    <div className="flex h-screen bg-[#FAF8F5] overflow-hidden text-stone-900 selection:bg-terracotta/20 relative">
      
      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-navy text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR NAVIGATION */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 340 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-stone-200 flex flex-col relative z-30 shadow-xl h-full overflow-hidden"
      >
        {/* Brand Banner */}
        <div className="p-5 border-b border-stone-100 bg-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terracotta rounded-xl flex items-center justify-center shadow-md shadow-terracotta/30 text-white font-serif font-bold text-base">
              AS
            </div>
            <div>
              {isEditingBrand ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    className="bg-navy-light text-white text-xs px-2 py-1 rounded border border-white/30 focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      if (brandInput.trim()) setBrandName(brandInput.trim());
                      setIsEditingBrand(false);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingBrand(true)}>
                  <h1 className="text-base font-serif font-bold tracking-tight leading-tight uppercase">
                    {brandName}
                  </h1>
                  <Edit3 className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <p className="text-[10px] text-stone-300 font-semibold tracking-widest uppercase">Destination Archive 2026</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden h-8 w-8 text-stone-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Region Filter Chips */}
        <div className="p-3.5 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Destination Catalog</span>
            <span className="text-[11px] font-bold text-terracotta">{filteredCities.length} Cities</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                  selectedRegion === region
                    ? "bg-navy text-white shadow-sm font-semibold"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Custom City Bar */}
        <div className="p-3.5 space-y-2.5 bg-white border-b border-stone-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Montreal, Lisbon, Tokyo..."
              className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddCityModal(true)}
              className="w-full border-stone-200 hover:border-terracotta hover:bg-terracotta-light text-stone-700 rounded-xl text-xs py-2 h-9 font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-terracotta" />
              Add Any City
            </Button>

            <Button
              onClick={handleBatchGenerate}
              disabled={isBatchGenerating || filteredCities.every(c => cachedGuides[c.name])}
              className="w-full bg-navy hover:bg-navy-light text-white rounded-xl text-xs py-2 h-9 shadow-sm font-medium"
            >
              {isBatchGenerating ? (
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{batchProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Batch Load</span>
                </div>
              )}
            </Button>
          </div>

          {Object.keys(cachedGuides).length > 0 && (
            <button 
              onClick={() => {
                const allContent = Object.entries(cachedGuides)
                  .map(([city, content]) => `# ${city} Travel Guide (${brandName} 2026 Edition)\n\n${content}`)
                  .join("\n\n---\n\n");
                downloadGuide("All_Curated_Travel_Guides_2026", allContent);
              }}
              className="w-full text-center text-[11px] font-medium text-stone-500 hover:text-terracotta py-1 flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" />
              Bulk Export All Generated ({Object.keys(cachedGuides).length})
            </button>
          )}
        </div>

        {/* City Directory List */}
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-1 pb-6">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              const isCached = !!cachedGuides[city.name];

              return (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all flex items-start justify-between group ${
                    isSelected
                      ? "bg-navy text-white shadow-lg shadow-navy/15"
                      : "hover:bg-stone-100/90 text-stone-700 bg-white mb-1 border border-stone-100"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      isCached ? (isSelected ? "bg-amber-400" : "bg-emerald-500") : (isSelected ? "bg-white/40" : "bg-stone-300")
                    }`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-serif font-bold text-sm tracking-tight truncate ${
                          isSelected ? "text-white" : "text-stone-900"
                        }`}>
                          {city.name}
                        </span>
                        <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded ${
                          isSelected ? "bg-white/15 text-white" : "bg-stone-100 text-stone-500"
                        }`}>
                          {city.country}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? "text-stone-300" : "text-stone-400 group-hover:text-stone-600"
                      }`}>
                        {city.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0 mt-0.5">
                    {isCached && (
                      <CheckCircle2 className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-emerald-500"}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-terracotta" />
              <span className="font-medium">{brandName}</span>
            </div>
            <button
              onClick={() => setShowHowItWorksModal(true)}
              className="text-terracotta hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>How It Works</span>
            </button>
          </div>
          <div className="text-[10px] text-stone-400 leading-tight pt-1.5 border-t border-stone-200/70">
            © 2026 Travel Blueprint Inc. Developed by Ami - SEO Girl. All rights reserved.
          </div>
        </div>
      </motion.aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden bg-[#FAF8F5]">
        
        {/* Top Editorial Navbar */}
        <header className="h-16 border-b border-stone-200/90 bg-white/95 backdrop-blur-md flex items-center px-6 sticky top-0 z-20 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {!isSidebarOpen && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsSidebarOpen(true)} 
                className="h-9 w-9 border-stone-200 text-stone-700 hover:bg-stone-100 rounded-xl"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            
            {/* 3-View Mode Switcher */}
            <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200/80">
              <button
                onClick={() => setViewMode("blog")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "blog"
                    ? "bg-white text-navy shadow-sm font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-terracotta" />
                <span>Editorial Guide</span>
              </button>

              <button
                onClick={() => setViewMode("blueprint")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "blueprint"
                    ? "bg-white text-navy shadow-sm font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Map className="w-3.5 h-3.5 text-amber-500" />
                <span>Interactive Master Blueprint</span>
              </button>

              <button
                onClick={() => setViewMode("raw")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "raw"
                    ? "bg-white text-navy shadow-sm font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Code className="w-3.5 h-3.5 text-navy" />
                <span>Markdown</span>
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentGuide && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleFavorite(selectedCity)} 
                  className={`rounded-xl border-stone-200 text-xs h-8 px-3 transition-colors ${
                    savedFavorites.includes(selectedCity) ? "bg-amber-50 text-amber-800 border-amber-300" : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${savedFavorites.includes(selectedCity) ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span className="hidden md:inline">Save</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyItineraryBlueprintAction}
                  className={`rounded-xl text-xs h-8 px-3 transition-all ${
                    copiedBlueprintState 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold" 
                      : "border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {copiedBlueprintState ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>Blueprint Copied!</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5 mr-1.5 text-terracotta" />
                      <span className="hidden sm:inline">Copy Blueprint</span>
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(currentGuide, `${selectedCity} Full Guide`)} 
                  className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-100 text-xs h-8 px-3"
                >
                  {copiedState ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      <span className="hidden md:inline">Copy All</span>
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadGuide(selectedCity, currentGuide)} 
                  className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-100 text-xs h-8 px-3"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden md:inline">Export</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint} 
                  className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-100 text-xs h-8 px-3 hidden sm:flex"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden md:inline">Print</span>
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleGenerateGuide(selectedCity, true)} 
                  className="rounded-xl text-stone-500 hover:text-navy hover:bg-stone-100 text-xs h-8 px-2"
                  title="Regenerate with fresh bespoke headings"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHowItWorksModal(true)}
              className="rounded-xl border-stone-200 text-stone-700 hover:text-navy hover:bg-stone-100 text-xs h-8 px-3 flex items-center gap-1.5 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-terracotta" />
              <span className="hidden sm:inline">How It Works</span>
            </Button>

            <Badge className="bg-terracotta-light text-terracotta border-terracotta/20 font-bold px-2.5 py-1 text-[10px] tracking-wider uppercase hidden sm:flex">
              Spring 2026
            </Badge>
          </div>
        </header>

        {/* Content View Container */}
        <div className="flex-1 flex overflow-hidden">
          
          <ScrollArea className="flex-1 h-full">
            <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 lg:py-14">
              
              <AnimatePresence mode="wait">
                {loading && !currentGuide ? (
                  <motion.div
                    key="loading-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-36 bg-stone-200/80 rounded-full" />
                      <Skeleton className="h-16 w-4/5 bg-stone-200/80 rounded-2xl" />
                      <Skeleton className="h-6 w-1/2 bg-stone-200/80 rounded-xl" />
                    </div>

                    <Skeleton className="h-64 w-full bg-stone-200/80 rounded-3xl" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Skeleton className="h-28 rounded-2xl bg-stone-200/80" />
                      <Skeleton className="h-28 rounded-2xl bg-stone-200/80" />
                      <Skeleton className="h-28 rounded-2xl bg-stone-200/80" />
                    </div>
                  </motion.div>
                ) : currentGuide ? (
                  <motion.article
                    key={`${selectedCity}-${viewMode}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-10"
                  >
                    {/* 1. VISUAL INTERACTIVE ITINERARY BLUEPRINT VIEW */}
                    {viewMode === "blueprint" && (
                      <div className="space-y-8">
                        {/* Blueprint Header */}
                        <div className="bg-gradient-to-r from-navy via-navy to-navy-light text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-96 h-96 bg-terracotta/15 rounded-full blur-3xl" />
                          <div className="relative z-10 space-y-3 max-w-2xl">
                            <Badge className="bg-amber-400 text-navy font-bold text-xs px-3 py-1">
                              Master Itinerary Blueprint
                            </Badge>
                            <h1 className="text-3xl sm:text-5xl font-serif font-black text-white leading-tight">
                              The {selectedCity} Step-by-Step Action Plan
                            </h1>
                            <p className="text-stone-300 text-sm leading-relaxed">
                              Chronological morning, afternoon, and evening blueprint curated by {brandName}. Mark tasks as done, preview route notes, or export to your phone.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 pt-3">
                              <Button
                                onClick={copyItineraryBlueprintAction}
                                className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl text-xs font-semibold h-10 px-5 shadow-md"
                              >
                                <Copy className="w-3.5 h-3.5 mr-1.5" />
                                Copy Full Blueprint
                              </Button>
                              <button
                                onClick={() => downloadGuide(`${selectedCity}_Blueprint`, currentGuide)}
                                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 rounded-xl text-xs font-medium h-10 px-4 transition-colors backdrop-blur-sm cursor-pointer shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                <span>Download Schedule (.md)</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Day Selector Pills */}
                        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-x-auto">
                          {parsedItinerary.map((day) => (
                            <button
                              key={day.dayNumber}
                              onClick={() => setActiveBlueprintDay(day.dayNumber)}
                              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-serif font-bold transition-all flex-shrink-0 ${
                                activeBlueprintDay === day.dayNumber
                                  ? "bg-navy text-white shadow-md shadow-navy/20"
                                  : "text-stone-600 hover:bg-stone-100"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                activeBlueprintDay === day.dayNumber ? "bg-terracotta text-white" : "bg-stone-200 text-stone-700"
                              }`}>
                                {day.dayNumber}
                              </span>
                              <span>Day {day.dayNumber}: {day.title.split(":")[0].split("—")[0]}</span>
                            </button>
                          ))}
                        </div>

                        {/* Active Day Timeline Cards */}
                        {parsedItinerary.map((day) => {
                          if (day.dayNumber !== activeBlueprintDay) return null;

                          return (
                            <motion.div
                              key={day.dayNumber}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-6"
                            >
                              <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                                  <div>
                                    <span className="text-xs uppercase tracking-widest font-bold text-terracotta">
                                      Day {day.dayNumber} Master Schedule
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy mt-1">
                                      {day.title}
                                    </h2>
                                  </div>
                                  <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs font-semibold px-3 py-1">
                                    Curated Route
                                  </Badge>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                  {/* Morning Block - Pastel Mint & Fresh Seafoam Palette */}
                                  {day.morning && (
                                    <div 
                                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                        completedSteps.includes(`${day.dayNumber}-morning`)
                                          ? "bg-stone-50 border-stone-200 opacity-60"
                                          : "bg-gradient-to-br from-emerald-50/70 via-[#F6FBF9] to-teal-50/50 border-emerald-200/80 hover:border-emerald-300 shadow-2xs"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-2xs">
                                            <Sun className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <span className="font-serif font-bold text-base text-emerald-950">Morning Exploration</span>
                                            <p className="text-[11px] text-emerald-700/80 font-medium">08:30 AM — 12:30 PM • Sights & Breakfast</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => toggleStepDone(`${day.dayNumber}-morning`)}
                                          className="text-stone-400 hover:text-emerald-700 p-1 transition-colors"
                                          title="Mark step completed"
                                        >
                                          <CheckSquare className={`w-5 h-5 ${completedSteps.includes(`${day.dayNumber}-morning`) ? "text-emerald-600 fill-emerald-100" : ""}`} />
                                        </button>
                                      </div>
                                      <p className="text-sm text-stone-700 leading-relaxed pl-9.5">
                                        {day.morning}
                                      </p>

                                      {/* Integrated Midday Transit & Food Footer */}
                                      {(day.middayTransit || day.middayCafe) && (
                                        <div className="mt-3 pt-2.5 border-t border-emerald-200/60 ml-0 sm:ml-9.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                          {day.middayTransit && (
                                            <div className="inline-flex items-center gap-1.5 bg-emerald-100/70 border border-emerald-200/80 text-emerald-950 px-2.5 py-0.5 rounded-md">
                                              <Train className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                              <span className="font-bold text-[10px] uppercase tracking-wide">Transit:</span>
                                              <span className="text-[11px] text-emerald-900 font-medium">{day.middayTransit}</span>
                                            </div>
                                          )}
                                          {day.middayCafe && (
                                            <div className="inline-flex items-center gap-1.5 bg-teal-100/70 border border-teal-200/80 text-teal-950 px-2.5 py-0.5 rounded-md">
                                              <Coffee className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                              <span className="font-bold text-[10px] uppercase tracking-wide">Pitstop:</span>
                                              <span className="text-[11px] text-teal-900 font-medium">{day.middayCafe}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Afternoon Block - Pastel Coral Rose & Sunset Petal Palette */}
                                  {day.afternoon && (
                                    <div 
                                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                        completedSteps.includes(`${day.dayNumber}-afternoon`)
                                          ? "bg-stone-50 border-stone-200 opacity-60"
                                          : "bg-gradient-to-br from-rose-50/70 via-[#FFF8F8] to-pink-50/50 border-rose-200/80 hover:border-rose-300 shadow-2xs"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-2xs">
                                            <Sunset className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <span className="font-serif font-bold text-base text-rose-950">Afternoon Culture & Tastings</span>
                                            <p className="text-[11px] text-rose-700/80 font-medium">01:00 PM — 05:30 PM • Museums, Markets & Alleys</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => toggleStepDone(`${day.dayNumber}-afternoon`)}
                                          className="text-stone-400 hover:text-rose-700 p-1 transition-colors"
                                          title="Mark step completed"
                                        >
                                          <CheckSquare className={`w-5 h-5 ${completedSteps.includes(`${day.dayNumber}-afternoon`) ? "text-emerald-600 fill-emerald-100" : ""}`} />
                                        </button>
                                      </div>
                                      <p className="text-sm text-stone-700 leading-relaxed pl-9.5">
                                        {day.afternoon}
                                      </p>

                                      {/* Integrated Evening Transit & Food Footer */}
                                      {(day.eveningTransit || day.eveningAperitivo) && (
                                        <div className="mt-3 pt-2.5 border-t border-rose-200/60 ml-0 sm:ml-9.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                          {day.eveningTransit && (
                                            <div className="inline-flex items-center gap-1.5 bg-rose-100/70 border border-rose-200/80 text-rose-950 px-2.5 py-0.5 rounded-md">
                                              <Compass className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                                              <span className="font-bold text-[10px] uppercase tracking-wide">Transit:</span>
                                              <span className="text-[11px] text-rose-900 font-medium">{day.eveningTransit}</span>
                                            </div>
                                          )}
                                          {day.eveningAperitivo && (
                                            <div className="inline-flex items-center gap-1.5 bg-pink-100/70 border border-pink-200/80 text-pink-950 px-2.5 py-0.5 rounded-md">
                                              <Utensils className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                                              <span className="font-bold text-[10px] uppercase tracking-wide">Aperitivo:</span>
                                              <span className="text-[11px] text-pink-900 font-medium">{day.eveningAperitivo}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Evening Block - Pastel Twilight Lavender & Slate Blue Palette */}
                                  {day.evening && (
                                    <div 
                                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                        completedSteps.includes(`${day.dayNumber}-evening`)
                                          ? "bg-stone-50 border-stone-200 opacity-60"
                                          : "bg-gradient-to-br from-indigo-50/70 via-[#F8F9FE] to-slate-50/60 border-indigo-200/70 hover:border-indigo-300 shadow-2xs"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-2xs">
                                            <Moon className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <span className="font-serif font-bold text-base text-indigo-950">Evening Gastronomy & Nightlife</span>
                                            <p className="text-[11px] text-indigo-700/80 font-medium">06:30 PM — Late • Sunset Views & Dinner Institution</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => toggleStepDone(`${day.dayNumber}-evening`)}
                                          className="text-stone-400 hover:text-indigo-700 p-1 transition-colors"
                                          title="Mark step completed"
                                        >
                                          <CheckSquare className={`w-5 h-5 ${completedSteps.includes(`${day.dayNumber}-evening`) ? "text-emerald-600 fill-emerald-100" : ""}`} />
                                        </button>
                                      </div>
                                      <p className="text-sm text-stone-700 leading-relaxed pl-9.5">
                                        {day.evening}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. EDITORIAL BLOG VIEW MODE */}
                    {viewMode === "blog" && (
                      <div className="space-y-10">
                        
                        {/* EDITORIAL BLOG HERO */}
                        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-terracotta/10 via-gold/5 to-transparent rounded-full pointer-events-none -mr-24 -mt-24" />
                          
                          {/* Breadcrumb & Category Tag */}
                          <div className="flex flex-wrap items-center gap-2.5 mb-6">
                            <span className="bg-navy text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {brandName} Destination Guide
                            </span>
                            <span className="bg-terracotta-light text-terracotta border border-terracotta/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {currentCityObj.country}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">
                              • 14 min read • Updated Spring 2026
                            </span>
                          </div>

                          {/* Magazine Title Heading */}
                          <h1 className="text-4xl sm:text-6xl font-serif font-black text-navy leading-[1.12] tracking-tight mb-6">
                            The Definitive 2026 Guide to <span className="text-terracotta italic">{selectedCity}</span>: Sights, Food & Master Plan
                          </h1>

                          {/* Subheading / Tagline */}
                          <p className="text-xl sm:text-2xl font-serif text-stone-600 leading-relaxed max-w-3xl mb-8">
                            {currentCityObj.tagline}. Curated by local guides with inside knowledge on hidden alleys, dining gems, and avoiding crowds.
                          </p>

                          {/* Author & Editorial Trust Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-stone-100">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                                AS
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm text-navy">{brandName} Editorial Archive</span>
                                  <UserCheck className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs text-stone-500 font-medium">Level 9 Certified Local Guide Authority</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold bg-stone-50 px-4 py-2 rounded-2xl border border-stone-200">
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                {authorityScore}% Authority Score
                              </span>
                              <span>•</span>
                              <span>Spring 2026 Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* SUMMARY & QUICK FACTS CARD */}
                        {parsedBlogSections.intro && (
                          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-terracotta/20 shadow-sm relative bg-gradient-to-r from-terracotta-light/30 to-white">
                            <div className="flex items-center gap-2 text-terracotta font-bold text-xs uppercase tracking-widest mb-4">
                              <Sparkles className="w-4 h-4" />
                              Summary & Essential Quick Facts
                            </div>
                            <div className="first-p-dropcap text-lg sm:text-xl font-serif leading-relaxed text-stone-800 blog-content">
                              <ReactMarkdown 
                                rehypePlugins={[rehypeRaw]} 
                                remarkPlugins={[remarkGfm]}
                              >
                                {parsedBlogSections.intro}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC BESPOKE TABLE OF CONTENTS */}
                        {dynamicHeadings.length > 0 && (
                          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-terracotta" />
                                Inside This {selectedCity} Master Guide
                              </h3>
                              <span className="text-xs text-stone-400 font-medium">10 City-Specific Chapters</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {dynamicHeadings.map((heading) => (
                                <div 
                                  key={heading.index}
                                  className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5 hover:bg-stone-100 transition-colors group"
                                >
                                  <span className="w-5 h-5 rounded-full bg-terracotta/10 text-terracotta font-serif font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-terracotta group-hover:text-white transition-colors">
                                    {heading.index}
                                  </span>
                                  <span className="font-serif font-semibold text-xs text-stone-800 leading-snug line-clamp-2">
                                    {heading.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* VISUAL ITINERARY PREVIEW BANNER IN BLOG */}
                        {parsedItinerary.length > 0 && (
                          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl p-6 sm:p-8 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                                <Map className="w-4 h-4 text-amber-600" />
                                <span>Interactive Timeline Available</span>
                              </div>
                              <h3 className="text-lg font-serif font-bold text-navy">
                                Explore the 3-Day & 5-Day Visual Blueprint
                              </h3>
                              <p className="text-xs text-stone-600">
                                Switch to our interactive day-by-day itinerary planner with step checklists and time schedules.
                              </p>
                            </div>
                            <Button
                              onClick={() => setViewMode("blueprint")}
                              className="bg-navy hover:bg-navy-light text-white rounded-xl text-xs font-semibold px-5 py-2.5 flex-shrink-0 shadow-md"
                            >
                              Launch Visual Planner
                            </Button>
                          </div>
                        )}

                        {/* MAIN EDITORIAL BODY */}
                        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-stone-200/80 shadow-sm blog-content">
                          <ReactMarkdown 
                            rehypePlugins={[rehypeRaw]} 
                            remarkPlugins={[remarkGfm]}
                          >
                            {parsedBlogSections.body || currentGuide}
                          </ReactMarkdown>
                        </div>

                        {/* INTERACTIVE CITY-SPECIFIC FAQS SECTION */}
                        {parsedFaqs.length > 0 && (
                          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-sm space-y-6">
                            <div className="border-b border-stone-100 pb-4">
                              <div className="flex items-center gap-2 text-terracotta font-bold text-xs uppercase tracking-wider mb-1">
                                <HelpCircle className="w-4 h-4" />
                                <span>City Intel & FAQs</span>
                              </div>
                              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
                                Frequently Asked Questions for {selectedCity}
                              </h2>
                              <p className="text-xs text-stone-500 mt-1">
                                Real questions travelers ask regarding language, transport quirks, payment, and local customs in {selectedCity}.
                              </p>
                            </div>

                            <div className="space-y-3">
                              {parsedFaqs.map((faq, idx) => {
                                const isOpen = openFaqIndex === idx;
                                return (
                                  <div
                                    key={idx}
                                    className={`rounded-2xl border transition-all overflow-hidden ${
                                      isOpen ? "bg-stone-50/80 border-terracotta/30 shadow-sm" : "bg-white border-stone-200/80 hover:border-stone-300"
                                    }`}
                                  >
                                    <button
                                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                      className="w-full text-left p-5 flex items-center justify-between gap-4"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-navy text-white font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                                          Q
                                        </span>
                                        <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                                          {faq.question}
                                        </span>
                                      </div>
                                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 text-stone-500">
                                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </div>
                                    </button>

                                    <AnimatePresence>
                                      {isOpen && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="px-6 pb-6 pt-1 text-sm text-stone-700 leading-relaxed border-t border-stone-100/80"
                                        >
                                          <div className="pl-9 text-[1.02rem] text-stone-700 font-normal">
                                            {faq.answer}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* CUSTOM GUIDE & ITINERARY CTA BANNER */}
                        <div className="bg-gradient-to-br from-navy via-navy to-navy-light text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/20 rounded-full blur-2xl pointer-events-none" />
                          <div className="relative z-10 space-y-5 max-w-2xl">
                            <Badge className="bg-amber-400 text-navy font-bold text-xs px-3 py-1">
                              {brandName} Curated Guarantee
                            </Badge>
                            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                              Want a Tailored, Private Experience in {selectedCity}?
                            </h3>
                            <p className="text-stone-300 text-sm leading-relaxed">
                              Skip generic bus tours. Connect with fully licensed local experts who craft 100% customizable itineraries, unlock skip-the-line museum tickets, and show you authentic neighborhoods without the crowds.
                            </p>
                            
                            {/* ACTION BUTTONS */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                              <Button 
                                onClick={() => setShowInquiryModal(true)}
                                className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl px-6 py-5 font-semibold text-xs shadow-lg flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Connect With a {selectedCity} Local Expert
                              </Button>

                              <button 
                                onClick={copyItineraryBlueprintAction}
                                className={`rounded-xl px-5 py-3 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                                  copiedBlueprintState 
                                    ? "bg-emerald-600 border border-emerald-500 text-white hover:bg-emerald-700" 
                                    : "bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
                                }`}
                              >
                                {copiedBlueprintState ? (
                                  <>
                                    <Check className="w-4 h-4 text-white" />
                                    <span>Blueprint Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span>Copy Itinerary Blueprint</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={() => setViewMode("blueprint")}
                                className="bg-white/5 hover:bg-white/15 border border-white/20 text-stone-200 hover:text-white rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Visual Blueprint</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* BLOG FOOTER CALLOUTS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-amber-50/80 rounded-2xl p-6 border border-amber-200/70 space-y-2">
                            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                              <Lightbulb className="w-4 h-4 text-amber-600" />
                              <span>Local Insider Rule</span>
                            </div>
                            <p className="text-xs text-amber-950/80 leading-relaxed">
                              Reserve iconic museum entries and popular dinner spots at least 2 to 3 weeks in advance during the shoulder season to avoid 2-hour ticketing queues and sold-out tables.
                            </p>
                          </div>

                          <div className="bg-stone-100 rounded-2xl p-6 border border-stone-200 space-y-2">
                            <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Verified Guide Authority</span>
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed">
                              This destination plan was crafted in accordance with Level 9 Local Guide entity coverage standards and real-time 2026 seasonal data.
                            </p>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* 3. RAW MARKDOWN / CODE VIEW */}
                    {viewMode === "raw" && (
                      <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 shadow-xl font-mono text-xs overflow-x-auto border border-stone-800 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                          <span className="text-stone-400 font-bold text-xs uppercase tracking-wider">
                            Source Markdown & HTML Code ({selectedCity})
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => copyToClipboard(currentGuide, `${selectedCity} Source Markdown`)}
                            className="bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs h-7"
                          >
                            <Copy className="w-3 h-3 mr-1.5" />
                            Copy Markdown
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-stone-300 font-mono">
                          {currentGuide}
                        </pre>
                      </div>
                    )}

                  </motion.article>
                ) : (
                  <div className="h-[65vh] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border border-stone-200/80 p-12">
                    <div className="w-20 h-20 bg-terracotta-light rounded-3xl flex items-center justify-center text-terracotta shadow-inner">
                      <Compass className="w-10 h-10 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy mb-3">
                        Ready to Explore {selectedCity}
                      </h2>
                      <p className="text-stone-500 max-w-lg text-sm leading-relaxed mx-auto">
                        Generate a comprehensive, bespoke destination guide covering climate, neighborhoods, foods, museums, master itineraries, transit, and 2026 events.
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleGenerateGuide(selectedCity)} 
                      className="bg-navy hover:bg-navy-light text-white rounded-xl px-8 py-6 text-sm font-semibold shadow-xl shadow-navy/20"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                      Generate Destination Guide
                    </Button>
                  </div>
                )}
              </AnimatePresence>

              {/* APPLICATION FOOTER */}
              <footer className="mt-16 pt-8 pb-12 border-t border-stone-200 text-center space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-stone-600">
                  <button
                    onClick={() => setShowHowItWorksModal(true)}
                    className="hover:text-terracotta flex items-center gap-1 transition-colors font-semibold text-navy cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-terracotta" />
                    <span>How It Works</span>
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => setShowAddCityModal(true)}
                    className="hover:text-terracotta flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-terracotta" />
                    <span>Add Any City</span>
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={handlePrint}
                    className="hover:text-terracotta flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-terracotta" />
                    <span>Print Guide</span>
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => setShowInquiryModal(true)}
                    className="hover:text-terracotta flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-terracotta" />
                    <span>Private Tour Inquiry</span>
                  </button>
                </div>
                <p className="text-xs font-semibold text-stone-700">
                  © 2026 Travel Blueprint Inc. Developed by Ami - SEO Girl. All rights reserved.
                </p>
                <p className="text-[11px] text-stone-400">
                  Authority Travel Guides & 360° Destination Blueprints • Spring 2026 Edition
                </p>
              </footer>

            </div>
          </ScrollArea>

          {/* RIGHT STRATEGIC INSIGHTS PANEL (Desktop) */}
          <aside className="w-80 border-l border-stone-200/90 bg-white hidden xl:flex flex-col h-full overflow-y-auto p-6 space-y-6">
            
            {/* Authority Score Gauge */}
            <Card className="bg-gradient-to-br from-navy via-navy to-navy-light text-white border-none shadow-xl shadow-navy/20 rounded-3xl overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-terracotta/20 rounded-full blur-xl" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-widest font-sans font-bold text-stone-300">SEO Authority Score</CardTitle>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-serif font-bold tracking-tight text-white">{authorityScore}%</span>
                  <span className="text-xs text-stone-300 font-medium">Verified Coverage</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug mb-4">
                  Full alignment with Level 9 Local Guide standards for Spring 2026.
                </p>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${authorityScore}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Semantic Entity Pillars */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-terracotta" />
                  Semantic Entity Pillars
                </h3>
                <span className="text-[11px] font-bold text-stone-400">
                  {entities.filter(e => e.found).length} / {entities.length}
                </span>
              </div>

              <div className="space-y-2">
                {entities.map((entity) => (
                  <div 
                    key={entity.name} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      entity.found 
                        ? "bg-emerald-50/70 border-emerald-200 text-stone-800" 
                        : "bg-stone-50 border-stone-100 text-stone-400"
                    }`}
                  >
                    <span className="font-medium text-[11px] truncate max-w-[170px]">{entity.name}</span>
                    {entity.found ? (
                      <Badge className="bg-emerald-600 text-white border-none text-[9px] px-1.5 py-0">Found</Badge>
                    ) : (
                      <Badge variant="outline" className="text-stone-400 border-stone-200 text-[9px] px-1.5 py-0">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Master Blueprint Launcher */}
            {parsedItinerary.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <Map className="w-4 h-4 text-amber-600" />
                    <span>Visual Blueprint</span>
                  </div>
                  <Badge className="bg-amber-500 text-white text-[9px]">3-5 Days</Badge>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Interactive morning, afternoon & evening timeline cards for {selectedCity}.
                </p>
                <Button
                  size="sm"
                  onClick={() => setViewMode("blueprint")}
                  className="w-full bg-navy hover:bg-navy-light text-white rounded-xl text-xs h-8 font-semibold shadow-sm"
                >
                  View Itinerary Timeline
                </Button>
              </div>
            )}

            {/* Dynamic City-Specific Table of Contents in Sidebar */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-terracotta" />
                {selectedCity} Chapters
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
                {dynamicHeadings.map((h) => (
                  <li key={h.index} className="flex items-start gap-1.5 hover:text-terracotta transition-colors">
                    <ChevronRight className="w-3 h-3 text-stone-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2 leading-tight">{h.title}</span>
                  </li>
                ))}
                {dynamicHeadings.length === 0 && (
                  <li className="text-xs text-stone-400">Chapters will appear here upon generation.</li>
                )}
              </ul>
            </div>

            {/* Saved Bookmarks */}
            {savedFavorites.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  Bookmarked Cities ({savedFavorites.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {savedFavorites.map(fav => (
                    <button
                      key={fav}
                      onClick={() => setSelectedCity(fav)}
                      className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors font-serif"
                    >
                      {fav}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </main>

      {/* CONNECT WITH LOCAL GUIDE INQUIRY MODAL */}
      <AnimatePresence>
        {showInquiryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center font-serif font-bold text-base shadow-sm">
                    AS
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-navy">Private Tour Inquiry</h3>
                    <p className="text-xs text-stone-500">Connect with a verified {selectedCity} local guide</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInquiryModal(false)}
                  className="text-stone-400 hover:text-stone-600 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Target Travel Season / Dates
                  </label>
                  <input
                    type="text"
                    value={inquiryDates}
                    onChange={(e) => setInquiryDates(e.target.value)}
                    placeholder="e.g. May 10 - 15, 2026"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                      Party Size
                    </label>
                    <input
                      type="text"
                      value={inquiryGuests}
                      onChange={(e) => setInquiryGuests(e.target.value)}
                      placeholder="e.g. 2 Adults, 1 Child"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                      Primary Interest
                    </label>
                    <input
                      type="text"
                      value={inquiryFocus}
                      onChange={(e) => setInquiryFocus(e.target.value)}
                      placeholder="e.g. Culinary, Art & History"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                    />
                  </div>
                </div>

                {/* Inquiry Preview Draft */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Generated Inquiry Draft</span>
                  <p className="text-xs text-stone-700 leading-relaxed font-mono">
                    "Hello {selectedCity} Guide! We are planning a trip around {inquiryDates} for {inquiryGuests}. We are passionate about {inquiryFocus} and would love a custom private walking itinerary with skip-the-line museum access."
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInquiryModal(false)}
                  className="flex-1 rounded-xl border-stone-200 text-stone-600 h-11 text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const draft = `Hello ${selectedCity} Guide! We are planning a trip around ${inquiryDates} for ${inquiryGuests}. We are passionate about ${inquiryFocus} and would love a custom private walking itinerary with skip-the-line museum access.`;
                    copyToClipboard(draft, "Guide Inquiry Draft");
                    setShowInquiryModal(false);
                  }}
                  className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl h-11 font-semibold text-xs shadow-md"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Copy Inquiry Draft
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CITY MODAL */}
      <AnimatePresence>
        {showAddCityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-terracotta-light rounded-xl flex items-center justify-center text-terracotta">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-navy">Add Any City</h3>
                    <p className="text-xs text-stone-500">Generate a custom editorial guide for any destination</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddCityModal(false)}
                  className="text-stone-400 hover:text-stone-600 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCustomCity} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Montreal, Seville, Bruges, Kyoto..."
                    value={customCityInput}
                    onChange={(e) => setCustomCityInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Country / Region (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Canada, Spain, Belgium, Japan..."
                    value={customCountryInput}
                    onChange={(e) => setCustomCountryInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCityModal(false)}
                    className="flex-1 rounded-xl border-stone-200 text-stone-600 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-navy hover:bg-navy-light text-white rounded-xl h-11 font-semibold shadow-md"
                  >
                    Create & Preview
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HOW IT WORKS MODAL */}
      <HowItWorksModal
        isOpen={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
        brandName={brandName}
      />

    </div>
  );
}

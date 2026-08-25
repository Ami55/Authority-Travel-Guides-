import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Compass,
  Sparkles,
  Map,
  Share2,
  Globe,
  CheckCircle2,
  Layers,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
}

export function HowItWorksModal({ isOpen, onClose, brandName }: HowItWorksModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "search",
      number: "01",
      icon: Search,
      badge: "Discovery Engine",
      title: "Select or Add Any Destination",
      description:
        "Choose from over 50 pre-indexed international cultural capitals across Europe, Asia, the Americas, Africa, and Oceania — or click 'Add Any City' to generate an instant bespoke guide for any village, metropolis, or hidden gem worldwide.",
      keyFeatures: [
        "Instant catalog search with regional filters",
        "Custom destination generator for any global city",
        "Bespoke naming and spring 2026 season calibration",
      ],
      tip: "Tip: Type even lesser-known towns like Bruges, Seville, or Nara to get deep local coverage."
    },
    {
      id: "semantic",
      number: "02",
      icon: Layers,
      badge: "Semantic SEO Intelligence",
      title: "Level 9 Local Guide & Entity Authority",
      description:
        "The system activates semantic entity mapping to build 10 bespoke chapters. It integrates real-world precipitation statistics, shoulder season pricing surges, quarter-by-quarter stay guides, and authentic culinary institutions rather than cookie-cutter advice.",
      keyFeatures: [
        "Weather benchmarks (°C/°F, mm rainfall, rain days)",
        "Curated neighborhood quarters (Luxury, Boutique, Value)",
        "Must-try local dishes, public markets & dining etiquette",
        "5 hyper-specific real-world local knowledge FAQs",
      ],
      tip: "Every guide passes 7 semantic entity checks to guarantee high-authority coverage."
    },
    {
      id: "blueprint",
      number: "03",
      icon: Map,
      badge: "Master Blueprint",
      title: "Interactive Itinerary & Transit Navigation",
      description:
        "Switch to the 'Interactive Master Blueprint' view for a chronological day-by-day action plan. Each day features morning cultural anchors, transit line recommendations, cafe pitstops, afternoon explorations, and golden hour sunset aperitivos.",
      keyFeatures: [
        "Morning, Afternoon & Evening timeline breakdown",
        "Specific transit line directions (metro lines, trams, walks)",
        "Interactive completion checkboxes to track your journey",
        "Day trip extensions for 5-day regional stays",
      ],
      tip: "Mark activities as completed to track your real-time travel progress on mobile."
    },
    {
      id: "export",
      number: "04",
      icon: Share2,
      badge: "Publish & Export",
      title: "Multi-Format Export & Local Guide Connect",
      description:
        "Seamlessly export full editorial articles in clean Markdown or HTML for your blog or CMS, copy formatted day-by-day blueprints for your phone notes, print for offline travel, or generate private guide inquiry drafts.",
      keyFeatures: [
        "One-click 'Copy Blueprint' formatted for Apple Notes/Notion",
        "Full Markdown / HTML download for content creators",
        "Print-optimized layout with clean typography",
        "Custom Private Guide inquiry email/message generator",
      ],
      tip: "Click 'Copy Blueprint' to instantly paste a ready-to-use checklist into your notes app."
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-navy via-navy to-navy-light text-white relative flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-terracotta rounded-2xl flex items-center justify-center shadow-lg shadow-terracotta/30 text-white">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                        How It Works
                      </h2>
                      <Badge className="bg-amber-400 text-navy font-bold text-[10px] px-2 py-0.5">
                        2026 Architecture
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      The Semantic Entity Travel Guide & Itinerary Blueprint Engine
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-stone-300 hover:text-white rounded-full p-1.5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Navigation Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/15">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStep === idx;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-white text-navy font-bold shadow-md"
                          : "bg-white/10 text-stone-200 hover:bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isActive ? "bg-terracotta text-white" : "bg-white/20 text-stone-200"
                        }`}
                      >
                        {step.number}
                      </div>
                      <span className="text-xs truncate font-medium">{step.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Active Step Detail */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {(() => {
                const step = steps[activeStep];
                const Icon = step.icon;

                return (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold font-mono text-terracotta uppercase tracking-wider">
                            Step {step.number}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs font-semibold text-stone-500">{step.badge}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy">
                          {step.title}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-terracotta-light text-terracotta flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Key Capabilities & Architecture
                      </h4>
                      <ul className="space-y-2">
                        {step.keyFeatures.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-xs text-stone-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pro Tip Callout */}
                    <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">{step.tip}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-semibold text-stone-700">
                  © 2026 Travel Blueprint Inc. Developed by Ami - SEO Girl. All rights reserved.
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Authority Travel Guides & Destination Blueprints
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="rounded-xl border-stone-200 text-stone-700 text-xs h-9"
                  >
                    Previous
                  </Button>
                )}
                {activeStep < steps.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="bg-navy hover:bg-navy-light text-white rounded-xl text-xs h-9 px-4 font-semibold ml-auto sm:ml-0"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onClose}
                    className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl text-xs h-9 px-5 font-semibold shadow-md ml-auto sm:ml-0"
                  >
                    Start Exploring
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

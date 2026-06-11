import React, { useState, useEffect } from 'react';
import { campusLocations, transportRoutes, activeBuses, CampusLocation, TransportRoute, Bus } from '../data/campusData';
import { MapPin, Bus as BusIcon, Navigation, Info, Compass, Anchor, GraduationCap, Building2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface InteractiveMapProps {
  onSelectLocation?: (location: CampusLocation) => void;
  selectedLocationId?: string;
  activeRouteId?: string;
  onSelectRoute?: (route: TransportRoute) => void;
  highlightedStopId?: string;
}

export default function InteractiveMap({
  onSelectLocation,
  selectedLocationId,
  activeRouteId,
  onSelectRoute,
  highlightedStopId,
}: InteractiveMapProps) {
  const [buses, setBuses] = useState<Bus[]>(activeBuses);
  const [hoveredLoc, setHoveredLoc] = useState<string | null>(null);

  // Simulate active bus movement smoothly over time!
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          let nextProgress = bus.progressPercentage + (Math.random() * 2 + 1) * (bus.status === 'moving' ? 1 : 0.1);
          let nextStatus = bus.status;
          let nextEta = bus.etaMinutes;

          if (nextProgress >= 100) {
            nextProgress = 0;
            // Cycle through stops
            const currentRoute = transportRoutes.find(r => r.stops.includes(bus.currentStopId));
            if (currentRoute) {
              const curIdx = currentRoute.stops.indexOf(bus.currentStopId);
              const nextIdx = (curIdx + 1) % currentRoute.stops.length;
              bus.currentStopId = currentRoute.stops[curIdx];
              bus.nextStopId = currentRoute.stops[nextIdx];
            }
            nextEta = Math.floor(Math.random() * 6) + 2;
            nextStatus = Math.random() > 0.3 ? 'moving' : 'boarding';
          } else if (nextProgress > 95) {
            nextEta = 1;
            nextStatus = 'boarding';
          } else {
            // Recalculate ETA based on distance
            const remaining = 100 - nextProgress;
            nextEta = Math.max(1, Math.ceil(remaining / 15));
            if (Math.random() > 0.95) {
              nextStatus = nextStatus === 'moving' ? 'boarding' : 'moving';
            }
          }

          return {
            ...bus,
            progressPercentage: parseFloat(nextProgress.toFixed(1)),
            status: nextStatus,
            etaMinutes: nextEta
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Helper to get category icon
  const getCategoryIcon = (category: string, size = 16) => {
    switch (category) {
      case 'faculty':
        return <GraduationCap size={size} />;
      case 'administrative':
        return <Building2 size={size} />;
      case 'recreation':
        return <Anchor size={size} />;
      case 'gate':
        return <Navigation size={size} className="rotate-45" />;
      case 'services':
        return <ShoppingBag size={size} />;
      default:
        return <MapPin size={size} />;
    }
  };

  // Helper to interpolate coordinate along a route's path
  const getBusCoordinates = (bus: Bus) => {
    const route = transportRoutes.find((r) => r.stops.includes(bus.currentStopId) && r.stops.includes(bus.nextStopId));
    
    const startLoc = campusLocations.find((l) => l.id === bus.currentStopId);
    const endLoc = campusLocations.find((l) => l.id === bus.nextStopId);

    if (!startLoc || !endLoc) return { x: 50, y: 50 };

    const progress = bus.progressPercentage / 100;
    // Calculate interpolated X, Y
    const x = startLoc.mapCoords.x + (endLoc.mapCoords.x - startLoc.mapCoords.x) * progress;
    const y = startLoc.mapCoords.y + (endLoc.mapCoords.y - startLoc.mapCoords.y) * progress;

    return { x, y };
  };

  return (
    <div className="relative w-full h-[380px] md:h-[500px] bg-white rounded-[32px] overflow-hidden border border-neutral-200/70 shadow-sm flex flex-col">
      {/* Map Control Widget */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-100 shadow-md flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
        <span className="text-[10px] font-display font-extrabold tracking-wider text-neutral-800 uppercase">
          UNILAG Campus Life: <span className="text-red-700 font-black">Active</span>
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-100 shadow-md text-neutral-700 hover:text-neutral-950 cursor-pointer text-[10px] flex items-center gap-1.5 font-display font-extrabold tracking-wider uppercase transition-all hover:scale-105">
          <Compass size={13} className="animate-spin-slow text-neutral-500" />
          <span>Akoka Campus</span>
        </div>
      </div>

      {/* Primary Map Stage */}
      <div className="relative flex-1 w-full h-full select-none overflow-hidden">
        {/* SVG Coordinates Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {/* Soft grid background */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ECEBE4" strokeWidth="0.8" />
            </pattern>
            {/* Glowing stroke filters */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background Fill */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Lagos Lagoon Waterbody Indicator on the East/Right margin */}
          <path
            d="M 450,0 Q 500,120 480,220 T 520,380 T 480,550 L 800,550 L 800,0 Z"
            className="fill-[#E5F3FF]/60 stroke-[#C0E0FF] stroke-2"
            style={{ transform: 'scaleX(1.3)' }}
          />

          {/* Lagoon Text Decoration */}
          <text x="82%" y="75%" fill="#7FB9F2" fontSize="11" fontWeight="600" letterSpacing="0.1em" className="font-sans antialiased opacity-60">
            LAGOS LAGOON
          </text>

          {/* Campus Boundary Roads (Representing elegant simple loops) */}
          <path
            d="M 15,25 Q 35,56 50,70 T 52,85"
            fill="none"
            stroke="#DFDDD3"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d="M 15,25 Q 50,50 82,20"
            fill="none"
            stroke="#DFDDD3"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* Dynamic Transport Route Dash Lines */}
          {transportRoutes.map((route) => {
            const isSelected = activeRouteId === route.id;
            // Compile points along route stops
            let pathString = '';
            route.stops.forEach((stopId, idx) => {
              const loc = campusLocations.find((l) => l.id === stopId);
              if (loc) {
                const prefix = idx === 0 ? 'M' : 'L';
                pathString += ` ${prefix} ${loc.mapCoords.x}% ${loc.mapCoords.y}%`;
              }
            });

            if (!pathString) return null;

            return (
              <g key={route.id}>
                {/* Outer shadow/glowing line */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={isSelected ? "5" : "3"}
                  strokeLinecap="round"
                  className="opacity-30 transition-all duration-300"
                />
                {/* Primary animated dashed line */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={route.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6, 5"
                  className="opacity-80 transition-all duration-300"
                  style={{
                    strokeDashoffset: isSelected ? -20 : 0,
                    animation: isSelected ? 'dash 1.2s linear infinite' : 'dash 3s linear infinite'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* CSS Keyframe for dashes */}
        <span className="hidden">
          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: -20;
              }
            }
            .animate-spin-slow {
              animation: spin 16s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </span>

        {/* Interactive Location Nodes represent pins */}
        {campusLocations.map((loc) => {
          const isSelected = selectedLocationId === loc.id;
          const isHighlightedStop = highlightedStopId === loc.id;
          const isHovered = hoveredLoc === loc.id;

          return (
            <div
              key={loc.id}
              id={`map-loc-${loc.id}`}
              className="absolute group"
              style={{
                left: `${loc.mapCoords.x}%`,
                top: `${loc.mapCoords.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 30 : isHovered ? 25 : 10
              }}
            >
              <div
                onClick={() => onSelectLocation?.(loc)}
                onMouseEnter={() => setHoveredLoc(loc.id)}
                onMouseLeave={() => setHoveredLoc(null)}
                className="relative cursor-pointer flex flex-col items-center transition-all duration-300"
              >
                {/* Pointer Dot / Pin Frame */}
                <div
                  className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'w-10 h-10 bg-neutral-950 text-white shadow-lg scale-110 border-2 border-white'
                      : isHighlightedStop
                      ? 'w-9 h-9 bg-red-600 text-white shadow-md animate-bounce ring-4 ring-red-100'
                      : 'w-8 h-8 bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200/85 hover:border-red-500 shadow-sm shadow-black/5 hover:scale-110'
                  }`}
                >
                  {getCategoryIcon(loc.category, 14)}
                </div>

                {/* Micro Ripple for recreation spaces like Lagoon Front */}
                {loc.category === 'recreation' && !isSelected && (
                  <span className="absolute -inset-1.5 border border-red-500 rounded-full animate-ping opacity-25 pointer-events-none" />
                )}

                {/* Rounded Label Cards */}
                <div
                  className={`mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-display font-bold tracking-tight whitespace-nowrap shadow-sm border transition-all duration-200 ${
                    isSelected
                      ? 'bg-neutral-950 border-neutral-950 text-white translate-y-[-1px]'
                      : 'bg-white/90 border-neutral-200 text-neutral-800 backdrop-blur-sm group-hover:bg-white group-hover:border-neutral-400'
                  }`}
                >
                  {loc.name}
                </div>

                {/* Quick Info Popover on Mouse Hover */}
                {isHovered && !isSelected && (
                  <div className="absolute bottom-16 bg-white border border-neutral-200 rounded-xl p-2.5 shadow-xl w-48 text-left text-xs pointer-events-none z-50 animate-fadeIn leading-relaxed">
                    <p className="font-bold text-neutral-900 mb-0.5">{loc.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mb-1">
                      <span>★</span>
                      <span>{loc.rating}</span>
                      <span className="text-neutral-400 font-normal">({loc.reviewsCount} reviews)</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 line-clamp-2 leading-snug">{loc.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time moving buses layer */}
        {buses.map((bus) => {
          const coords = getBusCoordinates(bus);
          const isFull = bus.seatsAvailable === 0;

          return (
            <motion.div
              key={bus.id}
              className="absolute cursor-pointer z-20 group"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                left: `${coords.x}%`,
                top: `${coords.y}%`
              }}
              transition={{
                duration: 2.5,
                ease: "linear"
              }}
            >
              {/* Bus Marker */}
              <div className={`relative flex flex-col items-center`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md transition-all ${
                    isFull ? 'bg-neutral-500' : 'bg-red-500 group-hover:scale-110'
                  }`}
                >
                  <BusIcon size={12} className={bus.status === 'moving' ? 'animate-pulse' : ''} />
                </div>

                {/* Tiny Seats Left Alert */}
                <div className="absolute -top-3.5 bg-neutral-900 text-[8px] text-white px-1 font-bold rounded shadow border border-neutral-700 scale-90">
                  {isFull ? 'FULL' : `${bus.seatsAvailable} seats`}
                </div>

                {/* Moving indicator */}
                <span className="absolute -inset-1 border border-red-500 rounded-full animate-ping opacity-25 pointer-events-none" />

                {/* Miniature tooltip on hover */}
                <div className="absolute top-8 opacity-0 group-hover:opacity-100 bg-neutral-900 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-all shadow font-medium">
                  {bus.shuttleNumber} • {bus.driverName} ({bus.progressPercentage}% done)
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Map Legend Footer Block */}
      <div className="bg-white border-t border-neutral-150 px-4 py-2.5 flex items-center justify-between text-[11px] text-neutral-500 gap-4 overflow-x-auto">
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 border border-white rounded-full inline-block" />
            <span className="font-semibold text-neutral-700">Red Line (Main Shuttles)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 border border-white rounded-full inline-block" />
            <span className="font-semibold text-neutral-700">Blue Line (Edu-Campus)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full inline-block" />
            <span className="font-semibold text-neutral-700">Green Line (Lagoon Scenic)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-400 shrink-0 select-none">
          <span className="flex items-center gap-0.5"><GraduationCap size={12} /> Academic</span>
          <span className="flex items-center gap-0.5"><ShoppingBag size={12} /> Shops</span>
          <span className="flex items-center gap-0.5"><Building2 size={12} /> Admin</span>
        </div>
      </div>
    </div>
  );
}

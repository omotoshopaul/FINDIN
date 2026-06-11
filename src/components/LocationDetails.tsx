import React from 'react';
import { CampusLocation, campusVendors } from '../data/campusData';
import { X, MapPin, Star, Clock, Sparkles, Navigation, ListTodo, Store } from 'lucide-react';
import { motion } from 'motion/react';

interface LocationDetailsProps {
  location: CampusLocation;
  onClose: () => void;
  onBookShuttleAtStop: (stopId: string) => void;
  onSelectVendor: (vendorId: string) => void;
}

export default function LocationDetails({
  location,
  onClose,
  onBookShuttleAtStop,
  onSelectVendor,
}: LocationDetailsProps) {
  // Find local vendors at this specific location
  const localVendors = campusVendors.filter(v => v.locationId === location.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative bg-white border border-neutral-200 w-full max-w-lg max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Banner image with Close trigger button */}
        <div className="relative h-48 w-full shrink-0">
          <img
            src={location.image}
            alt={location.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Close button icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 text-neutral-800 hover:text-neutral-950 rounded-full transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <X size={16} />
          </button>

          {/* Location Category & Title in the overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-white/95 backdrop-blur-sm text-neutral-800 text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-full uppercase">
              {location.category}
            </span>
            <h2 className="text-xl font-black text-white mt-1.5 leading-none flex items-center gap-1.5 drop-shadow-sm">
              {location.name}
            </h2>
          </div>
        </div>

        {/* Details Arena Scroller */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Rating Summary Bar */}
          <div className="bg-white border border-neutral-150 p-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="bg-amber-50 text-amber-600 rounded-lg p-1.5">
                <Star size={16} className="fill-amber-500 stroke-amber-500" />
              </div>
              <div>
                <span className="text-sm font-black text-neutral-900">{location.rating}</span>
                <span className="text-[11px] text-neutral-400 font-medium block">Rating Score</span>
              </div>
            </div>

            <div className="border-r border-neutral-150 h-6" />

            <div>
              <span className="text-sm font-black text-neutral-900">{location.reviewsCount}</span>
              <span className="text-[11px] text-neutral-400 font-medium block">Total Reviews</span>
            </div>

            <div className="border-r border-neutral-150 h-6" />

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-neutral-600 font-bold">Open Access</span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">About Location</h4>
            <p className="text-sm text-neutral-700 leading-relaxed font-normal">
              {location.longDescription}
            </p>
          </div>

          {/* Key Features List */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <ListTodo size={12} /> Highlights & Features
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {location.features.map((feature, idx) => (
                <div key={idx} className="bg-white border border-neutral-150 px-3 py-2 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
                  <span className="text-xs text-neutral-700 font-semibold truncate">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Local Vendors nearby */}
          {localVendors.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-neutral-150">
              <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Store size={12} /> Live Vendors Here ({localVendors.length})
              </h4>
              <div className="space-y-2">
                {localVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => onSelectVendor(vendor.id)}
                    className="bg-white hover:bg-neutral-50 border border-neutral-150 hover:border-neutral-300 p-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-2xs group"
                  >
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-extrabold text-neutral-800 leading-none group-hover:text-neutral-950 transition-colors">
                        {vendor.name}
                      </h5>
                      <span className="text-[10px] text-amber-500 font-black mt-1 inline-block">
                        ★ {vendor.rating} <span className="text-neutral-400 font-normal">({vendor.reviewsCount})</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 group-hover:text-neutral-800 flex items-center gap-0.5">
                      Explore ➔
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews list Container */}
          <div className="space-y-3 pt-1 border-t border-neutral-150">
            <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">
              Student Reviews ({location.reviews.length})
            </h4>
            <div className="space-y-3">
              {location.reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-neutral-150 p-3 rounded-2xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-800">{rev.userName}</span>
                    <span className="text-[10px] text-neutral-400 font-semibold">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-400 text-[10px]">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Booking trigger strip */}
        <div className="p-4 bg-white border-t border-neutral-150 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onBookShuttleAtStop(location.id)}
            className="flex-1 bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Navigation size={14} className="rotate-45" />
            Book Shuttle to {location.name}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

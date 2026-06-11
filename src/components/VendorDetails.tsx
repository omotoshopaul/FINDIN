import React, { useState } from 'react';
import { Vendor, ProductItem, LocationReview } from '../data/campusData';
import { X, MessageSquare, Phone, Store, Star, ThumbsUp, ShoppingBag, PlusCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VendorDetailsProps {
  vendor: Vendor;
  onClose: () => void;
  onAddReview: (vendorId: string, review: Omit<LocationReview, 'id' | 'date'>) => void;
}

export default function VendorDetails({ vendor, onClose, onAddReview }: VendorDetailsProps) {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reviewerName.trim()) {
      setErrorMsg('Please state your name.');
      return;
    }
    if (!newComment.trim() || newComment.length < 5) {
      setErrorMsg('Please write a genuine review of at least 5 characters.');
      return;
    }

    onAddReview(vendor.id, {
      userName: reviewerName,
      rating: newRating,
      comment: newComment
    });

    setFormSuccess(true);
    setNewComment('');
    setReviewerName('');
    setNewRating(5);

    setTimeout(() => {
      setFormSuccess(false);
    }, 3000);
  };

  const handleWhatsApp = () => {
    const textMsg = encodeURIComponent(`Hello ${vendor.name}, I found your business on FINDIN UNILAG and would like to make an inquiry!`);
    window.open(`https://wa.me/${vendor.phone}?text=${textMsg}`, '_blank');
  };

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

      {/* Main Container Card */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative bg-white border border-neutral-200 w-full max-w-xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Responsive Header image overlay */}
        <div className="relative h-44 md:h-52 w-full shrink-0">
          <img
            src={vendor.image}
            alt={vendor.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 text-neutral-800 hover:text-neutral-900 rounded-full transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <X size={16} />
          </button>

          {/* Subheader and Tags overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="bg-amber-400 text-neutral-950 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
              ★ Featured {vendor.category}
            </span>
            <h2 className="text-xl md:text-2xl font-black mt-2 leading-none">
              {vendor.name}
            </h2>
            <p className="text-[11px] text-neutral-200 mt-1 flex items-center gap-1">
              <Store size={12} /> {vendor.locationName}
            </p>
          </div>
        </div>

        {/* Content Arena */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Description */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">ABOUT KIOSK</h4>
            <p className="text-sm text-neutral-700 leading-relaxed font-normal">
              {vendor.description}
            </p>
          </div>

          {/* Call to Contact bar */}
          <div className="bg-white border border-neutral-150 p-3.5 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
            <div className="text-center sm:text-left">
              <span className="text-xs font-black text-neutral-800 leading-none block">Inquire or Order Now</span>
              <span className="text-[10px] text-neutral-400 font-medium block mt-1">Pricing is pre-negotiated for campus delivery</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare size={14} />
                WhatsApp
              </button>
              <a
                href={`tel:${vendor.phone}`}
                className="flex-1 sm:flex-none border border-neutral-200 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 bg-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Phone size={14} />
                Call Direct
              </a>
            </div>
          </div>

          {/* Products & Services Catalog Showcase */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag size={12} /> Products & Services ({vendor.products.length})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vendor.products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-neutral-150 p-3.5 rounded-2xl flex items-start gap-3 shadow-2xs hover:border-neutral-300 transition-all"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-neutral-800 leading-snug">{prod.name}</h5>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">{prod.description}</p>
                    <span className="text-xs font-extrabold text-neutral-900 block mt-1.5">
                      ₦{prod.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Ratings Breakdown Column */}
          <div className="space-y-4 pt-4 border-t border-neutral-150">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                VERIFIED STUDENT RATINGS
              </h4>
              <span className="text-xs font-black text-amber-500">★ {vendor.rating} ({vendor.reviewsCount} reviews)</span>
            </div>

            <div className="space-y-3">
              {vendor.reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-neutral-150 p-3.5 rounded-2xl space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-neutral-800">{rev.userName}</span>
                    <span className="text-[9px] text-neutral-400 font-bold">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 text-xs">★ {rev.rating}.0</span>
                    <span className="text-neutral-300">|</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <ThumbsUp size={10} /> Verified Purchase
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Write a review Input form */}
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-4">
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">Loved the service?</h4>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">Leave a verified rating to help fellow Akokites discover good spots!</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              {errorMsg && (
                <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-lg flex items-center gap-2 border border-red-100 font-bold">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-lg flex items-center gap-2 border border-emerald-100 font-bold">
                  <span>Review added! Thank you for backing UNILAG trade.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Reviewer Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Joy Akoka"
                    className="w-full bg-white border border-neutral-200 hover:border-neutral-350 focus:border-neutral-500 px-3 py-2 rounded-xl text-xs text-neutral-800 outline-none transition-all placeholder-neutral-400"
                  />
                </div>

                {/* Rating selection stars */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Star Rating</label>
                  <div className="flex items-center gap-2 h-8.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setNewRating(val)}
                        className={`text-xl cursor-pointer hover:scale-110 transition-transform ${
                          newRating >= val ? 'text-amber-500' : 'text-neutral-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-[10px] font-bold text-neutral-500 ml-1">({newRating}/5 Stars)</span>
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Your Comment</label>
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell students about the Joforo rice flavor, response speeds, or printing sharpness..."
                  className="w-full bg-white border border-neutral-200 hover:border-neutral-350 focus:border-neutral-500 px-3 py-2 rounded-xl text-xs text-neutral-800 outline-none transition-all placeholder-neutral-400 leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <PlusCircle size={14} />
                Publish Review
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { TransportRoute, Bus, campusLocations, transportRoutes, activeBuses } from '../data/campusData';
import { X, Check, Wallet, Info, Sparkles, Navigation, QrCode, ClipboardCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface SeatBookingProps {
  initialLocationId?: string;
  onClose: () => void;
  onConfirmBooking: (booking: {
    id: string;
    route: TransportRoute;
    bus: Bus;
    seatNumber: string;
    boarding: string;
    destination: string;
    price: number;
    timestamp: Date;
  }) => void;
}

export default function SeatBooking({ initialLocationId, onClose, onConfirmBooking }: SeatBookingProps) {
  // Select initial route and bus
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute>(() => {
    if (initialLocationId) {
      const match = transportRoutes.find(r => r.stops.includes(initialLocationId));
      if (match) return match;
    }
    return transportRoutes[0];
  });

  const [selectedBus, setSelectedBus] = useState<Bus>(() => {
    const routeBuses = activeBuses.filter(b => selectedRoute.stops.includes(b.currentStopId));
    return routeBuses[0] || activeBuses[0];
  });

  const [boarding, setBoarding] = useState<string>(() => {
    if (initialLocationId && selectedRoute.stops.includes(initialLocationId)) {
      return initialLocationId;
    }
    return selectedRoute.stops[0];
  });

  const [destination, setDestination] = useState<string>(() => {
    const lastStop = selectedRoute.stops[selectedRoute.stops.length - 1];
    if (lastStop !== boarding) return lastStop;
    return selectedRoute.stops[selectedRoute.stops.length - 2] || selectedRoute.stops[1];
  });

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<any>(null);

  // Generate 18 seats. We will randomize occupied states for realism
  const [seatStates] = useState<{ [key: string]: 'available' | 'occupied' }>({
    '1A': 'occupied', '1B': 'available',
    '2A': 'available', '2B': 'occupied',
    '3A': 'occupied', '3B': 'occupied',
    '4A': 'available', '4B': 'available',
    '5A': 'occupied', '5B': 'available',
    '6A': 'available', '6B': 'occupied',
    '7A': 'available', '7B': 'available',
    '8A': 'occupied', '8B': 'occupied',
    '9A': 'available', '9B': 'available',
  });

  const handleRouteAndBusChange = (route: TransportRoute) => {
    setSelectedRoute(route);
    const busMatch = activeBuses.find(b => route.stops.includes(b.currentStopId)) || activeBuses[0];
    setSelectedBus(busMatch);
    setBoarding(route.stops[0]);
    setDestination(route.stops[route.stops.length - 1]);
    setSelectedSeat(null);
  };

  const handleConfirmReservation = () => {
    if (!selectedSeat) return;

    const bookingId = 'BK-' + Math.floor(100000 + Math.random() * 900000);
    const ticketPayload = {
      id: bookingId,
      route: selectedRoute,
      bus: selectedBus,
      seatNumber: selectedSeat,
      boarding: campusLocations.find(l => l.id === boarding)?.name || boarding,
      destination: campusLocations.find(l => l.id === destination)?.name || destination,
      price: selectedRoute.price,
      timestamp: new Date()
    };

    setIssuedTicket(ticketPayload);
    setIsBookedSuccess(true);
    onConfirmBooking(ticketPayload);
  };

  // Render randomized QR style canvas representation
  const renderQRCodeSimulated = () => {
    return (
      <div className="bg-neutral-900 p-2.5 rounded-xl inline-block shadow-inner">
        <div className="grid grid-cols-6 gap-[1.5px] w-20 h-20 bg-white p-1">
          {Array.from({ length: 36 }).map((_, i) => {
            // Anchor blocks at corners
            const isAnchor =
              i < 2 || (i >= 4 && i < 6) ||
              (i >= 6 && i < 8) || (i >= 10 && i < 12) ||
              i >= 30 || (i >= 24 && i < 26);
            
            const isFilled = isAnchor ? true : Math.random() > 0.55;

            return (
              <div
                key={i}
                className={`w-full h-full transition-colors ${isFilled ? 'bg-neutral-950' : 'bg-transparent'}`}
              />
            );
          })}
        </div>
      </div>
    );
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

      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative bg-white border border-neutral-200 w-full max-w-md max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header Ribbon */}
        <div className="bg-white border-b border-neutral-150 px-5 py-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900 leading-none">
                {isBookedSuccess ? 'Booking Issued' : 'Book a Seat'}
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider leading-none">
                UNILAG Campus Transport
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!isBookedSuccess ? (
            <>
              {/* Route selections dropdown and description */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Choose Shuttle Path</label>
                  <select
                    value={selectedRoute.id}
                    onChange={(e) => {
                      const match = transportRoutes.find(r => r.id === e.target.value);
                      if (match) handleRouteAndBusChange(match);
                    }}
                    className="w-full bg-white border border-neutral-200 hover:border-neutral-300 focus:border-neutral-500 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-800 outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    {transportRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stops dropdown selections */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Boarding Point</label>
                    <select
                      value={boarding}
                      onChange={(e) => setBoarding(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 outline-none cursor-pointer"
                    >
                      {selectedRoute.stops.map(stopId => (
                        <option key={stopId} value={stopId}>
                          {campusLocations.find(l => l.id === stopId)?.name || stopId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Destination</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 outline-none cursor-pointer"
                    >
                      {selectedRoute.stops.map(stopId => (
                        <option key={stopId} value={stopId} disabled={stopId === boarding}>
                          {campusLocations.find(l => l.id === stopId)?.name || stopId}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-amber-100/50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5">
                  <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-900 leading-normal font-semibold">
                    Red shuttles maintain a flat fare rate of **₦150** per passenger ride inside the campus gates. No surplus fees.
                  </p>
                </div>
              </div>

              {/* Shuttle Bus Status Card */}
              <div className="bg-white border border-neutral-150 p-3 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-emerald-600 font-extrabold block">ACTIVE BUS ASSIGNED</span>
                  <p className="text-sm font-black text-neutral-800 mt-1">{selectedBus.shuttleNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 font-bold block">DRIVER PROFILE</span>
                  <p className="text-xs font-bold text-neutral-600 mt-1">{selectedBus.driverName}</p>
                </div>
              </div>

              {/* Passenger Seat selector matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                    Select Passenger Seat
                  </h4>
                  <div className="flex items-center gap-2.5 text-[9px] font-bold text-neutral-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-neutral-300 rounded" /> Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-neutral-900 rounded" /> Selected
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <span className="w-2.5 h-2.5 bg-red-150 border border-red-200 rounded" /> Occupied
                    </span>
                  </div>
                </div>

                {/* 18-Seater visual representation container resembling bus cockpit */}
                <div className="bg-white border border-neutral-150 p-4 rounded-3xl shadow-sm flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-dashed border-neutral-200 pb-3 mb-4">
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase">STREET SIDE FRONT</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-bold">Driver Cabin</span>
                      <div className="w-6 h-6 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-500 flex items-center justify-center text-[10px] font-bold select-none cursor-not-allowed">
                        ⛟
                      </div>
                    </div>
                  </div>

                  {/* Seat Grid Layout */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {/* Column Left (Seats A) */}
                    <div className="space-y-2">
                      {['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A'].map((seat) => {
                        const state = seatStates[seat] || 'available';
                        const isSelected = selectedSeat === seat;
                        const isOccupied = state === 'occupied';

                        return (
                          <button
                            key={seat}
                            disabled={isOccupied}
                            onClick={() => setSelectedSeat(seat)}
                            className={`w-full py-2.5.5 text-xs font-black rounded-lg transition-all border flex items-center justify-between px-3 cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-900 border-neutral-900 text-white scale-98 shadow-sm shadow-neutral-950/25'
                                : isOccupied
                                ? 'bg-neutral-100 border-neutral-150 text-neutral-300 cursor-not-allowed line-through'
                                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-800'
                            }`}
                          >
                            <span>Seat {seat}</span>
                            {isSelected && <Check size={11} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Column Right (Seats B) */}
                    <div className="space-y-2">
                      {['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B'].map((seat) => {
                        const state = seatStates[seat] || 'available';
                        const isSelected = selectedSeat === seat;
                        const isOccupied = state === 'occupied';

                        return (
                          <button
                            key={seat}
                            disabled={isOccupied}
                            onClick={() => setSelectedSeat(seat)}
                            className={`w-full py-2.5.5 text-xs font-black rounded-lg transition-all border flex items-center justify-between px-3 cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-900 border-neutral-900 text-white scale-98 shadow-sm shadow-neutral-950/25'
                                : isOccupied
                                ? 'bg-neutral-100 border-neutral-150 text-neutral-300 cursor-not-allowed line-through'
                                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-800'
                            }`}
                          >
                            <span>Seat {seat}</span>
                            {isSelected && <Check size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Booking confirmation pass markup resembling an airline receipt card */
            <div className="bg-white border border-neutral-250 rounded-3xl p-5 shadow-sm space-y-5 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                <ClipboardCheck size={24} />
              </div>

              <div>
                <span className="text-[10px] text-emerald-600 font-extrabold tracking-widest uppercase">RESERVATION VERIFIED</span>
                <h4 className="text-sm font-black text-neutral-900 mt-1">Ready for Akoka Shuttle Boarding</h4>
              </div>

              {/* Splittable layout lines dotted to suggest tear */}
              <div className="border-t border-dashed border-neutral-200 w-full py-1" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">TICKET REF:</span>
                  <span className="font-extrabold text-neutral-800 tracking-wider">{issuedTicket.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">ROUTE ASSIGNED:</span>
                  <span className="font-extrabold text-[#EF4444]">{issuedTicket.route.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">BUS ASSIGNED:</span>
                  <span className="font-extrabold text-neutral-800">{issuedTicket.bus.shuttleNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">RESERVED SEAT:</span>
                  <span className="font-extrabold text-neutral-900">{issuedTicket.seatNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">BOARDING ZONE:</span>
                  <span className="font-extrabold text-neutral-800">{issuedTicket.boarding}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">DESTINATION:</span>
                  <span className="font-extrabold text-neutral-800">{issuedTicket.destination}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-100">
                  <span className="text-neutral-500 font-extrabold">FARE DEDUCTED:</span>
                  <span className="font-black text-neutral-900">₦{issuedTicket.price}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-200 w-full pt-4" />

              {/* Simulated scan code block */}
              {renderQRCodeSimulated()}

              <p className="text-[10px] text-neutral-400 font-bold max-w-[80%] mx-auto leading-normal">
                Present this QR Ticket pass to the bus collector upon boarding at {issuedTicket.boarding}.
              </p>
            </div>
          )}
        </div>

        {/* Action Button strip */}
        <div className="p-4 bg-white border-t border-neutral-150 shrink-0">
          {!isBookedSuccess ? (
            <button
              onClick={handleConfirmReservation}
              disabled={!selectedSeat}
              className={`w-full font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                selectedSeat
                  ? 'bg-neutral-950 hover:bg-neutral-900 text-white hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-neutral-100 text-neutral-350 cursor-not-allowed'
              }`}
            >
              Confirm Seat {selectedSeat || 'Selection'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              Done & Save to Passbook
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

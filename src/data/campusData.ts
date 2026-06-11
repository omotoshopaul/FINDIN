export interface LocationReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  category: 'faculty' | 'administrative' | 'recreation' | 'utility' | 'gate' | 'services';
  description: string;
  longDescription: string;
  rating: number;
  reviewsCount: number;
  mapCoords: { x: number; y: number }; // X, Y percentages for the interactive SVG map
  image: string;
  features: string[];
  popularVendors?: string[];
  busyHours?: { [key: string]: number }; // percentage busy at 8 AM, 12 PM, 4 PM, etc.
  reviews: LocationReview[];
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'food' | 'printing' | 'salon' | 'groceries' | 'gadgets';
  rating: number;
  reviewsCount: number;
  phone: string;
  locationName: string;
  locationId: string;
  image: string;
  description: string;
  products: ProductItem[];
  reviews: LocationReview[];
  featured?: boolean;
}

export interface Bus {
  id: string;
  shuttleNumber: string;
  driverName: string;
  seatsAvailable: number;
  seatsTotal: number;
  status: 'moving' | 'boarding' | 'idle';
  currentStopId: string;
  nextStopId: string;
  etaMinutes: number;
  progressPercentage: number; // For rendering bus moving on the SVG track
}

export interface TransportRoute {
  id: string;
  name: string;
  description: string;
  stops: string[]; // Location IDs
  price: number;
  color: string;
}

export const campusLocations: CampusLocation[] = [
  {
    id: 'senate_building',
    name: 'Senate Building',
    category: 'administrative',
    description: 'The iconic high-rise administrative heart of UNILAG.',
    longDescription: 'Rising tall over the Akoka campus, the UNILAG Senate Building is the administrative epicenter of the university. Known for its distinct architectural silhouette and spectacular panoramic views of Lagos, it houses the Vice-Chancellor\'s office and core administrative departments.',
    rating: 4.8,
    reviewsCount: 142,
    mapCoords: { x: 50, y: 70 },
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
    features: ['Vice-Chancellor\'s Office', 'Main Fountain', 'Academic Office', 'Senate Chamber'],
    reviews: [
      { id: 'r1', userName: 'Chidi Okafor', rating: 5, comment: 'Breathtaking architecture, easily the most iconic spot on campus.', date: '3 days ago' },
      { id: 'r2', userName: 'Yetunde Alao', rating: 4, comment: 'Nice grounds to walk around in the evening. Fountain is beautiful when active.', date: '1 week ago' }
    ]
  },
  {
    id: 'lagoon_front',
    name: 'Lagoon Front Park',
    category: 'recreation',
    description: 'Serene recreational park with soothing lagoon breezes.',
    longDescription: 'The Lagoon Front Park is UNILAG\'s crown jewel of relaxation. Bordered by the beautiful Lagos lagoon, this park offers towering palm trees, cozy wooden benches, and cooling breezes. It is the absolute favorite spot for students to read, rest, socialize, and snap photographs.',
    rating: 4.9,
    reviewsCount: 384,
    mapCoords: { x: 52, y: 85 },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    features: ['Lagoon Breezes', 'Photo Spots', 'Wooden Canopy Seating', 'Evening Suya Spots'],
    reviews: [
      { id: 'r3', userName: 'Adebayo Tunde', rating: 5, comment: 'Best relaxation spot. Cool breeze, sunset view of Third Mainland Bridge is elite!', date: '2 days ago' },
      { id: 'r4', userName: 'Joy Ngozi', rating: 5, comment: 'Great for group work, highly refreshing and quiet during mornings.', date: '5 days ago' }
    ]
  },
  {
    id: 'sports_centre',
    name: 'University Sports Centre',
    category: 'recreation',
    description: 'A world-class athletic complex hosting sports and events.',
    longDescription: 'The Sports Centre is the heart of physical training, recreation, and athletic events on campus. It features an Olympic-sized football field with running trackers, basketball courts, and an active indoor sports gym. It is the main training ground for the NUGA games.',
    rating: 4.6,
    reviewsCount: 98,
    mapCoords: { x: 32, y: 45 },
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=600',
    features: ['Football Pitch', 'Running Track', 'Basketball Court', 'Swimming Pool'],
    reviews: [
      { id: 'r5', userName: 'Emeka David', rating: 4, comment: 'Excellent basketball courts. Highly energetic on Friday nights!', date: '4 days ago' }
    ]
  },
  {
    id: 'jaja_clinic',
    name: 'Jaja Clinic & Pharmacy',
    category: 'utility',
    description: 'State-certified emergency and healthcare medical hub.',
    longDescription: 'Named after King Jaja of Opobo, the Jaja Clinic provides continuous medical attention and pharmacy distributions to all staff and registered UNILAG residents. Located centrally near Jaja Hall.',
    rating: 4.2,
    reviewsCount: 57,
    mapCoords: { x: 35, y: 56 },
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    features: ['24/7 Ward', 'Certified Doctors', 'Student Registration', 'Pharmacy'],
    reviews: [
      { id: 'r6', userName: 'Sarah Peters', rating: 4, comment: 'Got my medical registration done under 30 minutes! Staff were polite.', date: '2 weeks ago' }
    ]
  },
  {
    id: 'main_gate',
    name: 'UNILAG Main Gate Park',
    category: 'gate',
    description: 'The primary terminal connecting campus to Akoka.',
    longDescription: 'The UNILAG Main Gate terminal is the central gateway to the university from Yaba and Akoka. Bordered by the security headquarters and campus entrance monuments, it is the busiest transportation hub where students catch red buses, cabs, or campus shuttles.',
    rating: 4.4,
    reviewsCount: 215,
    mapCoords: { x: 15, y: 25 },
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
    features: ['Main Bus Park', 'Campuses Security HQ', 'Visitor Gate Pass Office'],
    reviews: [
      { id: 'r7', userName: 'Tobe Okafor', rating: 4, comment: 'Easy connection to transport, very organized shuttle queues.', date: '1 day ago' }
    ]
  },
  {
    id: 'park_and_shop',
    name: 'UNILAG Shopping Mall (Park & Shop)',
    category: 'services',
    description: 'The core commercial, retail, dining, and printing center.',
    longDescription: 'Commonly known as the Park & Shop or Student Union Mall, this complex is the ultimate commercial center. It contains dozens of food joints, printing centers, tailors, barber shops, and gadget stores servicing students every day.',
    rating: 4.7,
    reviewsCount: 310,
    mapCoords: { x: 45, y: 40 },
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=600',
    features: ['Printing Hubs', 'Food Court', 'ATM Gallery', 'Supermarkets'],
    reviews: [
      { id: 'r8', userName: 'Dolapo Shonibare', rating: 5, comment: 'Almost everything you need is here. Copier services are cheaper than off-campus.', date: '2 days ago' }
    ]
  },
  {
    id: 'faculty_of_science',
    name: 'Faculty of Science Complex',
    category: 'faculty',
    description: 'Major academic complex housing lecture halls and laboratories.',
    longDescription: 'The Faculty of Science complex is one of the oldest and largest faculties on campus, situated adjacent to the Faculty of Engineering and the Main Library. It handles thousands of STEM students daily in its iconic lecture halls like LT 025 and the Julius Berger Lecture Theater.',
    rating: 4.3,
    reviewsCount: 120,
    mapCoords: { x: 65, y: 35 },
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=600',
    features: ['Julius Berger Hall', 'Biology Labs', 'LT 025 Lecture Room', 'Department of chemistry'],
    reviews: [
      { id: 'r9', userName: 'Temi Johnson', rating: 4, comment: 'Iconic lecture theatre! Finding lecture rooms can be a bit challenging for freshers though.', date: '3 days ago' }
    ]
  },
  {
    id: 'faculty_of_education',
    name: 'Faculty of Education Complex',
    category: 'faculty',
    description: 'A spacious academic facility located towards Bariga Gate.',
    longDescription: 'The Faculty of Education is situated towards the Bariga entrance/gate. It is the premier training ground for educational specialists and contains high-capacity lecture halls, sprawling grassy lawns, and a local campus shuttle terminal.',
    rating: 4.5,
    reviewsCount: 74,
    mapCoords: { x: 82, y: 20 },
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?auto=format&fit=crop&q=80&w=600',
    features: ['Education Hall', 'Bariga Shuttle Terminus', 'Quiet reading gardens'],
    reviews: [
      { id: 'r10', userName: 'Mabel Nnamdi', rating: 5, comment: 'So peaceful around here, particularly in the mornings. Love the local bus terminal.', date: '6 days ago' }
    ]
  },
  {
    id: 'main_library',
    name: 'UNILAG Main Library',
    category: 'services',
    description: 'The monumental center of academic research and reading resources.',
    longDescription: 'Overlooking Senate Road, the multi-story UNILAG Main Library is a grand academic monument containing hundreds of thousands of textbooks, journals, and a modern computer lab database. It is the quietest zone on campus, featuring air-conditioned rooms designed for deep study.',
    rating: 4.6,
    reviewsCount: 185,
    mapCoords: { x: 50, y: 50 },
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600',
    features: ['Air-Conditioned Study Rooms', 'Digital Research Center', 'Theses Archives'],
    reviews: [
      { id: 'r11', userName: 'Bose Ade', rating: 5, comment: 'Clean, extremely quiet, and the library staff are helpful. Remember to bring your library card!', date: 'Yesterday' }
    ]
  }
];

export const campusVendors: Vendor[] = [
  {
    id: 'efes_buka',
    name: 'Efes Buka Culinary',
    category: 'food',
    rating: 4.8,
    reviewsCount: 185,
    phone: '+234 812 345 6789',
    locationName: 'UNILAG Shopping Mall (Park & Shop)',
    locationId: 'park_and_shop',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=500',
    description: 'Serving hot, traditional Nigerian dishes including native Joforo Rice, Pepper Soup, pounded yam, amala, and grilled catfish with student-friendly pricing.',
    featured: true,
    products: [
      { id: 'p1', name: 'Premium Joforo Rice & Chicken', price: 1800, description: 'Lagos spicy party Jollof rice served with a large piece of spiced roasted chicken and plantains.', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=150' },
      { id: 'p2', name: 'Amala with Abula & Goat Meat', price: 2200, description: 'Traditional fluffy Yam Flour served with rich Gbegiri (beans soup), Ewedu, pepper sauce, and tender succulent goat meat.', image: 'https://images.unsplash.com/photo-1618413693630-fcfbd62d5ba2?auto=format&fit=crop&q=80&w=150' },
      { id: 'p3', name: 'Fresh Catfish Peppersoup', price: 2500, description: 'Deliciously hot, spiced catfish soup with local scent leaves and herbs, made to order.', image: 'https://images.unsplash.com/photo-1547928298-d86f73cb62d4?auto=format&fit=crop&q=80&w=150' }
    ],
    reviews: [
      { id: 'rv1', userName: 'Fola Jacobs', rating: 5, comment: 'The Jollof is top-notch! Best party rice on campus by far. Generous portions too.', date: '2 hours ago' },
      { id: 'rv2', userName: 'Soji Williams', rating: 4, comment: 'Their amala is hot and fluffy. Service is fast even during peak lunch rush!', date: '2 days ago' }
    ]
  },
  {
    id: 'copypaste_hub',
    name: 'CopyPaste Digital Hub',
    category: 'printing',
    rating: 4.6,
    reviewsCount: 92,
    phone: '+234 905 112 3344',
    locationName: 'UNILAG Shopping Mall (Park & Shop), Block B',
    locationId: 'park_and_shop',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=500',
    description: 'The premier printing and publishing solutions kiosk catering to UNILAG students. High-speed slides printing, spiral binding, thesis formatting, and graphic works.',
    products: [
      { id: 'p4', name: 'Thesis Full Spiral Binding', price: 1500, description: 'Academic-grade heavy plastic spiral binding with custom front transparent PVC and solid back cover.', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=150' },
      { id: 'p5', name: 'Color Slides Printing (per page)', price: 100, description: 'Sleek gloss-finish color printing perfect for academic slides and presentations.', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=150' }
    ],
    reviews: [
      { id: 'rv3', userName: 'Halima Sani', rating: 5, comment: 'Very skilled designers! Assisted me with formatting my final project slides beautifully.', date: '3 days ago' }
    ]
  },
  {
    id: 'lagoon_grill',
    name: 'Lagoon Side Grill & Chill',
    category: 'food',
    rating: 4.9,
    reviewsCount: 145,
    phone: '+234 809 111 2222',
    locationName: 'Lagoon Front Recreation Gardens',
    locationId: 'lagoon_front',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=500',
    description: 'Chilled waterside bar food offering spicy Lagos chicken suya, beef suya, mocktails, and fresh juices perfect for campus dates or evening hangouts.',
    featured: true,
    products: [
      { id: 'p6', name: 'Signature Chicken Suya Platter', price: 2000, description: 'Perfectly spiced, slow-grilled chicken fillet served with sliced tomatoes, raw onions, and rich spicy yaji powder.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=150' },
      { id: 'p7', name: 'Lagoon Sunset Mocktail', price: 1200, description: 'Refreshing sparkling fruit punch with passionfruit, lime, pineapple essence and dynamic mint.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=150' }
    ],
    reviews: [
      { id: 'rv4', userName: 'Tobi Daniels', rating: 5, comment: 'Sipping mocktails with the lagoon breeze blowing at night is pure vibe! Suya is excellently peppered.', date: '1 day ago' }
    ]
  },
  {
    id: 'glamour_locks',
    name: 'Glamour Locks Salon',
    category: 'salon',
    rating: 4.5,
    reviewsCount: 78,
    phone: '+234 814 555 6677',
    locationName: 'Moremi Hall Complex Ground Floor',
    locationId: 'park_and_shop', // Situated near mall blocks or hostels
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=500',
    description: 'Expert hair braiding, dreadlocks, hair dyeing, skin fades, and professional grooming for students and campus staff. High-end modern styling.',
    products: [
      { id: 'p8', name: 'Grooming Haircut & Face Treatment', price: 1500, description: 'Cool sharp hair trim/fade, detailing, followed by an relaxing eucalyptus steam facial wash.', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=150' },
      { id: 'p9', name: 'Premium Braids (Knotless)', price: 8000, description: 'Long-lasting, perfectly aligned precise knotless extensions. Done by dual rapid stylists.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=150' }
    ],
    reviews: [
      { id: 'rv5', userName: 'Damilola Sandra', rating: 4, comment: 'Knotless braids look gorgeous. Staff were so friendly!', date: '1 week ago' }
    ]
  },
  {
    id: 'techstop_unilag',
    name: 'TechStop Mobile & Laptop Care',
    category: 'gadgets',
    rating: 4.7,
    reviewsCount: 110,
    phone: '+234 703 999 8888',
    locationName: 'Shopping Mall, Block C, Shop 4',
    locationId: 'park_and_shop',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=500',
    description: 'Instant diagnostics and repair services for smartphones, iPads, and MacBooks. Stockists of genuine screen protectors, fast chargers, and durable tech accessories.',
    products: [
      { id: 'p10', name: 'Ultra-Fast GaN 65W PD Charger', price: 9500, description: 'Dual-port USB-C travel charger perfectly powerful enough to charge your laptops and phones simultaneously.', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=150' }
    ],
    reviews: [
      { id: 'rv6', userName: 'Junior Ajayi', rating: 5, comment: 'Repaired my crashing MacBook motherboard in 4 hours. Absolute saviors for my exams!', date: '3 days ago' }
    ]
  }
];

export const transportRoutes: TransportRoute[] = [
  {
    id: 'route_main_park',
    name: 'Main Gate ↔ Park & Shop',
    description: 'Direct shuttle connecting the campus entrance to the commercial shopping complex.',
    stops: ['main_gate', 'sports_centre', 'main_library', 'park_and_shop', 'senate_building'],
    price: 150,
    color: '#EF4444' // red
  },
  {
    id: 'route_gate_edu',
    name: 'Main Gate ↔ Faculty of Education',
    description: 'Academic route running across student libraries onto the Education compound.',
    stops: ['main_gate', 'main_library', 'faculty_of_science', 'faculty_of_education'],
    price: 150,
    color: '#3B82F6' // blue
  },
  {
    id: 'route_shuttle_lagoon',
    name: 'Park & Shop ↔ Lagoon Front',
    description: 'Scenic relaxation route from the commercial center down to the shoreline.',
    stops: ['park_and_shop', 'senate_building', 'lagoon_front'],
    price: 150,
    color: '#10B981' // emerald
  }
];

export const activeBuses: Bus[] = [
  {
    id: 'bus_1',
    shuttleNumber: 'UNILAG-RED-04',
    driverName: 'Baba Shola',
    seatsAvailable: 4,
    seatsTotal: 18,
    status: 'moving',
    currentStopId: 'main_gate',
    nextStopId: 'main_library',
    etaMinutes: 3,
    progressPercentage: 42
  },
  {
    id: 'bus_2',
    shuttleNumber: 'UNILAG-RED-12',
    driverName: 'Uncle Murphy',
    seatsAvailable: 11,
    seatsTotal: 18,
    status: 'boarding',
    currentStopId: 'park_and_shop',
    nextStopId: 'senate_building',
    etaMinutes: 1,
    progressPercentage: 5
  },
  {
    id: 'bus_3',
    shuttleNumber: 'UNILAG-RED-07',
    driverName: 'Mallam Yusuf',
    seatsAvailable: 0,
    seatsTotal: 18,
    status: 'moving',
    currentStopId: 'senate_building',
    nextStopId: 'lagoon_front',
    etaMinutes: 6,
    progressPercentage: 68
  },
  {
    id: 'bus_4',
    shuttleNumber: 'UNILAG-BLUE-02',
    driverName: 'Kingsley N.',
    seatsAvailable: 8,
    seatsTotal: 18,
    status: 'moving',
    currentStopId: 'faculty_of_science',
    nextStopId: 'faculty_of_education',
    etaMinutes: 4,
    progressPercentage: 50
  }
];

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  image: string;
  category: string;
  intro: string;
  whyVisit: string[];
  topExperiences: string[];
  attractions: string[];
  bestTimeToVisit: string;
  travelTips: string;
  relatedTours: string[];
  faq: { q: string; a: string }[];
}

export interface Tour {
  id: string;
  name: string;
  destination: string;
  category: string;
  image: string;
  duration: string;
  description: string;
  overview: string;
  highlights: string[];
  itinerary: { day: string; title: string; desc: string }[];
  whatToExpect: string;
  bestTimeToGo: string;
  whatToBring: string[];
  faq: { q: string; a: string }[];
}

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  author: string;
  image?: string;
  related: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  trip: string;
  avatar: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: string;
}

// Curated, ultra-stable, high-fidelity real photography URLs from Unsplash CDN (no AI-generation)
const REAL_PHOTOS = {
  lionCloseUp: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80",
  zanzibarBeach: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  kilimanjaroGiraffe: "https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?auto=format&fit=crop&w=1200&q=80",
  safariGoldenHour: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  swahiliCulture: "https://images.unsplash.com/photo-1489493887462-402b72644d55?auto=format&fit=crop&w=1200&q=80",
  tropicalCoastSunset: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
};

export const destinationsData: Destination[] = [
  {
    id: "kenya",
    name: "Kenya",
    tagline: "The Cradle of Safari & Untamed Wilderness",
    image: REAL_PHOTOS.safariGoldenHour,
    category: "East Africa",
    intro: "Kenya is the legendary home of the African safari, with sweeping savannas, spectacular wildlife migrations, and vibrant tribal cultures from the Maasai Mara to Diani Beach.",
    whyVisit: [
      "Witness the world-famous Great Wildebeest Migration in the Maasai Mara.",
      "Marvel at free-roaming elephants against Mt. Kilimanjaro in Amboseli.",
      "Relax on the untouched sands of Diani along the Swahili Coast."
    ],
    topExperiences: [
      "Sunrise hot air balloon flight over the Mara savanna with bush breakfast.",
      "Guided walking safaris in private northern conservancies with Samburu rangers."
    ],
    attractions: ["Maasai Mara Reserve", "Amboseli National Park", "Diani Beach"],
    bestTimeToVisit: "July to October for migration; January to March for dry-season wildlife viewing.",
    travelTips: "Apply for a Kenyan Electronic Travel Authorization (eTA) in advance. Pack lightweight earth-toned clothing.",
    relatedTours: ["maasai-mara-safari"],
    faq: [
      { q: "Is Kenya safe for luxury travelers?", a: "Yes, Kenya is a highly secure, established premium destination with elite private concessions and charters." }
    ]
  },
  {
    id: "tanzania",
    name: "Tanzania",
    tagline: "Endless golden savannas & grand ecosystems",
    image: REAL_PHOTOS.lionCloseUp,
    category: "East Africa",
    intro: "Tanzania offers wild Africa at its grandest scale, hosting the endless Serengeti plains, the Ngorongoro Crater, and Mount Kilimanjaro.",
    whyVisit: [
      "Track the year-round Great Wildebeest Migration.",
      "Explore Ngorongoro Crater, a caldera home to over 25,000 large mammals."
    ],
    topExperiences: [
      "Mobile luxury tented safaris following the migration.",
      "Drives within the Ngorongoro caldera walls searching for black rhinos."
    ],
    attractions: ["Serengeti National Park", "Ngorongoro Crater", "Mount Kilimanjaro"],
    bestTimeToVisit: "June to October for dry-season safaris; January and February for southern Serengeti calving.",
    travelTips: "Ensure travel vaccinations are up to date and obtain a tourist e-Visa. early mornings on crater rims can be cold.",
    relatedTours: ["serengeti-safari"],
    faq: [
      { q: "Can I combine safari with beach relaxation?", a: "Yes, most itineraries pair Serengeti safaris with a direct scenic flight to Zanzibar." }
    ]
  },
  {
    id: "zanzibar",
    name: "Zanzibar",
    tagline: "The Spice Island of the Indian Ocean",
    image: REAL_PHOTOS.zanzibarBeach,
    category: "Beach Destinations",
    intro: "An exotic Swahili-Arabic paradise of organic spice farms, powder-white sandy beaches, and spectacular Indian Ocean coral reefs.",
    whyVisit: [
      "Relax on remote, palm-shaded turquoise beaches.",
      "Explore the historic stone alleys of UNESCO-listed Stone Town."
    ],
    topExperiences: [
      "Sunset dhow sailing cruises with traditional Swahili musicians.",
      "Snorkeling and marine excursions around Mnemba Atoll reefs."
    ],
    attractions: ["Stone Town Alleys", "Nungwi Beach Coastline", "Jozani Primate Forest"],
    bestTimeToVisit: "June to October and December to February.",
    travelTips: "When walking in Stone Town, dress modestly to respect local Swahili Islamic traditions.",
    relatedTours: ["zanzibar-beach-escape"],
    faq: []
  },
  {
    id: "uganda",
    name: "Uganda",
    tagline: "The Lush Cradle of Mountain Primates",
    image: REAL_PHOTOS.swahiliCulture,
    category: "Wildlife Destinations",
    intro: "Famously coined the 'Pearl of Africa,' Uganda is a lush tropical sanctuary of rainforests, thundering rivers, and mountain gorilla reserves.",
    whyVisit: [
      "Look directly into the eyes of endangered mountain gorillas in Bwindi.",
      "Track active chimpanzees in Kibale Forest."
    ],
    topExperiences: [
      "A life-changing trek to spend an hour with gorillas in the mist.",
      "Sunset cruises on the River Nile to the base of Murchison Falls."
    ],
    attractions: ["Bwindi Impenetrable Forest", "Kibale Primate Reserve", "Murchison Falls"],
    bestTimeToVisit: "June to August and December to February.",
    travelTips: "Primate trekking permits must be booked several months in advance. Wear robust hiking boots.",
    relatedTours: ["mountain-adventures"],
    faq: []
  },
  {
    id: "rwanda",
    name: "Rwanda",
    tagline: "Land of a Thousand Hills & Eco-Lodge Retreats",
    image: REAL_PHOTOS.kilimanjaroGiraffe,
    category: "Wildlife Destinations",
    intro: "A pristine model of exclusive eco-tourism, featuring rolling green volcanic peaks, architectural luxury lodges, and direct access to mountain gorillas.",
    whyVisit: [
      "Encounter gorillas in the dramatic mist of Volcanoes National Park.",
      "Walk the canopy suspension bridge over the primeval Nyungwe Forest."
    ],
    topExperiences: [
      "Bespoke gorilla treks paired with private luxury forest villas.",
      "Spotting golden monkeys in bamboo mountain forests."
    ],
    attractions: ["Volcanoes National Park", "Nyungwe Forest Canopy", "Lake Kivu Resort"],
    bestTimeToVisit: "June to September during dry season.",
    travelTips: "Single-use plastic bags are strictly banned in Rwanda. Kigali is incredibly clean and safe.",
    relatedTours: ["mountain-adventures"],
    faq: []
  },
  {
    id: "south-africa",
    name: "South Africa",
    tagline: "A World in One Luxurious Country",
    image: REAL_PHOTOS.tropicalCoastSunset,
    category: "Southern Africa",
    intro: "Blending raw big-game wilderness with Cape Town's spectacular cliffs and the world-class sun-drenched vineyards of Franschhoek.",
    whyVisit: [
      "See the Big Five in exclusive, off-road private Kruger reserves like Sabi Sands.",
      "Dine at award-winning culinary estates in Franschhoek and Stellenbosch."
    ],
    topExperiences: [
      "Night safari tracking with master Shangaan trackers.",
      "Helicopter tour of the spectacular Cape Peninsula cliffs."
    ],
    attractions: ["Sabi Sands Private Reserve", "Cape Town & Table Mountain", "Cape Winelands"],
    bestTimeToVisit: "May to September for safaris; November to March for vibrant Cape Town beaches.",
    travelTips: "South Africa uses Type M/N power outlets. Credit cards are universally accepted.",
    relatedTours: ["serengeti-safari"],
    faq: []
  }
];

export const toursData: Tour[] = [
  {
    id: "maasai-mara-safari",
    name: "Maasai Mara Wildlife Safari",
    destination: "Kenya",
    category: "Wildlife",
    image: REAL_PHOTOS.safariGoldenHour,
    duration: "5 Days / 4 Nights",
    description: "An immersive journey into the heart of Africa's most famous wildlife arena, featuring luxurious tented camps, private open-top 4x4 safaris, and dawn hot-air balloon flights.",
    overview: "Set foot on the legendary plains of the Maasai Mara. This signature itinerary is designed for travelers who want to experience dense populations of lions, leopards, cheetahs, and majestic elephants up close. Staying in a private, high-end conservancy ensures total exclusivity away from tourist crowds.",
    highlights: [
      "Daily private game drives in specialized open-sided 4x4 vehicles with silver-certified guides.",
      "Eco-luxury tented camp accommodation with private verandas overlooking wild rivers.",
      "A private cultural visit to an authentic Maasai village to learn about traditional customs and songs.",
      "Charming bush sundowners—sipping cocktails as the sun sets over the African horizon."
    ],
    itinerary: [
      { day: "Day 1", title: "Nairobi to the Maasai Mara", desc: "Fly via light aircraft from Nairobi directly to a private bush airstrip. Arrive for lunch and embark on an afternoon game drive." },
      { day: "Day 2-3", title: "Untamed Savannas & Big Cat Tracking", desc: "Track the Mara's abundant wildlife. Observe prides of lions, search for leopards in river forests, and watch cheetahs scan the horizon." },
      { day: "Day 4", title: "Sunrise Balloon Flight & Maasai Culture", desc: "Glide over the plains in a hot air balloon, followed by a champagne breakfast. Spend the afternoon learning Maasai traditions directly." },
      { day: "Day 5", title: "Morning Safari & Departure", desc: "One final morning safari, followed by a scenic flight back to Nairobi." }
    ],
    whatToExpect: "Exceptional wildlife viewing, high-end dining, supreme comfort in hand-selected tented suites, and highly personalized guiding services.",
    bestTimeToGo: "July to October to witness the Wildebeest Migration; December to March for predator tracking.",
    whatToBring: ["Neutral khaki or olive clothing", "Telephoto lens camera", "Sun protection", "Warm fleece for early mornings"],
    faq: []
  },
  {
    id: "serengeti-safari",
    name: "The Endless Serengeti Expedition",
    destination: "Tanzania",
    category: "Wildlife",
    image: REAL_PHOTOS.lionCloseUp,
    duration: "6 Days / 5 Nights",
    description: "Traverse the vast, boundless plains of the Serengeti, tracking the Great Migration and staying in premium tented camps perched on ancient granite kopjes.",
    overview: "This premium safari spans the vast Serengeti ecosystem. From the central plains to the dramatic northern rivers, you will follow the path of millions of wildebeests and zebras, concluding with a descent into the majestic Ngorongoro Crater.",
    highlights: [
      "Follow the movement of the Great Wildebeest Migration.",
      "Stay in boutique luxury camps built on scenic granite outcrops.",
      "Descend into the Ngorongoro Crater, a UNESCO World Heritage caldera teeming with life."
    ],
    itinerary: [
      { day: "Day 1", title: "Arusha to Serengeti Plains", desc: "Fly from Arusha to the central Serengeti. After a welcome, enjoy a late afternoon safari search for lions and leopards." },
      { day: "Day 2-3", title: "Following the Great Migration", desc: "Track the migration herds. Experience hundreds of thousands of animals moving together across the golden grass." },
      { day: "Day 4", title: "Journey to Ngorongoro Rim", desc: "Travel to the high-altitude rim of the Ngorongoro Crater. Stay in an elegant lodge with caldera views." },
      { day: "Day 5", title: "Ngorongoro Crater Floor Safari", desc: "Descend into the volcanic crater for an early morning game drive, experiencing a highly dense ecosystem." },
      { day: "Day 6", title: "Transfer to Arusha", desc: "Leisurely breakfast on the crater rim before a flight back to Arusha." }
    ],
    whatToExpect: "Stunning geological scenery, huge numbers of grazing mammals and predators, and luxurious historic safari service.",
    bestTimeToGo: "June to October for dry-season migration crossings.",
    whatToBring: ["Fleece jacket (crater rim nights are cold)", "Sturdy walking shoes", "Binoculars"],
    faq: []
  },
  {
    id: "zanzibar-beach-escape",
    name: "Zanzibar Island Sanctuary",
    destination: "Zanzibar",
    category: "Beach",
    image: REAL_PHOTOS.zanzibarBeach,
    duration: "4 Days / 3 Nights",
    description: "An elegant coastal holiday blending turquoise Indian Ocean waters, ancient Swahili culture, aromatic organic spice tours, and world-class seafood dining.",
    overview: "This boutique coastal escape invites you to slow down and immerse yourself in Zanzibar's laid-back 'pole pole' lifestyle. From your luxury private beach villa, experience Stone Town's historical charm, tour local spice forests, and sail into the sunset.",
    highlights: [
      "Relax in a private luxury beachfront suite with direct access to turquoise waters.",
      "A private guided walking tour of UNESCO-listed Stone Town's ancient architectural heritage.",
      "Snorkel the pristine, protected marine sanctuary of Mnemba Atoll."
    ],
    itinerary: [
      { day: "Day 1", title: "Arrival in Zanzibar Paradise", desc: "Private VIP transfer to your premium beachfront resort. Enjoy a direct view of the Indian Ocean." },
      { day: "Day 2", title: "Stone Town Alleys & organic Spice Tour", desc: "Wander through the historic alleys of Stone Town. In the afternoon, visit an organic spice farm." },
      { day: "Day 3", title: "Marine Safari at Mnemba Atoll", desc: "Snorkel in the Mnemba Island Marine Conservation Area with sea turtles and dolphins." },
      { day: "Day 4", title: "Farewell Zanzibar", desc: "Morning swim in the ocean before a private transfer to the airport." }
    ],
    whatToExpect: "Ultimate beachfront peace, rich cultural encounters, luxury spa therapies, and fresh coastal seafood dining.",
    bestTimeToGo: "June to October and December to March.",
    whatToBring: ["Light linen shirts and trousers", "Swimsuits and sun care", "Modest shawl for Stone Town"],
    faq: []
  },
  {
    id: "mountain-adventures",
    name: "East African Peaks & Gorilla Valleys",
    destination: "Uganda & Rwanda",
    category: "Adventure",
    image: REAL_PHOTOS.kilimanjaroGiraffe,
    duration: "8 Days / 7 Nights",
    description: "An active, high-end trekking expedition through the misty jungles of Uganda and Rwanda to meet rare mountain gorillas and chimpanzees.",
    overview: "This is one of the world's most physically rewarding and emotionally moving wildlife expeditions. Traverse high-altitude rainforests, meet ancient primate families, and stay in architectural eco-lodges perched on volcanic ridgelines.",
    highlights: [
      "Guaranteed mountain gorilla tracking permit in Bwindi Impenetrable Forest.",
      "Track highly active chimpanzee families through the Kibale Forest canopy.",
      "Stay in premium eco-luxury mountain lodges with private fireplaces and butler service."
    ],
    itinerary: [
      { day: "Day 1", title: "Arrival in Kigali, Rwanda", desc: "Arrive in Rwanda's capital. Check into a boutique hotel and enjoy a fine-dining Swahili-fusion dinner." },
      { day: "Day 2", title: "Scenic Drive to Bwindi Forest", desc: "Scenic drive across the border into Uganda, watching rolling green hills transition into forest." },
      { day: "Day 3", title: "The Gorilla Encounter of a Lifetime", desc: "Spend a magical hour sitting silently just meters away from a family of mountain gorillas." },
      { day: "Day 4-5", title: "Chimpanzees of Kibale Forest", desc: "Track energetic chimpanzee families vocalizing and leaping through the canopy." },
      { day: "Day 6-7", title: "Queen Elizabeth National Park Savanna", desc: "Savanna safari in Queen Elizabeth National Park. Spot tree-climbing lions and river hippos." },
      { day: "Day 8", title: "Return to Kigali", desc: "Drive back to Kigali, enjoying a city craft tour before transferring to the airport." }
    ],
    whatToExpect: "Physically active daily hikes in high-altitude forests, breathtaking rainforest vistas, and top-tier hospitality.",
    bestTimeToGo: "June to August and December to February.",
    whatToBring: ["Waterproof leather hiking boots", "Thick hiking trousers", "Gardening gloves"],
    faq: []
  }
];

export const blogData: Article[] = [
  {
    id: "best-time-to-visit-kenya",
    title: "The Connoisseur’s Guide: The Best Time to Visit Kenya",
    category: "Travel Tips",
    date: "October 2026",
    excerpt: "Planning an African safari involves matching your personal travel goals with East Africa's dynamic weather cycles. From the Wildebeest Migration to quiet dry-season safaris, here is when to travel.",
    content: `When planning a trip to Kenya, timing is everything. Kenya is a diverse country with climates that range from hot and humid along the Swahili Coast to cool and crisp in the highlands.

The Peak Dry Season (July to October)
This is widely considered the best time to visit. The dry weather forces wildlife to gather around permanent water sources, making them incredibly easy to spot. Crucially, this period hosts the world-famous Great Wildebeest Migration in the Maasai Mara.

The Shoulder Season (January to March)
For a more exclusive, less crowded safari, the first three months of the year are spectacular. The weather is dry and warm. This is calving season, bringing countless newborns and drawing predators.

The Rainy Season (April to May & November)
The "Green Season" rains transform savannas into a lush emerald paradise. Benefits include zero crowds, dramatic skies perfect for photography, and incredible migratory birdlife.`,
    metaDescription: "Discover the best seasons to visit Kenya for wildlife safaris, the Great Wildebeest Migration, and coastal beach holidays.",
    author: "Amara Kagz",
    related: ["top-safari-destinations", "safari-packing-guide"]
  },
  {
    id: "top-safari-destinations",
    title: "Top 5 Safari Destinations in East Africa for Luxury Travelers",
    category: "Safari",
    date: "September 2026",
    excerpt: "East Africa is home to some of the world's most spectacular ecosystems. We detail the five absolute finest destinations that offer pure luxury, exclusivity, and raw nature.",
    content: `East Africa stands as the ultimate spiritual home of the African safari. These five luxury destinations offer unparalleled access and service:

1. Maasai Mara National Reserve, Kenya
Teeming plains. Bordering private conservancies grant total exclusivity, night game drives, and off-road tracking.

2. Serengeti National Park, Tanzania
Vast, endless landscapes. Private lodges on granite kopjes offer infinity pools overlooking migrating herds.

3. Ngorongoro Crater, Tanzania
A 600m deep volcanic caldera holding 25,000 large animals, including black rhinos.

4. Bwindi Impenetrable National Park, Uganda
Lush rainforest treks to meet rare mountain gorillas.

5. Amboseli National Park, Kenya
Tusker elephants walking with Mount Kilimanjaro towering in the background.`,
    metaDescription: "Explore the top five safari destinations in Kenya, Tanzania, and Uganda, featuring Maasai Mara and Serengeti.",
    author: "Amara Kagz",
    related: ["best-time-to-visit-kenya", "safari-packing-guide"]
  },
  {
    id: "safari-packing-guide",
    title: "The Ultimate Kenya Safari Packing Guide: What to Wear and Bring",
    category: "Travel Tips",
    date: "August 2026",
    excerpt: "Packing for an African safari requires balancing comfort, practicality, and luggage constraints. This refined guide details exactly what to bring for your journey.",
    content: `A successful safari begins with thoughtful preparation, especially under the 15kg soft-bag limits on light aircraft flights.

The Color Palette
Stick to natural, earthy colors: khaki, olive green, sand, beige, and light brown. Avoid dark blue/black (which attract tsetse flies) and white/neon (which startle animals).

Essential Layers
Savanna mornings are cold, requiring a windproof fleece, scarf, and beanie. Midday is intense, making long breathable linen shirts and trousers essential.

Footwear
Sturdy, enclosed walking shoes or light hiking boots with good grip are perfect. Bring premium leather sandals for evenings.

Tech & Accessories
High-quality binoculars are non-negotiable. Bring a camera with a decent zoom lens and a dustproof bag to protect your gear.`,
    metaDescription: "Expert packing tips for a Kenyan safari. Learn what clothing, colors, shoes, and gear to bring under luggage limits.",
    author: "Amara Kagz",
    related: ["best-time-to-visit-kenya", "top-safari-destinations"]
  }
];

export const testimonialsData: Testimonial[] = [
  {
    id: "1",
    quote: "Our safari organized by KAGZ was absolutely flawless. The private camps were stunning, but our guide's expertise in tracking a leopard in the Mara was the absolute highlight of our lives.",
    author: "Eleanor & Thomas Vance",
    location: "London, UK",
    trip: "Maasai Mara Explorer",
    avatar: "EV"
  },
  {
    id: "2",
    quote: "Gorilla trekking in Bwindi was an incredibly moving experience, followed by a week of pure relaxation in Zanzibar. KAGZ tailored the transitions perfectly.",
    author: "Dr. Marcus Chen",
    location: "San Francisco, USA",
    trip: "Gorillas & Zanzibar Coast",
    avatar: "MC"
  },
  {
    id: "3",
    quote: "Attention to detail is KAGZ's superpower. Every private flight, sunset sundowner, and bush dinner was beautifully curated. It was a truly premium African adventure.",
    author: "Sophie Dumont",
    location: "Paris, France",
    trip: "Classic Tanzania Wilderness",
    avatar: "SD"
  }
];

export const galleryData: GalleryItem[] = [
  { id: "1", src: REAL_PHOTOS.safariGoldenHour, alt: "Golden hour over the expansive savanna", category: "Landscapes" },
  { id: "2", src: REAL_PHOTOS.lionCloseUp, alt: "Close-up portrait of a majestic wild lion", category: "Wildlife" },
  { id: "3", src: REAL_PHOTOS.zanzibarBeach, alt: "Breathtaking coastline and dhow sailing in Zanzibar", category: "Beaches" },
  { id: "4", src: REAL_PHOTOS.swahiliCulture, alt: "Beautiful natural landscapes of East Africa", category: "Culture" },
  { id: "5", src: REAL_PHOTOS.kilimanjaroGiraffe, alt: "Mount Kilimanjaro peak rising above the mist", category: "Adventure" },
  { id: "6", src: REAL_PHOTOS.safariGoldenHour, alt: "Elephants marching across Amboseli", category: "Safari" }
];

export interface EnquiryNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface EnquiryEmailRecord {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  templateKey?: 'welcome' | 'proposal' | 'followup' | 'confirmation' | 'custom';
  sentAt: string;
  status: 'Delivered' | 'Sent' | 'Opened';
  messageId: string;
  deliveryReceipt?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  destination: string;
  travelDate: string;
  startDate?: string;
  endDate?: string;
  travelers: string;
  style: string;
  message: string;
  status: 'New Enquiry' | 'Under Curation' | 'Proposal Sent' | 'Confirmed' | 'Closed';
  dateSubmitted: string;
  priority?: 'VIP' | 'High' | 'Standard' | 'Flexible';
  assignedTo?: string;
  budget?: string;
  source?: string;
  notes?: EnquiryNote[];
  emails?: EnquiryEmailRecord[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verifiedAt?: string;
}

export const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: "enq-1728392100",
    name: "Lord Alistair & Lady Cynthia Montgomery",
    email: "montgomery.safaris@cotswolds.uk",
    phone: "+44 7911 123456",
    country: "United Kingdom",
    destination: "Kenya (Maasai Mara & Samburu)",
    travelDate: "August 2027",
    travelers: "2 guests (Couple)",
    style: "Ultra-Luxury Private Mobile Concessions",
    message: "Planning our 25th wedding anniversary safari. We require front-row views of the Mara River wildebeest crossings, private open-sided Land Cruisers, exclusive fly-in Cessna transfers, and a private sunrise hot air balloon with bush champagne breakfast.",
    status: "Under Curation",
    priority: "VIP",
    assignedTo: "Amara Kagz",
    budget: "$32,000 - $38,000",
    source: "Plan Your Trip Concierge",
    dateSubmitted: "2026-10-06",
    notes: [
      {
        id: "note-1",
        author: "Amara Kagz",
        date: "2026-10-06 14:30",
        text: "Held provisional dates at Cottar's 1920s Safari Camp and Mara Plains. Client requested private naturalist guide with extensive big-cat tracking pedigree."
      },
      {
        id: "note-2",
        author: "Timothy Kungu",
        date: "2026-10-07 10:15",
        text: "Checked Wilson Airport charter availability for direct flight to Keekorok Airstrip. Custom proposal drafted."
      }
    ],
    emails: [
      {
        id: "msg-101",
        senderName: "Timothy Kungu",
        senderEmail: "kungutim541@gmail.com",
        recipientName: "Lord Alistair & Lady Cynthia Montgomery",
        recipientEmail: "montgomery.safaris@cotswolds.uk",
        subject: "Your Bespoke East Africa Safari Expedition | KAGZ Travel & Safaris",
        body: "Dear Lord Alistair & Lady Cynthia Montgomery,\n\nThank you for your enquiry with KAGZ Travel & Safaris regarding your upcoming journey to Kenya (Maasai Mara & Samburu) planned for August 2027.\n\nOur senior safari design team is reviewing your bespoke preferences for 2 guests (Ultra-Luxury Private Mobile Concessions). We would be delighted to schedule a brief private consultation call to discuss your wildlife priorities, preferred private conservancies, and bespoke aviation connections.\n\nWarmest safari regards,\nTimothy Kungu\nLead Safari Curator | KAGZ Travel & Safaris",
        templateKey: "welcome",
        sentAt: "2026-10-06 11:30 AM",
        status: "Delivered",
        messageId: "kagz-msg-1728392100-welcome",
        deliveryReceipt: "250 2.0.0 OK (Delivered directly to client inbox via KAGZ Secure Mail Gateway)"
      }
    ]
  },
  {
    id: "enq-1728391800",
    name: "Dr. Sophia Laurent & Family",
    email: "sophia.laurent@sorbonne-med.fr",
    phone: "+33 6 12 34 56 78",
    country: "France",
    destination: "Rwanda & Uganda",
    travelDate: "Dec 26, 2026 - Jan 6, 2027",
    travelers: "4 guests (2 adults, 2 teens: 16 & 18)",
    style: "Primate Trekking & Luxury Eco-Lodges",
    message: "Our family seeks habituated mountain gorilla permits in Volcanoes National Park (2 treks) combined with Bwindi Impenetrable Forest and chimpanzees in Kibale. We require luxury lodge suites with roaring fireplaces.",
    status: "New Enquiry",
    priority: "High",
    assignedTo: "Timothy Kungu",
    budget: "$24,000 - $28,000",
    source: "Tour Detail: Primate Grand Traverse",
    dateSubmitted: "2026-10-08",
    notes: [
      {
        id: "note-3",
        author: "Timothy Kungu",
        date: "2026-10-08 08:45",
        text: "Contacted Rwanda Development Board to hold 4 gorilla permits for Dec 29. Need passport copies from client to lock booking."
      }
    ]
  },
  {
    id: "enq-1728391200",
    name: "Marcus & Elena Vance",
    email: "marcus.vance@techventures.io",
    phone: "+1 (415) 890-2341",
    country: "United States (California)",
    destination: "Tanzania & Zanzibar",
    travelDate: "July 12 - July 24, 2027",
    travelers: "2 guests",
    style: "Bush-to-Beach Signature Expedition",
    message: "Looking for 6 nights exploring Northern Serengeti river crossings followed by 5 nights on a private barefoot luxury atoll in Zanzibar (Mnemba or Matemwe). Require private dhow sundowner and private chef.",
    status: "Confirmed",
    priority: "VIP",
    assignedTo: "David Ochieng",
    budget: "$21,500",
    source: "Direct Concierge Referral",
    dateSubmitted: "2026-10-05",
    notes: [
      {
        id: "note-4",
        author: "David Ochieng",
        date: "2026-10-05 11:20",
        text: "30% Safari commitment deposit processed via luxury wire transfer. Vouchers sent for Serengeti Four Seasons & Mnemba Island lodge."
      },
      {
        id: "note-5",
        author: "David Ochieng",
        date: "2026-10-06 15:00",
        text: "Guest dietary requirements noted: Elena is gluten-free and pescatarian. Head safari chef notified."
      }
    ]
  },
  {
    id: "enq-1728390500",
    name: "Hiroshi & Keiko Tanaka",
    email: "tanaka.h@ginzamedia.jp",
    phone: "+81 90 4567 8901",
    country: "Japan",
    destination: "Kenya (Maasai Mara & Amboseli)",
    travelDate: "September 15 - September 26, 2027",
    travelers: "2 guests (Wildlife Photographers)",
    style: "Specialist Wildlife Photography Safari",
    message: "Both professional photographers with telephoto 600mm primes. We require customized open Land Cruisers equipped with beanbags, gimbal mounting plates, low-angle side hatches, and an expert driver experienced with predator framing.",
    status: "Proposal Sent",
    priority: "Standard",
    assignedTo: "Amara Kagz",
    budget: "$16,000 - $19,000",
    source: "Contact Concierge Form",
    dateSubmitted: "2026-10-04",
    notes: [
      {
        id: "note-6",
        author: "Amara Kagz",
        date: "2026-10-05 16:40",
        text: "Sent customized photographic itinerary with private vehicle option at Mara North Conservancy. Awaiting client review of photographic gear specs."
      }
    ]
  },
  {
    id: "enq-1728389800",
    name: "Klaus & Greta Becker",
    email: "klaus.becker@berlin-architekten.de",
    phone: "+49 171 2345678",
    country: "Germany",
    destination: "Kenya (Amboseli & Tsavo West)",
    travelDate: "November 5 - November 14, 2026",
    travelers: "3 guests (2 adults, 1 child)",
    style: "Classic Tented Safari & Walking Bush Expeditions",
    message: "Desire to experience legendary big tusker elephants under Mount Kilimanjaro and Mzima Springs hippos. Looking for eco-conscious camps with guided walking safaris with local Maasai trackers.",
    status: "New Enquiry",
    priority: "Standard",
    assignedTo: "David Ochieng",
    budget: "$11,500 - $14,000",
    source: "Amboseli Destination Page",
    dateSubmitted: "2026-10-08",
    notes: []
  }
];


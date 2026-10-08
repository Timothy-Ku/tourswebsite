import { useEffect } from 'react';
import { destinationsData, toursData, blogData } from '../data/travelData';

interface SEOUpdaterProps {
  currentHash: string;
}

export default function SEOUpdater({ currentHash }: SEOUpdaterProps) {
  useEffect(() => {
    let title = 'KAGZ — Premium African Travel, Safaris & Experiences';
    let description = 'Discover extraordinary African safaris, stunning tropical beaches, and authentic cultural tours across Kenya, Tanzania, Zanzibar, Uganda, Rwanda, and South Africa with KAGZ.';

    // Parse path
    const hash = currentHash || '#/';
    
    // Read from localStorage if available, otherwise fallback to static imports
    const storedDests = localStorage.getItem('kagz_destinations');
    const storedTours = localStorage.getItem('kagz_tours');
    const storedBlogs = localStorage.getItem('kagz_blogs');

    const destinationsList = storedDests ? JSON.parse(storedDests) : destinationsData;
    const toursList = storedTours ? JSON.parse(storedTours) : toursData;
    const blogsList = storedBlogs ? JSON.parse(storedBlogs) : blogData;
    
    if (hash === '#/') {
      title = 'KAGZ — Premium African Travel, Safaris & Experiences';
      description = 'Explore unforgettable destinations, extraordinary wildlife, rich cultures, and meaningful travel experiences with KAGZ.';
    } else if (hash.startsWith('#/destinations/')) {
      const destId = hash.replace('#/destinations/', '');
      const dest = destinationsList.find((d: any) => d.id === destId);
      if (dest) {
        title = `${dest.name} Custom Luxury Safaris & Travel Guide | KAGZ`;
        description = `${dest.intro.substring(0, 150)}... Discover things to do, top attractions, and premium itineraries for ${dest.name} with KAGZ.`;
      }
    } else if (hash === '#/destinations') {
      title = 'Explore Africa: Curated Safari Destinations | KAGZ';
      description = 'Search and filter premium travel destinations across East and Southern Africa, including Kenya, Tanzania, Zanzibar, Uganda, Rwanda, and South Africa.';
    } else if (hash.startsWith('#/tours/')) {
      const tourId = hash.replace('#/tours/', '');
      const tour = toursList.find((t: any) => t.id === tourId);
      if (tour) {
        title = `${tour.name} (${tour.duration}) | KAGZ Safaris`;
        description = `${tour.description} Experience luxury lodging, private guiding, and hand-selected highlights in Africa.`;
      }
    } else if (hash === '#/tours') {
      title = 'Hand-Crafted African Safaris & Experience Itineraries | KAGZ';
      description = 'Discover premium tour itineraries, including wildlife safaris, tropical beach escapes, culture heritage trips, and mountain treks.';
    } else if (hash.startsWith('#/guide/')) {
      const articleId = hash.replace('#/guide/', '');
      const article = blogsList.find((b: any) => b.id === articleId);
      if (article) {
        title = `${article.title} | KAGZ Travel Guide`;
        description = article.metaDescription || article.excerpt;
      }
    } else if (hash === '#/guide') {
      title = 'African Travel Guide, Packing Checklists & Tips | KAGZ';
      description = 'Read expert African travel guides, wildlife photography tips, savanna packing checklists, and advice on the best seasons to travel.';
    } else if (hash === '#/about') {
      title = 'About KAGZ — Our Passion, Vision & Local Heritage';
      description = 'Learn about KAGZ, a premier African travel agency built on deep local knowledge, sustainable conservation, and personalized luxury travel curation.';
    } else if (hash === '#/gallery') {
      title = 'Immersive African Wildlife & Landscape Photo Gallery | KAGZ';
      description = 'Wander through our full-screen photography collection showcasing majestic wild animals, pristine beaches, and rich Maasai community life.';
    } else if (hash === '#/contact') {
      title = 'Contact KAGZ Concierge — Speak to a Safari Specialist';
      description = 'Enquire about your upcoming African journey. Reach KAGZ via phone, email, WhatsApp, or our secure enquiry form for custom luxury trip design.';
    } else if (hash === '#/plan') {
      title = 'Plan Your Custom African Journey — Custom Enquiry | KAGZ';
      description = 'Tell us your ideal destinations, travel dates, styles, and group size, and KAGZ will design a bespoke safari itinerary tailored entirely for you.';
    }

    // Set page title
    document.title = title;

    // Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Set open graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    // Set open graph description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

  }, [currentHash]);

  return null;
}

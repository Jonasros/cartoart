/**
 * SEO Route Data Access
 * Source of truth for programmatic SEO landing pages
 */

import type { SEORouteMetadata, SEOCategory } from '@/types/seo';

/**
 * Marathon/Race Routes - Phase 1
 * These map to /race/[slug] pages
 */
export const raceRoutes: SEORouteMetadata[] = [
  {
    id: 'boston-marathon',
    slug: 'boston-marathon',
    category: 'race',
    name: 'Boston Marathon',
    shortName: 'Boston Marathon',
    subtitle: 'Hopkinton → Boston',
    description:
      "The world's oldest annual marathon. A bucket-list race for runners worldwide.",
    country: 'USA',
    region: 'Massachusetts',
    distance: 42.2,
    difficulty: 'hard',
    routeColor: '#003DA5',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'world-major', 'boston', 'usa', 'qualifying'],
    year: 2025,
    website: 'https://www.baa.org/races/boston-marathon',
    mapTitle: 'boston-marathon',
    introText:
      "The Boston Marathon is more than a race—it's a rite of passage for runners. As the world's oldest annual marathon, qualifying and finishing Boston represents the pinnacle of amateur running achievement. Commemorate your Boston journey with a stunning route poster.",
    routeSpecificFAQs: [
      {
        question: 'What is the Boston Marathon qualifying time?',
        answer:
          'Boston Marathon qualifying times vary by age and gender. For example, men 18-34 need to run 3:00:00, while women in the same age group need 3:30:00. Times get more lenient with age.',
      },
      {
        question: 'Why is the Boston Marathon course famous?',
        answer:
          "The Boston course is point-to-point from Hopkinton to Boston, featuring the infamous 'Heartbreak Hill' around mile 20. The net downhill course and late-race hills make it uniquely challenging.",
      },
    ],
  },
  {
    id: 'london-marathon',
    slug: 'london-marathon',
    category: 'race',
    name: 'London Marathon',
    shortName: 'London Marathon',
    subtitle: 'Greenwich → The Mall',
    description:
      "One of the World Marathon Majors, running through London's iconic landmarks.",
    country: 'United Kingdom',
    region: 'London',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#E31837',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'world-major', 'london', 'uk'],
    year: 2025,
    website: 'https://www.tcslondonmarathon.com/',
    mapTitle: 'london-marathon',
    introText:
      "The London Marathon takes runners past Tower Bridge, the Cutty Sark, and finishes at Buckingham Palace. It's one of the most scenic and prestigious marathons in the world, known for incredible crowd support and record-breaking performances.",
    routeSpecificFAQs: [
      {
        question: 'What landmarks does the London Marathon pass?',
        answer:
          'The London Marathon passes Tower Bridge, the Cutty Sark, Canary Wharf, the Tower of London, and finishes on The Mall near Buckingham Palace.',
      },
    ],
  },
  {
    id: 'berlin-marathon',
    slug: 'berlin-marathon',
    category: 'race',
    name: 'Berlin Marathon',
    shortName: 'Berlin Marathon',
    subtitle: 'Tiergarten → Brandenburg Gate',
    description:
      "The world's fastest marathon course, where world records are made.",
    country: 'Germany',
    region: 'Berlin',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FFD700',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'world-major', 'berlin', 'germany', 'world-record'],
    year: 2025,
    website: 'https://www.bmw-berlin-marathon.com/',
    mapTitle: 'berlin-marathon',
    introText:
      'Berlin is where world records are set. The flat, fast course has produced more marathon world records than any other race. Finishing through the Brandenburg Gate is an unforgettable moment every runner deserves to commemorate.',
    routeSpecificFAQs: [
      {
        question: 'Why is Berlin Marathon the fastest course?',
        answer:
          'Berlin is famously flat with minimal turns and excellent weather conditions in late September. The course has produced multiple world records, including the current men\'s world record.',
      },
    ],
  },
  {
    id: 'chicago-marathon',
    slug: 'chicago-marathon',
    category: 'race',
    name: 'Chicago Marathon',
    shortName: 'Chicago Marathon',
    subtitle: 'Grant Park Loop',
    description:
      'A fast, flat course through the heart of Chicago with incredible crowd support.',
    country: 'USA',
    region: 'Illinois',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FF6900',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'world-major', 'chicago', 'usa', 'flat'],
    year: 2025,
    website: 'https://www.chicagomarathon.com/',
    mapTitle: 'chicago-marathon',
    introText:
      "Chicago offers one of the flattest and fastest marathon courses in the world, winding through 29 neighborhoods with a million spectators cheering you on. It's the perfect race for a personal best.",
    routeSpecificFAQs: [
      {
        question: 'How flat is the Chicago Marathon?',
        answer:
          'The Chicago Marathon is one of the flattest World Major courses with only about 100 feet of total elevation gain. The course runs through 29 diverse Chicago neighborhoods.',
      },
    ],
  },
  {
    id: 'new-york-city-marathon',
    slug: 'new-york-city-marathon',
    category: 'race',
    name: 'New York City Marathon',
    shortName: 'NYC Marathon',
    subtitle: 'Staten Island → Central Park',
    description:
      "The world's largest marathon, crossing all five NYC boroughs.",
    country: 'USA',
    region: 'New York',
    distance: 42.2,
    difficulty: 'hard',
    routeColor: '#00629B',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'world-major', 'new-york', 'usa', 'iconic'],
    year: 2025,
    website: 'https://www.nyrr.org/tcsnycmarathon',
    mapTitle: 'new-york-city-marathon',
    introText:
      "Running the NYC Marathon means crossing all five boroughs with 2 million spectators cheering you on. From the Verrazzano Bridge to Central Park, it's the most iconic marathon experience in the world.",
    routeSpecificFAQs: [
      {
        question: 'Which bridges does the NYC Marathon cross?',
        answer:
          'The NYC Marathon crosses five bridges: Verrazzano-Narrows (start), Pulaski, Queensboro (59th Street), Willis Avenue, and Madison Avenue Bridge.',
      },
    ],
  },
  {
    id: 'tokyo-marathon',
    slug: 'tokyo-marathon',
    category: 'race',
    name: 'Tokyo Marathon',
    shortName: 'Tokyo Marathon',
    subtitle: 'Shinjuku → Tokyo Station',
    description:
      "Asia's premier marathon, combining traditional and modern Tokyo.",
    country: 'Japan',
    region: 'Tokyo',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#E60012',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'world-major', 'tokyo', 'japan', 'asia'],
    year: 2025,
    website: 'https://www.marathon.tokyo/',
    mapTitle: 'tokyo-marathon',
    introText:
      "Tokyo Marathon blends ancient temples with futuristic skyscrapers. The impeccably organized race showcases Japanese hospitality at its finest, with aid stations offering everything from bananas to rice balls.",
    routeSpecificFAQs: [
      {
        question: 'What makes Tokyo Marathon unique?',
        answer:
          'Tokyo Marathon is known for its exceptional organization, unique aid stations with Japanese treats, and the blend of traditional temples and modern architecture along the course.',
      },
    ],
  },
  {
    id: 'copenhagen-marathon',
    slug: 'copenhagen-marathon',
    category: 'race',
    name: 'Copenhagen Marathon',
    shortName: 'Copenhagen Marathon',
    subtitle: 'Islands Brygge Loop',
    description:
      "A scenic marathon through Denmark's capital, known for great atmosphere.",
    country: 'Denmark',
    region: 'Copenhagen',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#C8102E',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'copenhagen', 'denmark', 'scandinavia'],
    year: 2025,
    website: 'https://copenhagenmarathon.dk/',
    mapTitle: 'copenhagen-marathon',
    introText:
      "Copenhagen Marathon runs through one of the world's happiest cities, passing colorful Nyhavn, the Little Mermaid, and royal palaces. The flat course and enthusiastic Danish crowds make it a fantastic experience.",
    routeSpecificFAQs: [
      {
        question: 'What landmarks does Copenhagen Marathon pass?',
        answer:
          'The course passes Nyhavn, Amalienborg Palace, the Little Mermaid statue, Christiania, and the historic city center.',
      },
    ],
  },
  {
    id: 'paris-marathon',
    slug: 'paris-marathon',
    category: 'race',
    name: 'Paris Marathon',
    shortName: 'Paris Marathon',
    subtitle: 'Champs-Élysées → Avenue Foch',
    description:
      "Run through the City of Light, passing iconic Parisian landmarks.",
    country: 'France',
    region: 'Paris',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#0055A4',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'paris', 'france', 'europe'],
    year: 2025,
    website: 'https://www.schneiderelectricparismarathon.com/',
    mapTitle: 'paris-marathon',
    introText:
      "Start on the Champs-Élysées, run along the Seine, through the Bois de Vincennes and Bois de Boulogne. Paris Marathon is a sightseeing tour at running pace through the world's most romantic city.",
    routeSpecificFAQs: [
      {
        question: 'What is the Paris Marathon route?',
        answer:
          'Starting on the Champs-Élysées, the course passes Place de la Concorde, the Louvre, Bastille, runs through Bois de Vincennes, along the Seine, and finishes near the Arc de Triomphe.',
      },
    ],
  },
  {
    id: 'amsterdam-marathon',
    slug: 'amsterdam-marathon',
    category: 'race',
    name: 'Amsterdam Marathon',
    shortName: 'Amsterdam Marathon',
    subtitle: 'Olympic Stadium Loop',
    description:
      'A fast, flat course starting and finishing at the historic Olympic Stadium.',
    country: 'Netherlands',
    region: 'Amsterdam',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FF6B35',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'amsterdam', 'netherlands', 'europe', 'flat'],
    year: 2025,
    website: 'https://www.tcsamsterdammarathon.nl/',
    mapTitle: 'amsterdam-marathon',
    introText:
      'Amsterdam Marathon starts and finishes at the iconic 1928 Olympic Stadium. The pancake-flat course along canals and through Vondelpark makes it perfect for PB hunters.',
    routeSpecificFAQs: [
      {
        question: 'Why is Amsterdam Marathon good for a PB?',
        answer:
          'Amsterdam is one of the flattest marathons in Europe, running along canals with almost no elevation change. The October timing usually offers ideal running temperatures.',
      },
    ],
  },
  {
    id: 'stockholm-marathon',
    slug: 'stockholm-marathon',
    category: 'race',
    name: 'Stockholm Marathon',
    shortName: 'Stockholm Marathon',
    subtitle: 'Stadium Loop',
    description:
      'Finish in the 1912 Olympic Stadium, one of the most iconic marathon finishes.',
    country: 'Sweden',
    region: 'Stockholm',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FECC00',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'stockholm', 'sweden', 'scandinavia', 'olympic'],
    year: 2025,
    website: 'https://www.stockholmmarathon.se/',
    mapTitle: 'stockholm-marathon',
    introText:
      'Stockholm Marathon finishes inside the 1912 Olympic Stadium—the oldest Olympic stadium still in use. Running through the city built on 14 islands is an unforgettable Nordic experience.',
    routeSpecificFAQs: [
      {
        question: 'What makes the Stockholm Marathon finish special?',
        answer:
          'Stockholm Marathon finishes inside the 1912 Olympic Stadium, the oldest Olympic stadium still in active use. Runners enter through the marathon gate used in the 1912 Olympics.',
      },
    ],
  },
];

/**
 * Trail/Hiking Routes - Phase 2
 */
export const trailRoutes: SEORouteMetadata[] = [
  {
    id: 'camino-de-santiago',
    slug: 'camino-de-santiago',
    category: 'trail',
    name: 'Camino de Santiago',
    shortName: 'Camino Francés',
    subtitle: 'Saint-Jean-Pied-de-Port → Santiago de Compostela',
    description:
      'The most famous pilgrimage route in the world, crossing northern Spain.',
    country: 'Spain',
    countries: ['France', 'Spain'],
    distance: 800,
    elevationGain: 12000,
    difficulty: 'moderate',
    duration: '30-35 days',
    routeColor: '#8B4513',
    styleId: 'vintage',
    paletteId: 'sepia',
    tags: ['pilgrimage', 'spain', 'hiking', 'long-distance', 'cultural'],
    website: 'https://oficinadelperegrino.com/',
    mapTitle: 'camino-de-santiago',
    introText:
      'The Camino de Santiago is a transformative journey that has drawn pilgrims for over a thousand years. Walking the 800km from France to Santiago de Compostela is a life-changing experience worth commemorating.',
  },
  {
    id: 'west-highland-way',
    slug: 'west-highland-way',
    category: 'trail',
    name: 'West Highland Way',
    shortName: 'West Highland Way',
    subtitle: 'Milngavie → Fort William',
    description:
      "Scotland's most famous long-distance trail through the Highlands.",
    country: 'United Kingdom',
    region: 'Scotland',
    distance: 154,
    elevationGain: 4000,
    difficulty: 'moderate',
    duration: '7-8 days',
    routeColor: '#2E7D32',
    styleId: 'topographic',
    paletteId: 'forest',
    tags: ['scotland', 'highlands', 'hiking', 'uk', 'scenic'],
    website: 'https://www.westhighlandway.org/',
    mapTitle: 'west-highland-way',
    introText:
      'The West Highland Way traverses some of Scotland\'s most dramatic landscapes—from Loch Lomond to the shadow of Ben Nevis. It\'s the quintessential Scottish hiking experience.',
  },
  {
    id: 'tour-du-mont-blanc',
    slug: 'tour-du-mont-blanc',
    category: 'trail',
    name: 'Tour du Mont Blanc',
    shortName: 'TMB',
    subtitle: 'Chamonix → Chamonix',
    description:
      'A spectacular circuit around the Mont Blanc massif through three countries.',
    country: 'France',
    countries: ['France', 'Italy', 'Switzerland'],
    distance: 170,
    elevationGain: 10000,
    difficulty: 'hard',
    duration: '10-12 days',
    routeColor: '#E74C3C',
    styleId: 'topographic',
    paletteId: 'alpine',
    tags: ['alps', 'france', 'italy', 'switzerland', 'mountain', 'classic'],
    website: 'https://www.autourdumontblanc.com/',
    mapTitle: 'tour-du-mont-blanc',
    introText:
      'The Tour du Mont Blanc circumnavigates Western Europe\'s highest peak through France, Italy, and Switzerland. It\'s consistently rated as one of the world\'s best long-distance hikes.',
  },
  {
    id: 'kungsleden',
    slug: 'kungsleden',
    category: 'trail',
    name: 'Kungsleden',
    shortName: "King's Trail",
    subtitle: 'Abisko → Hemavan',
    description:
      "Sweden's King's Trail through pristine Arctic wilderness.",
    country: 'Sweden',
    region: 'Lapland',
    distance: 440,
    elevationGain: 8000,
    difficulty: 'moderate',
    duration: '20-25 days',
    routeColor: '#1976D2',
    styleId: 'topographic',
    paletteId: 'forest',
    tags: ['sweden', 'arctic', 'wilderness', 'scandinavia', 'midnight-sun'],
    website: 'https://www.swedishtouristassociation.com/',
    mapTitle: 'kungsleden',
    introText:
      'Kungsleden—the King\'s Trail—traverses 440km of Swedish Lapland wilderness. Hike under the midnight sun past glaciers, through birch forests, and alongside crystal-clear Arctic rivers.',
  },
  {
    id: 'hardrock-100',
    slug: 'hardrock-100',
    category: 'trail',
    name: 'Hardrock 100',
    shortName: 'Hardrock 100',
    subtitle: 'Silverton Loop',
    description:
      'One of the most challenging ultramarathons in the world through the San Juan Mountains.',
    country: 'USA',
    region: 'Colorado',
    distance: 160,
    elevationGain: 10000,
    difficulty: 'expert',
    duration: '24-48 hours',
    routeColor: '#FF6B35',
    styleId: 'topographic',
    paletteId: 'dark',
    tags: ['ultra', 'colorado', 'mountains', 'extreme', 'running'],
    website: 'https://hardrock100.com/',
    mapTitle: 'hardrock-100',
    introText:
      'Hardrock 100 is the ultimate test of mountain running—100 miles through the rugged San Juan Mountains with 33,000 feet of elevation change. Finishing Hardrock is a lifetime achievement.',
  },
];

/**
 * Cycling Routes - Phase 3
 * Only including a sample for now, full list in Phase 3
 */
export const cyclingRoutes: SEORouteMetadata[] = [
  // Phase 3: Add Tour de France stages here
];

/**
 * Get all routes for a specific SEO category
 */
export function getRoutesByCategory(category: SEOCategory): SEORouteMetadata[] {
  switch (category) {
    case 'race':
      return raceRoutes;
    case 'trail':
      return trailRoutes;
    case 'cycling':
      return cyclingRoutes;
    default:
      return [];
  }
}

/**
 * Get a specific route by slug and category
 */
export function getRouteBySlug(
  slug: string,
  category: SEOCategory
): SEORouteMetadata | undefined {
  const routes = getRoutesByCategory(category);
  return routes.find((route) => route.slug === slug);
}

/**
 * Get all routes across all categories
 */
export function getAllRoutes(): SEORouteMetadata[] {
  return [...raceRoutes, ...trailRoutes, ...cyclingRoutes];
}

/**
 * Get related routes (same category, excluding current)
 */
export function getRelatedRoutes(
  currentSlug: string,
  category: SEOCategory,
  limit: number = 3
): SEORouteMetadata[] {
  const routes = getRoutesByCategory(category);
  return routes.filter((route) => route.slug !== currentSlug).slice(0, limit);
}

/**
 * Get all slugs for a category (for static generation)
 */
export function getRouteSlugs(category: SEOCategory): string[] {
  return getRoutesByCategory(category).map((route) => route.slug);
}

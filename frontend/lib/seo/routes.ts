/**
 * SEO Route Data Access
 * Source of truth for programmatic SEO landing pages
 *
 * TRADEMARK POLICY:
 * - Use short geographic/descriptive names for products (e.g., "Boston 42K", "Mont Ventoux")
 * - Avoid trademarked event names in product titles
 * - Can mention events in body text for SEO context
 * - Add disclaimers on landing pages
 */

import type { SEORouteMetadata, SEOCategory } from '@/types/seo';

/**
 * Marathon/Race Routes - Phase 1
 * These map to /race/[slug] pages
 *
 * NOTE: Product names use geographic descriptions to avoid trademark issues
 * while body text can reference events for SEO context.
 */
export const raceRoutes: SEORouteMetadata[] = [
  {
    id: 'boston-marathon',
    slug: 'boston-marathon',
    category: 'race',
    name: 'Boston 42K Running Route',
    shortName: 'Boston 42K',
    subtitle: 'Hopkinton → Boston',
    description:
      'The classic 42km point-to-point running route from Hopkinton to downtown Boston, featuring the famous Heartbreak Hill.',
    country: 'USA',
    region: 'Massachusetts',
    distance: 42.2,
    difficulty: 'hard',
    routeColor: '#003DA5',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'boston', 'usa', 'running', 'heartbreak-hill'],
    year: 2025,
    website: 'https://www.baa.org/',
    mapTitle: 'Boston 42K',
    introText:
      "The Boston 42K route is one of the most iconic running courses in the world. This historic point-to-point course from Hopkinton to downtown Boston features the infamous Heartbreak Hill and attracts runners from around the globe. Commemorate your Boston journey with a stunning route poster.",
    routeSpecificFAQs: [
      {
        question: 'What is Heartbreak Hill?',
        answer:
          'Heartbreak Hill is the famous incline around mile 20 of the Boston course. After several preceding hills, this final climb breaks many runners who started too fast.',
      },
      {
        question: 'Why is the Boston course challenging?',
        answer:
          "The Boston course is point-to-point from Hopkinton to Boston, featuring the infamous Heartbreak Hill around mile 20. The net downhill course and late-race hills make it uniquely challenging.",
      },
    ],
  },
  {
    id: 'london-marathon',
    slug: 'london-marathon',
    category: 'race',
    name: 'London 42K Running Route',
    shortName: 'London 42K',
    subtitle: 'Greenwich → The Mall',
    description:
      "A scenic 42km running route through London's iconic landmarks, from Greenwich to Buckingham Palace.",
    country: 'United Kingdom',
    region: 'London',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#E31837',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'london', 'uk', 'running', 'landmarks'],
    year: 2025,
    website: 'https://www.tcslondonmarathon.com/',
    mapTitle: 'London 42K',
    introText:
      "The London 42K route takes runners past Tower Bridge, the Cutty Sark, and finishes near Buckingham Palace. It's one of the most scenic running routes in the world, known for incredible crowd support.",
    routeSpecificFAQs: [
      {
        question: 'What landmarks does the London 42K route pass?',
        answer:
          'The route passes Tower Bridge, the Cutty Sark, Canary Wharf, the Tower of London, and finishes on The Mall near Buckingham Palace.',
      },
    ],
  },
  {
    id: 'berlin-marathon',
    slug: 'berlin-marathon',
    category: 'race',
    name: 'Berlin 42K Running Route',
    shortName: 'Berlin 42K',
    subtitle: 'Tiergarten → Brandenburg Gate',
    description:
      'The famously flat and fast 42km Berlin running route, finishing at the iconic Brandenburg Gate.',
    country: 'Germany',
    region: 'Berlin',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FFD700',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'berlin', 'germany', 'running', 'flat', 'fast'],
    year: 2025,
    website: 'https://www.bmw-berlin-marathon.com/',
    mapTitle: 'Berlin 42K',
    introText:
      'The Berlin 42K route is renowned as one of the fastest running courses in the world. The flat course has produced numerous world records. Finishing through the Brandenburg Gate is an unforgettable moment every runner deserves to commemorate.',
    routeSpecificFAQs: [
      {
        question: 'Why is Berlin considered a fast course?',
        answer:
          'Berlin is famously flat with minimal turns and excellent weather conditions in late September. The course is known for producing fast times and world records.',
      },
    ],
  },
  {
    id: 'chicago-marathon',
    slug: 'chicago-marathon',
    category: 'race',
    name: 'Chicago 42K Running Route',
    shortName: 'Chicago 42K',
    subtitle: 'Grant Park Loop',
    description:
      'A fast, flat 42km running route through the heart of Chicago, passing through 29 diverse neighborhoods.',
    country: 'USA',
    region: 'Illinois',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FF6900',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'chicago', 'usa', 'running', 'flat'],
    year: 2025,
    website: 'https://www.chicagomarathon.com/',
    mapTitle: 'Chicago 42K',
    introText:
      "The Chicago 42K route offers one of the flattest running courses in the world, winding through 29 neighborhoods. It's the perfect route for those seeking a fast time.",
    routeSpecificFAQs: [
      {
        question: 'How flat is the Chicago 42K route?',
        answer:
          'The Chicago route is one of the flattest in the world with only about 100 feet of total elevation gain. The course runs through 29 diverse Chicago neighborhoods.',
      },
    ],
  },
  {
    id: 'new-york-city-marathon',
    slug: 'new-york-city-marathon',
    category: 'race',
    name: 'New York City 42K Running Route',
    shortName: 'NYC 42K',
    subtitle: 'Staten Island → Central Park',
    description:
      'The iconic 42km running route crossing all five NYC boroughs, from Staten Island to Central Park.',
    country: 'USA',
    region: 'New York',
    distance: 42.2,
    difficulty: 'hard',
    routeColor: '#00629B',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'new-york', 'usa', 'running', 'five-boroughs'],
    year: 2025,
    website: 'https://www.nyrr.org/',
    mapTitle: 'NYC 42K',
    introText:
      "The NYC 42K route crosses all five boroughs, from the Verrazzano Bridge to Central Park. It's one of the most iconic running experiences in the world.",
    routeSpecificFAQs: [
      {
        question: 'Which bridges does the NYC 42K route cross?',
        answer:
          'The route crosses five bridges: Verrazzano-Narrows (start), Pulaski, Queensboro (59th Street), Willis Avenue, and Madison Avenue Bridge.',
      },
    ],
  },
  {
    id: 'tokyo-marathon',
    slug: 'tokyo-marathon',
    category: 'race',
    name: 'Tokyo 42K Running Route',
    shortName: 'Tokyo 42K',
    subtitle: 'Shinjuku → Tokyo Station',
    description:
      "A 42km running route through Tokyo, combining traditional temples with modern skyscrapers.",
    country: 'Japan',
    region: 'Tokyo',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#E60012',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'tokyo', 'japan', 'running', 'asia'],
    year: 2025,
    website: 'https://www.marathon.tokyo/',
    mapTitle: 'Tokyo 42K',
    introText:
      'The Tokyo 42K route blends ancient temples with futuristic skyscrapers. This impeccably designed course showcases Japanese culture and architecture at every turn.',
    routeSpecificFAQs: [
      {
        question: 'What makes the Tokyo 42K route unique?',
        answer:
          'The Tokyo route is known for its blend of traditional temples and modern architecture, passing through diverse neighborhoods from Shinjuku to Tokyo Station.',
      },
    ],
  },
  {
    id: 'copenhagen-marathon',
    slug: 'copenhagen-marathon',
    category: 'race',
    name: 'Copenhagen 42K Running Route',
    shortName: 'Copenhagen 42K',
    subtitle: 'Islands Brygge Loop',
    description:
      "A scenic 42km running route through Denmark's capital, passing Nyhavn, the Little Mermaid, and royal palaces.",
    country: 'Denmark',
    region: 'Copenhagen',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#C8102E',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'copenhagen', 'denmark', 'running', 'scandinavia'],
    year: 2025,
    website: 'https://copenhagenmarathon.dk/',
    mapTitle: 'Copenhagen 42K',
    introText:
      "The Copenhagen 42K route runs through one of the world's happiest cities, passing colorful Nyhavn, the Little Mermaid, and royal palaces. The flat course makes it ideal for all runners.",
    routeSpecificFAQs: [
      {
        question: 'What landmarks does the Copenhagen 42K route pass?',
        answer:
          'The course passes Nyhavn, Amalienborg Palace, the Little Mermaid statue, Christiania, and the historic city center.',
      },
    ],
  },
  {
    id: 'paris-marathon',
    slug: 'paris-marathon',
    category: 'race',
    name: 'Paris 42K Running Route',
    shortName: 'Paris 42K',
    subtitle: 'Champs-Élysées → Avenue Foch',
    description:
      'A 42km running route through the City of Light, passing iconic Parisian landmarks.',
    country: 'France',
    region: 'Paris',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#0055A4',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'paris', 'france', 'running', 'landmarks'],
    year: 2025,
    website: 'https://www.schneiderelectricparismarathon.com/',
    mapTitle: 'Paris 42K',
    introText:
      "The Paris 42K route starts on the Champs-Élysées, runs along the Seine, through the Bois de Vincennes and Bois de Boulogne. It's a sightseeing tour at running pace through the world's most romantic city.",
    routeSpecificFAQs: [
      {
        question: 'What is the Paris 42K route?',
        answer:
          'Starting on the Champs-Élysées, the course passes Place de la Concorde, the Louvre, Bastille, runs through Bois de Vincennes, along the Seine, and finishes near the Arc de Triomphe.',
      },
    ],
  },
  {
    id: 'amsterdam-marathon',
    slug: 'amsterdam-marathon',
    category: 'race',
    name: 'Amsterdam 42K Running Route',
    shortName: 'Amsterdam 42K',
    subtitle: 'Olympic Stadium Loop',
    description:
      'A fast, flat 42km running route starting and finishing at the historic 1928 Olympic Stadium.',
    country: 'Netherlands',
    region: 'Amsterdam',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FF6B35',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'amsterdam', 'netherlands', 'running', 'flat'],
    year: 2025,
    website: 'https://www.tcsamsterdammarathon.nl/',
    mapTitle: 'Amsterdam 42K',
    introText:
      'The Amsterdam 42K route starts and finishes at the iconic 1928 Olympic Stadium. The pancake-flat course along canals and through Vondelpark makes it perfect for fast times.',
    routeSpecificFAQs: [
      {
        question: 'Why is the Amsterdam 42K route good for fast times?',
        answer:
          'Amsterdam is one of the flattest routes in Europe, running along canals with almost no elevation change. The October timing usually offers ideal running temperatures.',
      },
    ],
  },
  {
    id: 'stockholm-marathon',
    slug: 'stockholm-marathon',
    category: 'race',
    name: 'Stockholm 42K Running Route',
    shortName: 'Stockholm 42K',
    subtitle: 'Stadium Loop',
    description:
      'A scenic 42km running route finishing in the historic 1912 Olympic Stadium.',
    country: 'Sweden',
    region: 'Stockholm',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#FECC00',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'stockholm', 'sweden', 'running', 'scandinavia'],
    year: 2025,
    website: 'https://www.stockholmmarathon.se/',
    mapTitle: 'Stockholm 42K',
    introText:
      'The Stockholm 42K route finishes inside the 1912 Olympic Stadium—the oldest Olympic stadium still in use. Running through the city built on 14 islands is an unforgettable Nordic experience.',
    routeSpecificFAQs: [
      {
        question: 'What makes the Stockholm 42K finish special?',
        answer:
          'The route finishes inside the 1912 Olympic Stadium, the oldest Olympic stadium still in active use. Runners enter through the historic marathon gate.',
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
    mapTitle: 'Camino Francés',
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
    mapTitle: 'West Highland Way',
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
    mapTitle: 'Tour du Mont Blanc',
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
    mapTitle: 'Kungsleden',
    introText:
      'Kungsleden—the King\'s Trail—traverses 440km of Swedish Lapland wilderness. Hike under the midnight sun past glaciers, through birch forests, and alongside crystal-clear Arctic rivers.',
  },
  {
    id: 'hardrock-100',
    slug: 'hardrock-100',
    category: 'trail',
    name: 'San Juan Mountains 100 Mile Trail',
    shortName: 'San Juan 100',
    subtitle: 'Silverton Loop',
    description:
      'A legendary 100-mile loop through the rugged San Juan Mountains of Colorado with 33,000 feet of elevation change.',
    country: 'USA',
    region: 'Colorado',
    distance: 160,
    elevationGain: 10000,
    difficulty: 'expert',
    duration: '24-48 hours',
    routeColor: '#FF6B35',
    styleId: 'topographic',
    paletteId: 'dark',
    tags: ['ultra', 'colorado', 'mountains', 'extreme', 'running', 'san-juan'],
    website: 'https://hardrock100.com/',
    mapTitle: 'San Juan 100',
    introText:
      'The San Juan Mountains 100 Mile Trail is the ultimate test of mountain running—100 miles through the rugged Colorado Rockies with 33,000 feet of elevation change. Completing this legendary loop is a lifetime achievement.',
  },
  // UK National Trails
  {
    id: 'cotswold-way',
    slug: 'cotswold-way',
    category: 'trail',
    name: 'Cotswold Way',
    shortName: 'Cotswold Way',
    subtitle: 'Chipping Campden → Bath',
    description:
      'A 102-mile National Trail through quintessential English countryside, passing honey-colored stone villages.',
    country: 'United Kingdom',
    region: 'Cotswolds',
    distance: 164,
    elevationGain: 4300,
    difficulty: 'moderate',
    duration: '7-10 days',
    routeColor: '#8B7355',
    styleId: 'minimal',
    paletteId: 'sage',
    tags: ['england', 'cotswolds', 'national-trail', 'scenic', 'villages'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/cotswold-way/',
    mapTitle: 'Cotswold Way',
    introText:
      "The Cotswold Way winds through 102 miles of quintessential English countryside—honey-colored stone villages, rolling hills, ancient woodlands, and historic sites including Broadway Tower and Bath's Georgian splendor. It's the perfect trail for those seeking pastoral beauty.",
    routeSpecificFAQs: [
      {
        question: 'What villages does the Cotswold Way pass through?',
        answer:
          'The trail passes through charming villages including Broadway, Stanton, Winchcombe, Painswick, and ends in the UNESCO World Heritage city of Bath.',
      },
    ],
  },
  {
    id: 'south-downs-way',
    slug: 'south-downs-way',
    category: 'trail',
    name: 'South Downs Way',
    shortName: 'South Downs Way',
    subtitle: 'Winchester → Eastbourne',
    description:
      'A 100-mile National Trail along the chalk ridge of the South Downs with views to the English Channel.',
    country: 'United Kingdom',
    region: 'South Downs',
    distance: 160,
    elevationGain: 4000,
    difficulty: 'moderate',
    duration: '7-9 days',
    routeColor: '#4CAF50',
    styleId: 'topographic',
    paletteId: 'classic',
    tags: ['england', 'south-downs', 'national-trail', 'chalk', 'coastal'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/south-downs-way/',
    mapTitle: 'South Downs Way',
    introText:
      'The South Downs Way follows the ancient chalk ridge from Winchester Cathedral to the white cliffs at Beachy Head. Walking this 100-mile trail, you traverse rolling downland with sweeping views to the English Channel—a classic English hiking experience.',
    routeSpecificFAQs: [
      {
        question: 'What is the terrain like on the South Downs Way?',
        answer:
          'The trail follows chalk downland ridges with gentle rolling hills, ancient woodland, and dramatic cliff-top sections near Eastbourne. Most of the route is on well-maintained bridleways.',
      },
    ],
  },
  {
    id: 'cleveland-way',
    slug: 'cleveland-way',
    category: 'trail',
    name: 'Cleveland Way',
    shortName: 'Cleveland Way',
    subtitle: 'Helmsley → Filey',
    description:
      'A 109-mile National Trail around the North York Moors and along the dramatic Yorkshire coastline.',
    country: 'United Kingdom',
    region: 'North Yorkshire',
    distance: 175,
    elevationGain: 3500,
    difficulty: 'moderate',
    duration: '8-10 days',
    routeColor: '#795548',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['england', 'yorkshire', 'national-trail', 'moors', 'coastal'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/cleveland-way/',
    mapTitle: 'Cleveland Way',
    introText:
      "The Cleveland Way combines the wild heather moorland of the North York Moors with the dramatic cliffs of the Yorkshire coast. This horseshoe-shaped trail offers some of England's finest scenery—from Roseberry Topping to Whitby Abbey to the sea cliffs at Filey.",
    routeSpecificFAQs: [
      {
        question: 'What makes the Cleveland Way unique?',
        answer:
          "It's one of the few National Trails that combines both inland moorland and coastal walking. The route passes Whitby Abbey (inspiration for Bram Stoker's Dracula) and offers stunning views of the North Sea.",
      },
    ],
  },
  {
    id: 'coast-to-coast',
    slug: 'coast-to-coast',
    category: 'trail',
    name: 'Coast to Coast Walk',
    shortName: 'Coast to Coast',
    subtitle: "St Bees → Robin Hood's Bay",
    description:
      "Alfred Wainwright's famous 192-mile route across northern England, traversing three national parks.",
    country: 'United Kingdom',
    region: 'Northern England',
    distance: 309,
    elevationGain: 8500,
    difficulty: 'hard',
    duration: '12-15 days',
    routeColor: '#E74C3C',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['england', 'wainwright', 'lake-district', 'yorkshire-dales', 'iconic'],
    website: 'https://www.wainwright.org.uk/coast-to-coast/',
    mapTitle: 'Coast to Coast',
    introText:
      "Alfred Wainwright's Coast to Coast is Britain's most popular long-distance walk. Starting at St Bees on the Irish Sea and finishing at Robin Hood's Bay on the North Sea, the 192-mile journey crosses three national parks: the Lake District, Yorkshire Dales, and North York Moors.",
    routeSpecificFAQs: [
      {
        question: 'Who created the Coast to Coast Walk?',
        answer:
          "The route was devised by Alfred Wainwright, the famous guidebook writer, and published in 1973. It's not an official National Trail but has become Britain's most popular long-distance path.",
      },
      {
        question: 'Which national parks does the Coast to Coast cross?',
        answer:
          'The walk traverses three national parks: the Lake District (with dramatic mountain scenery), the Yorkshire Dales (limestone landscapes), and the North York Moors (heather moorland).',
      },
    ],
  },
  {
    id: 'hadrians-wall-path',
    slug: 'hadrians-wall-path',
    category: 'trail',
    name: "Hadrian's Wall Path",
    shortName: "Hadrian's Wall",
    subtitle: 'Wallsend → Bowness-on-Solway',
    description:
      'An 84-mile National Trail following the UNESCO World Heritage Site of the Roman frontier.',
    country: 'United Kingdom',
    region: 'Northumberland',
    distance: 135,
    elevationGain: 2800,
    difficulty: 'moderate',
    duration: '6-8 days',
    routeColor: '#8B4513',
    styleId: 'vintage',
    paletteId: 'sepia',
    tags: ['england', 'roman', 'history', 'national-trail', 'unesco'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/hadrians-wall-path/',
    mapTitle: "Hadrian's Wall",
    introText:
      "Walk in the footsteps of Roman legionaries along Hadrian's Wall, the most impressive Roman frontier monument in Britain. This 84-mile trail follows the UNESCO World Heritage Site coast to coast, passing forts, milecastles, and the wild Northumberland landscape.",
    routeSpecificFAQs: [
      {
        question: "What is Hadrian's Wall?",
        answer:
          "Built by Emperor Hadrian in AD 122, Hadrian's Wall was the north-western frontier of the Roman Empire for nearly 300 years. The 73-mile wall stretched coast to coast across northern Britain.",
      },
      {
        question: 'What Roman sites can I see along the path?',
        answer:
          'Major sites include Housesteads Fort (the most complete Roman fort in Britain), Vindolanda (with its famous writing tablets), Chesters Fort, and Birdoswald Fort.',
      },
    ],
  },
];

/**
 * Cycling Routes - French Grand Tour Routes 2025
 *
 * NOTE: Product names use geographic descriptions to avoid trademark issues.
 * Body text can reference events for SEO context.
 */
export const cyclingRoutes: SEORouteMetadata[] = [
  {
    id: 'lille-cycling-circuit',
    slug: 'lille-cycling-circuit',
    category: 'cycling',
    name: 'Lille Cycling Circuit',
    shortName: 'Lille Circuit',
    subtitle: 'Lille → Lille',
    description: 'A 185km flat cycling circuit through the Hauts-de-France region, starting and finishing in Lille.',
    country: 'France',
    region: 'Hauts-de-France',
    distance: 185,
    difficulty: 'moderate',
    routeColor: '#FFD700',
    styleId: 'classic',
    paletteId: 'warm',
    tags: ['cycling', 'france', 'flat', 'lille', 'circuit'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Lille Cycling Circuit',
    introText: 'The Lille Cycling Circuit is a 185km route through northern France, popular with cyclists seeking flat terrain and scenic French countryside. Create a poster of this exciting route.',
  },
  {
    id: 'caen-time-trial-route',
    slug: 'caen-time-trial-route',
    category: 'cycling',
    name: 'Caen Time Trial Route',
    shortName: 'Caen TT',
    subtitle: 'Caen → Caen',
    description: 'A 33km individual time trial route in historic Caen, Normandy.',
    country: 'France',
    region: 'Normandy',
    distance: 33,
    difficulty: 'moderate',
    routeColor: '#FFD700',
    styleId: 'classic',
    paletteId: 'warm',
    tags: ['cycling', 'france', 'time-trial', 'normandy', 'caen'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Caen Time Trial',
    introText: 'The Caen Time Trial Route is a 33km race against the clock through historic Normandy. This demanding route tests every cyclist\'s ability to maintain maximum effort.',
  },
  {
    id: 'hautacam-mountain-route',
    slug: 'hautacam-mountain-route',
    category: 'cycling',
    name: 'Hautacam Mountain Route',
    shortName: 'Hautacam',
    subtitle: 'Auch → Hautacam',
    description: 'A challenging 181km mountain route finishing at the legendary Hautacam climb in the Pyrenees.',
    country: 'France',
    region: 'Occitanie',
    distance: 181,
    elevationGain: 4500,
    difficulty: 'expert',
    routeColor: '#FFD700',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['cycling', 'france', 'mountains', 'pyrenees', 'hautacam', 'climbing'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Hautacam Mountain',
    introText: 'The Hautacam Mountain Route is a legendary Pyrenean cycling challenge. The 181km route culminates in the brutal climb to Hautacam, famous for its steep final kilometers.',
    routeSpecificFAQs: [
      {
        question: 'What is the Hautacam climb?',
        answer: 'Hautacam is a ski resort in the French Pyrenees famous for its brutally steep final kilometers. The climb has been a decisive finish in professional cycling since 1994.',
      },
    ],
  },
  {
    id: 'superbagneres-pyrenean-route',
    slug: 'superbagneres-pyrenean-route',
    category: 'cycling',
    name: 'Superbagnères Pyrenean Route',
    shortName: 'Superbagnères',
    subtitle: 'Pau → Superbagnères',
    description: 'An epic 183km mountain route from Pau to Superbagnères with 5,000m of climbing.',
    country: 'France',
    region: 'Occitanie',
    distance: 183,
    elevationGain: 5000,
    difficulty: 'expert',
    routeColor: '#FFD700',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['cycling', 'france', 'mountains', 'pyrenees', 'superbagneres', 'climbing'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Superbagnères Pyrenees',
    introText: 'The Superbagnères Pyrenean Route is a queen stage through the French Pyrenees. With 5,000m of climbing across 183km, this is where cycling legends are made.',
  },
  {
    id: 'mont-ventoux-cycling-route',
    slug: 'mont-ventoux-cycling-route',
    category: 'cycling',
    name: 'Mont Ventoux Cycling Route',
    shortName: 'Mont Ventoux',
    subtitle: 'Montpellier → Mont Ventoux',
    description: 'A 172km route to the iconic Beast of Provence—one of cycling\'s most legendary climbs.',
    country: 'France',
    region: 'Provence',
    distance: 172,
    elevationGain: 4200,
    difficulty: 'expert',
    routeColor: '#FFD700',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['cycling', 'france', 'mountains', 'mont-ventoux', 'iconic-climb', 'provence'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Mont Ventoux',
    introText: 'Mont Ventoux—the Beast of Provence—is perhaps the most iconic climb in cycling. The barren, lunar summit has witnessed countless epic moments in cycling history.',
    routeSpecificFAQs: [
      {
        question: 'Why is Mont Ventoux called the Beast of Provence?',
        answer: 'Mont Ventoux earns its fearsome nickname from its brutal 21km ascent, exposed lunar landscape, and frequent high winds. The bare white limestone summit resembles a snow-capped peak year-round.',
      },
      {
        question: 'What is the history of Mont Ventoux in cycling?',
        answer: 'Mont Ventoux has been a legendary cycling destination since the 1950s. The exposed summit and relentless gradient have produced some of the most dramatic moments in professional cycling.',
      },
    ],
  },
  {
    id: 'col-de-la-loze-alpine-route',
    slug: 'col-de-la-loze-alpine-route',
    category: 'cycling',
    name: 'Col de la Loze Alpine Route',
    shortName: 'Col de la Loze',
    subtitle: 'Vif → Col de la Loze',
    description: 'A 171km high Alpine route finishing at the brutal Col de la Loze at 2,304m.',
    country: 'France',
    region: 'Auvergne-Rhône-Alpes',
    distance: 171,
    elevationGain: 5200,
    difficulty: 'expert',
    routeColor: '#FFD700',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['cycling', 'france', 'mountains', 'alps', 'col-de-la-loze', 'climbing'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Col de la Loze',
    introText: 'The Col de la Loze is one of the newest and hardest climbs in French cycling. At 2,304m with brutal gradients, it has quickly become a modern classic.',
  },
  {
    id: 'la-plagne-alpine-route',
    slug: 'la-plagne-alpine-route',
    category: 'cycling',
    name: 'La Plagne Alpine Route',
    shortName: 'La Plagne',
    subtitle: 'Albertville → La Plagne',
    description: 'A 130km Alpine cycling route finishing at the ski resort of La Plagne with 4,800m of climbing.',
    country: 'France',
    region: 'Auvergne-Rhône-Alpes',
    distance: 130,
    elevationGain: 4800,
    difficulty: 'expert',
    routeColor: '#FFD700',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['cycling', 'france', 'mountains', 'alps', 'la-plagne', 'climbing'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'La Plagne Alps',
    introText: 'The La Plagne Alpine Route features one of the most demanding finishes in French cycling. The 17km climb at an average of 7.5% is where cycling dreams are made or broken.',
  },
  {
    id: 'paris-champs-elysees-circuit',
    slug: 'paris-champs-elysees-circuit',
    category: 'cycling',
    name: 'Paris Champs-Élysées Circuit',
    shortName: 'Paris Circuit',
    subtitle: 'Mantes-la-Ville → Paris',
    description: 'A 120km cycling route finishing with laps on the iconic Champs-Élysées in Paris.',
    country: 'France',
    region: 'Île-de-France',
    distance: 120,
    difficulty: 'easy',
    routeColor: '#FFD700',
    styleId: 'classic',
    paletteId: 'warm',
    tags: ['cycling', 'france', 'paris', 'champs-elysees', 'circuit', 'iconic'],
    year: 2025,
    website: 'https://www.letour.fr/',
    mapTitle: 'Paris Champs-Élysées',
    introText: 'The Paris Champs-Élysées Circuit is cycling\'s most iconic finish. Racing laps on the famous boulevard with the Arc de Triomphe as a backdrop is an unforgettable experience.',
    routeSpecificFAQs: [
      {
        question: 'What makes the Champs-Élysées circuit special?',
        answer: 'The Champs-Élysées is the most famous finishing circuit in cycling. Multiple laps on the cobblestoned boulevard, with the Arc de Triomphe towering overhead, create an iconic celebration of cycling.',
      },
    ],
  },
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

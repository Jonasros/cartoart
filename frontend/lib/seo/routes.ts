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
  // Phase 2 European Marathons
  {
    id: 'vienna-marathon',
    slug: 'vienna-marathon',
    category: 'race',
    name: 'Vienna 42K Running Route',
    shortName: 'Vienna 42K',
    subtitle: 'Reichsbrücke → Heldenplatz',
    description:
      'A scenic 42km running route through imperial Vienna, passing the Prater, Ringstraße, and Schönbrunn Palace.',
    country: 'Austria',
    region: 'Vienna',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#ED1C24',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'vienna', 'austria', 'running', 'imperial'],
    year: 2025,
    website: 'https://www.vienna-marathon.com/',
    mapTitle: 'Vienna 42K',
    introText:
      "The Vienna 42K route is one of Europe's most beautiful city running courses, passing imperial palaces, the famous Ringstraße boulevard, and the green expanse of the Prater. Vienna's flat course and stunning architecture make it a favorite for runners chasing fast times in a world-class setting.",
    routeSpecificFAQs: [
      {
        question: 'What landmarks does the Vienna 42K route pass?',
        answer:
          'The route passes the Prater park, the Ringstraße with its grand buildings (Opera House, Parliament, City Hall), Schönbrunn Palace, and the Heldenplatz.',
      },
    ],
  },
  {
    id: 'barcelona-marathon',
    slug: 'barcelona-marathon',
    category: 'race',
    name: 'Barcelona 42K Running Route',
    shortName: 'Barcelona 42K',
    subtitle: 'Passeig de Gràcia Circuit',
    description:
      'A flat, fast 42km running route past 15 historic landmarks including the Sagrada Família.',
    country: 'Spain',
    region: 'Barcelona',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#CF142B',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'barcelona', 'spain', 'running', 'gaudi'],
    year: 2025,
    website: 'https://www.zurichmaratobarcelona.es/',
    mapTitle: 'Barcelona 42K',
    introText:
      "The Barcelona 42K route takes runners past 15 of the city's most iconic landmarks, from Gaudí's Sagrada Família to the Columbus Monument at the harbour. The flat, fast course along Mediterranean boulevards makes it one of Europe's most popular spring running destinations.",
    routeSpecificFAQs: [
      {
        question: 'What Gaudí landmarks does the Barcelona 42K pass?',
        answer:
          "The route passes near several of Gaudí's masterpieces including the Sagrada Família, Casa Batlló, and Casa Milà (La Pedrera) along Passeig de Gràcia.",
      },
    ],
  },
  {
    id: 'rome-marathon',
    slug: 'rome-marathon',
    category: 'race',
    name: 'Rome 42K Running Route',
    shortName: 'Rome 42K',
    subtitle: 'Fori Imperiali Circuit',
    description:
      'A 42km running route through the Eternal City, past the Colosseum, Vatican, and ancient Roman ruins.',
    country: 'Italy',
    region: 'Rome',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#008C45',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'rome', 'italy', 'running', 'historic', 'ancient'],
    year: 2025,
    website: 'https://www.runromethemarathon.com/',
    mapTitle: 'Rome 42K',
    introText:
      "The Rome 42K route is a journey through 2,000 years of history. Running past the Colosseum, along the Tiber, near St. Peter's Basilica, and through the Forum—there is no marathon in the world with more monuments per kilometer.",
    routeSpecificFAQs: [
      {
        question: 'What ancient sites does the Rome 42K pass?',
        answer:
          "The route passes the Colosseum, Roman Forum, Circus Maximus, Castel Sant'Angelo, St. Peter's Basilica, the Pantheon, and Piazza Navona among many other historic landmarks.",
      },
    ],
  },
  {
    id: 'athens-marathon',
    slug: 'athens-marathon',
    category: 'race',
    name: 'Athens 42K Running Route',
    shortName: 'Athens 42K',
    subtitle: 'Marathon → Panathenaic Stadium',
    description:
      'The original marathon route, retracing the legendary run from Marathon to Athens.',
    country: 'Greece',
    region: 'Attica',
    distance: 42.2,
    difficulty: 'hard',
    routeColor: '#0D5EAF',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'athens', 'greece', 'running', 'original-marathon', 'historic'],
    year: 2025,
    website: 'https://www.athensauthenticmarathon.gr/',
    mapTitle: 'Athens 42K',
    introText:
      "The Athens 42K is where it all began—the original marathon route from the town of Marathon to the marble Panathenaic Stadium in Athens. Running this historic course, you retrace the legendary footsteps of Pheidippides from 490 BC. No other running route carries this much history.",
    routeSpecificFAQs: [
      {
        question: 'Why is the Athens route called the original marathon?',
        answer:
          "The marathon distance was inspired by the legend of Pheidippides, who ran from the Battle of Marathon to Athens in 490 BC. The Athens route follows this historic path, finishing in the Panathenaic Stadium—the venue of the first modern Olympics in 1896.",
      },
      {
        question: 'Is the Athens 42K a difficult course?',
        answer:
          'Yes, the Athens course is challenging with significant uphill sections in the first half. The route climbs steadily from Marathon before descending into Athens, making it slower than flat city courses.',
      },
    ],
  },
  {
    id: 'hamburg-marathon',
    slug: 'hamburg-marathon',
    category: 'race',
    name: 'Hamburg 42K Running Route',
    shortName: 'Hamburg 42K',
    subtitle: 'Hamburg City Circuit',
    description:
      'A flat, fast 42km running route through the vibrant port city of Hamburg.',
    country: 'Germany',
    region: 'Hamburg',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#E30613',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'hamburg', 'germany', 'running', 'flat', 'port-city'],
    year: 2024,
    website: 'https://www.haspa-marathon-hamburg.de/',
    mapTitle: 'Hamburg 42K',
    introText:
      "The Hamburg 42K route takes runners through Germany's gateway to the world. The flat, fast course passes the historic port, the Alster lakes, and the elegant Speicherstadt warehouse district—a unique blend of maritime heritage and urban energy.",
    routeSpecificFAQs: [
      {
        question: 'Why is Hamburg considered a fast marathon course?',
        answer:
          'The Hamburg course is almost entirely flat with excellent crowd support, making it one of the fastest marathon courses in Germany. The course record stands at 2:04:47.',
      },
    ],
  },
  {
    id: 'munich-marathon',
    slug: 'munich-marathon',
    category: 'race',
    name: 'Munich 42K Running Route',
    shortName: 'Munich 42K',
    subtitle: 'Olympic Park → Marienplatz',
    description:
      "A one-lap 42km running route through Munich's top spots, from the Olympic Park to Marienplatz.",
    country: 'Germany',
    region: 'Munich',
    distance: 42.2,
    difficulty: 'moderate',
    routeColor: '#0098DB',
    styleId: 'minimalist',
    paletteId: 'clean',
    tags: ['marathon', 'munich', 'germany', 'running', 'bavaria', 'olympic'],
    year: 2025,
    website: 'https://www.muenchenmarathon.de/',
    mapTitle: 'Munich 42K',
    introText:
      "The Munich 42K route is a sightseeing tour of Bavaria's capital at running pace. Starting from the iconic Olympic Park, the one-lap course passes the Siegestor, Odeonsplatz, and finishes at the famous Marienplatz—offering Bavarian hospitality with every kilometer.",
    routeSpecificFAQs: [
      {
        question: 'What is the Munich marathon course like?',
        answer:
          "The new one-lap course passes Munich's top landmarks, starting at the Olympic Park (host of the 1972 Olympics) and running through the English Garden, past Odeonsplatz, and finishing at the iconic Marienplatz in the heart of the old town.",
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
  // Phase 2 UK Trails
  {
    id: 'pennine-way',
    slug: 'pennine-way',
    category: 'trail',
    name: 'Pennine Way',
    shortName: 'Pennine Way',
    subtitle: 'Edale → Kirk Yetholm',
    description:
      "Britain's first and most famous National Trail, 268 miles along the backbone of England.",
    country: 'United Kingdom',
    region: 'Northern England',
    distance: 429,
    elevationGain: 11700,
    difficulty: 'hard',
    duration: '16-20 days',
    routeColor: '#5D4037',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['england', 'scotland', 'pennines', 'national-trail', 'backbone'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/pennine-way/',
    mapTitle: 'Pennine Way',
    introText:
      "The Pennine Way was Britain's first National Trail, opened in 1965. Running 268 miles from the Peak District to the Scottish Borders, it follows the Pennine ridge—the backbone of England—through wild moorland, dramatic waterfalls, and the finest upland scenery in Britain.",
    routeSpecificFAQs: [
      {
        question: 'How long does the Pennine Way take?',
        answer:
          'Most walkers take 16-20 days to complete the 268-mile trail. Strong walkers can finish in 14 days, while a more relaxed pace might take 3 weeks. The current fastest known time is under 3 days.',
      },
      {
        question: 'What is the hardest section of the Pennine Way?',
        answer:
          'The Cross Fell to Hadrian\'s Wall section and the Cheviot crossing near the finish are considered the most challenging, with exposed moorland, boggy terrain, and limited shelter.',
      },
    ],
  },
  {
    id: 'offas-dyke-path',
    slug: 'offas-dyke-path',
    category: 'trail',
    name: "Offa's Dyke Path",
    shortName: "Offa's Dyke",
    subtitle: 'Sedbury → Prestatyn',
    description:
      'A 177-mile National Trail following the ancient earthwork boundary between England and Wales.',
    country: 'United Kingdom',
    countries: ['England', 'Wales'],
    distance: 285,
    elevationGain: 8500,
    difficulty: 'moderate',
    duration: '12-14 days',
    routeColor: '#558B2F',
    styleId: 'topographic',
    paletteId: 'forest',
    tags: ['england', 'wales', 'border', 'national-trail', 'historic', 'earthwork'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/offas-dyke-path/',
    mapTitle: "Offa's Dyke",
    introText:
      "Offa's Dyke Path follows the ancient 8th-century earthwork built by King Offa of Mercia to mark the boundary between England and Wales. This 177-mile National Trail crosses some of the most beautiful borderland scenery in Britain, from the Severn Estuary to the Irish Sea.",
    routeSpecificFAQs: [
      {
        question: "What is Offa's Dyke?",
        answer:
          "Offa's Dyke is an ancient earthwork barrier built around AD 780 by King Offa of Mercia. It stretches roughly along the border between England and Wales. The National Trail follows much of this historic boundary.",
      },
    ],
  },
  {
    id: 'pembrokeshire-coast-path',
    slug: 'pembrokeshire-coast-path',
    category: 'trail',
    name: 'Pembrokeshire Coast Path',
    shortName: 'Pembrokeshire Coast',
    subtitle: 'St Dogmaels → Amroth',
    description:
      'A stunning 186-mile coastal trail around the Pembrokeshire peninsula in Wales.',
    country: 'United Kingdom',
    region: 'Pembrokeshire, Wales',
    distance: 299,
    elevationGain: 10600,
    difficulty: 'hard',
    duration: '12-15 days',
    routeColor: '#1565C0',
    styleId: 'topographic',
    paletteId: 'classic',
    tags: ['wales', 'coastal', 'national-trail', 'sea-cliffs', 'wildlife'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/pembrokeshire-coast-path/',
    mapTitle: 'Pembrokeshire Coast',
    introText:
      "The Pembrokeshire Coast Path hugs 186 miles of the most spectacular coastline in Britain. Towering sea cliffs, hidden coves, sandy beaches, and abundant wildlife—from puffins to seals—make this National Trail in Wales one of the finest coastal walks anywhere in the world.",
    routeSpecificFAQs: [
      {
        question: 'What wildlife can I see on the Pembrokeshire Coast Path?',
        answer:
          'The trail passes puffin colonies on Skomer Island, grey seal haul-outs, dolphins in Cardigan Bay, and a rich variety of seabirds including gannets, razorbills, and guillemots.',
      },
    ],
  },
  {
    id: 'north-downs-way',
    slug: 'north-downs-way',
    category: 'trail',
    name: 'North Downs Way',
    shortName: 'North Downs Way',
    subtitle: 'Farnham → Dover',
    description:
      'A 153-mile National Trail along the chalk ridge of the North Downs, following the ancient Pilgrims\' Way to Canterbury.',
    country: 'United Kingdom',
    region: 'Surrey / Kent',
    distance: 246,
    elevationGain: 4500,
    difficulty: 'moderate',
    duration: '10-13 days',
    routeColor: '#7CB342',
    styleId: 'minimal',
    paletteId: 'sage',
    tags: ['england', 'surrey', 'kent', 'national-trail', 'pilgrims-way', 'chalk'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/north-downs-way/',
    mapTitle: 'North Downs Way',
    introText:
      "The North Downs Way follows the ancient chalk ridge from Farnham to Dover, sharing its path with the historic Pilgrims' Way to Canterbury. Walking this 153-mile trail through the Garden of England, you pass through ancient woodlands, across sweeping downland, and finish at the iconic White Cliffs of Dover.",
    routeSpecificFAQs: [
      {
        question: "What is the Pilgrims' Way?",
        answer:
          "The Pilgrims' Way is the historic route taken by medieval pilgrims from Winchester to Canterbury. The North Downs Way follows much of this ancient path along the chalk ridge of the North Downs.",
      },
    ],
  },
  {
    id: 'the-ridgeway',
    slug: 'the-ridgeway',
    category: 'trail',
    name: 'The Ridgeway',
    shortName: 'The Ridgeway',
    subtitle: 'Overton Hill → Ivinghoe Beacon',
    description:
      "Britain's oldest road, an 87-mile National Trail following an ancient route across the Wessex Downs.",
    country: 'United Kingdom',
    region: 'Wiltshire / Oxfordshire',
    distance: 139,
    elevationGain: 2400,
    difficulty: 'moderate',
    duration: '5-7 days',
    routeColor: '#A1887F',
    styleId: 'vintage',
    paletteId: 'sepia',
    tags: ['england', 'ancient', 'national-trail', 'wessex', 'oldest-road', 'prehistoric'],
    website: 'https://www.nationaltrail.co.uk/en_GB/trails/the-ridgeway/',
    mapTitle: 'The Ridgeway',
    introText:
      "The Ridgeway is Britain's oldest road—a route that has been in continuous use for over 5,000 years. This 87-mile National Trail follows the ancient chalk ridge past Avebury stone circle, the White Horse of Uffington, and Neolithic burial chambers, connecting you to the deepest layers of British prehistory.",
    routeSpecificFAQs: [
      {
        question: 'Why is The Ridgeway called Britain\'s oldest road?',
        answer:
          'The Ridgeway has been used as a travel route for over 5,000 years, since the Neolithic period. It passes prehistoric sites including Avebury stone circle (older than Stonehenge), the Uffington White Horse, and Wayland\'s Smithy burial chamber.',
      },
    ],
  },
  // International Trails
  {
    id: 'laugavegur-trail',
    slug: 'laugavegur-trail',
    category: 'trail',
    name: 'Laugavegur Trail',
    shortName: 'Laugavegur',
    subtitle: 'Landmannalaugar → Þórsmörk',
    description:
      "Iceland's most famous trek through volcanic landscapes, hot springs, and colorful rhyolite mountains.",
    country: 'Iceland',
    region: 'Southern Highlands',
    distance: 55,
    elevationGain: 1800,
    difficulty: 'moderate',
    duration: '3-4 days',
    routeColor: '#FF5722',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['iceland', 'volcanic', 'hot-springs', 'trekking', 'highlands'],
    website: 'https://www.laugavegurtrailguide.com/',
    mapTitle: 'Laugavegur',
    introText:
      "The Laugavegur Trail is Iceland's most iconic trek—55 km through a landscape that looks like another planet. From the steaming hot springs of Landmannalaugar, through rainbow-colored rhyolite mountains, across black obsidian deserts, to the lush green valley of Þórsmörk. There is nothing else like it on Earth.",
    routeSpecificFAQs: [
      {
        question: 'When is the best time to hike the Laugavegur?',
        answer:
          'The trail is typically open from late June to early September. July and August offer the best weather and longest daylight hours, including the midnight sun.',
      },
      {
        question: 'What makes the Laugavegur landscape unique?',
        answer:
          'The trail passes through an extraordinary range of volcanic terrain: hot springs, rhyolite mountains in every color, obsidian lava fields, glacial rivers, and lush green valleys—all within 55 km.',
      },
    ],
  },
  {
    id: 'gr20-corsica',
    slug: 'gr20-corsica',
    category: 'trail',
    name: 'GR20 Corsica',
    shortName: 'GR20',
    subtitle: 'Calenzana → Conca',
    description:
      "Often called Europe's toughest long-distance trail, 180km along the mountainous spine of Corsica.",
    country: 'France',
    region: 'Corsica',
    distance: 180,
    elevationGain: 12500,
    difficulty: 'expert',
    duration: '12-16 days',
    routeColor: '#D84315',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['france', 'corsica', 'mountains', 'toughest-trail', 'gr-trail'],
    website: 'https://www.le-gr20.fr/',
    mapTitle: 'GR20 Corsica',
    introText:
      "The GR20 is legendary—widely considered Europe's toughest long-distance trail. This 180km route runs along the mountainous spine of Corsica, traversing dramatic granite peaks, glacial lakes, and pristine alpine forests. Completing the GR20 is a badge of honor among serious hikers.",
    routeSpecificFAQs: [
      {
        question: "Why is the GR20 considered Europe's toughest trail?",
        answer:
          'The GR20 involves 12,500m of total elevation gain over rugged, rocky terrain with steep scrambles, exposed ridges, and limited water sources. Many sections require hands-on scrambling over granite slabs and boulders.',
      },
      {
        question: 'What is the difference between the north and south sections?',
        answer:
          'The northern section (Calenzana to Vizzavona) is the harder half, with more exposed terrain, rocky scrambles, and higher elevations. The southern section (Vizzavona to Conca) is generally easier with more forest cover.',
      },
    ],
  },
  {
    id: 'haute-route-chamonix-zermatt',
    slug: 'haute-route-chamonix-zermatt',
    category: 'trail',
    name: "Walker's Haute Route",
    shortName: 'Haute Route',
    subtitle: 'Chamonix → Zermatt',
    description:
      'The classic alpine high-level route connecting two mountain capitals through the French and Swiss Alps.',
    country: 'France',
    countries: ['France', 'Switzerland'],
    distance: 180,
    elevationGain: 11800,
    difficulty: 'hard',
    duration: '12-14 days',
    routeColor: '#C62828',
    styleId: 'topographic',
    paletteId: 'terrain',
    tags: ['france', 'switzerland', 'alps', 'haute-route', 'multi-country', 'high-altitude'],
    website: 'https://www.chamonix.com/',
    mapTitle: 'Haute Route',
    introText:
      "The Walker's Haute Route connects two of the Alps' great mountain towns—Chamonix at the foot of Mont Blanc and Zermatt beneath the Matterhorn. This 180km high-level traverse crosses passes over 2,900m, descending into flower-filled Swiss valleys between breathtaking alpine panoramas.",
    routeSpecificFAQs: [
      {
        question: 'What is the highest point on the Haute Route?',
        answer:
          "The highest point on the Walker's Haute Route is the Col de Prafleuri at approximately 2,987m. Several other passes exceed 2,700m, making proper acclimatization important.",
      },
    ],
  },
  {
    id: 'lycian-way',
    slug: 'lycian-way',
    category: 'trail',
    name: 'Lycian Way',
    shortName: 'Lycian Way',
    subtitle: 'Fethiye → Antalya',
    description:
      "Turkey's first long-distance trail, 540km along the Turquoise Coast past ancient Lycian ruins.",
    country: 'Turkey',
    region: 'Mediterranean Coast',
    distance: 540,
    elevationGain: 20000,
    difficulty: 'hard',
    duration: '25-30 days',
    routeColor: '#00838F',
    styleId: 'topographic',
    paletteId: 'classic',
    tags: ['turkey', 'coastal', 'ancient-ruins', 'mediterranean', 'turquoise-coast'],
    website: 'https://www.lycianway.org/',
    mapTitle: 'Lycian Way',
    introText:
      "The Lycian Way is Turkey's premier long-distance trail—540km along the stunning Turquoise Coast from Fethiye to Antalya. Named after the ancient Lycian civilization, the trail passes rock-cut tombs, Roman ruins, secluded beaches, and mountain villages, combining Mediterranean coastal beauty with 3,000 years of history.",
    routeSpecificFAQs: [
      {
        question: 'What are the Lycian ruins along the trail?',
        answer:
          'The trail passes remarkable ancient Lycian sites including the rock tombs of Myra, the sunken city of Kekova, the mountaintop ruins of Termessos, and the eternal flames of Chimera (Yanartaş).',
      },
      {
        question: 'When is the best time to hike the Lycian Way?',
        answer:
          'The best seasons are spring (March-May) and autumn (September-November). Summer is too hot for comfortable hiking, while winter can bring rain and cold at higher elevations.',
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

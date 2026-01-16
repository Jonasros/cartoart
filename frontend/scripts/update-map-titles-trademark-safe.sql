-- Update map titles to trademark-safe geographic names
-- Run this script in Supabase SQL editor before regenerating thumbnails

-- Tour de France stages -> Geographic names
UPDATE maps SET title = 'Lille Cycling Circuit' WHERE title ILIKE '%tdf-2025-stage-01%' OR title ILIKE '%Tour de France 2025 - Stage 1%';
UPDATE maps SET title = 'Boulogne Coastal Route' WHERE title ILIKE '%tdf-2025-stage-02%' OR title ILIKE '%Tour de France 2025 - Stage 2%';
UPDATE maps SET title = 'Dunkirk Cycling Route' WHERE title ILIKE '%tdf-2025-stage-03%' OR title ILIKE '%Tour de France 2025 - Stage 3%';
UPDATE maps SET title = 'Rouen Normandy Route' WHERE title ILIKE '%tdf-2025-stage-04%' OR title ILIKE '%Tour de France 2025 - Stage 4%';
UPDATE maps SET title = 'Caen Time Trial Route' WHERE title ILIKE '%tdf-2025-stage-05%' OR title ILIKE '%Tour de France 2025 - Stage 5%';
UPDATE maps SET title = 'Vire Normandy Route' WHERE title ILIKE '%tdf-2025-stage-06%' OR title ILIKE '%Tour de France 2025 - Stage 6%';
UPDATE maps SET title = 'Mûr-de-Bretagne Breton Route' WHERE title ILIKE '%tdf-2025-stage-07%' OR title ILIKE '%Tour de France 2025 - Stage 7%';
UPDATE maps SET title = 'Laval Brittany Route' WHERE title ILIKE '%tdf-2025-stage-08%' OR title ILIKE '%Tour de France 2025 - Stage 8%';
UPDATE maps SET title = 'Châteauroux Loire Route' WHERE title ILIKE '%tdf-2025-stage-09%' OR title ILIKE '%Tour de France 2025 - Stage 9%';
UPDATE maps SET title = 'Mont-Dore Auvergne Route' WHERE title ILIKE '%tdf-2025-stage-10%' OR title ILIKE '%Tour de France 2025 - Stage 10%';
UPDATE maps SET title = 'Toulouse Circuit' WHERE title ILIKE '%tdf-2025-stage-11%' OR title ILIKE '%Tour de France 2025 - Stage 11%';
UPDATE maps SET title = 'Hautacam Mountain Route' WHERE title ILIKE '%tdf-2025-stage-12%' OR title ILIKE '%Tour de France 2025 - Stage 12%';
UPDATE maps SET title = 'Peyragudes Time Trial' WHERE title ILIKE '%tdf-2025-stage-13%' OR title ILIKE '%Tour de France 2025 - Stage 13%';
UPDATE maps SET title = 'Superbagnères Pyrenean Route' WHERE title ILIKE '%tdf-2025-stage-14%' OR title ILIKE '%Tour de France 2025 - Stage 14%';
UPDATE maps SET title = 'Carcassonne Southern Route' WHERE title ILIKE '%tdf-2025-stage-15%' OR title ILIKE '%Tour de France 2025 - Stage 15%';
UPDATE maps SET title = 'Mont Ventoux Cycling Route' WHERE title ILIKE '%tdf-2025-stage-16%' OR title ILIKE '%Tour de France 2025 - Stage 16%';
UPDATE maps SET title = 'Valence Rhône Route' WHERE title ILIKE '%tdf-2025-stage-17%' OR title ILIKE '%Tour de France 2025 - Stage 17%';
UPDATE maps SET title = 'Col de la Loze Alpine Route' WHERE title ILIKE '%tdf-2025-stage-18%' OR title ILIKE '%Tour de France 2025 - Stage 18%';
UPDATE maps SET title = 'La Plagne Alpine Route' WHERE title ILIKE '%tdf-2025-stage-19%' OR title ILIKE '%Tour de France 2025 - Stage 19%';
UPDATE maps SET title = 'Pontarlier Jura Route' WHERE title ILIKE '%tdf-2025-stage-20%' OR title ILIKE '%Tour de France 2025 - Stage 20%';
UPDATE maps SET title = 'Paris Champs-Élysées Circuit' WHERE title ILIKE '%tdf-2025-stage-21%' OR title ILIKE '%Tour de France 2025 - Stage 21%';

-- Marathon routes -> Geographic names
UPDATE maps SET title = 'Boston 42K Running Route' WHERE title ILIKE '%boston-marathon%' OR title ILIKE '%Boston Marathon%';
UPDATE maps SET title = 'London 42K Running Route' WHERE title ILIKE '%london-marathon%' OR title ILIKE '%London Marathon%';
UPDATE maps SET title = 'Berlin 42K Running Route' WHERE title ILIKE '%berlin-marathon%' OR title ILIKE '%Berlin Marathon%';
UPDATE maps SET title = 'Chicago 42K Running Route' WHERE title ILIKE '%chicago-marathon%' OR title ILIKE '%Chicago Marathon%';
UPDATE maps SET title = 'New York City 42K Running Route' WHERE title ILIKE '%new-york-city-marathon%' OR title ILIKE '%NYC Marathon%' OR title ILIKE '%New York City Marathon%';
UPDATE maps SET title = 'Tokyo 42K Running Route' WHERE title ILIKE '%tokyo-marathon%' OR title ILIKE '%Tokyo Marathon%';
UPDATE maps SET title = 'Copenhagen 42K Running Route' WHERE title ILIKE '%copenhagen-marathon%' OR title ILIKE '%Copenhagen Marathon%';
UPDATE maps SET title = 'Paris 42K Running Route' WHERE title ILIKE '%paris-marathon%' OR title ILIKE '%Paris Marathon%';
UPDATE maps SET title = 'Amsterdam 42K Running Route' WHERE title ILIKE '%amsterdam-marathon%' OR title ILIKE '%Amsterdam Marathon%';
UPDATE maps SET title = 'Stockholm 42K Running Route' WHERE title ILIKE '%stockholm-marathon%' OR title ILIKE '%Stockholm Marathon%';

-- Ultra trail routes -> Geographic names
UPDATE maps SET title = 'San Juan Mountains 100 Mile Trail' WHERE title ILIKE '%hardrock-100%' OR title ILIKE '%Hardrock 100%';

-- Verify changes
SELECT id, title, is_featured FROM maps WHERE is_featured = true ORDER BY title;

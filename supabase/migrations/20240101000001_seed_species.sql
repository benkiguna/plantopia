-- Seed species table with common houseplants

INSERT INTO species (key, name, water_days, light, humidity, fertilize_days, tip) VALUES
  ('monstera_deliciosa', 'Monstera Deliciosa', 7, 'bright_indirect', 'high', 30, 'Wipe leaves monthly to remove dust and help photosynthesis.'),
  ('pothos', 'Golden Pothos', 10, 'low_to_bright_indirect', 'medium', 60, 'Trim regularly to encourage bushier growth.'),
  ('snake_plant', 'Snake Plant', 14, 'low_to_bright', 'low', 60, 'One of the most forgiving plants - perfect for beginners.'),
  ('fiddle_leaf_fig', 'Fiddle Leaf Fig', 7, 'bright_indirect', 'medium', 30, 'Rotate weekly for even growth. Avoid moving it frequently.'),
  ('peace_lily', 'Peace Lily', 7, 'low_to_medium', 'high', 45, 'Droopy leaves mean it needs water - it will perk back up quickly.'),
  ('rubber_plant', 'Rubber Plant', 10, 'bright_indirect', 'medium', 30, 'Clean leaves with a damp cloth to keep them shiny.'),
  ('zz_plant', 'ZZ Plant', 21, 'low_to_bright_indirect', 'low', 90, 'Extremely drought tolerant - when in doubt, don''t water.'),
  ('spider_plant', 'Spider Plant', 7, 'bright_indirect', 'medium', 30, 'Produces baby plants (spiderettes) that can be propagated.'),
  ('philodendron', 'Philodendron', 7, 'medium_to_bright_indirect', 'medium', 30, 'Yellow leaves often indicate overwatering.'),
  ('calathea', 'Calathea', 5, 'medium_indirect', 'high', 30, 'Use filtered or distilled water - sensitive to chemicals in tap water.');

-- Create a mock user for development (no auth)
INSERT INTO profiles (id, email, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'dev@plantopia.local', 'Dev User');

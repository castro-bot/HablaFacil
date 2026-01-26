-- =============================================
-- HablaFácil AAC - Supabase Database Setup
-- =============================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- =============================================

-- Step 1: Create the LOCATIONS table
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  spanish TEXT NOT NULL,
  english TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Step 2: Create the WORDS table
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  spanish TEXT NOT NULL,
  english TEXT NOT NULL,
  category TEXT NOT NULL,
  locations TEXT[] NOT NULL DEFAULT ARRAY['all'],
  symbol_url TEXT DEFAULT '',
  audio_url TEXT,
  frequency TEXT NOT NULL DEFAULT 'medium'
);

-- Step 3: Enable Row Level Security (allows public read access)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for public read access
-- Step 4: Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access on locations" ON locations;
CREATE POLICY "Allow public read access on locations" ON locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on words" ON words;
CREATE POLICY "Allow public read access on words" ON words
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on words" ON words;
CREATE POLICY "Allow public insert access on words" ON words
  FOR INSERT WITH CHECK (true);

-- =============================================
-- SEED DATA: Locations
-- =============================================
INSERT INTO locations (id, spanish, english, icon, color, "order") VALUES
  ('casa', 'Casa', 'Home', '🏠', 'bg-amber-500', 1),
  ('escuela', 'Escuela', 'School', '🏫', 'bg-blue-500', 2),
  ('parque', 'Parque', 'Park', '🌳', 'bg-green-500', 3),
  ('centro_comercial', 'Centro Comercial', 'Mall', '🛒', 'bg-purple-500', 4),
  ('hospital', 'Hospital', 'Hospital', '🏥', 'bg-red-500', 5),
  ('restaurante', 'Restaurante', 'Restaurant', '🍽️', 'bg-orange-500', 6)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED DATA: Words (Core Vocabulary)
-- =============================================
INSERT INTO words (id, spanish, english, category, locations, frequency) VALUES
  -- Pronouns
  ('yo', 'Yo', 'I', 'pronombres', ARRAY['all'], 'high'),
  ('tu', 'Tú', 'You', 'pronombres', ARRAY['all'], 'high'),
  ('el', 'Él', 'He', 'pronombres', ARRAY['all'], 'high'),
  ('ella', 'Ella', 'She', 'pronombres', ARRAY['all'], 'high'),
  ('nosotros', 'Nosotros', 'We', 'pronombres', ARRAY['all'], 'high'),
  ('este', 'Este', 'This', 'pronombres', ARRAY['all'], 'high'),
  ('ese', 'Ese', 'That', 'pronombres', ARRAY['all'], 'high'),
  ('todo', 'Todo', 'All/Everything', 'pronombres', ARRAY['all'], 'high'),
  ('nada', 'Nada', 'Nothing', 'pronombres', ARRAY['all'], 'high'),
  ('algo', 'Algo', 'Something', 'pronombres', ARRAY['all'], 'high'),
  ('alguien', 'Alguien', 'Someone', 'pronombres', ARRAY['all'], 'medium'),
  ('nadie', 'Nadie', 'Nobody', 'pronombres', ARRAY['all'], 'medium'),

  -- Verbs
  ('quiero', 'Quiero', 'I want', 'verbos', ARRAY['all'], 'high'),
  ('necesito', 'Necesito', 'I need', 'verbos', ARRAY['all'], 'high'),
  ('tengo', 'Tengo', 'I have', 'verbos', ARRAY['all'], 'high'),
  ('me_gusta', 'Me gusta', 'I like', 'verbos', ARRAY['all'], 'high'),
  ('no_me_gusta', 'No me gusta', 'I don''t like', 'verbos', ARRAY['all'], 'high'),
  ('puedo', 'Puedo', 'I can', 'verbos', ARRAY['all'], 'high'),
  ('ir', 'Ir', 'To go', 'verbos', ARRAY['all'], 'high'),
  ('comer', 'Comer', 'To eat', 'verbos', ARRAY['casa', 'restaurante', 'escuela'], 'high'),
  ('beber', 'Beber', 'To drink', 'verbos', ARRAY['casa', 'restaurante', 'escuela', 'parque'], 'high'),
  ('jugar', 'Jugar', 'To play', 'verbos', ARRAY['casa', 'parque', 'escuela'], 'high'),
  ('dormir', 'Dormir', 'To sleep', 'verbos', ARRAY['casa', 'hospital'], 'high'),
  ('ayudar', 'Ayudar', 'To help', 'verbos', ARRAY['all'], 'high'),
  ('hablar', 'Hablar', 'To talk', 'verbos', ARRAY['all'], 'high'),
  ('escuchar', 'Escuchar', 'To listen', 'verbos', ARRAY['all'], 'medium'),
  ('ver', 'Ver', 'To see', 'verbos', ARRAY['all'], 'high'),
  ('leer', 'Leer', 'To read', 'verbos', ARRAY['casa', 'escuela'], 'medium'),
  ('escribir', 'Escribir', 'To write', 'verbos', ARRAY['casa', 'escuela'], 'medium'),
  ('caminar', 'Caminar', 'To walk', 'verbos', ARRAY['parque', 'centro_comercial'], 'medium'),
  ('correr', 'Correr', 'To run', 'verbos', ARRAY['parque', 'escuela'], 'medium'),
  ('sentarse', 'Sentarse', 'To sit', 'verbos', ARRAY['all'], 'medium'),
  ('levantarse', 'Levantarse', 'To stand up', 'verbos', ARRAY['all'], 'medium'),
  ('esperar', 'Esperar', 'To wait', 'verbos', ARRAY['all'], 'medium'),
  ('terminar', 'Terminar', 'To finish', 'verbos', ARRAY['all'], 'medium'),
  ('empezar', 'Empezar', 'To start', 'verbos', ARRAY['all'], 'medium'),
  ('abrir', 'Abrir', 'To open', 'verbos', ARRAY['all'], 'medium'),
  ('cerrar', 'Cerrar', 'To close', 'verbos', ARRAY['all'], 'medium'),
  ('comprar', 'Comprar', 'To buy', 'verbos', ARRAY['centro_comercial', 'restaurante'], 'medium'),
  ('pagar', 'Pagar', 'To pay', 'verbos', ARRAY['centro_comercial', 'restaurante'], 'medium'),

  -- Social phrases
  ('si', 'Sí', 'Yes', 'sociales', ARRAY['all'], 'high'),
  ('no', 'No', 'No', 'sociales', ARRAY['all'], 'high'),
  ('hola', 'Hola', 'Hello', 'sociales', ARRAY['all'], 'high'),
  ('adios', 'Adiós', 'Goodbye', 'sociales', ARRAY['all'], 'high'),
  ('gracias', 'Gracias', 'Thank you', 'sociales', ARRAY['all'], 'high'),
  ('por_favor', 'Por favor', 'Please', 'sociales', ARRAY['all'], 'high'),
  ('lo_siento', 'Lo siento', 'I''m sorry', 'sociales', ARRAY['all'], 'high'),
  ('perdon', 'Perdón', 'Excuse me', 'sociales', ARRAY['all'], 'high'),
  ('buenos_dias', 'Buenos días', 'Good morning', 'sociales', ARRAY['all'], 'medium'),
  ('buenas_noches', 'Buenas noches', 'Good night', 'sociales', ARRAY['all'], 'medium'),

  -- Questions
  ('que', '¿Qué?', 'What?', 'preguntas', ARRAY['all'], 'high'),
  ('donde', '¿Dónde?', 'Where?', 'preguntas', ARRAY['all'], 'high'),
  ('cuando', '¿Cuándo?', 'When?', 'preguntas', ARRAY['all'], 'high'),
  ('quien', '¿Quién?', 'Who?', 'preguntas', ARRAY['all'], 'high'),
  ('por_que', '¿Por qué?', 'Why?', 'preguntas', ARRAY['all'], 'high'),
  ('como', '¿Cómo?', 'How?', 'preguntas', ARRAY['all'], 'high'),
  ('cuanto', '¿Cuánto?', 'How much?', 'preguntas', ARRAY['centro_comercial', 'restaurante'], 'medium'),

  -- Nouns
  ('agua', 'Agua', 'Water', 'sustantivos', ARRAY['casa', 'restaurante', 'escuela', 'parque', 'hospital'], 'high'),
  ('comida', 'Comida', 'Food', 'sustantivos', ARRAY['casa', 'restaurante', 'escuela'], 'high'),
  ('bano', 'Baño', 'Bathroom', 'sustantivos', ARRAY['all'], 'high'),
  ('mama', 'Mamá', 'Mom', 'sustantivos', ARRAY['all'], 'high'),
  ('papa', 'Papá', 'Dad', 'sustantivos', ARRAY['all'], 'high'),
  ('hermano', 'Hermano', 'Brother', 'sustantivos', ARRAY['casa', 'escuela'], 'medium'),
  ('hermana', 'Hermana', 'Sister', 'sustantivos', ARRAY['casa', 'escuela'], 'medium'),
  ('amigo', 'Amigo', 'Friend', 'sustantivos', ARRAY['escuela', 'parque'], 'high'),
  ('maestro', 'Maestro', 'Teacher', 'sustantivos', ARRAY['escuela'], 'high'),
  ('doctor', 'Doctor', 'Doctor', 'sustantivos', ARRAY['hospital'], 'high'),
  ('libro', 'Libro', 'Book', 'sustantivos', ARRAY['casa', 'escuela'], 'medium'),
  ('juguete', 'Juguete', 'Toy', 'sustantivos', ARRAY['casa', 'parque', 'centro_comercial'], 'medium'),
  ('pelota', 'Pelota', 'Ball', 'sustantivos', ARRAY['casa', 'parque', 'escuela'], 'medium'),
  ('telefono', 'Teléfono', 'Phone', 'sustantivos', ARRAY['casa', 'escuela'], 'medium'),
  ('television', 'Televisión', 'TV', 'sustantivos', ARRAY['casa'], 'medium'),
  ('musica', 'Música', 'Music', 'sustantivos', ARRAY['casa', 'escuela', 'parque'], 'medium'),
  ('carro', 'Carro', 'Car', 'sustantivos', ARRAY['casa', 'centro_comercial'], 'medium'),
  ('ropa', 'Ropa', 'Clothes', 'sustantivos', ARRAY['casa', 'centro_comercial'], 'medium'),
  ('zapatos', 'Zapatos', 'Shoes', 'sustantivos', ARRAY['casa', 'centro_comercial'], 'medium'),
  ('medicina', 'Medicina', 'Medicine', 'sustantivos', ARRAY['casa', 'hospital'], 'medium'),
  ('dolor', 'Dolor', 'Pain', 'sustantivos', ARRAY['hospital', 'casa'], 'high'),
  ('cabeza', 'Cabeza', 'Head', 'sustantivos', ARRAY['hospital'], 'medium'),
  ('estomago', 'Estómago', 'Stomach', 'sustantivos', ARRAY['hospital'], 'medium'),
  ('mano', 'Mano', 'Hand', 'sustantivos', ARRAY['all'], 'medium'),
  ('pie', 'Pie', 'Foot', 'sustantivos', ARRAY['all'], 'medium'),
  ('dinero', 'Dinero', 'Money', 'sustantivos', ARRAY['centro_comercial', 'restaurante'], 'medium'),
  ('caja', 'Caja', 'Cashier', 'sustantivos', ARRAY['centro_comercial', 'restaurante'], 'low'),
  ('menu', 'Menú', 'Menu', 'sustantivos', ARRAY['restaurante'], 'medium'),
  ('mesa', 'Mesa', 'Table', 'sustantivos', ARRAY['restaurante', 'casa', 'escuela'], 'medium'),
  ('silla', 'Silla', 'Chair', 'sustantivos', ARRAY['restaurante', 'casa', 'escuela'], 'medium'),
  ('columpio', 'Columpio', 'Swing', 'sustantivos', ARRAY['parque'], 'medium'),
  ('resbaladilla', 'Resbaladilla', 'Slide', 'sustantivos', ARRAY['parque'], 'medium'),
  ('arbol', 'Árbol', 'Tree', 'sustantivos', ARRAY['parque'], 'low'),
  ('flor', 'Flor', 'Flower', 'sustantivos', ARRAY['parque'], 'low'),
  ('lapiz', 'Lápiz', 'Pencil', 'sustantivos', ARRAY['escuela'], 'medium'),
  ('papel', 'Papel', 'Paper', 'sustantivos', ARRAY['escuela'], 'medium'),
  ('mochila', 'Mochila', 'Backpack', 'sustantivos', ARRAY['escuela'], 'medium'),
  ('clase', 'Clase', 'Class', 'sustantivos', ARRAY['escuela'], 'high'),
  ('recreo', 'Recreo', 'Recess', 'sustantivos', ARRAY['escuela'], 'high'),
  ('tarea', 'Tarea', 'Homework', 'sustantivos', ARRAY['escuela', 'casa'], 'medium'),
  ('almuerzo', 'Almuerzo', 'Lunch', 'sustantivos', ARRAY['escuela', 'casa', 'restaurante'], 'high'),
  ('desayuno', 'Desayuno', 'Breakfast', 'sustantivos', ARRAY['casa'], 'medium'),
  ('cena', 'Cena', 'Dinner', 'sustantivos', ARRAY['casa', 'restaurante'], 'medium'),
  ('cama', 'Cama', 'Bed', 'sustantivos', ARRAY['casa', 'hospital'], 'medium'),
  ('cocina', 'Cocina', 'Kitchen', 'sustantivos', ARRAY['casa'], 'medium'),
  ('sala', 'Sala', 'Living room', 'sustantivos', ARRAY['casa'], 'medium'),
  ('cuarto', 'Cuarto', 'Room', 'sustantivos', ARRAY['casa', 'hospital'], 'medium'),

  -- Emotions
  ('feliz', 'Feliz', 'Happy', 'emociones', ARRAY['all'], 'high'),
  ('triste', 'Triste', 'Sad', 'emociones', ARRAY['all'], 'high'),
  ('enojado', 'Enojado', 'Angry', 'emociones', ARRAY['all'], 'high'),
  ('cansado', 'Cansado', 'Tired', 'emociones', ARRAY['all'], 'high'),
  ('hambre', 'Tengo hambre', 'I''m hungry', 'emociones', ARRAY['all'], 'high'),
  ('sed', 'Tengo sed', 'I''m thirsty', 'emociones', ARRAY['all'], 'high'),
  ('frio', 'Tengo frío', 'I''m cold', 'emociones', ARRAY['all'], 'medium'),
  ('calor', 'Tengo calor', 'I''m hot', 'emociones', ARRAY['all'], 'medium'),
  ('asustado', 'Asustado', 'Scared', 'emociones', ARRAY['all'], 'medium'),
  ('sorprendido', 'Sorprendido', 'Surprised', 'emociones', ARRAY['all'], 'low'),
  ('me_duele', 'Me duele', 'It hurts', 'emociones', ARRAY['hospital', 'casa'], 'high'),

  -- Adjectives
  ('grande', 'Grande', 'Big', 'adjetivos', ARRAY['all'], 'high'),
  ('pequeno', 'Pequeño', 'Small', 'adjetivos', ARRAY['all'], 'high'),
  ('mas', 'Más', 'More', 'adjetivos', ARRAY['all'], 'high'),
  ('menos', 'Menos', 'Less', 'adjetivos', ARRAY['all'], 'medium'),
  ('bueno', 'Bueno', 'Good', 'adjetivos', ARRAY['all'], 'high'),
  ('malo', 'Malo', 'Bad', 'adjetivos', ARRAY['all'], 'high'),
  ('nuevo', 'Nuevo', 'New', 'adjetivos', ARRAY['all'], 'medium'),
  ('viejo', 'Viejo', 'Old', 'adjetivos', ARRAY['all'], 'medium'),
  ('rapido', 'Rápido', 'Fast', 'adjetivos', ARRAY['all'], 'medium'),
  ('lento', 'Lento', 'Slow', 'adjetivos', ARRAY['all'], 'medium'),
  ('aqui', 'Aquí', 'Here', 'adjetivos', ARRAY['all'], 'high'),
  ('alla', 'Allá', 'There', 'adjetivos', ARRAY['all'], 'high'),
  ('arriba', 'Arriba', 'Up', 'adjetivos', ARRAY['all'], 'medium'),
  ('abajo', 'Abajo', 'Down', 'adjetivos', ARRAY['all'], 'medium'),
  ('dentro', 'Dentro', 'Inside', 'adjetivos', ARRAY['all'], 'medium'),
  ('fuera', 'Fuera', 'Outside', 'adjetivos', ARRAY['all'], 'medium'),
  ('otra_vez', 'Otra vez', 'Again', 'adjetivos', ARRAY['all'], 'high'),
  ('diferente', 'Diferente', 'Different', 'adjetivos', ARRAY['all'], 'medium'),
  ('mismo', 'Mismo', 'Same', 'adjetivos', ARRAY['all'], 'medium'),

  -- Numbers
  ('uno', 'Uno', 'One', 'numeros', ARRAY['all'], 'high'),
  ('dos', 'Dos', 'Two', 'numeros', ARRAY['all'], 'high'),
  ('tres', 'Tres', 'Three', 'numeros', ARRAY['all'], 'high'),
  ('cuatro', 'Cuatro', 'Four', 'numeros', ARRAY['all'], 'medium'),
  ('cinco', 'Cinco', 'Five', 'numeros', ARRAY['all'], 'medium'),
  ('diez', 'Diez', 'Ten', 'numeros', ARRAY['all'], 'medium'),

  -- Colors
  ('rojo', 'Rojo', 'Red', 'colores', ARRAY['all'], 'medium'),
  ('azul', 'Azul', 'Blue', 'colores', ARRAY['all'], 'medium'),
  ('verde', 'Verde', 'Green', 'colores', ARRAY['all'], 'medium'),
  ('amarillo', 'Amarillo', 'Yellow', 'colores', ARRAY['all'], 'medium'),
  ('negro', 'Negro', 'Black', 'colores', ARRAY['all'], 'medium'),
  ('blanco', 'Blanco', 'White', 'colores', ARRAY['all'], 'medium'),

  -- Time
  ('hoy', 'Hoy', 'Today', 'tiempo', ARRAY['all'], 'high'),
  ('manana', 'Mañana', 'Tomorrow', 'tiempo', ARRAY['all'], 'medium'),
  ('ayer', 'Ayer', 'Yesterday', 'tiempo', ARRAY['all'], 'medium'),
  ('ahora', 'Ahora', 'Now', 'tiempo', ARRAY['all'], 'high'),
  ('despues', 'Después', 'Later', 'tiempo', ARRAY['all'], 'high'),
  ('antes', 'Antes', 'Before', 'tiempo', ARRAY['all'], 'medium')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Verification: Count inserted rows
-- =============================================
SELECT 'Locations:' as table_name, COUNT(*) as count FROM locations
UNION ALL
SELECT 'Words:', COUNT(*) FROM words;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Paths
const wordsTxtPath = path.join(rootDir, 'words.txt');
const setupSqlPath = path.join(rootDir, 'supabase_setup.sql');
const mulberryDir = path.join(rootDir, 'public/symbols/mulberry-symbols/EN-symbols');
const outputSymbolsDir = path.join(rootDir, 'public/symbols');
const outputWordsSqlPath = path.join(rootDir, 'words_seed.sql');
const outputCoreUpdateSqlPath = path.join(rootDir, 'core_words_update.sql');

// Ensure output dir exists
if (!fs.existsSync(outputSymbolsDir)) {
    fs.mkdirSync(outputSymbolsDir, { recursive: true });
}

// 1. Gather all words (new + core)
const paramMap = new Map(); // Key: normalized spanish, Value: { id, english, category, isCore }

// Parse words.txt (New words)
function parseWordsTxt() {
    console.log('Parsing words.txt...');
    const content = fs.readFileSync(wordsTxtPath, 'utf-8');
    const lines = content.split('\n');
    let currentCategory = 'sustantivos';

    // ... (logic from previous script) ...
    const categoryMap = { 'NOUNS': 'sustantivos', 'VERBS': 'verbos', 'PRONOUNS': 'pronombres', 'ADVERBS': 'adjetivos', 'ADJECTIVES': 'adjetivos', 'NUMERALS': 'numeros', 'INTERJECTIONS': 'sociales', 'Time': 'tiempo' };
    const headersToSkip = [ 'Animals', 'People', 'Food and Drink', 'Household Objects', 'Body Parts', 'Toys', 'Vehicles', 'Places', 'Clothing', 'Outside Objects', 'Activities', 'STABLE SUBSTITUTES', 'ARTICLES', 'PREPOSITIONS', 'CONJUNCTIONS', 'Word FTU AoA', '(continued)', 'Continued.', 'Note.', 'Appendix A', 'Page' ];

// Spanish to English Map for words.txt
const spanishToEnglish = {
    // Animals
    'ardilla': 'squirrel', 'bicho': 'bug', 'caballo': 'horse', 'conejo': 'rabbit', 'gallina': 'hen',
    'gato': 'cat', 'jirafa': 'giraffe', 'leon': 'lion', 'mariposa': 'butterfly', 'mono': 'monkey',
    'osito': 'teddy bear', 'oso': 'bear', 'pajaro': 'bird', 'pato': 'duck', 'perro': 'dog',
    'pescado': 'fish', 'pinguino': 'penguin', 'pollito': 'chick', 'pollo': 'chicken', 'rana': 'frog',
    'raton': 'mouse', 'vaca': 'cow',
    // People
    'abuela': 'grandmother', 'abuelo': 'grandfather', 'amigo': 'friend', 'hermana': 'sister',
    'hermano': 'brother', 'maestra': 'teacher', 'mama': 'mom', 'nina': 'girl', 'nino': 'boy',
    'papa': 'dad', 'payaso': 'clown', 'policia': 'police', 'prima': 'cousin', 'primo': 'cousin', 'tia': 'aunt',
    // Food
    'agua': 'water', 'azucar': 'sugar', 'calabaza': 'pumpkin', 'chocolate': 'chocolate', 'comida': 'food',
    'dulce': 'candy', 'galleta': 'cookie', 'helado': 'ice cream', 'hielo': 'ice', 'jugo': 'juice',
    'leche': 'milk', 'naranja': 'orange', 'cuchara': 'spoon', 'plato': 'plate', 'vaso': 'glass',
    // Household
    'cuna': 'crib', 'escalera': 'stairs', 'escoba': 'broom', 'espejo': 'mirror', 'luz': 'light',
    'mesa': 'table', 'peine': 'comb', 'puerta': 'door', 'silla': 'chair', 'telefono': 'telephone',
    'cama': 'bed', 'bano': 'bathroom', 'cocina': 'kitchen', 'sala': 'living room', 'cuarto': 'bedroom',
    // Body
    'boca': 'mouth', 'cara': 'face', 'mano': 'hand', 'nariz': 'nose', 'ojo': 'eye', 'oreja': 'ear',
    'pelo': 'hair', 'pie': 'foot', 'teta': 'boob', 'cabeza': 'head', 'estomago': 'stomach',
    // Toys
    'carriola': 'stroller', 'colores': 'colors', 'globo': 'balloon', 'juguete': 'toy', 'lapiz': 'pencil',
    'muneca': 'doll', 'pala': 'shovel', 'papel': 'paper', 'pelota': 'ball', 'libro': 'book',
    'mochila': 'backpack', 'clase': 'class', 'recreo': 'recess', 'tarea': 'homework',
    // Vehicles
    'avion': 'airplane', 'barco': 'boat', 'camion': 'truck', 'coche': 'car', 'moto': 'motorcycle',
    'tractor': 'tractor', 'tren': 'train', 'calle': 'street',
    // Places
    'casa': 'house', 'parque': 'park', 'playa': 'beach', 'escuela': 'school', 'hospital': 'hospital',
    'restaurante': 'restaurant', 'supermercado': 'supermarket',
    // Clothing
    'reloj': 'watch', 'sombrero': 'hat', 'zapato': 'shoe', 'ropa': 'clothes', 'zapatos': 'shoes',
    // Nature
    'estrella': 'star', 'flor': 'flower', 'sol': 'sun', 'arbol': 'tree',
    // Verbs
    'abrir': 'open', 'acabar': 'finish', 'bailar': 'dance', 'buscar': 'look for', 'caer': 'fall',
    'caminar': 'walk', 'cantar': 'sing', 'cerrar': 'close', 'cocinar': 'cook', 'comer': 'eat',
    'comprar': 'buy', 'correr': 'run', 'dar': 'give', 'dormir': 'sleep', 'enseñar': 'teach',
    'escuchar': 'listen', 'esperar': 'wait', 'estar': 'be', 'gustar': 'like', 'haber': 'have',
    'hablar': 'talk', 'hacer': 'do', 'ir': 'go', 'jugar': 'play', 'llevar': 'carry', 'llorar': 'cry',
    'mirar': 'look', 'morder': 'bite', 'oir': 'hear', 'parar': 'stop', 'peinar': 'comb',
    'perder': 'lose', 'poner': 'put', 'querer': 'want', 'quitar': 'remove', 'romper': 'break',
    'saber': 'know', 'salir': 'exit', 'saltar': 'jump', 'sentar': 'sit', 'ser': 'be', 'tener': 'have',
    'tirar': 'throw', 'tocar': 'touch', 'tomar': 'take', 'venir': 'come', 'ver': 'see',
    'ayudar': 'help', 'escribir': 'write', 'leer': 'read', 'pagar': 'pay', 'empezar': 'start',
    // Adjectives/Adverbs
    'abajo': 'down', 'arriba': 'up', 'adentro': 'inside', 'afuera': 'outside', 'grande': 'big',
    'pequeno': 'small', 'feliz': 'happy', 'triste': 'sad', 'enojado': 'angry', 'bueno': 'good',
    'malo': 'bad', 'mas': 'more', 'menos': 'less', 'si': 'yes', 'no': 'no', 'hola': 'hello',
    'adios': 'goodbye', 'gracias': 'thank you', 'por favor': 'please', 'perdon': 'sorry',
    'hoy': 'today', 'manana': 'tomorrow', 'ayer': 'yesterday', 'ahora': 'now', 'antes': 'before',
    'despues': 'after', 'rapido': 'fast', 'lento': 'slow', 'nuevo': 'new', 'viejo': 'old',
    'limpio': 'clean', 'sucio': 'dirty', 'caliente': 'hot', 'frio': 'cold', 'rico': 'yummy',
    // Colors/Numbers (handled partially)
    'rojo': 'red', 'azul': 'blue', 'verde': 'green', 'amarillo': 'yellow', 'negro': 'black', 'blanco': 'white',
    'uno': 'one', 'dos': 'two', 'tres': 'three', 'cuatro': 'four', 'cinco': 'five', 'diez': 'ten'
};

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (categoryMap[line]) { currentCategory = categoryMap[line]; continue; }
        if (headersToSkip.some(h => line.includes(h))) continue;

        // Extract word
        const digitMatch = line.match(/\d/);
        let wordText = digitMatch ? line.substring(0, digitMatch.index).trim() : (line.length < 20 ? line : '');
        wordText = wordText.replace(/[~€]/g, '').trim();
        if (wordText.length < 2 || headersToSkip.includes(wordText)) continue;

        let spanish = wordText.charAt(0).toUpperCase() + wordText.slice(1);
        // Fix some specific typos in words.txt or encoding issues
        if (spanish === 'Uino') { spanish = 'Pinguino'; } // Fix 'Ping' 'uino' split
        if (spanish === 'Ping') continue; // Part of pinguino
        if (spanish.includes('(')) spanish = spanish.split('(')[0].trim(); // Remove (se)

        const slug = spanish.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
        const key = spanish.toLowerCase();

        // Lookup english mapping
        let english = spanishToEnglish[key] || '';

        if (!paramMap.has(key)) {
             paramMap.set(key, {
                 spanish: spanish,
                 english: english,
                 category: currentCategory,
                 isCore: false
             });
        }
    }
}

// Parse supabase_setup.sql (Core words)
function parseSetupSql() {
    console.log('Parsing supabase_setup.sql...');
    const content = fs.readFileSync(setupSqlPath, 'utf-8');
    // Regex to find INSERT INTO words ... VALUES ...
    // Then parse lines like ('yo', 'Yo', 'I', ...)

    // Simple naive line parser for the INSERT block
    const lines = content.split('\n');
    let insideInsert = false;

    for (const line of lines) {
        if (line.includes('INSERT INTO words')) insideInsert = true;
        if (line.includes('SELECT')) insideInsert = false;

        if (insideInsert && line.trim().startsWith('(')) {
            // ('id', 'Spanish', 'English', ...)
            const parts = line.split(',').map(p => p.trim().replace(/^'|'$/g, '')); // split by comma, remove quotes
            if (parts.length >= 3) {
                const id = parts[0].replace(/^\('/, '').replace(/'$/, ''); // clean up parens
                const spanish = parts[1];
                const english = parts[2];
                const category = parts[3];

                const key = spanish.toLowerCase();
                // Overwrite if exists (core takes precedence or merges)
                paramMap.set(key, {
                    id: id,
                    spanish: spanish,
                    english: english,
                    category: category,
                    isCore: true
                });
            }
        }
    }
}

parseWordsTxt();
parseSetupSql();

console.log(`Total unique words to match: ${paramMap.size}`);

// 2. Index Mulberry Symbols
// We assume they are in mulberryDir (recursive?)
// Usually they are flat or categorized. We'll crawl recursively.
function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(getFiles(file));
        else if (file.endsWith('.svg')) results.push(file);
    });
    return results;
}

console.log(`Scanning symbols in ${mulberryDir}...`);
const allSymbols = getFiles(mulberryDir);
console.log(`Found ${allSymbols.length} SVG files.`);

if (allSymbols.length === 0) {
    console.warn("WARNING: No symbols found. Did you extract the Mulberry zip to 'mulberry-symbols'?");
}

// 3. Match logic
// Mulberry format: "cat.svg", "dog_1.svg", "run,.svg"
// Strategy:
// A. Exact match english (if available)
// B. Exact match spanish
// C. Fuzzy match?

let matched = 0;
let missing = 0;

const seedValues = [];
const coreUpdates = [];
const usedIds = new Set();

// Helper to clean english phrases for better matching
function cleanEnglish(text) {
    if (!text) return '';
    return text.toLowerCase()
        .replace(/^to /, '') // "To eat" -> "eat"
        .replace(/^i /, '')  // "I want" -> "want"
        .replace(/^a /, '')  // "A dog" -> "dog"
        .replace(/^the /, '')
        .replace(/\?$/, '')  // "What?" -> "What"
        .trim();
}

// Find symbol with improved logic
function findSymbol(wordObj) {
    const spanish = wordObj.spanish.toLowerCase();
    const english = wordObj.english ? wordObj.english.toLowerCase() : '';
    const cleanedEnglish = cleanEnglish(english);

    // 1. Exact English
    if (english) {
        const match = allSymbols.find(p => path.basename(p, '.svg').toLowerCase() === english);
        if (match) return match;
    }

    // 2. Cleaned English (e.g. "To eat" -> "eat.svg")
    if (cleanedEnglish && cleanedEnglish !== english) {
        const match = allSymbols.find(p => path.basename(p, '.svg').toLowerCase() === cleanedEnglish);
        if (match) return match;
    }

    // 3. Exact Spanish
    const matchEs = allSymbols.find(p => path.basename(p, '.svg').toLowerCase() === spanish);
    if (matchEs) return matchEs;

    // 4. Safe Partial Match (e.g. "teacher" -> "teacher_1a.svg")
    // Only if target length > 3 to avoid noise (e.g. "be" -> "bear")
    if (cleanedEnglish && cleanedEnglish.length > 3) {
        // Find files that start with the word strictly
        const partials = allSymbols.filter(p => {
            const name = path.basename(p, '.svg').toLowerCase();
            return name.startsWith(`${cleanedEnglish}_`) || name.startsWith(`${cleanedEnglish}-`);
        });

        if (partials.length > 0) {
            // Sort by length to pick shortest (most relevant)
            partials.sort((a, b) => a.length - b.length);
            return partials[0];
        }
    }

    // 5. Fuzzy/Contains (Conservative) - only if length > 3 to avoid noise
    // Mulberry often uses "word_1.svg"
    // Check if filename STARTS with word + "_" or is word + ".svg"

    const candidates = [cleanedEnglish, spanish].filter(s => s && s.length > 2);
    for (const cand of candidates) {
        const fuzzy = allSymbols.find(p => {
            const name = path.basename(p, '.svg').toLowerCase();
            return name === cand || name.startsWith(`${cand}_`) || name.startsWith(`${cand}-`);
        });
        if (fuzzy) return fuzzy;
    }

    return null;
}

// Helper to copy
function copySymbol(src, distinctName) {
    const destName = `${distinctName}.svg`;
    fs.copyFileSync(src, path.join(outputSymbolsDir, destName));
    return `/symbols/${destName}`;
}

// Restore API Fetch for fallback
async function fetchSymboTalk(word) {
    try {
        const url = `https://symbotalkapiv1.azurewebsites.net/search/?name=${encodeURIComponent(word)}&lang=es&repo=all&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].link) {
            return data[0].link;
        }
    } catch (e) { /* ignore */ }
    return null;
}

// simple sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
    console.log(`Matching symbols...`);

    for (const [key, w] of paramMap) {
        const symbolPath = findSymbol(w);
        let publicUrl = '';

        // Generate clean ID
        let id = w.id;
        if (!id) {
            const slug = w.spanish.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
            id = `${slug}_txt`;
            let counter = 1;
            const origId = id;
            while (usedIds.has(id)) { counter++; id = `${origId}_${counter}`; }
            usedIds.add(id);
        }

        if (symbolPath) {
            publicUrl = copySymbol(symbolPath, id);
            matched++;
        } else {
            missing++;
            process.stdout.write('!'); // Missing local

            // Fallback to API
            const onlineUrl = await fetchSymboTalk(w.spanish);
            if (onlineUrl) {
                publicUrl = onlineUrl;
            } else {
                publicUrl = `https://ui-avatars.com/api/?name=${w.spanish}&background=random`;
            }
            await sleep(100); // Throttling
        }

        if (w.isCore) {
            if (symbolPath || publicUrl.includes('http')) {
                 // Update if we have a better symbol (local or real API), otherwise keep existing?
                 // Actually, supabase_setup has NO URL by default. So any URL is better.
                 coreUpdates.push(`UPDATE words SET symbol_url = '${publicUrl}' WHERE id = '${w.id}';`);
            }
        } else {
            seedValues.push(`  ('${id}', '${w.spanish.replace(/'/g, "''")}', '${w.spanish.replace(/'/g, "''")}', '${w.category}', ARRAY['all'], 'medium', '${publicUrl}')`);
        }
    }

    console.log(`\nMatching complete. Matched Local: ${matched}, Online Fallback/Missing: ${missing}`);

    if (seedValues.length > 0) {
        let sql = `-- Seed data (New Words)\n`;
        sql += `INSERT INTO words (id, spanish, english, category, locations, frequency, symbol_url) VALUES\n`;
        sql += seedValues.join(',\n');
        sql += `\nON CONFLICT (id) DO UPDATE SET symbol_url = EXCLUDED.symbol_url;\n`;
        fs.writeFileSync(outputWordsSqlPath, sql);
        console.log(`Updated ${outputWordsSqlPath}`);
    }

    if (coreUpdates.length > 0) {
        const sql = `-- Update Core Words with Symbols\n` + coreUpdates.join('\n');
        fs.writeFileSync(outputCoreUpdateSqlPath, sql);
        console.log(`Created ${outputCoreUpdateSqlPath}`);
    } else {
        // Write empty or comment if nothing
         fs.writeFileSync(outputCoreUpdateSqlPath, "-- No core word updates found");
    }
}

run();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read words.txt
const wordsPath = path.resolve(__dirname, '../words.txt');
const wordsContent = fs.readFileSync(wordsPath, 'utf-8');
const lines = wordsContent.split('\n');

const wordsToAdd = [];
let currentCategory = 'sustantivos';

const categoryMap = {
    'NOUNS': 'sustantivos',
    'VERBS': 'verbos',
    'PRONOUNS': 'pronombres',
    'ADVERBS': 'adjetivos',
    'ADJECTIVES': 'adjetivos',
    'NUMERALS': 'numeros',
    'INTERJECTIONS': 'sociales',
    'Time': 'tiempo',
};

const headersToSkip = [
    'Animals', 'People', 'Food and Drink', 'Household Objects', 'Body Parts',
    'Toys', 'Vehicles', 'Places', 'Clothing', 'Outside Objects', 'Activities',
    'STABLE SUBSTITUTES', 'ARTICLES', 'PREPOSITIONS', 'CONJUNCTIONS',
    'Word FTU AoA', '(continued)', 'Continued.', 'Note.', 'Appendix A',
    'List of Overlapping Words Between the Pineiro and Manzano (PM) ~',
    'Database and the Inventorios del Desarrollo de Habilidades',
    'Comunicativas (IDHC)', 'Page'
];

for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (categoryMap[line]) {
        currentCategory = categoryMap[line];
        continue;
    }

    if (headersToSkip.includes(line)) continue;
    if (line.includes('Page ')) continue;

    const digitMatch = line.match(/\d/);
    let wordText = '';

    if (digitMatch) {
        wordText = line.substring(0, digitMatch.index).trim();
    } else {
        if (line.length < 20) wordText = line;
        else continue;
    }

    wordText = wordText.replace(/[~€]/g, '').trim();
    if (wordText.length < 2) continue;
    if (headersToSkip.includes(wordText)) continue;

    const spanish = wordText.charAt(0).toUpperCase() + wordText.slice(1);

    wordsToAdd.push({
        spanish: spanish,
        category: currentCategory,
    });
}

console.log(`Loaded ${wordsToAdd.length} words. Starting API fetch...`);

async function fetchSymbol(word) {
    try {
        const url = `https://symbotalkapiv1.azurewebsites.net/search/?name=${encodeURIComponent(word)}&lang=es&repo=all&limit=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0 && data[0].link) {
            return data[0].link;
        }
    } catch (e) {
        // ignore error
    }
    return null;
}

// simple sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generate() {
    let sql = `-- Seed data with real images\n`;
    sql += `INSERT INTO words (id, spanish, english, category, locations, frequency, symbol_url) VALUES\n`;

    const values = [];
    const BATCH_SIZE = 5; // Parallel requests

    const usedIds = new Set();

    for (let i = 0; i < wordsToAdd.length; i += BATCH_SIZE) {
        const batch = wordsToAdd.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (w) => {
            let symbolUrl = await fetchSymbol(w.spanish);

            // If API fails or returns nothing, fallback to ui-avatars?
            // User said "not have those ugly emojis".
            // Mulberry fallback would be hard without the zip.
            // Let's stick to ui-avatars as LAST resort but try hard.
            if (!symbolUrl) {
               symbolUrl = `https://ui-avatars.com/api/?name=${w.spanish}&background=random`;
            }

            const slug = w.spanish.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
            let id = `${slug}_txt`;

            // Handle duplicates within this run
            let counter = 1;
            const originalId = id;
            while (usedIds.has(id)) {
                counter++;
                id = `${originalId}_${counter}`;
            }
            usedIds.add(id);

            return `  ('${id}', '${w.spanish.replace(/'/g, "''")}', '${w.spanish.replace(/'/g, "''")}', '${w.category}', ARRAY['all'], 'medium', '${symbolUrl}')`;
        });

        const results = await Promise.all(promises);
        values.push(...results);

        process.stdout.write(`.`);
        await sleep(200); // Be nice to the API
    }

    sql += values.join(',\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET symbol_url = EXCLUDED.symbol_url;\n`; // Update existing ones too!

    const outputPath = path.resolve(__dirname, '../words_seed.sql');
    fs.writeFileSync(outputPath, sql);

    console.log(`\nGenerated ${outputPath}`);
}

generate();

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

    // Check if header
    if (categoryMap[line]) {
        currentCategory = categoryMap[line];
        continue;
    }

    // Skip subheaders
    if (headersToSkip.includes(line)) continue;
    if (line.includes('Page ')) continue;

    // Parse word
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

// Generate SQL
let sql = `-- Seed data from words.txt\n`;
sql += `INSERT INTO words (id, spanish, english, category, locations, frequency, symbol_url) VALUES\n`;

const values = wordsToAdd.map(w => {
    const slug = w.spanish.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
    // Using a suffix to avoid collision with existing simple IDs
    const id = `${slug}_txt`;
    const symbolUrl = `https://ui-avatars.com/api/?name=${w.spanish}&background=random`;
    return `  ('${id}', '${w.spanish.replace(/'/g, "''")}', '${w.spanish.replace(/'/g, "''")}', '${w.category}', ARRAY['all'], 'medium', '${symbolUrl}')`;
});

sql += values.join(',\n');
sql += `\nON CONFLICT (id) DO NOTHING;\n`;

const outputPath = path.resolve(__dirname, '../words_seed.sql');
fs.writeFileSync(outputPath, sql);

console.log(`Generated ${outputPath} with ${wordsToAdd.length} words.`);

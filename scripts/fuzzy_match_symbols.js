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

// Levenshtein distance
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// 1. Gather all words (new + core)
const paramMap = new Map();

// Spanish to English Map (Copied from match script for context)
const spanishToEnglish = {
    // Animals
    'ardilla': 'squirrel', 'bicho': 'bug', 'caballo': 'horse', 'conejo': 'rabbit', 'gallina': 'hen',
    'gato': 'cat', 'jirafa': 'giraffe', 'leon': 'lion', 'mariposa': 'butterfly', 'mono': 'monkey',
    'osito': 'teddy bear', 'oso': 'bear', 'pajaro': 'bird', 'pato': 'duck', 'perro': 'dog',
    'pescado': 'fish', 'pinguino': 'penguin', 'pollito': 'chick', 'pollo': 'chicken', 'rana': 'frog',
    'raton': 'mouse', 'vaca': 'cow',
    // ... (Keep concise, script should ideally import or share this, but duplication is safer for standalone)
    'abuela': 'grandmother', 'abuelo': 'grandfather', 'amigo': 'friend', 'hermana': 'sister',
    'hermano': 'brother', 'maestra': 'teacher', 'mama': 'mom', 'nina': 'girl', 'nino': 'boy',
    'papa': 'dad', 'payaso': 'clown', 'policia': 'police', 'prima': 'cousin', 'primo': 'cousin', 'tia': 'aunt',
    'agua': 'water', 'comida': 'food', 'escuela': 'school', 'hospital': 'hospital', 'casa': 'house',
    'jugar': 'play', 'comer': 'eat', 'dormir': 'sleep', 'correr': 'run', 'saltar': 'jump',
    'feliz': 'happy', 'triste': 'sad', 'enojado': 'angry', 'grande': 'big', 'pequeno': 'small',
    'si': 'yes', 'no': 'no', 'hola': 'hello', 'adios': 'goodbye', 'gracias': 'thank you',
    'yo': 'i', 'tu': 'you', 'el': 'he', 'ella': 'she', 'nosotros': 'we', 'ellos': 'they',
    'que': 'what', 'donde': 'where', 'cuando': 'when', 'quien': 'who', 'por que': 'why', 'como': 'how',
    'haber': 'have', 'estar': 'be', 'ser': 'be', 'gustar': 'like', 'ir': 'go', 'hacer': 'do',
    'ver': 'see', 'mirar': 'look', 'escuchar': 'listen', 'enseñar': 'teach', 'aprender': 'learn'
};

function parseWordsTxt() {
    console.log('Parsing words.txt...');
    const content = fs.readFileSync(wordsTxtPath, 'utf-8');
    const lines = content.split('\n');
    const headersToSkip = [ 'Animals', 'People', 'Word FTU AoA', '(continued)' ];

    for (let line of lines) {
        line = line.trim();
        if (!line || headersToSkip.some(h => line.includes(h))) continue;
        const digitMatch = line.match(/\d/);
        let wordText = digitMatch ? line.substring(0, digitMatch.index).trim() : (line.length < 20 ? line : '');
        wordText = wordText.replace(/[~€]/g, '').trim();
        if (wordText.length < 2) continue;

        let spanish = wordText.charAt(0).toUpperCase() + wordText.slice(1);
        if (spanish.includes('(')) spanish = spanish.split('(')[0].trim();

        const key = spanish.toLowerCase();
        let english = spanishToEnglish[key] || '';
        if (!paramMap.has(key)) paramMap.set(key, { spanish, english });
    }
}

function parseSetupSql() {
    console.log('Parsing supabase_setup.sql...');
    const content = fs.readFileSync(setupSqlPath, 'utf-8');
    const lines = content.split('\n');
    let insideInsert = false;
    for (const line of lines) {
        if (line.includes('INSERT INTO words')) insideInsert = true;
        if (line.includes('SELECT')) insideInsert = false;
        if (insideInsert && line.trim().startsWith('(')) {
            const parts = line.split(',').map(p => p.trim().replace(/^'|'$/g, ''));
            if (parts.length >= 3) {
                const spanish = parts[1];
                const english = parts[2];
                const key = spanish.toLowerCase();
                paramMap.set(key, { spanish, english });
            }
        }
    }
}

parseWordsTxt();
parseSetupSql();

// Get Symbols
const allSymbols = fs.readdirSync(mulberryDir).filter(f => f.endsWith('.svg'));
console.log(`Loaded ${allSymbols.length} symbols.`);

console.log('\n--- Finding Closest Matches for Missing Words ---\n');

const results = [];

for (const [key, word] of paramMap) {
    const spanish = word.spanish.toLowerCase();
    const english = word.english ? word.english.toLowerCase() : '';

    // Check if exact match already exists
    const exactEn = english && allSymbols.find(s => s.toLowerCase() === `${english}.svg`);
    const exactEs = allSymbols.find(s => s.toLowerCase() === `${spanish}.svg`);

    if (exactEn || exactEs) continue; // Skip, already handled

    // Fuzzy matching
    let bestMatch = null;
    let minDist = Infinity;

    // Search against English translation first (better quality)
    const target = english || spanish; // Fallback to spanish if no english

    // 0. Substring match (High priority)
    // e.g. "squirrel" in "gray_squirrel.svg"
    let substringMatch = null;
    if (target.length > 3) {
        // Find shortest filename that contains the target
        const containing = allSymbols.filter(s => s.toLowerCase().includes(target));
        if (containing.length > 0) {
            containing.sort((a, b) => a.length - b.length);
            substringMatch = containing[0];
        }
    }

    if (substringMatch) {
         results.push({
            spanish: word.spanish,
            english: word.english,
            target: target,
            match: substringMatch,
            dist: 0, // Pseudo-distance
            type: 'Substring'
        });
        continue;
    }

    for (const file of allSymbols) {
        const name = file.replace('.svg', '').toLowerCase();
        const dist = levenshtein(target, name);

        if (dist < minDist) {
            minDist = dist;
            bestMatch = file;
        }
    }

    // Heuristic: only show if relevant enough (e.g. distance is relatively small compared to length)
    // or just show top results
    if (minDist < 4) { // arbitrary threshold
        results.push({
            spanish: word.spanish,
            english: word.english,
            target: target,
            match: bestMatch,
            dist: minDist
        });
    }
}

// Sort by relevance
results.sort((a, b) => a.dist - b.dist);

// Output code to paste into map
console.log('// Suggested additions to spanishToEnglish map or direct symbol overrides:');
results.forEach(r => {
    console.log(`// ${r.spanish} (${r.english}) -> ${r.match} (dist: ${r.dist})`);
});

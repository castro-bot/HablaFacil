import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load vocabulary data
const data = require('../src/data/vocabulary.json');

// Get list of SVG files
const symbolsDir = './public/symbols';
const symbols = fs.readdirSync(symbolsDir)
  .filter(f => f.endsWith('.svg'))
  .map(f => f.replace('.svg', ''));

// Map frequency string to number
const freqMap = { high: 3, medium: 2, low: 1 };

// Helper to escape SQL strings
const escapeSql = (s) => (s || '').replace(/'/g, "''");

// Generate SQL INSERT statements
const lines = data.map(w => {
  // Check for local SVG (id.svg or id_txt.svg)
  let symbolUrl = w.symbolUrl || '';
  if (symbols.includes(w.id)) {
    symbolUrl = '/symbols/' + w.id + '.svg';
  } else if (symbols.includes(w.id + '_txt')) {
    symbolUrl = '/symbols/' + w.id + '_txt.svg';
  }

  const freq = freqMap[(w.frequency || 'medium').toLowerCase()] || 2;

  return `  ('${w.id}', '${escapeSql(w.spanish)}', '${escapeSql(w.english)}', '${w.category}', ${freq}, '${symbolUrl}')`;
});

let sql = `-- =============================================
-- HablaFácil AAC - Complete Seed Data
-- Generated from vocabulary.json (${data.length} words)
-- Run on Supabase branch: refactor-categories-words-symbols
-- =============================================

-- =============================================
-- SEED DATA: Words (${data.length} vocabulary items)
-- =============================================
INSERT INTO words (id, spanish, english, category, frequency, symbol_url) VALUES
${lines.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  spanish = EXCLUDED.spanish,
  english = EXCLUDED.english,
  category = EXCLUDED.category,
  frequency = EXCLUDED.frequency,
  symbol_url = EXCLUDED.symbol_url;

-- Verification queries
SELECT 'Total words:' as metric, COUNT(*) as value FROM words
UNION ALL
SELECT 'Words with symbols:', COUNT(*) FROM words WHERE symbol_url IS NOT NULL AND symbol_url != ''
UNION ALL
SELECT 'Words with local SVG:', COUNT(*) FROM words WHERE symbol_url LIKE '/symbols/%';
`;

fs.writeFileSync('vocabulary_seed.sql', sql);
console.log('Generated vocabulary_seed.sql with ' + data.length + ' words');

// Also show category breakdown
const categories = {};
data.forEach(w => {
  categories[w.category] = (categories[w.category] || 0) + 1;
});
console.log('\nCategory breakdown:');
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

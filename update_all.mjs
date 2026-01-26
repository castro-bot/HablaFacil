import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURACIÓN ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'src', 'data', 'vocabulary.json');

// Leer JSON
const vocabulary = JSON.parse(fs.readFileSync(JSON_PATH));

console.log(`🚀 Iniciando BÚSQUEDA INTELIGENTE EN INGLÉS para ${vocabulary.length} palabras...`);

const buscarEnIngles = (fraseIngles) => {
    return new Promise((resolve) => {
        // LIMPIEZA INTELIGENTE
        // 1. Convertimos "To run" -> "run"
        // 2. Convertimos "I want" -> "want"
        // 3. Dejamos "I" como "I"
        let term = fraseIngles.toLowerCase();
        
        // Si no es "I" (Yo), limpiamos prefijos comunes
        if (term !== 'i') {
            term = term.replace(/^to /i, '');       // To run -> run
            term = term.replace(/^i'm /i, '');      // I'm hungry -> hungry
            
            // Si empieza con "I " y hay más texto, quitamos la "I"
            if (term.startsWith('i ') && term.length > 2) {
                term = term.substring(2);
            }
        }
        
        term = term.trim();

        // API EN INGLÉS (/en/search)
        const url = `https://api.arasaac.org/api/pictograms/en/search/${encodeURIComponent(term)}`;
        
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const resultados = JSON.parse(data);
                    if (Array.isArray(resultados) && resultados.length > 0) {
                        // Devolvemos el primer resultado (la mejor coincidencia)
                        resolve(resultados[0]._id);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
};

const procesar = async () => {
    let encontrados = 0;

    for (let i = 0; i < vocabulary.length; i++) {
        const word = vocabulary[i];
        
        if (word.english) {
            process.stdout.write(`[${i+1}/${vocabulary.length}] 🇬🇧 Buscando "${word.english}"... `);
            
            const id = await buscarEnIngles(word.english);
            
            if (id) {
                // URL directa a la API
                word.symbolUrl = `https://api.arasaac.org/api/pictograms/${id}?download=false`;
                console.log(`✅ ID: ${id}`);
                encontrados++;
            } else {
                console.log(`❌ No encontrado`);
            }
            
            // Pausa mínima
            await new Promise(r => setTimeout(r, 50));
        }
    }

    // Guardar cambios
    fs.writeFileSync(JSON_PATH, JSON.stringify(vocabulary, null, 2));
    
    console.log('\n=======================================');
    console.log(`✨ PROCESO TERMINADO`);
    console.log(`✅ Imágenes encontradas: ${encontrados} de ${vocabulary.length}`);
    console.log(`👉 REINICIA EL SERVIDOR (npm run dev)`);
    console.log('=======================================');
};

procesar();
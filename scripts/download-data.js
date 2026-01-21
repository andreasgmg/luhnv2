const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs till Skatteverkets öppna data (Entryscape)
const DATA_SOURCES = {
  personnummer: 'https://skatteverket.entryscape.net/rowstore/dataset/b4de7df7-63c0-4e7e-bb59-1f156a591763/json',
  samordningsnummer: 'https://skatteverket.entryscape.net/rowstore/dataset/9f29fe09-4dbc-4d2f-848f-7cffdd075383/json'
};

const OUTPUT_DIR = path.join(__dirname, '../data');

/**
 * Parsar ett personnummer (sträng) till ett fullt årtal (YYYY).
 * Hanterar formaten:
 * - YYYYMMDDXXXX (12 siffror)
 * - YYMMDD-XXXX (10 siffror med bindestreck)
 * - YYMMDD+XXXX (10 siffror med plus, över 100 år)
 */
function getFullYear(ssn) {
    // Ta bort allt som inte är siffror eller tecken
    const clean = ssn.trim();
    
    // 12-siffrigt format (enkelt)
    if (/^\d{12}$/.test(clean)) {
        return parseInt(clean.substring(0, 4), 10);
    }

    // 10-siffrigt format med tecken (YYMMDD-XXXX eller YYMMDD+XXXX)
    // Eller 10 siffror utan tecken (YYMMDDXXXX) - antar bindestreck då
    // Vi måste veta nuvarande år för att gissa sekel
    const match = clean.match(/^(\d{2})(\d{2})(\d{2})([\-\+]?)(\d{4})$/);
    
    if (match) {
        const yy = parseInt(match[1], 10);
        const separator = match[4]; // - eller +
        
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        
        let fullYear = currentCentury + yy;
        
        // Om året blev i framtiden, så är det föregående sekel (1900-tal)
        if (fullYear > currentYear) {
            fullYear -= 100;
        }

        // Om separatorn är '+', så är personen över 100 år. 
        // Vi drar bort ytterligare 100 år.
        if (separator === '+') {
            fullYear -= 100;
        }

        return fullYear;
    }

    return null; // Ogiltigt format
}

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Laddar ner ${filename}...`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Vi sparar bara nummer i intervallet 1900-2025 för att hålla filstorleken nere och relevansen uppe
// Men för samordningsnummer kan vi behöva vara mer generösa.
const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // 1. Personnummer
    const pnrData = await downloadFile(DATA_SOURCES.personnummer, 'Personnummer');
    const pnrList = [];
    
    if (pnrData && pnrData.results) {
        pnrData.results.forEach(item => {
            // Skatteverkets JSON har ofta en nyckel som är själva numret eller "testpersonnummer"
            const num = item.testpersonnummer || item.personnummer;
            if (num) {
                const year = getFullYear(num);
                if (year && year >= MIN_YEAR && year <= MAX_YEAR) {
                    pnrList.push(num);
                }
            }
        });
    }
    
    console.log(`Hittade ${pnrList.length} personnummer.`);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'personnummer.json'), JSON.stringify(pnrList, null, 2));

    // 2. Samordningsnummer
    const samData = await downloadFile(DATA_SOURCES.samordningsnummer, 'Samordningsnummer');
    const samList = [];

    if (samData && samData.results) {
        samData.results.forEach(item => {
            const num = item.samordningsnummer || item.testsamordningsnummer;
            if (num) {
                // Samordningsnummer har ingen strikt åldersgräns på samma sätt, 
                // men vi vill ha rimliga år.
                const year = getFullYear(num); 
                // För samordningsnummer bryr vi oss inte lika mycket om åldern, 
                // vi tar allt som ser giltigt ut.
                if (year) {
                    samList.push(num);
                }
            }
        });
    }

    console.log(`Hittade ${samList.length} samordningsnummer.`);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'samordningsnummer.json'), JSON.stringify(samList, null, 2));

    // 3. Generera namn (Vi mockar detta eftersom vi inte har en bra öppen källa för just namn-listor i JSON)
    // I en riktig "Best in Class" lösning skulle vi skrapa SCB, men för nu använder vi en hårdkodad fil
    // som vi redan har i projektet (data/names.json).
    // Om den inte finns, skapa en placeholder.
    if (!fs.existsSync(path.join(OUTPUT_DIR, 'names.json'))) {
        console.log('Skapar names.json placeholder...');
        const names = {
            firstNames: {
                male: ["Lars", "Mikael", "Anders", "Johan", "Erik", "Per", "Karl", "Peter", "Jan", "Thomas"],
                female: ["Anna", "Eva", "Maria", "Karin", "Kristina", "Lena", "Sara", "Kerstin", "Ingrid", "Marie"]
            },
            lastNames: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson"],
            company: {
                locations: ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg"],
                sectors: ["IT", "Bygg", "Konsult", "Handel", "Transport", "Media", "Finans", "Fastighet"],
                suffixes: ["AB", "HB", "Kommanditbolag", "Group", "Nordic", "Sverige", "International"]
            },
            banks: ["Swedbank", "Nordea", "SEB", "Handelsbanken", "Länsförsäkringar", "Danske Bank", "ICA Banken"]
        };
        fs.writeFileSync(path.join(OUTPUT_DIR, 'names.json'), JSON.stringify(names, null, 2));
    }

    console.log('Klar! Data nedladdad och processad.');

  } catch (err) {
    console.error('Fel vid nedladdning:', err);
    process.exit(1);
  }
}

main();

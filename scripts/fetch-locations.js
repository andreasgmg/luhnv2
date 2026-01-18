const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://raw.githubusercontent.com/beshrkayali/sverige_postnummer/master/postcodes.json';
const outputPath = path.join(__dirname, '../data/locations.json');

console.log('Hämtar adresser från', url);

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      console.log('Nedladdning klar. Rensar och filtrerar...');
      const raw = JSON.parse(data);
      const locations = [];

      Object.keys(raw).forEach(zipKey => {
        const entries = raw[zipKey];
        if (entries && entries.length > 0) {
          
          const validEntries = entries.filter(entry => {
            const street = (entry['Street Name'] || '').trim();
            if (!street || street.length < 4) return false;
            
            const lower = street.toLowerCase();
            
            // 1. Släng företag (AB, Aktiebolag, HB, KB, etc)
            // Vi kollar efter fristående förkortningar
            const isCompany = 
                /\b(ab|aktiebolag|aktiebolaget|handelsbolag|hb|kommanditbolag|kb|ek\.?\s*för\.?|storföretag)\b/i.test(street) ||
                street.includes('(') || // Ofta parenteser i företagsnamn
                street.includes('&');   // Ofta ampersand i företagsnamn

            if (isCompany) return false;

            // 2. Släng institutioner och logistik
            const isInstitution = /\b(skola|gymnasium|universitet|högskola|sjukhus|vårdcentral|kommun|förvaltning|museum|kyrka|församling|arena|stadium|stadsbibliotek|kundtjänst|lager|terminal|logistics|distribution|center|mailbox|box|posten|pob)\b/i.test(street);
            if (isInstitution) return false;

            // 3. Släng adresser med siffror (ofta boxar)
            if (/\d/.test(street)) return false;

            // 4. Släng specialadresser
            if (street.includes('/') || street.includes('\\') || street.includes('|')) return false;

            return true;
          });

          if (validEntries.length > 0) {
            // Sortera för att få mest "gatu-liknande" namn först
            validEntries.sort((a, b) => {
                const getScore = (s) => {
                    const l = s.toLowerCase();
                    if (l.endsWith('gatan')) return 10;
                    if (l.endsWith('vägen')) return 9;
                    if (l.endsWith('gränd')) return 8;
                    if (l.endsWith('allé')) return 7;
                    if (l.endsWith('stig')) return 6;
                    return 0;
                };
                return getScore(b['Street Name']) - getScore(a['Street Name']);
            });
            
            const entry = validEntries[0];
            const city = entry['City/Locality'];
            const street = entry['Street Name'];
            const zip = entry['Postcode'];

            if (city && street && zip) {
              locations.push({ street, zip, city });
            }
          }
        }
      });

      // Ta bort dubbletter
      const seen = new Set();
      const unique = locations.filter(l => {
          const key = `${l.street}-${l.city}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
      });

      fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));
      console.log(`Klart! Extraherade ${unique.length} unika, rena bostadsadresser.`);

    } catch (error) {
      console.error('Fel vid parsing av JSON:', error);
    }
  });

}).on('error', (err) => {
  console.error('Fel vid nedladdning:', err);
});
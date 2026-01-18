const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://raw.githubusercontent.com/beshrkayali/sverige_postnummer/master/postcodes.json';
const outputPath = path.join(__dirname, '../data/locations.json');

console.log('Fetching locations from', url);

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      console.log('Download complete. Parsing...');
      const raw = JSON.parse(data);
      const locations = [];

      // Structure: { "12345": [ { "Street Name": "A", ... }, ... ] }
      Object.keys(raw).forEach(zipKey => {
        const entries = raw[zipKey];
        if (entries && entries.length > 0) {
          // Pick the first entry for this zip code
          const entry = entries[0];
          const city = entry['City/Locality'];
          const street = entry['Street Name'];
          const zip = entry['Postcode']; // "352 36"

          if (city && street && zip) {
            locations.push({
              street,
              zip,
              city
            });
          }
        }
      });

      console.log(`Extracted ${locations.length} locations.`);
      fs.writeFileSync(outputPath, JSON.stringify(locations, null, 2));
      console.log('Saved to', outputPath);

    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });

}).on('error', (err) => {
  console.error('Error downloading:', err);
});

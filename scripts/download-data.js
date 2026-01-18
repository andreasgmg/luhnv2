const fs = require('fs/promises');
const path = require('path');

const urls = {
  personnummer: 'https://skatteverket.entryscape.net/rowstore/dataset/b4de7df7-63c0-4e7e-bb59-1f156a591763',
  samordningsnummer: 'https://skatteverket.entryscape.net/rowstore/dataset/9f29fe09-4dbc-4d2f-848f-7cffdd075383'
};

const dataDir = path.join(__dirname, '../src/data');

/**
 * Fetches with retry mechanism.
 * @param {string} url The URL to fetch.
 * @param {number} retries Number of retries.
 * @param {number} delay Delay between retries in ms.
 * @returns {Promise<any>}
 */
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`Fetch failed for ${url}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}


/**
 * Fetches all data from a paginated API.
 * @param {string} baseUrl The base URL of the API.
 * @returns {Promise<any[]>} A promise that resolves to an array of all results.
 */
async function fetchAllData(baseUrl) {
  let allResults = [];
  const limit = 1000;
  let totalCount = 0;

  try {
    const initialResponse = await fetchWithRetry(`${baseUrl}?_limit=1`);
    const initialData = await initialResponse.json();
    totalCount = initialData.resultCount;
  } catch (error) {
    console.error(`Error fetching total count from ${baseUrl}:`, error);
    return [];
  }

  if (totalCount === 0) {
    console.log(`No results found for ${baseUrl}`);
    return [];
  }

  console.log(`Found ${totalCount} total results for ${baseUrl}. Fetching in pages of ${limit}...`);

  const totalPages = Math.ceil(totalCount / limit);
  console.log(`Total pages to fetch: ${totalPages}`);

  for (let i = 0; i < totalPages; i++) {
    const offset = i * limit;
    const pageUrl = `${baseUrl}?_offset=${offset}&_limit=${limit}`;
    console.log(`Fetching page ${i + 1} of ${totalPages} from ${pageUrl}`);
    try {
      const response = await fetchWithRetry(pageUrl);
      const pageData = await response.json();
      if (pageData.results) {
        allResults.push(...pageData.results);
        console.log(`Fetched ${pageData.results.length} records. Total so far: ${allResults.length}`);
      } else {
        console.log(`No 'results' key in response for page ${i + 1}`);
      }
    } catch (error) {
      console.error(`Error fetching page ${pageUrl}:`, error);
      // Continue to next page even if one fails
    }
  }

  return allResults;
}


/**
 * Filters a person or coordination number record by birth year.
 * @param {{Testpersonnummer?: string, Testsamordningsnummer?: string}} record
 * @returns {boolean}
 */
function filterByBirthYear(record) {
    const number = record.Testpersonnummer || record.Testsamordningsnummer;
    if (!number) return false;

    // The test data has different formats, so we need to handle them.
    // Formats: YYYYMMDDXXXX, YYMMDD-XXXX, YYMMDD+XXXX
    let birthYear;
    if (number.length === 12 && !isNaN(number)) { // YYYYMMDDXXXX
        birthYear = parseInt(number.substring(0, 4), 10);
    } else if (number.length === 11 && (number.includes('-') || number.includes('+'))) { // YYMMDD-XXXX or YYMMDD+XXXX
        let yearPart = parseInt(number.substring(0, 2), 10);
        const separator = number.charAt(6);
        const currentYearLastTwoDigits = new Date().getFullYear() % 100;

        if (separator === '+') {
            // '+' means the person is 100 years or older.
            // This logic assumes the script runs in the 21st century.
            birthYear = 1900 + yearPart;
             if (yearPart > currentYearLastTwoDigits) {
                birthYear = 1800 + yearPart; // Should be rare for test data
            } else {
                birthYear = 1900 + yearPart;
            }
        } else { // separator === '-'
             if (yearPart > currentYearLastTwoDigits) {
                birthYear = 1900 + yearPart;
            } else {
                birthYear = 2000 + yearPart;
            }
        }
    } else if (number.length === 10 && !isNaN(number)) { // YYMMDDXXXX (without separator)
         let yearPart = parseInt(number.substring(0, 2), 10);
         const currentYearLastTwoDigits = new Date().getFullYear() % 100;
         if (yearPart > currentYearLastTwoDigits) {
            birthYear = 1900 + yearPart;
        } else {
            birthYear = 2000 + yearPart;
        }
    }
    //This is a simplified logic that might not cover all edge cases but should work for the dataset.
    else if (number.length > 8) {
        let yearStr = number.substring(0, 2);
        let twoDigitYear = parseInt(yearStr, 10);
        let separator = number.includes('+') ? '+' : '-';
        if (separator === '-') {
            if (twoDigitYear <= (new Date().getFullYear() % 100)) {
                birthYear = 2000 + twoDigitYear;
            } else {
                birthYear = 1900 + twoDigitYear;
            }
        } else { // separator === '+'
            birthYear = 1900 + twoDigitYear;
        }
    }
    else {
        // console.log(`Skipping invalid number format: ${number}`);
        return false;
    }

    const inRange = birthYear >= 1936 && birthYear <= 2026;
    // if(inRange) console.log(`Number: ${number}, Year: ${birthYear}, In Range: ${inRange}`);
    return inRange;
}


async function downloadAndFilter() {
  try {
    await fs.mkdir(dataDir, { recursive: true });

    for (const [name, url] of Object.entries(urls)) {
      console.log(`Processing ${name}...`);
      const allData = await fetchAllData(url);
      console.log(`Downloaded ${allData.length} total records for ${name}.`);

      console.log(`Filtering ${name} data...`);
      const filteredData = allData.filter(filterByBirthYear);
      console.log(`Filtered to ${filteredData.length} records between 1936 and 2026.`);

      const outputPath = path.join(dataDir, `${name}.json`);
      await fs.writeFile(outputPath, JSON.stringify({ results: filteredData }, null, 2));
      console.log(`Filtered ${name} data saved to ${outputPath}`);
    }

  } catch (error) {
    console.error('Error during download and filter process:', error);
  }
}

downloadAndFilter();
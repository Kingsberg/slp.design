import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const MARKUP = 1.8; // Cost + 80%
const importDir = path.join(__dirname, '..', 'pricing');
const outputDataFile = path.join(__dirname, '..', 'data', 'pricing.json');

const files = fs.readdirSync(importDir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));

if (files.length === 0) {
    console.error('❌ Error: No .xls files found in /pricing');
    process.exit(1);
}

const finalPricingData = {};

let totalParsed = 0;

for (const fileName of files) {
    if (fileName.startsWith('~$')) {
        continue;
    }
    const targetFile = path.join(importDir, fileName);

    if (fileName.includes('BillBook')) {
        console.log(`\n⏳ Extracting Bill Book pricing from: ${fileName}`);
        try {
            const workbook = XLSX.readFile(targetFile);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            if (!finalPricingData['billbook']) {
                finalPricingData['billbook'] = {};
            }
            
            for (const row of jsonData) {
                const qty = parseInt(row['Qty'], 10);
                const mat = row['Paper Material'];
                const sets = row['Sets'];
                const printing = row['Printing'];
                const price = parseFloat(row['Price']);
                
                if (!mat || isNaN(qty) || !sets || !printing || isNaN(price)) continue;
                
                // Key format: "NCR 2ply_50_1C" -> qty -> price
                const key = `${mat}_${sets}_${printing}`;
                
                if (!finalPricingData['billbook'][key]) {
                    finalPricingData['billbook'][key] = {};
                }
                
                // Apply 1.8x markup
                const retailPrice = price * MARKUP;
                finalPricingData['billbook'][key][qty] = parseFloat(retailPrice.toFixed(2));
            }
            totalParsed++;
        } catch (error) {
            console.error(`❌ Failed parsing Bill Book:`, error.message);
        }
        continue;
    }

    if (fileName.includes('BusinessCard')) {
        console.log(`\n⏳ Extracting Business Card pricing from: ${fileName}`);
        try {
            const workbook = XLSX.readFile(targetFile);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            if (!finalPricingData['business']) {
                finalPricingData['business'] = {};
            }
            
            for (const row of jsonData) {
                const sheetMat = row['Material / Paper'];
                const qty = parseInt(row['Qty'], 10);
                const finishingName = row['Finishing'];
                const rawCost = parseFloat(row['Platinum Cost (MYR)']);
                
                if (!sheetMat || isNaN(qty) || !finishingName || isNaN(rawCost)) continue;
                
                // Determine mapped material name
                let mappedMat = null;
                if (sheetMat === 'Gloss Art Card 250gsm') mappedMat = 'Gloss Art Card 250gsm (2 sides coated)';
                else if (sheetMat === 'Gloss Art Card 310gsm') mappedMat = 'Gloss Art Card 310gsm (2 sides coated)';
                else if (sheetMat === 'Linen 240gsm') mappedMat = 'Linen 240gsm';
                else if (sheetMat === 'Super White 250gsm') mappedMat = 'Super White 250gsm';
                
                if (!mappedMat) continue;
                
                // Determine if this is the row we want to use as base price
                let isBase = false;
                if (sheetMat.includes('Gloss Art Card')) {
                    if (qty < 300 && finishingName === 'Varnish (Free)') {
                        isBase = true;
                    } else if (qty >= 300 && finishingName === 'Matte Laminate') {
                        isBase = true;
                    }
                } else {
                    // Specialty papers (Linen, Super White)
                    if (finishingName === 'Varnish (Free)' || finishingName === 'None (Base Price)') {
                        isBase = true;
                    }
                }
                
                if (isBase) {
                    if (!finalPricingData['business'][mappedMat]) {
                        finalPricingData['business'][mappedMat] = {};
                    }
                    const businessCardMarkups = {
                        "50": 3.9583,
                        "100": 3.9583,
                        "200": 4.375,
                        "300": 3.5533,
                        "500": 3.6036,
                        "1000": 3.3595,
                        "2000": 2.5761,
                        "3000": 2.2718,
                        "5000": 2.0748,
                        "10000": 1.9041
                    };
                    const dynamicMarkup = businessCardMarkups[String(qty)] || MARKUP;
                    const retailPrice = rawCost * dynamicMarkup;
                    
                    // Round to nearest whole number if it's very close, otherwise standard 2 decimals
                    let finalVal = Math.round(retailPrice);
                    if (Math.abs(retailPrice - finalVal) > 0.05) {
                        finalVal = parseFloat(retailPrice.toFixed(2));
                    }
                    finalPricingData['business'][mappedMat][qty] = finalVal;
                }
            }
            totalParsed++;
        } catch (error) {
            console.error(`❌ Failed parsing Business Cards:`, error.message);
        }
        continue;
    }

    console.log(`\n⏳ Extracting Platinum 4C / 4C+4C from: ${fileName}`);

    try {
        const workbook = XLSX.readFile(targetFile);
        const filePricing = { "4C": {}, "4C+4C": {} };
        
        let currentSection = null; // '4C' or '4C+4C'
        let readingPrices = false;
        let platinumColKey = null;

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            for (const row of jsonData) {
                const head = row["Total Amount (RM)"];
                if (!head) continue;

                const headStr = String(head).trim();

                // Detect Section
                if (headStr === '4C') {
                    currentSection = '4C';
                    readingPrices = false;
                    continue;
                } else if (headStr === '4C+4C') {
                    currentSection = '4C+4C';
                    readingPrices = false;
                    continue;
                } else if (headStr === '1C' || headStr === '1C+1C' || headStr.startsWith('Go To')) {
                    if (currentSection && headStr.startsWith('Go To')) {
                         currentSection = null; // Exit section
                    }
                    readingPrices = false;
                    continue;
                }

                // Detect Header Row
                if (currentSection && headStr === 'Quantity') {
                    // Find which column has 'Platinum'
                    for (const key in row) {
                        if (String(row[key]).trim() === 'Platinum') {
                            platinumColKey = key;
                            break;
                        }
                    }
                    readingPrices = true;
                    continue;
                }

                // Stop reading on footer/notes
                if (headStr.startsWith('*')) {
                    readingPrices = false;
                    continue;
                }

                // Read Prices
                if (readingPrices && currentSection && platinumColKey) {
                    const qty = parseInt(headStr, 10);
                    let rawPriceStr = String(row[platinumColKey]).trim();
                    
                    // Cleanup float quirks like '62.55*'
                    rawPriceStr = rawPriceStr.replace(/[^0-9.]/g, ''); 
                    
                    const price = parseFloat(rawPriceStr);
                    
                    if (!isNaN(qty) && !isNaN(price)) {
                        // Apply cost + 80%
                        const retailPrice = price * MARKUP;
                        filePricing[currentSection][qty] = parseFloat(retailPrice.toFixed(2));
                    }
                }
            }
        }
        
        // Strip out the extension to just be cleanly identifiable (e.g., A4_100gsm_Artpaper)
        const cleanName = fileName.endsWith('.xlsx') ? fileName.slice(0, -5) : fileName.slice(0, -4);
        finalPricingData[cleanName] = filePricing;
        totalParsed++;

    } catch (error) {
        console.error(`❌ Failed:`, error.message);
    }
}

fs.writeFileSync(outputDataFile, JSON.stringify(finalPricingData, null, 2), 'utf-8');
console.log(`\n✅ Success! Parsed ${totalParsed} products with ${MARKUP}x markup.`);
console.log(`📊 Exported clean JSON database to: /data/pricing.json\n`);

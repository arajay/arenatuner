const fs = require('fs');
const path = require('path');
const https = require('https');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/pick.js');
const { streamObject } = require('stream-json/streamers/stream-object.js');

const outputDir = path.resolve(__dirname, '../src/data/mtgjson');
const outputFile = path.join(outputDir, 'historic-cards.json');
const url = 'https://mtgjson.com/api/v5/AllPrintings.json';

const normalizeName = (value) =>
    value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[’‘`'"“”]/g, '')
        .replace(/[^a-z0-9]+/gi, ' ')
        .trim()
        .toLowerCase();

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Downloading MTGJSON AllPrintings and building a compact Historic subset...');

https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to download MTG JSON: HTTP ${res.statusCode}`);
        process.exit(1);
    }

    const historicCards = {};

    const pipeline = chain([
        res,
        parser(),
        pick({ filter: 'data' }),
        streamObject(),
    ]);

    pipeline.on('data', ({ key: setCode, value: set }) => {
        if (!set || !set.cards) {
            return;
        }

        for (const card of set.cards) {
            if (card.legalities?.historic !== 'Legal') {
                continue;
            }

            const key = normalizeName(card.name || '');
            if (!key) {
                continue;
            }

            if (!historicCards[key]) {
                historicCards[key] = {
                    id: card.uuid || `${setCode}:${card.name}`,
                    name: card.name,
                    manaCost: card.manaCost || '',
                    colors: card.colors || [],
                    typeLine: card.type || '',
                    rarity: card.rarity || '',
                    setCode,
                };
            }
        }
    });

    pipeline.on('end', () => {
        try {
            fs.writeFileSync(outputFile, JSON.stringify(Object.values(historicCards)), 'utf8');
            console.log(`Saved compact Historic card subset to ${outputFile}`);
            console.log(`Total Historic unique cards: ${Object.keys(historicCards).length}`);
        } catch (error) {
            console.error('Failed to write compact MTG JSON subset:', error);
            process.exit(1);
        }
    });

    pipeline.on('error', (err) => {
        console.error('Failed to parse MTG JSON stream:', err);
        process.exit(1);
    });
}).on('error', (err) => {
    console.error('Failed to fetch MTG JSON data:', err);
    process.exit(1);
});

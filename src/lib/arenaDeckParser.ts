import { ArenaDeckLine, CardData, ParsedDeck, ParseResult } from '../types';

const countLineRegex = /^(\d+)\s+x?\s*(.+)$/i;

export function parseArenaDeckExport(rawText: string, cardCatalog: CardData[]): ParseResult {
    let lines = rawText.split(/\r?\n/);
    const deckLines: ArenaDeckLine[] = [];
    const warnings: string[] = [];
    const unknownCardNames = new Set<string>();

    if (lines.length > 0 && /^deck\s*:?$/i.test(lines[0].trim())) {
        lines = lines.slice(1);
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || /^sideboard/i.test(line) || /^board/i.test(line)) {
            continue;
        }

        const match = countLineRegex.exec(line);
        if (!match) {
            warnings.push(`Unable to parse line: "${line}"`);
            continue;
        }

        const count = Number(match[1]);
        const name = match[2].trim();
        if (!name) {
            warnings.push(`Missing card name in line: "${line}"`);
            continue;
        }

        deckLines.push({ count, name });
        const known = cardCatalog.some((card) => card.name.toLowerCase() === name.toLowerCase());
        if (!known) {
            unknownCardNames.add(name);
        }
    }

    const deckSlots = deckLines.map((line) => {
        const card = cardCatalog.find((item) => item.name.toLowerCase() === line.name.toLowerCase());
        return {
            cardId: card?.id ?? `unknown:${line.name}`,
            count: line.count,
            name: line.name,
        };
    });

    const totalCards = deckSlots.reduce((sum, slot) => sum + slot.count, 0);

    if (!deckLines.length) {
        warnings.push('No deck lines were detected. Paste your MTG Arena export text into the field above.');
    }

    return {
        mode: 'historic-bo1',
        lines: deckLines,
        deckSlots,
        totalCards,
        unknownCardNames: Array.from(unknownCardNames),
        warnings,
    };
}

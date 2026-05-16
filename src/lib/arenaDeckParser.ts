import { ArenaDeckLine, CardData, ParsedDeck, ParseResult } from '../types';
import { resolveCardName } from './cardNameMapper';

const countLineRegex = /^(\d+)\s+x?\s*(.+)$/i;
const arenaExportSuffixRegex = /\s*\([^)]*\)\s*\d+\s*$/;

const stripArenaExportSuffix = (value: string): string => value.replace(arenaExportSuffixRegex, '').trim();

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
        const rawName = match[2].trim();
        const name = stripArenaExportSuffix(rawName);
        if (!name) {
            warnings.push(`Missing card name in line: "${line}"`);
            continue;
        }

        deckLines.push({ count, name });
    }

    const deckSlots = deckLines.map((line) => {
        const match = resolveCardName(line.name, cardCatalog);
        if (!match.card) {
            unknownCardNames.add(line.name);
        }

        return {
            cardId: match.card?.id ?? `unknown:${line.name}`,
            count: line.count,
            name: line.name,
            resolvedName: match.card?.name,
            matchQuality: match.matchQuality,
            typeLine: match.card?.typeLine,
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

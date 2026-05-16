import { CardData } from '../types';
import { cardNameKnowledge } from '../data/cardNameKnowledge';

export type MatchQuality = 'exact' | 'alias' | 'normalized' | 'fuzzy' | 'unknown';

export interface CardMatch {
    card?: CardData;
    resolvedName?: string;
    matchQuality: MatchQuality;
}

const normalizeName = (value: string): string =>
    value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[’‘`'"“”]/g, '')
        .replace(/[^a-z0-9]+/gi, ' ')
        .trim()
        .toLowerCase();

const buildNameIndex = (cardCatalog: CardData[]) => {
    const map = new Map<string, CardData>();

    for (const card of cardCatalog) {
        const normalizedName = normalizeName(card.name);
        map.set(normalizedName, card);
    }

    return map;
};

const getKnownCanonicalName = (name: string): string | undefined => {
    const normalized = normalizeName(name);
    return cardNameKnowledge[normalized];
};

const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i += 1) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j += 1) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i += 1) {
        for (let j = 1; j <= a.length; j += 1) {
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1),
            );
        }
    }

    return matrix[b.length][a.length];
};

export function resolveCardName(inputName: string, cardCatalog: CardData[]): CardMatch {
    const normalizedInput = normalizeName(inputName);
    if (!normalizedInput) {
        return { matchQuality: 'unknown' };
    }

    const canonicalName = getKnownCanonicalName(inputName);
    if (canonicalName) {
        const card = cardCatalog.find((item) => normalizeName(item.name) === normalizeName(canonicalName));
        if (card) {
            return { card, resolvedName: card.name, matchQuality: 'alias' };
        }
    }

    const nameIndex = buildNameIndex(cardCatalog);
    const exactMatch = nameIndex.get(normalizedInput);
    if (exactMatch) {
        return { card: exactMatch, resolvedName: exactMatch.name, matchQuality: 'exact' };
    }

    for (const card of cardCatalog) {
        if (normalizeName(card.name) === normalizedInput) {
            return { card, resolvedName: card.name, matchQuality: 'normalized' };
        }
    }

    let bestCard: CardData | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const card of cardCatalog) {
        const normalizedCardName = normalizeName(card.name);
        const distance = getLevenshteinDistance(normalizedInput, normalizedCardName);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestCard = card;
        }
    }

    if (bestCard) {
        const threshold = Math.max(1, Math.floor(normalizedInput.length * 0.2));
        if (bestDistance <= threshold) {
            return { card: bestCard, resolvedName: bestCard.name, matchQuality: 'fuzzy' };
        }
    }

    return { matchQuality: 'unknown' };
}

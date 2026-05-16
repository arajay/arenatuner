export interface CardData {
    id: string;
    name: string;
    mana?: string;
    manaCost?: string;
    color?: string;
    colors?: string[];
    archetype?: string;
    typeLine?: string;
    rarity?: string;
    setCode?: string;
    rating?: number;
}

export interface DeckSlot {
    cardId: string;
    count: number;
    name: string;
    resolvedName?: string;
    matchQuality?: 'exact' | 'alias' | 'normalized' | 'fuzzy' | 'unknown';
    typeLine?: string;
}

export interface ArenaDeckLine {
    count: number;
    name: string;
}

export interface ParsedDeck {
    mode: 'historic-bo1';
    lines: ArenaDeckLine[];
    deckSlots: DeckSlot[];
    totalCards: number;
    unknownCardNames: string[];
    warnings: string[];
}

export interface AdviceIssue {
    severity: 'info' | 'warning' | 'error';
    message: string;
}

export type ParseResult = ParsedDeck;

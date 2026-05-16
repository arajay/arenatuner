export interface CardData {
    id: string;
    name: string;
    mana: string;
    color: string;
    archetype: string;
    rating: number;
}

export interface DeckSlot {
    cardId: string;
    count: number;
    name?: string;
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

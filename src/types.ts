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
}

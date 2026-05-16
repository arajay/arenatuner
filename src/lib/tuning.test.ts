import { describe, expect, it } from 'vitest';
import { generateBo1Advice } from './tuning';
import type { ParsedDeck } from '../types';

describe('generateBo1Advice', () => {
    it('should ignore basic land duplicates and still warn on deck size', () => {
        const deck: ParsedDeck = {
            mode: 'historic-bo1',
            lines: [],
            deckSlots: [
                {
                    cardId: 'island',
                    count: 10,
                    name: 'Island',
                    typeLine: 'Basic Land — Island',
                    manaCost: '',
                },
                {
                    cardId: 'thoughtseize',
                    count: 4,
                    name: 'Thoughtseize',
                    typeLine: 'Sorcery',
                    manaCost: '{B}',
                },
            ],
            totalCards: 14,
            unknownCardNames: [],
            warnings: [],
        };

        const advice = generateBo1Advice(deck);
        expect(advice.some((item) => item.message.includes('Card "Island" has'))).toBe(false);
        expect(advice.some((item) => item.message.includes('Deck size is 14'))).toBe(true);
    });

    it('should warn about low land count and slow curve for a BO1 deck', () => {
        const deck: ParsedDeck = {
            mode: 'historic-bo1',
            lines: [],
            deckSlots: [
                { cardId: 'island', count: 18, name: 'Island', typeLine: 'Basic Land — Island', manaCost: '' },
                { cardId: 'fable', count: 4, name: 'Fable of the Mirror-Breaker', typeLine: 'Legendary Creature — Human Warrior', manaCost: '{1}{U}{R}' },
                { cardId: 'teferi', count: 4, name: 'Teferi, Time Raveler', typeLine: 'Legendary Planeswalker — Teferi', manaCost: '{1}{W}{W}' },
                { cardId: 'thoughtseize', count: 4, name: 'Thoughtseize', typeLine: 'Sorcery', manaCost: '{B}' },
                { cardId: 'brainstorm', count: 4, name: 'Brainstorm', typeLine: 'Instant', manaCost: '{U}' },
                { cardId: 'karn', count: 2, name: 'Karn, the Great Creator', typeLine: 'Legendary Planeswalker — Karn', manaCost: '{4}' },
                { cardId: 'fire', count: 2, name: 'Chandra, Torch of Defiance', typeLine: 'Legendary Planeswalker — Chandra', manaCost: '{2}{R}' },
                { cardId: 'elixir', count: 2, name: 'Narset, Parter of Veils', typeLine: 'Legendary Planeswalker — Narset', manaCost: '{1}{U}{U}' },
                { cardId: 'bigspell', count: 4, name: 'Cavalier of Flame', typeLine: 'Creature — Elemental Knight', manaCost: '{3}{R}{R}' },
            ],
            totalCards: 40,
            unknownCardNames: [],
            warnings: [],
        };

        const advice = generateBo1Advice(deck);
        expect(advice.some((item) => item.message.includes('Land count is 18'))).toBe(true);
        expect(advice.some((item) => item.message.includes('low-cost cards'))).toBe(true);
    });

    it('should warn when no lands are present', () => {
        const deck: ParsedDeck = {
            mode: 'historic-bo1',
            lines: [],
            deckSlots: [
                { cardId: 'thoughtseize', count: 4, name: 'Thoughtseize', typeLine: 'Sorcery', manaCost: '{B}' },
                { cardId: 'opt', count: 4, name: 'Opt', typeLine: 'Instant', manaCost: '{U}' },
            ],
            totalCards: 8,
            unknownCardNames: [],
            warnings: [],
        };

        const advice = generateBo1Advice(deck);
        expect(advice.some((item) => item.message.includes('No lands detected'))).toBe(true);
    });
});

import { AdviceIssue, ParsedDeck } from '../types';

export function generateBo1Advice(deck: ParsedDeck): AdviceIssue[] {
    const advice: AdviceIssue[] = [];

    if (deck.warnings.length) {
        advice.push({ severity: 'warning', message: 'There are parse warnings; verify all card names and counts.' });
    }

    if (deck.totalCards < 60) {
        advice.push({ severity: 'warning', message: `Deck size is ${deck.totalCards}. Historic BO1 decks should be 60 cards.` });
    } else if (deck.totalCards > 60) {
        advice.push({ severity: 'warning', message: `Deck size is ${deck.totalCards}. Consider trimming to 60 cards for a tighter BO1 list.` });
    } else {
        advice.push({ severity: 'info', message: 'Deck size is 60 — good target for Historic BO1.' });
    }

    const duplicates = deck.deckSlots.filter((slot) => slot.count > 4);
    for (const slot of duplicates) {
        advice.push({ severity: 'error', message: `Card "${slot.name}" has ${slot.count} copies. Maximum is 4.` });
    }

    if (deck.unknownCardNames.length) {
        advice.push({ severity: 'warning', message: `Unknown cards detected: ${deck.unknownCardNames.join(', ')}.` });
    }

    if (!deck.deckSlots.length) {
        advice.push({ severity: 'error', message: 'No valid deck cards found yet. Paste a valid Arena deck export into the textarea.' });
    }

    return advice;
}

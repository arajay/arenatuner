import { AdviceIssue, ParsedDeck } from '../types';

type DeckSlot = ParsedDeck['deckSlots'][number];

const parseManaValue = (slot: DeckSlot): number => {
    const manaCost = slot.manaCost ?? '';
    if (!manaCost) {
        return 0;
    }

    const symbolRegex = /\{([^}]+)\}/g;
    let match: RegExpExecArray | null;
    let value = 0;

    while ((match = symbolRegex.exec(manaCost)) !== null) {
        const symbol = match[1];
        if (/^\d+$/.test(symbol)) {
            value += Number(symbol);
        } else if (symbol.toUpperCase() === 'X') {
            value += 2;
        } else {
            value += 1;
        }
    }

    if (value === 0) {
        const fallback = manaCost.match(/\d+/g);
        if (fallback) {
            value = fallback.reduce((sum, item) => sum + Number(item), 0);
        }
    }

    return value;
};

const isBasicLand = (slot: DeckSlot) =>
    typeof slot.typeLine === 'string' && /\bBasic\b/i.test(slot.typeLine) && /\bLand\b/i.test(slot.typeLine);

const isLand = (slot: DeckSlot) =>
    typeof slot.typeLine === 'string' && /\bLand\b/i.test(slot.typeLine);

const isCreature = (slot: DeckSlot) =>
    typeof slot.typeLine === 'string' && /\bCreature\b/i.test(slot.typeLine) && !isLand(slot);

const isInstantOrSorcery = (slot: DeckSlot) =>
    typeof slot.typeLine === 'string' && /\b(Instant|Sorcery)\b/i.test(slot.typeLine);

const isPlaneswalker = (slot: DeckSlot) =>
    typeof slot.typeLine === 'string' && /\bPlaneswalker\b/i.test(slot.typeLine);

const safeSum = (slots: DeckSlot[], predicate: (slot: DeckSlot) => boolean) =>
    slots.reduce((sum, slot) => (predicate(slot) ? sum + slot.count : sum), 0);

export function generateBo1Advice(deck: ParsedDeck): AdviceIssue[] {
    const advice: AdviceIssue[] = [];

    if (deck.warnings.length) {
        advice.push({ severity: 'warning', message: 'There are parse warnings; verify all card names and counts.' });
    }

    const totalCards = deck.totalCards;
    if (totalCards < 60) {
        advice.push({ severity: 'warning', message: `Deck size is ${totalCards}. Historic BO1 decks should be 60 cards.` });
    } else if (totalCards > 60) {
        advice.push({ severity: 'warning', message: `Deck size is ${totalCards}. Consider trimming to 60 cards for a tighter BO1 list.` });
    }

    const landCount = safeSum(deck.deckSlots, isLand);
    const nonLandCount = totalCards - landCount;
    const creatureCount = safeSum(deck.deckSlots, isCreature);
    const cheapCount = safeSum(deck.deckSlots, (slot) => !isLand(slot) && parseManaValue(slot) <= 2);
    const highCostCount = safeSum(deck.deckSlots, (slot) => !isLand(slot) && parseManaValue(slot) >= 5);
    const spellCount = safeSum(deck.deckSlots, (slot) => !isLand(slot));
    const totalSpellCMC = deck.deckSlots.reduce(
        (sum, slot) => (!isLand(slot) ? sum + parseManaValue(slot) * slot.count : sum),
        0,
    );
    const averageSpellCMC = spellCount > 0 ? totalSpellCMC / spellCount : 0;

    if (totalCards > 0) {
        if (landCount === 0) {
            advice.push({ severity: 'error', message: 'No lands detected in the deck. Verify your deck list includes lands.' });
        } else if (landCount < 20) {
            advice.push({ severity: 'warning', message: `Land count is ${landCount}. Consider 20–24 lands for a consistent BO1 deck.` });
        } else if (landCount > 26) {
            advice.push({ severity: 'warning', message: `Land count is ${landCount}. Consider trimming lands to 20–24 to improve your deck's density.` });
        }

        if (spellCount > 0) {
            if (cheapCount < 14) {
                advice.push({ severity: 'warning', message: `Only ${cheapCount} low-cost cards (CMC 1–2) were found. Consider adding more cheap cards for faster BO1 starts.` });
            }

            if (highCostCount > 16) {
                advice.push({ severity: 'warning', message: `There are ${highCostCount} high-cost cards (CMC 5+). This may make the deck too slow for BO1.` });
            }

            if (averageSpellCMC > 4.0) {
                advice.push({ severity: 'warning', message: `Average spell CMC is ${averageSpellCMC.toFixed(1)}. The deck may be too slow for a consistent BO1 strategy.` });
            }

            if (creatureCount > 0 && creatureCount < 14) {
                advice.push({ severity: 'warning', message: `Creature count is ${creatureCount}. If this is a creature deck, consider increasing creature density.` });
            }
        }
    }

    const duplicates = deck.deckSlots.filter((slot) => slot.count > 4 && !isBasicLand(slot));
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

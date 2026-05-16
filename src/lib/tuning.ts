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

const safeSum = (slots: DeckSlot[], predicate: (slot: DeckSlot) => boolean) =>
    slots.reduce((sum, slot) => (predicate(slot) ? sum + slot.count : sum), 0);

const getDeckColors = (slots: DeckSlot[]) => {
    const colors = new Set<string>();
    for (const slot of slots) {
        slot.colors?.forEach((color) => colors.add(color));
    }
    return Array.from(colors);
};

const cardSuggestionsByColor: Record<string, string[]> = {
    W: ['Solitude', 'Swords to Plowshares', 'Path to Exile'],
    U: ['Opt', 'Brainstorm', 'Expressive Iteration', 'Counterspell'],
    B: ['Thoughtseize', 'Fatal Push', 'Inquisition of Kozilek'],
    R: ['Shock', 'Lightning Bolt', 'Chandra, Torch of Defiance'],
    G: ['Llanowar Elves', 'Elvish Mystic', 'Scavenging Ooze'],
};

const goodCoreCards = new Set([
    'Deep-Cavern Bat',
    'Gurmag Swiftwing',
    'Duress',
    'Liliana of the Veil',
    'Sanguine Soothsayer',
    'Thoughtseize',
    'Fatal Push',
    'Bloodchief\'s Thirst',
    'Opt',
    'Brainstorm',
]);

const slowPayoffCandidates = (slots: DeckSlot[]) =>
    slots.filter((slot) => !isLand(slot) && slot.count === 1 && parseManaValue(slot) >= 4);

const getItemNames = (slots: DeckSlot[]) => slots.map((slot) => slot.name);

const basicLandByColor: Record<string, string> = {
    W: 'Plains',
    U: 'Island',
    B: 'Swamp',
    R: 'Mountain',
    G: 'Forest',
};

const formatSuggestions = (items: string[]) => {
    if (items.length === 0) {
        return '';
    }
    if (items.length === 1) {
        return items[0];
    }
    return items.slice(0, -1).join(', ') + ' or ' + items[items.length - 1];
};

const selectSuggestions = (colors: string[], currentNames: Set<string>, limit = 3) => {
    const suggestions: string[] = [];

    for (const color of colors) {
        const pool = cardSuggestionsByColor[color] ?? [];
        for (const candidate of pool) {
            if (!currentNames.has(candidate) && !suggestions.includes(candidate)) {
                suggestions.push(candidate);
                if (suggestions.length >= limit) {
                    return suggestions;
                }
            }
        }
    }

    for (const pool of Object.values(cardSuggestionsByColor)) {
        for (const candidate of pool) {
            if (!currentNames.has(candidate) && !suggestions.includes(candidate)) {
                suggestions.push(candidate);
                if (suggestions.length >= limit) {
                    return suggestions;
                }
            }
        }
    }

    return suggestions;
};

const getHighCostCards = (slots: DeckSlot[]) =>
    slots
        .filter((slot) => !isLand(slot) && parseManaValue(slot) >= 5)
        .sort((a, b) => parseManaValue(b) - parseManaValue(a))
        .slice(0, 3)
        .map((slot) => slot.name);

const getGoodCoreCardNames = (slots: DeckSlot[]) =>
    Array.from(new Set(slots.filter((slot) => goodCoreCards.has(slot.name)).map((slot) => slot.name)));

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

    const deckColors = getDeckColors(deck.deckSlots);
    const deckNames = new Set(deck.deckSlots.map((slot) => slot.name));
    const landCount = safeSum(deck.deckSlots, isLand);
    const creatureCount = safeSum(deck.deckSlots, isCreature);
    const cheapCount = safeSum(deck.deckSlots, (slot) => !isLand(slot) && parseManaValue(slot) <= 2);
    const highCostCount = safeSum(deck.deckSlots, (slot) => !isLand(slot) && parseManaValue(slot) >= 5);
    const spellCount = safeSum(deck.deckSlots, (slot) => !isLand(slot));
    const totalSpellCMC = deck.deckSlots.reduce(
        (sum, slot) => (!isLand(slot) ? sum + parseManaValue(slot) * slot.count : sum),
        0,
    );
    const averageSpellCMC = spellCount > 0 ? totalSpellCMC / spellCount : 0;
    const slowPayoffNames = getItemNames(slowPayoffCandidates(deck.deckSlots)).slice(0, 3);
    const goodCoreNames = getGoodCoreCardNames(deck.deckSlots);
    const cheapSuggestions = selectSuggestions(deckColors.length ? deckColors : ['U', 'B', 'R', 'G', 'W'], deckNames);

    if (totalCards > 0) {
        if (slowPayoffNames.length >= 2 && cheapCount < 14) {
            advice.push({
                severity: 'warning',
                message: `This deck includes slow singleton payoffs such as ${formatSuggestions(slowPayoffNames)} while the early game is weak. In BO1, prefer a clearer plan with more repeatable cheap interaction and fewer narrow top-end cards.`,
            });
        } else if (slowPayoffNames.length >= 2) {
            advice.push({
                severity: 'warning',
                message: `This deck includes slow singleton payoffs such as ${formatSuggestions(slowPayoffNames)}. Consider cutting some of these for more reliable, repeatable threats and interaction.`,
            });
        }

        if (goodCoreNames.length > 0) {
            advice.push({
                severity: 'info',
                message: `Keep strong core cards like ${formatSuggestions(goodCoreNames)} while tightening the deck around a focused, consistent plan.`,
            });
        }
        if (landCount === 0) {
            advice.push({ severity: 'error', message: 'No lands detected in the deck. Verify your deck list includes lands.' });
        } else if (landCount < 20) {
            const landSuggestions = deckColors.length
                ? deckColors.map((color) => basicLandByColor[color]).filter(Boolean)
                : ['Plains', 'Island'];
            advice.push({
                severity: 'warning',
                message: `Land count is ${landCount}. Consider 20–24 lands for a consistent BO1 deck, such as ${formatSuggestions(landSuggestions)}.`,
            });
        } else if (landCount > 26) {
            advice.push({
                severity: 'warning',
                message: `Land count is ${landCount}. Consider trimming lands to 20–24 to improve your deck's density.`,
            });
        }

        if (spellCount > 0) {
            if (cheapCount < 14) {
                const cheapSuggestions = selectSuggestions(deckColors.length ? deckColors : ['U', 'B', 'R', 'G', 'W'], deckNames);
                advice.push({
                    severity: 'warning',
                    message: `Only ${cheapCount} low-cost cards (CMC 1–2) were found. Consider adding cheap cards such as ${formatSuggestions(cheapSuggestions)}.`,
                });
            }

            if (highCostCount > 16) {
                const expensiveCards = getHighCostCards(deck.deckSlots);
                const cheapSuggestions = selectSuggestions(deckColors.length ? deckColors : ['U', 'B', 'R', 'G', 'W'], deckNames);
                advice.push({
                    severity: 'warning',
                    message: `There are ${highCostCount} high-cost cards (CMC 5+), including ${formatSuggestions(expensiveCards)}. Consider replacing one with cheaper options like ${formatSuggestions(cheapSuggestions)}.`,
                });
            }

            if (averageSpellCMC > 4.0) {
                const cheapSuggestions = selectSuggestions(deckColors.length ? deckColors : ['U', 'B', 'R', 'G', 'W'], deckNames);
                advice.push({
                    severity: 'warning',
                    message: `Average spell CMC is ${averageSpellCMC.toFixed(1)}. The deck may be too slow for a consistent BO1 strategy; consider cheaper cards like ${formatSuggestions(cheapSuggestions)}.`,
                });
            }

            if (creatureCount > 0 && creatureCount < 14) {
                advice.push({
                    severity: 'warning',
                    message: `Creature count is ${creatureCount}. If this is a creature deck, consider increasing creature density with value creatures or aggressive threats.`,
                });
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

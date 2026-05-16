import '@testing-library/jest-dom';
import { render, screen } from './test-utils';
import { describe, expect, it } from 'vitest';
import DeckCardsPanel from './DeckCardsPanel';

const sampleItems = [
    {
        cardId: '1',
        count: 4,
        name: 'Island',
        typeLine: 'Basic Land — Island',
        card: {
            id: '1',
            name: 'Island',
            manaCost: '',
            colors: [],
            typeLine: 'Basic Land — Island',
        },
    },
    {
        cardId: '2',
        count: 2,
        name: 'Fable of the Mirror-Breaker',
        typeLine: 'Legendary Creature — Human Warrior',
        card: {
            id: '2',
            name: 'Fable of the Mirror-Breaker',
            manaCost: '{1}{U}{R}',
            colors: ['U', 'R'],
            typeLine: 'Legendary Creature — Human Warrior',
        },
    },
];

describe('DeckCardsPanel', () => {
    it('should render zero state when no submission has occurred', () => {
        render(<DeckCardsPanel deckItems={[]} hasSubmitted={false} />);

        expect(screen.getByText('Ready when you are')).toBeInTheDocument();
        expect(screen.getByText(/Paste your MTG Arena deck export/)).toBeInTheDocument();
        expect(screen.queryByText('Parsed deck cards')).not.toBeInTheDocument();
    });

    it('should render parsed deck rows after submission', () => {
        render(<DeckCardsPanel deckItems={sampleItems} hasSubmitted={true} />);

        expect(screen.getByText('Parsed deck cards')).toBeInTheDocument();
        expect(screen.getByText('Island')).toBeInTheDocument();
        expect(screen.getByText('Fable of the Mirror-Breaker')).toBeInTheDocument();
        expect(screen.getByText('{1}{U}{R}')).toBeInTheDocument();
        expect(screen.getByText('Basic Land — Island')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});

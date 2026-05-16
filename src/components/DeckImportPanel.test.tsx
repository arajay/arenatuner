import '@testing-library/jest-dom';
import { fireEvent, screen, render } from './test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeckImportPanel from './DeckImportPanel';
import type { AdviceIssue, ParseResult } from '../types';

const defaultParseResult: ParseResult = {
    mode: 'historic-bo1',
    lines: [],
    deckSlots: [],
    totalCards: 0,
    unknownCardNames: [],
    warnings: [],
};

describe('DeckImportPanel', () => {
    const onDeckTextChange = vi.fn();
    const onParseDeck = vi.fn();

    beforeEach(() => {
        onDeckTextChange.mockClear();
        onParseDeck.mockClear();
    });

    it('should render the import form and call parse on button click', () => {
        render(
            <DeckImportPanel
                deckText=""
                onDeckTextChange={onDeckTextChange}
                onParseDeck={onParseDeck}
                parseResult={defaultParseResult}
                advice={[]}
                totalCards={0}
                uniqueCards={0}
                hasSubmitted={false}
            />,
        );

        const textarea = screen.getByLabelText('Arena deck export');
        expect(textarea).toBeInTheDocument();

        fireEvent.change(textarea, { target: { value: '4 Island' } });
        expect(onDeckTextChange).toHaveBeenCalledWith('4 Island');

        fireEvent.click(screen.getByRole('button', { name: 'Parse deck' }));
        expect(onParseDeck).toHaveBeenCalled();

        expect(screen.queryByText('Deck summary')).not.toBeInTheDocument();
    });

    it('should render deck summary, warnings, and advice after submission', () => {
        const parseResult: ParseResult = {
            ...defaultParseResult,
            totalCards: 61,
            unknownCardNames: ['Mystic Snake'],
            warnings: ['Unable to parse line: "foobar"'],
        };

        const advice: AdviceIssue[] = [
            { severity: 'warning', message: 'Deck size is 61. Consider trimming to 60 cards for a tighter BO1 list.' },
        ];

        render(
            <DeckImportPanel
                deckText="4 Island"
                onDeckTextChange={onDeckTextChange}
                onParseDeck={onParseDeck}
                parseResult={parseResult}
                advice={advice}
                totalCards={61}
                uniqueCards={1}
                hasSubmitted={true}
            />,
        );

        expect(screen.getByText('Deck summary')).toBeInTheDocument();
        expect(screen.getByText('Total cards: 61')).toBeInTheDocument();
        expect(screen.getByText('Unique cards: 1')).toBeInTheDocument();
        expect(screen.getByText('Unknown cards: 1')).toBeInTheDocument();
        expect(screen.getByText('Mystic Snake')).toBeInTheDocument();
        expect(screen.getByText('Unable to parse line: "foobar"')).toBeInTheDocument();
        expect(screen.getByText(advice[0].message)).toBeInTheDocument();
    });
});

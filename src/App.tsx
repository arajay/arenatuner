import { useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { CardData, DeckSlot, ParseResult } from './types';
import historicCards from './data/mtgjson/historic-cards.json';
import { parseArenaDeckExport } from './lib/arenaDeckParser';
import { generateBo1Advice } from './lib/tuning';
import DeckCardsPanel from './components/DeckCardsPanel';
import DeckImportPanel from './components/DeckImportPanel';
import Layout from './components/Layout';

function App() {
    const [deckText, setDeckText] = useState('');
    const [parseResult, setParseResult] = useState<ParseResult>(
        parseArenaDeckExport('', historicCards as CardData[]),
    );
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const advice = useMemo(() => generateBo1Advice(parseResult), [parseResult]);

    const deckItems = useMemo(
        () =>
            parseResult.deckSlots.map((slot) => {
                const card = (historicCards as CardData[]).find((item) => item.id === slot.cardId);
                return {
                    ...slot,
                    card,
                };
            }),
        [parseResult],
    );

    const totalCards = parseResult.totalCards;
    const uniqueCards = parseResult.deckSlots.length;

    const handleParse = () => {
        setParseResult(parseArenaDeckExport(deckText, historicCards as CardData[]));
        setHasSubmitted(true);
    };

    return (
        <Layout>
            <Grid item xs={12} md={6}>
                <DeckImportPanel
                    deckText={deckText}
                    onDeckTextChange={setDeckText}
                    onParseDeck={handleParse}
                    parseResult={parseResult}
                    advice={advice}
                    totalCards={totalCards}
                    uniqueCards={uniqueCards}
                    hasSubmitted={hasSubmitted}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <DeckCardsPanel deckItems={deckItems} hasSubmitted={hasSubmitted} />
            </Grid>
        </Layout>
    );
}

export default App;

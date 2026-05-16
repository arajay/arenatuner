import {
    Alert,
    Button,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { AdviceIssue, CardData, DeckSlot, ParseResult } from '../types';

interface DeckImportPanelProps {
    deckText: string;
    onDeckTextChange: (value: string) => void;
    onParseDeck: () => void;
    parseResult: ParseResult;
    advice: AdviceIssue[];
    totalCards: number;
    uniqueCards: number;
    hasSubmitted: boolean;
}

export default function DeckImportPanel({
    deckText,
    onDeckTextChange,
    onParseDeck,
    parseResult,
    advice,
    totalCards,
    uniqueCards,
    hasSubmitted,
}: DeckImportPanelProps) {
    return (
        <>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Import MTG Arena deck export
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                    Paste the raw deck export text from Arena into the field below. The app will parse your deck lines and provide BO1 tuning advice.
                </Typography>
                <TextField
                    value={deckText}
                    onChange={(event) => onDeckTextChange(event.target.value)}
                    label="Arena deck export"
                    placeholder="4 Fable of the Mirror-Breaker"
                    multiline
                    minRows={16}
                    fullWidth
                    variant="outlined"
                />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={onParseDeck}>
                        Parse deck
                    </Button>
                </Stack>
                {hasSubmitted && parseResult.warnings.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {parseResult.warnings.map((warning, index) => (
                            <Alert key={index} severity="warning">
                                {warning}
                            </Alert>
                        ))}
                    </Stack>
                )}
            </Paper>

            {hasSubmitted && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Deck summary
                    </Typography>
                    <Typography>Total cards: {totalCards}</Typography>
                    <Typography>Unique cards: {uniqueCards}</Typography>
                    <Typography>Unknown cards: {parseResult.unknownCardNames.length}</Typography>
                    {parseResult.unknownCardNames.length > 0 && (
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            {parseResult.unknownCardNames.join(', ')}
                        </Typography>
                    )}
                    {advice.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Tuning advice
                            </Typography>
                            <Stack spacing={1}>
                                {advice.map((item, index) => (
                                    <Alert key={index} severity={item.severity}>
                                        {item.message}
                                    </Alert>
                                ))}
                            </Stack>
                        </>
                    )}
                </Paper>
            )}
        </>
    );
}

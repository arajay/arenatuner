import { useMemo, useState } from 'react';
import {
    AppBar,
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { CardData, DeckSlot, ParseResult } from './types';
import historicCards from './data/mtgjson/historic-cards.json';
import { parseArenaDeckExport } from './lib/arenaDeckParser';
import { generateBo1Advice } from './lib/tuning';

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
        <Box minHeight="100vh" bgcolor="background.default" color="text.primary">
            <AppBar position="static" color="primary" enableColorOnDark>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Arena Historic BO1 Deck Importer
                    </Typography>
                    <Typography variant="body2">Mode: Historic BO1</Typography>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h5" gutterBottom>
                                    Import MTG Arena deck export
                                </Typography>
                                <Typography color="text.secondary" gutterBottom>
                                    Paste the raw deck export text from Arena into the field below. The app will parse your deck lines and provide BO1 tuning advice.
                                </Typography>
                                <TextField
                                    value={deckText}
                                    onChange={(event) => setDeckText(event.target.value)}
                                    label="Arena deck export"
                                    placeholder="4 Fable of the Mirror-Breaker"
                                    multiline
                                    minRows={16}
                                    fullWidth
                                    variant="outlined"
                                />
                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                    <Button variant="contained" onClick={handleParse}>
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
                                    <Typography>
                                        Unknown cards: {parseResult.unknownCardNames.length}
                                    </Typography>
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
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {hasSubmitted ? (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Parsed deck cards
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Mana</TableCell>
                                                <TableCell>Archetype</TableCell>
                                                <TableCell align="center">Count</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deckItems.map((slot) => (
                                                <TableRow key={`${slot.cardId}-${slot.name}-${slot.count}`}>
                                                    <TableCell>{slot.name}</TableCell>
                                                    <TableCell>{slot.card?.manaCost ?? slot.card?.mana ?? '—'}</TableCell>
                                                    <TableCell>{slot.card?.typeLine ?? slot.card?.archetype ?? 'Unknown'}</TableCell>
                                                    <TableCell align="center">{slot.count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Ready when you are
                                </Typography>
                                <Typography color="text.secondary">
                                    Paste your MTG Arena deck export and click Parse deck to see the deck summary and parsed cards.
                                </Typography>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default App;

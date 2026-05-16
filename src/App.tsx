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

const sampleDeckText = `4 Fable of the Mirror-Breaker
4 Expressive Iteration
3 Lurrus of the Dream-Den
2 Hullbreacher
4 Thoughtseize
4 Bloodchief's Thirst
4 Opt
2 Solitude
1 Karn, the Great Creator
4 Brainstorm
4 Oko, Thief of Crowns
4 Teferi, Time Raveler
4 Omnath, Locus of Creation
10 Island
4 Plains
2 Watery Grave
4 Fabled Passage`;

const initialParse = parseArenaDeckExport(sampleDeckText, historicCards as CardData[]);

function App() {
    const [deckText, setDeckText] = useState(sampleDeckText);
    const [parseResult, setParseResult] = useState<ParseResult>(initialParse);

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
    };

    const handleLoadSample = () => {
        setDeckText(sampleDeckText);
        setParseResult(parseArenaDeckExport(sampleDeckText, historicCards as CardData[]));
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
                                    <Button variant="outlined" onClick={handleLoadSample}>
                                        Load sample deck
                                    </Button>
                                </Stack>
                                {parseResult.warnings.length > 0 && (
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        {parseResult.warnings.map((warning, index) => (
                                            <Alert key={index} severity="warning">
                                                {warning}
                                            </Alert>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>

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
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
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
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default App;

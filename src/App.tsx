import { useMemo, useState } from 'react';
import {
    AppBar,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Slider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
} from '@mui/material';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';
import { CardData, DeckSlot } from './types';

const sampleCards: CardData[] = [
    { id: '1', name: 'Fable of the Mirror-Breaker', mana: '1R', color: 'Red', archetype: 'Mono Red', rating: 9.2 },
    { id: '2', name: 'Expressive Iteration', mana: '2UR', color: 'Blue/Red', archetype: 'Izzet', rating: 8.7 },
    { id: '3', name: 'Lurrus of the Dream-Den', mana: '1W', color: 'White', archetype: 'Historic', rating: 8.9 },
    { id: '4', name: 'Hullbreacher', mana: '1UU', color: 'Blue', archetype: 'Historic', rating: 8.8 },
const defaultDeck: DeckSlot[] = [
    { cardId: '1', count: 4 },
    { cardId: '2', count: 3 },
    { cardId: '3', count: 2 },
    { cardId: '5', count: 4 },
];

function App() {
    const [deck, setDeck] = useState<DeckSlot[]>(defaultDeck);
    const [selectedCardId, setSelectedCardId] = useState<string>('1');

    const deckItems = useMemo(
        () =>
            deck.map((slot) => {
                const card = sampleCards.find((row) => row.id === slot.cardId);
                return {
                    ...slot,
                    card,
                };
            }),
        [deck],
    );

    const totalCards = deck.reduce((sum, slot) => sum + slot.count, 0);
    const averageRating = deckItems.reduce((sum, slot) => sum + (slot.card?.rating ?? 0) * slot.count, 0) / Math.max(totalCards, 1);

    const updateCount = (cardId: string, delta: number) => {
        setDeck((current) =>
            current
                .map((slot) =>
                    slot.cardId === cardId
                        ? { ...slot, count: Math.max(0, Math.min(slot.count + delta, 4)) }
                        : slot,
                )
                .filter((slot) => slot.count > 0),
        );
    };

    const addCard = () => {
        const existing = deck.find((slot) => slot.cardId === selectedCardId);
        if (existing) {
            updateCount(selectedCardId, 1);
            return;
        }
        setDeck((current) => [...current, { cardId: selectedCardId, count: 1 }]);
    };

    const availableCards = sampleCards.filter((card) => !deck.some((slot) => slot.cardId === card.id));

    return (
        <Box minHeight="100vh" bgcolor="background.default" color="text.primary">
            <AppBar position="static" color="primary" enableColorOnDark>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Arena Historic BO1 Deck Tweaker
                    </Typography>
                    <Typography variant="body2">Total cards: {totalCards}</Typography>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 4 }}>
                <Stack spacing={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Deck summary
                        </Typography>
                        <Typography>Average power rating: {averageRating.toFixed(2)}</Typography>
                        <Typography>Current deck size: {totalCards}</Typography>
                        <Typography mt={1} color="text.secondary">
                            Use this view to tune counts, swap slots, and keep the deck legal for BO1.
                        </Typography>
                    </Paper>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Deck slots
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Mana</TableCell>
                                                <TableCell>Archetype</TableCell>
                                                <TableCell align="center">Count</TableCell>
                                                <TableCell align="center">Adjust</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deckItems.map((slot) => (
                                                <TableRow key={slot.cardId}>
                                                    <TableCell>{slot.card?.name ?? 'Unknown'}</TableCell>
                                                    <TableCell>{slot.card?.mana ?? '—'}</TableCell>
                                                    <TableCell>{slot.card?.archetype ?? '—'}</TableCell>
                                                    <TableCell align="center">{slot.count}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton size="small" onClick={() => updateCount(slot.cardId, -1)}>
                                                            <RemoveCircleOutline fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => updateCount(slot.cardId, 1)}>
                                                            <AddCircleOutline fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Add or swap cards
                                </Typography>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Choose a card to add
                                        </Typography>
                                        <Slider
                                            value={sampleCards.findIndex((card) => card.id === selectedCardId)}
                                            min={0}
                                            max={sampleCards.length - 1}
                                            step={1}
                                            marks={sampleCards.map((card, index) => ({ value: index, label: card.name }))}
                                            onChange={(_, value) => setSelectedCardId(sampleCards[Number(value)].id)}
                                        />
                                    </Box>
                                    <Button variant="contained" onClick={addCard} disabled={!availableCards.length}>
                                        Add selected card
                                    </Button>
                                </Stack>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2">Available cards</Typography>
                                <Stack spacing={1} mt={1}>
                                    {availableCards.map((card) => (
                                        <Paper key={card.id} sx={{ p: 1, backgroundColor: 'background.paper' }}>
                                            <Typography>{card.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {card.mana} · {card.archetype}
                                            </Typography>
                                        </Paper>
                                    ))}
                                    {!availableCards.length && <Typography color="text.secondary">All sample cards are in the deck.</Typography>}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}

export default App;

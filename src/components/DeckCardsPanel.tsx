import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { CardData, DeckSlot } from '../types';

interface DeckCardsPanelProps {
    deckItems: Array<DeckSlot & { card?: CardData }>;
    hasSubmitted: boolean;
}

export default function DeckCardsPanel({ deckItems, hasSubmitted }: DeckCardsPanelProps) {
    return (
        <Paper sx={{ p: 3 }}>
            {hasSubmitted ? (
                <>
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
                </>
            ) : (
                <>
                    <Typography variant="h6" gutterBottom>
                        Ready when you are
                    </Typography>
                    <Typography color="text.secondary">
                        Paste your MTG Arena deck export and click Parse deck to see the deck summary and parsed cards.
                    </Typography>
                </>
            )}
        </Paper>
    );
}

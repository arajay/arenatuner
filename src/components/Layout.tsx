import { AppBar, Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
                <Grid container spacing={3}>{children}</Grid>
            </Container>
        </Box>
    );
}

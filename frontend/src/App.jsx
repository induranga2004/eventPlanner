// frontend/src/App.jsx
import { useState } from "react";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import eventPlannerTheme, { animationVariants } from './theme/eventPlannerTheme';
import PlannerWizard from "./pages/PlannerWizard.jsx";
import InteractivePlannerResults from "./pages/InteractivePlannerResults.jsx";

export default function App() {
  const [data, setData] = useState(null);
  const [campaignId, setCampaignId] = useState("");

  const onGenerated = (json, id) => {
    setData(json);
    setCampaignId(id);
  };

  return (
    <ThemeProvider theme={eventPlannerTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: eventPlannerTheme.palette.background.default,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <AnimatePresence mode="wait">
            {!data ? (
              <motion.div
                key="wizard"
                {...animationVariants.fadeIn}
              >
                <PlannerWizard onGenerated={onGenerated} />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                {...animationVariants.fadeIn}
              >
                <InteractivePlannerResults data={data} campaignId={campaignId} />
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </ThemeProvider>
  );
}


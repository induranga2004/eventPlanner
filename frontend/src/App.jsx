// frontend/src/App.jsx
import { useState } from "react";
import PlannerWizard from "./pages/PlannerWizard.jsx";
import PlannerResults from "./pages/PlannerResults.jsx";

export default function App() {
  const [data, setData] = useState(null);
  const [campaignId, setCampaignId] = useState("");

  const onGenerated = (json, id) => {
    setData(json);
    setCampaignId(id);
  };

  return (
    <div className="container">
      <h1>Event Planner & Budget AI (Dev 1)</h1>
      {!data ? (
        <PlannerWizard onGenerated={onGenerated} />
      ) : (
        <PlannerResults data={data} campaignId={campaignId} />
      )}
    </div>
  );
}

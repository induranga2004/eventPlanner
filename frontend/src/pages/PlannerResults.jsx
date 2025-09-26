// frontend/src/pages/PlannerResults.jsx
import { useState, useMemo } from "react";
import { selectConcept } from "../api/planner";

function Currency({ value }) {
  return <>LKR {Number(value).toLocaleString()}</>;
}

function Timeline({ eventDate, items }) {
  const d0 = new Date(eventDate);
  const expanded = items.map(it => {
    const dt = new Date(d0);
    dt.setDate(d0.getDate() + it.offset_days);
    return { ...it, date: dt.toISOString().split("T")[0] };
  });
  return (
    <div className="timeline">
      {expanded.map((t, i) => (
        <div key={i} className="milestone">
          <div className="milestone-title">{t.milestone}</div>
          <div className="milestone-date">{t.date} ({t.offset_days})</div>
        </div>
      ))}
    </div>
  );
}

export default function PlannerResults({ data, campaignId }) {
  const [selecting, setSelecting] = useState(null);

  const perPerson = useMemo(() => {
    const total = data.concepts?.[0]?.total_lkr ?? 0;
    const ppl = data.event.attendees || 1;
    return Math.round(total / ppl);
  }, [data]);

  const onSelect = async (cid) => {
    try {
      setSelecting(cid);
      await selectConcept(campaignId, cid);
      alert(`Selected concept ${cid} for campaign.`);
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div>
      <h2>Plans for {data.event.name}</h2>
      <div className="notes">
        {data.derived?.feasibility_notes?.map((n,i)=><div key={i} className="note">• {n}</div>)}
        {data.event.attendees > 0 && <div className="note">• Approx per person: <Currency value={perPerson} /></div>}
      </div>

      <div className="grid">
        {data.concepts.map(c => (
          <div key={c.id} className="concept-card">
            <div className="card-head">
              <h3>{c.title} <span className="badge">{c.budget_profile}</span></h3>
              <div className="total">Total: <Currency value={c.total_lkr} /></div>
            </div>
            <ul className="costs">
              {c.costs.map((k) => (
                <li key={k.category}>
                  <span className="cat">{k.category}</span>
                  <span className="amt"><Currency value={k.amount_lkr} /></span>
                </li>
              ))}
            </ul>
            <div className="assumptions">
              <div className="label">Assumptions</div>
              <ul>{c.assumptions.map((a,i)=><li key={i}>{a}</li>)}</ul>
            </div>
            <button disabled={selecting === c.id} onClick={() => onSelect(c.id)}>
              {selecting === c.id ? "Selecting..." : `Select ${c.id}`}
            </button>
          </div>
        ))}
      </div>

      <h3>Timeline</h3>
      <Timeline eventDate={data.event.date} items={data.timeline} />
    </div>
  );
}

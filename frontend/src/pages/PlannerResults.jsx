// frontend/src/pages/PlannerResults.jsx
import { useMemo, useState } from "react";
import { selectConcept } from "../api/planner";

function Currency({ value }) {
  const n = Number(value || 0);
  return <>LKR {n.toLocaleString()}</>;
}

function Timeline({ eventDate, items }) {
  const d0 = new Date(eventDate);
  const expanded = (items || []).map((it) => {
    const dt = new Date(d0);
    dt.setDate(d0.getDate() + it.offset_days);
    return { ...it, date: dt.toISOString().split("T")[0] };
  });

  return (
    <div className="timeline" style={{ display: "grid", gap: 8 }}>
      {expanded.map((t, i) => (
        <div key={i} className="milestone" style={{ padding: "8px 10px", border: "1px solid #eee", borderRadius: 8 }}>
          <div className="milestone-title" style={{ fontWeight: 600 }}>{t.milestone}</div>
          <div className="milestone-date" style={{ opacity: .8 }}>{t.date} (offset {t.offset_days})</div>
        </div>
      ))}
    </div>
  );
}

function formatCurrency(value) {
  const n = Number(value || 0)
  if (!n) return null
  return `LKR ${n.toLocaleString()}`
}

export default function PlannerResults({ data, campaignId }) {
  const [selecting, setSelecting] = useState(null);

  const providersByConcept = useMemo(() => {
    const map = new Map();
    const providerPayload = data?.derived?.concept_providers || {};
    (data?.concepts || []).forEach((concept) => {
      const providers = providerPayload[concept.id] || concept.providers || {};
      map.set(concept.id, providers);
    });
    return map;
  }, [data]);

  const perPerson = useMemo(() => {
    const total = data?.concepts?.[0]?.total_lkr ?? 0;
    const ppl = data?.event?.attendees || 1;
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

  if (!data) {
    return <div>No planner data. Please generate a plan first.</div>;
  }

  return (
    <div className="planner-results" style={{ display: "grid", gap: 16 }}>
  <h2>Musical Plans for {data.event?.name || "Event"}</h2>

      {/* Feasibility notes */}
      <div className="notes" style={{ display: "grid", gap: 6 }}>
        {data.derived?.feasibility_notes?.map((n, i) => (
          <div key={i} className="note" style={{ fontSize: 14, opacity: .95 }}>• {n}</div>
        ))}
        {data.event?.attendees > 0 && (
          <div className="note" style={{ fontSize: 14, opacity: .95 }}>
            • Approx per person: <Currency value={perPerson} />
          </div>
        )}
      </div>

      {/* Venue booking risk banner */}
      {data.derived?.venue_booking_risk && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffeeba", padding: 12, borderRadius: 10 }}>
          ⚠️ {data.derived?.venue_booking_note || "Venue booking window looks tight for your date."}
        </div>
      )}

      {/* Concepts grid */}
      <div className="grid" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {data.concepts?.map((c) => (
          <div key={c.id} className="concept-card" style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
            <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0 }}>
                {c.title}{" "}
                <span className="badge" style={{ fontSize: 12, padding: "2px 6px", border: "1px solid #ddd", borderRadius: 999 }}>
                  {c.budget_profile}
                </span>
              </h3>
              <div className="total" style={{ fontWeight: 600 }}>Total: <Currency value={c.total_lkr} /></div>
            </div>

            <ul className="costs" style={{ listStyle: "none", padding: 0, margin: "10px 0", display: "grid", gap: 6 }}>
              {c.costs?.map((k) => (
                <li key={k.category} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="cat" style={{ textTransform: "capitalize" }}>{k.category.replace(/_/g, ' ')}</span>
                  <span className="amt"><Currency value={k.amount_lkr} /></span>
                </li>
              ))}
            </ul>

            <div className="assumptions" style={{ marginTop: 6 }}>
              <div className="label" style={{ fontWeight: 600, marginBottom: 4 }}>Signature Notes</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
                {c.assumptions?.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.4, opacity: 0.85 }}>
                <div><strong>Venue:</strong> {c.venue_preference || 'Curated stage experience'}</div>
                {c.music_focus ? <div><strong>Music:</strong> {c.music_focus}</div> : null}
                {c.lighting_style ? <div><strong>Lighting:</strong> {c.lighting_style}</div> : null}
                {c.sound_profile ? <div><strong>Sound:</strong> {c.sound_profile}</div> : null}
              </div>
              {providersByConcept.get(c.id) && Object.keys(providersByConcept.get(c.id)).some((key) => (providersByConcept.get(c.id)[key] || []).length) ? (
                <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Spotlight Talent</div>
                  <div style={{ display: "grid", gap: 4 }}>
                    {Object.entries(providersByConcept.get(c.id)).map(([key, items]) => {
                      if (!items || !items.length) return null;
                      const label = key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <div key={key}>
                          <span style={{ fontWeight: 600 }}>{label}:</span> {items.join(', ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              disabled={selecting === c.id}
              onClick={() => onSelect(c.id)}
              style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
            >
              {selecting === c.id ? "Selecting..." : `Select ${c.id}`}
            </button>
          </div>
        ))}
      </div>

      {/* Suggested Venues */}
      <div>
        <h3>Suggested Venues</h3>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {(data.derived?.suggested_venues || []).map((v, i) => (
            <li key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 600 }}>
                {v.name} {v.rating ? <span style={{ fontWeight: 400 }}>• ⭐ {v.rating}</span> : null}
              </div>
              <div style={{ opacity: .85 }}>
                {v.address || "Address N/A"}
                {v.website && (
                  <>
                    {" "}•{" "}
                    <a href={v.website} target="_blank" rel="noreferrer">website</a>
                  </>
                )}
              </div>
              <div style={{ fontSize: 14, opacity: .8 }}>
                Type: {v.type || "n/a"}
                {v.capacity ? ` • Capacity: ${v.capacity}` : ""}
                {formatCurrency(v.avg_cost_lkr) ? ` • Avg: ${formatCurrency(v.avg_cost_lkr)}` : ""}
                {formatCurrency(v.standard_rate_lkr) && (!v.avg_cost_lkr || v.standard_rate_lkr !== v.avg_cost_lkr) ? ` • Standard: ${formatCurrency(v.standard_rate_lkr)}` : ""}
                {typeof v.min_lead_days === "number" && v.min_lead_days > 0 ? ` • Lead: ~${v.min_lead_days} days` : ""}
                {v.source ? ` • Source: ${v.source}` : ""}
              </div>
            </li>
          ))}
          {(!data.derived?.suggested_venues || data.derived?.suggested_venues?.length === 0) && (
            <li style={{ opacity: .8 }}>No venue suggestions available for this musical brief.</li>
          )}
        </ul>
      </div>

      {/* Timeline */}
      <div>
        <h3>Timeline</h3>
        <Timeline eventDate={data.event?.date} items={data.timeline} />
      </div>

    </div>
  );
}

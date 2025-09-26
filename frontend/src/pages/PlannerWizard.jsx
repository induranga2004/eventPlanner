// frontend/src/pages/PlannerWizard.jsx
import { useState } from "react";
import { generatePlans } from "../api/planner";

const TYPES = ["wedding", "concert", "corporate", "workshop", "birthday"];

export default function PlannerWizard({ onGenerated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campaign_id: crypto.randomUUID(),
    event_name: "",
    event_type: "wedding",
    city: "",
    venue: "",
    event_date: "",
    attendees_estimate: 100,
    audience_profile: "families",
    special_instructions: "",
    total_budget_lkr: 1000000,
    number_of_concepts: 2,
  });

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: ["attendees_estimate", "total_budget_lkr", "number_of_concepts"].includes(name) ? Number(value) : value
    }));
  };

  const submit = async () => {
    if (!form.event_name || form.event_name.length < 3) return alert("Event name must be at least 3 characters.");
    if (!form.city) return alert("City is required.");
    if (!form.event_date) return alert("Event date is required.");
    if (form.attendees_estimate < 1) return alert("Attendees must be ≥ 1.");
    if (form.total_budget_lkr < 50000) return alert("Budget must be ≥ LKR 50,000.");

    try {
      setLoading(true);
      const data = await generatePlans(form);
      onGenerated(data, form.campaign_id);
    } catch (e) {
      alert("Failed to generate: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard">
      <h2>Create Event Plan</h2>
      <div className="steps">Step {step} / 4</div>

      {step === 1 && (
        <div className="card">
          <label>Event Name
            <input name="event_name" value={form.event_name} onChange={onChange} />
          </label>
          <label>Event Type
            <select name="event_type" value={form.event_type} onChange={onChange}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>City
            <input name="city" value={form.city} onChange={onChange} />
          </label>
          <label>Venue (optional)
            <input name="venue" value={form.venue} onChange={onChange} />
          </label>
          <label>Event Date
            <input type="date" name="event_date" value={form.event_date} onChange={onChange} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <label>Attendees Estimate
            <input type="number" name="attendees_estimate" value={form.attendees_estimate} onChange={onChange} />
          </label>
          <label>Total Budget (LKR)
            <input type="number" name="total_budget_lkr" value={form.total_budget_lkr} onChange={onChange} />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <label>Audience Profile
            <input name="audience_profile" value={form.audience_profile} onChange={onChange} />
          </label>
          <label>Special Instructions
            <textarea name="special_instructions" value={form.special_instructions} onChange={onChange} />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <label>Number of Concepts (1–4)
            <input type="number" min={1} max={4} name="number_of_concepts" value={form.number_of_concepts} onChange={onChange} />
          </label>
          <p style={{opacity:.8}}>Using Concept-A split (premium venue).</p>
        </div>
      )}

      <div className="actions">
        {step > 1 && <button onClick={back}>Back</button>}
        {step < 4 && <button onClick={next}>Next</button>}
        {step === 4 && <button disabled={loading} onClick={submit}>{loading ? "Generating..." : "Generate Plans"}</button>}
      </div>
    </div>
  );
}

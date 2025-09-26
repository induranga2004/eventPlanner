import React, { useState } from "react";
import "./AutoShareForm.css";

export default function AutoShareForm() {
  const [form, setForm] = useState({
    name: "",
    date: "",
    venue: "",
    price: "",
    audience: "",
    photo_url: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/auto-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Network error" });
    }
    setLoading(false);
  };

  return (
    <div className="auto-share-container">
      <h2>Auto Share Your Event</h2>
      <form className="auto-share-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Event Name" value={form.name} onChange={handleChange} required />
        <input name="date" type="date" placeholder="Date" value={form.date} onChange={handleChange} required />
        <input name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} required />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="audience" placeholder="Audience" value={form.audience} onChange={handleChange} required />
        <input name="photo_url" placeholder="Photo URL" value={form.photo_url} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Sharing..." : "Auto Share"}</button>
      </form>
      {result && (
        <div className="auto-share-result">
          {result.caption && (
            <>
              <h3>Generated Caption:</h3>
              <p>{result.caption}</p>
            </>
          )}
          {result.result && <pre>{JSON.stringify(result.result, null, 2)}</pre>}
          {result.error && <p className="error">{result.error}</p>}
        </div>
      )}
    </div>
  );
}

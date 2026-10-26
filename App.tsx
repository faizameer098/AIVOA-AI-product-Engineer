

import { useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [stage, setStage] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeDeviation = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please enter the incident title and description");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const res = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, batchNumber, stage, description, evidence }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h1>AIVOA-RCA - Pharma RCA</h1>
      
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 10 }} />
      <input placeholder="Batch Number" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 10 }} />
      <input placeholder="Stage" value={stage} onChange={e => setStage(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 10 }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 10, height: 100 }} />
      <textarea placeholder="Evidence" value={evidence} onChange={e => setEvidence(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 10, height: 80 }} />

      <button onClick={analyzeDeviation} disabled={loading} style={{ marginTop: 15, padding: "10px 20px" }}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {analysis && <div style={{ marginTop: 20, whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 15 }}>{analysis}</div>}
    </div>
  );
}

export default App;
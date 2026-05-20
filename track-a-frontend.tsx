// track-a-frontend.tsx
// Single‑file React UI for the Institutional Grade NIL Valuation Exchange System

import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

// ---------------------------------------------
// COMPONENT: NIL Index Card
// ---------------------------------------------
function NilIndexCard({ athleteId }: { athleteId: number }) {
  const [data, setData] = useState<{
    athleteId: number;
    modelNil: number;
    marketNil: number;
    divergence: number;
  } | null>(null);

  useEffect(() => {
    fetch(`http://localhost:4001/divergence/${athleteId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [athleteId]);

  if (!data) return <div style={styles.card}>Loading...</div>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Athlete #{data.athleteId}</h2>
      <p>Model NIL: ${data.modelNil}</p>
      <p>Market NIL: ${data.marketNil}</p>
      <p>Divergence: {data.divergence}</p>
    </div>
  );
}

// ---------------------------------------------
// MAIN APP
// ---------------------------------------------
function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Institutional Grade NIL Valuation Exchange System</h1>
      <NilIndexCard athleteId={1} />
    </div>
  );
}

// ---------------------------------------------
// INLINE STYLES (Black & Gold Aesthetic)
// ---------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "40px",
    background: "#000",
    minHeight: "100vh",
    color: "#f5f5f5",
    fontFamily: "Inter, sans-serif"
  },
  header: {
    color: "#f5c542",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: 700
  },
  card: {
    background: "#111",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #333",
    width: "320px"
  },
  title: {
    color: "#f5c542",
    marginBottom: "10px"
  }
};

// ---------------------------------------------
// RENDER APP
// ---------------------------------------------
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

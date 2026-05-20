// track-b-frontend.tsx
// Single‑file React UI for the Professional NIL Exchange System (Track B)

import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

// ----------------------------------------------------
// COMPONENT: Swap Exposure Panel
// ----------------------------------------------------
function SwapExposurePanel({ sponsorId }: { sponsorId: number }) {
  const [data, setData] = useState<{
    sponsor_id?: number;
    total_exposure?: number;
    swap_count?: number;
  } | null>(null);

  useEffect(() => {
    fetch(`http://localhost:4002/exposure/${sponsorId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [sponsorId]);

  if (!data) return <div style={styles.card}>Loading exposure...</div>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Sponsor Exposure</h2>
      <p>Sponsor ID: {sponsorId}</p>
      <p>Total Exposure: {data.total_exposure}</p>
      <p>Active Swaps: {data.swap_count}</p>
    </div>
  );
}

// ----------------------------------------------------
// COMPONENT: Cohort Basket Card
// ----------------------------------------------------
function CohortBasketCard({ cohort }: { cohort: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:4002/cohorts/${cohort}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [cohort]);

  if (!data) return <div style={styles.card}>Loading cohort...</div>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Cohort: {data.cohort}</h2>
      {data.athletes.map((a: any) => (
        <div key={a.athlete_id} style={styles.row}>
          <strong>{a.name}</strong>
          <span>Model NIL: ${a.model_nil}</span>
          <span>Units: {a.total_units}</span>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------
// MAIN APP
// ----------------------------------------------------
function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Professional NIL Exchange System</h1>

      <div style={styles.grid}>
        <SwapExposurePanel sponsorId={1} />
        <CohortBasketCard cohort="EAST_DIVISION" />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// BLACK & GOLD STYLES
// ----------------------------------------------------
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
  grid: {
    display: "flex",
    gap: "20px"
  },
  card: {
    background: "#111",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #333",
    width: "360px"
  },
  title: {
    color: "#f5c542",
    marginBottom: "10px"
  },
  row: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #222"
  }
};

// ----------------------------------------------------
// RENDER APP
// ----------------------------------------------------
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

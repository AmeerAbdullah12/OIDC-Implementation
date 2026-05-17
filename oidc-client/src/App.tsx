import { useEffect, useState } from "react";

type Route = "home" | "dashboard";

export default function App() {
  const [route, setRoute] = useState<Route>("home");

  useEffect(() => {
    if (window.location.pathname === "/dashboard") {
      setRoute("dashboard");
    }
  }, []);

  if (route === "dashboard") {
    return <Dashboard />;
  }

  return <Home />;
}

function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "1rem",
    }}>
      <h1 style={{ fontSize: "2rem" }}>OIDC Demo</h1>
      <p style={{ color: "#555" }}>A custom OpenID Connect server implementation</p>
      <a
        href="/login"
        style={{
          padding: "0.75rem 2rem",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        Login
      </a>
    </div>
  );
}

function Dashboard() {
  return <div>Dashboard</div>;
}
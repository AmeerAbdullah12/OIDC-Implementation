import { useEffect, useState } from "react";
import axios from "axios";

type Route = "home" | "dashboard";

interface User {
  sub: string;
  email: string;
  name: string;
}

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
        href="http://localhost:8080/login"
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setError("Failed to load user info"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await axios.post("/logout", {}, { withCredentials: true });
    window.location.href = "http://localhost:8080/login";
  }

  if (loading) {
    return (
      <div style={centerStyle}>
        <p style={{ color: "#555" }}>Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={centerStyle}>
        <p style={{ color: "#dc2626" }}>{error ?? "Not authenticated"}</p>
        <a href="http://localhost:8080/login" style={linkStyle}>Back to login</a>
      </div>
    );
  }

  return (
    <div style={centerStyle}>
      <div style={cardStyle}>
        <div style={avatarStyle}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{user.name}</h1>
        <p style={{ color: "#555", marginBottom: "2rem" }}>{user.email}</p>
        <div style={infoBoxStyle}>
          <InfoRow label="Subject" value={user.sub} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Name" value={user.name} />
        </div>
        <button onClick={handleLogout} style={buttonStyle}>
          Logout
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "0.625rem 0",
      borderBottom: "1px solid #f0f0f0",
      fontSize: "0.875rem",
    }}>
      <span style={{ color: "#555", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#111" }}>{value}</span>
    </div>
  );
}

const centerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  gap: "1rem",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "12px",
  padding: "2rem",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const avatarStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "#2563eb",
  color: "white",
  fontSize: "1.5rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 1rem",
};

const infoBoxStyle: React.CSSProperties = {
  background: "#f9f9f9",
  borderRadius: "8px",
  padding: "0 1rem",
  marginBottom: "1.5rem",
  textAlign: "left",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "1rem",
  cursor: "pointer",
};

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  textDecoration: "none",
  fontSize: "0.875rem",
};
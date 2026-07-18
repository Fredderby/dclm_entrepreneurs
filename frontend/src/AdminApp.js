import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
);

const PALETTE = [
  "#2563eb","#7c3aed","#db2777","#dc2626","#ea580c","#d97706",
  "#16a34a","#0891b2","#6366f1","#ec4899","#f43f5e","#8b5cf6",
  "#14b8a6","#84cc16","#f97316","#06b6d4",
];

const AUTH_HEADER = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const G = {
  bg: "#eef1f6",
  bgGrad: "linear-gradient(160deg,#e8ecf4 0%,#f4f6fa 40%,#eef1f6 100%)",
  bg2: "#f8fafc",
  card: "#ffffff",
  cardHover: "#f1f5f9",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  accent: "#2563eb",
  accentGlow: "rgba(37,99,235,0.15)",
  success: "#16a34a",
  warn: "#d97706",
  danger: "#dc2626",
  purple: "#7c3aed",
  headerGrad: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
};

const SHARED_CSS = `
  *{box-sizing:border-box}
  .am-enter{animation:amSlideUp .45s cubic-bezier(.22,1,.36,1) both}
  @keyframes amSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes amPulse{0%,100%{opacity:1}50%{opacity:.6}}
  .am-pulse{animation:amPulse 2s ease-in-out infinite}
  .am-card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.08)!important}
  .am-nav-btn:hover{background:rgba(0,0,0,.05)!important}
  .am-input:focus{border-color:${G.accent}!important;box-shadow:0 0 0 3px ${G.accentGlow}!important}
  .am-btn:hover{filter:brightness(1.05);transform:translateY(-1px)}
  .am-btn:active{transform:translateY(0)}
  .am-row:hover{background:${G.cardHover}!important}
  .am-badge{display:inline-flex;align-items:center;padding:.2rem .55rem;border-radius:20px;font-size:.7rem;font-weight:600;letter-spacing:.02em}
  .am-scroll::-webkit-scrollbar{height:6px}
  .am-scroll::-webkit-scrollbar-track{background:${G.bg2}}
  .am-scroll::-webkit-scrollbar-thumb{background:${G.border};border-radius:3px}
  @media(max-width:768px){.am-metric-grid{grid-template-columns:repeat(2,1fr)!important}.am-chart-grid{grid-template-columns:1fr!important}}
  @media(max-width:480px){.am-metric-grid{grid-template-columns:1fr!important}}
`;

function Icon({ type, size = 22 }) {
  const s = { width: size, height: size };
  const icons = {
    total: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.accent} strokeWidth="2" strokeLinecap="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>,
    today: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.success} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="15" r="2"/></svg>,
    month: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.purple} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
    year: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.warn} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M7 16l2 2 4-4"/></svg>,
    search: <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    download: <svg style={{width:15,height:15}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    logout: <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    back: <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    trash: <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    chart: <svg style={{width:15,height:15}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    table: <svg style={{width:15,height:15}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>,
  };
  return icons[type] || null;
}

function MetricCard({ label, value, icon, color, sub, delay = 0 }) {
  return (
    <div className="am-card am-enter" style={{
      background: G.card,
      borderRadius: "14px",
      border: `1px solid ${G.border}`,
      padding: "1.25rem 1.35rem",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      transition: "all .25s cubic-bezier(.22,1,.36,1)",
      animationDelay: `${delay}ms`,
    }}>
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "90px", height: "90px", borderRadius: "50%",
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <p style={{
            margin: 0, fontSize: "0.68rem", fontWeight: 700, color: G.textMuted,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>{label}</p>
          <p style={{
            margin: "0.45rem 0 0.15rem", fontSize: "2rem", fontWeight: 800, color: G.text,
            lineHeight: 1, fontVariantNumeric: "tabular-nums",
          }}>{value}</p>
          {sub && <p style={{ margin: 0, fontSize: "0.7rem", color: G.textMuted }}>{sub}</p>}
        </div>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${color}10`,
          border: `1px solid ${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon type={icon} size={22} />
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        borderRadius: "0 0 14px 14px",
      }} />
    </div>
  );
}

function ChartCard({ title, children, h = "260px", delay = 0 }) {
  return (
    <div className="am-card am-enter" style={{
      background: G.card,
      borderRadius: "14px", border: `1px solid ${G.border}`,
      padding: "1.35rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      transition: "all .25s cubic-bezier(.22,1,.36,1)",
      animationDelay: `${delay}ms`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: "#eff6ff", border: `1px solid #bfdbfe`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon type="chart" />
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: G.text, letterSpacing: "0.01em" }}>{title}</p>
      </div>
      <div style={{ height: h, position: "relative" }}>{children}</div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/admin/login", { username, password });
      localStorage.setItem("admin_token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: G.bgGrad,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: `radial-gradient(circle, ${G.accent}10 0%, transparent 70%)`, top: "-200px", right: "-200px" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${G.purple}08 0%, transparent 70%)`, bottom: "-150px", left: "-150px" }} />
      </div>

      <div className="am-enter" style={{
        width: "100%", maxWidth: "400px", position: "relative", zIndex: 1,
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all .6s cubic-bezier(.22,1,.36,1)",
      }}>
        <div style={{
          background: G.card,
          borderRadius: "20px", border: `1px solid ${G.border}`,
          boxShadow: "0 25px 80px rgba(0,0,0,0.1)", overflow: "hidden",
        }}>
          <div style={{
            padding: "2rem 2.25rem 1.5rem", textAlign: "center",
            borderBottom: `1px solid ${G.border}`,
            background: G.bg2,
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 1rem",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg style={{ width: 28, height: 28 }} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: G.text }}>Admin Panel</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: G.textMuted }}>DCLM-Ghana Entrepreneurship Database</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "1.75rem 2.25rem 2rem" }}>
            {error && (
              <div style={{
                background: `${G.danger}0a`, border: `1px solid ${G.danger}33`,
                borderRadius: "10px", padding: "0.65rem 0.9rem", marginBottom: "1.25rem",
                fontSize: "0.8rem", color: G.danger, fontWeight: 500,
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <svg style={{width:16,height:16,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke={G.danger} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "1.15rem" }}>
              <label style={{
                fontWeight: 700, fontSize: "0.7rem", display: "block", marginBottom: "0.4rem",
                color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em",
              }}>Username</label>
              <input className="am-input" autoFocus
                style={{
                  width: "100%", padding: "0.7rem 0.9rem", borderRadius: "10px",
                  border: `1.5px solid ${G.border}`, fontSize: "0.88rem", fontFamily: "inherit",
                  boxSizing: "border-box", outline: "none", background: G.bg2, color: G.text,
                  transition: "all .2s",
                }}
                value={username} onChange={e => setUsername(e.target.value)} required
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                fontWeight: 700, fontSize: "0.7rem", display: "block", marginBottom: "0.4rem",
                color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em",
              }}>Password</label>
              <input className="am-input" type="password"
                style={{
                  width: "100%", padding: "0.7rem 0.9rem", borderRadius: "10px",
                  border: `1.5px solid ${G.border}`, fontSize: "0.88rem", fontFamily: "inherit",
                  boxSizing: "border-box", outline: "none", background: G.bg2, color: G.text,
                  transition: "all .2s",
                }}
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>

            <button type="submit" disabled={loading}
              className="am-btn"
              style={{
                width: "100%", padding: "0.75rem",
                background: loading ? G.accent + "88" : `linear-gradient(135deg, ${G.accent}, #2563eb)`,
                color: "#fff", border: "none", borderRadius: "10px",
                fontWeight: 700, fontSize: "0.88rem", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 15px rgba(37,99,235,0.3)",
                transition: "all .2s", letterSpacing: "0.02em",
              }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span className="am-pulse" style={{
                    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block", animation: "amPulse .6s linear infinite",
                  }} />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/analytics", AUTH_HEADER(token))
      .then(r => { setAnalytics(r.data); setTimeout(() => setMounted(true), 50); })
      .catch(() => {});
  }, [token]);

  if (!analytics) return (
    <div style={{ padding: "3rem", textAlign: "center", color: G.textMuted }}>
      <div className="am-pulse" style={{
        width: 40, height: 40, border: `3px solid ${G.border}`, borderTopColor: G.accent,
        borderRadius: "50%", margin: "0 auto 1rem", animation: "amPulse .8s linear infinite",
      }} />
      <p style={{ fontSize: "0.85rem" }}>Loading analytics...</p>
    </div>
  );

  const sharedScales = {
    x: {
      grid: { color: "#e2e8f044", drawBorder: false },
      ticks: { font: { size: 10 }, color: "#64748b", maxRotation: 45 },
    },
    y: {
      beginAtZero: true, grid: { color: "#e2e8f066", drawBorder: false },
      ticks: { stepSize: 1, font: { size: 10 }, color: "#64748b" },
    },
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff", titleColor: "#0f172a", bodyColor: "#64748b",
        borderColor: "#e2e8f0", borderWidth: 1, cornerRadius: 8, padding: 10,
        titleFont: { weight: 700 }, bodyFont: { size: 12 },
      },
    },
    scales: sharedScales,
  };

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff", titleColor: "#0f172a", bodyColor: "#64748b",
        borderColor: "#e2e8f0", borderWidth: 1, cornerRadius: 8, padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false }, ticks: { font: { size: 9 }, color: "#94a3b8", maxRotation: 45, autoSkip: true, maxTicksLimit: 10 },
      },
      y: {
        beginAtZero: true, grid: { color: "#e2e8f066", drawBorder: false },
        ticks: { stepSize: 1, font: { size: 10 }, color: "#64748b" },
      },
    },
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "right", labels: {
          boxWidth: 12, padding: 10, font: { size: 11 },
          color: "#64748b", usePointStyle: true, pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "#fff", titleColor: "#0f172a", bodyColor: "#64748b",
        borderColor: "#e2e8f0", borderWidth: 1, cornerRadius: 8, padding: 10,
      },
    },
  };

  const makeBarData = (obj, label) => {
    const entries = Object.entries(obj).filter(([k]) => k && k !== "Unknown");
    return {
      labels: entries.map(([k]) => k.length > 18 ? k.slice(0, 16) + "\u2026" : k),
      datasets: [{
        label, data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length] + "cc"),
        hoverBackgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 6, barThickness: 22,
      }],
    };
  };

  const makeDoughnutData = (obj) => {
    const entries = Object.entries(obj).filter(([k]) => k && k !== "Unknown");
    return {
      labels: entries.map(([k]) => k),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length] + "dd"),
        hoverBackgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 0, hoverOffset: 6,
      }],
    };
  };

  const trendData = {
    labels: analytics.daily_trend.map(d => d.date.slice(5)),
    datasets: [{
      label: "Submissions", data: analytics.daily_trend.map(d => d.count),
      borderColor: "#2563eb", backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return "rgba(37,99,235,0.08)";
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, "rgba(37,99,235,0.18)");
        g.addColorStop(1, "rgba(37,99,235,0.01)");
        return g;
      },
      fill: true, tension: 0.4, pointRadius: 2, pointHoverRadius: 5,
      pointBackgroundColor: "#2563eb", pointBorderColor: "#fff", pointBorderWidth: 2,
      borderWidth: 2.5,
    }],
  };

  return (
    <div>
      <style>{SHARED_CSS}</style>

      <div style={{ marginBottom: "1.5rem" }} className="am-enter">
        <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: G.text }}>Dashboard</h1>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: G.textMuted }}>Overview of all submissions and analytics</p>
      </div>

      <div className="am-metric-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.85rem", marginBottom: "1.5rem",
      }}>
        <MetricCard label="Total Submissions" value={analytics.total} icon="total" color={G.accent} sub="All time" delay={0} />
        <MetricCard label="Today" value={analytics.today} icon="today" color={G.success} sub={new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} delay={60} />
        <MetricCard label="This Month" value={analytics.this_month} icon="month" color={G.purple} sub={new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} delay={120} />
        <MetricCard label="This Year" value={analytics.this_year} icon="year" color={G.warn} sub={new Date().getFullYear().toString()} delay={180} />
      </div>

      <div style={{ marginBottom: "1.25rem" }} className="am-enter" style={{ animationDelay: "200ms" }}>
        <ChartCard title="Submissions Trend — Last 30 Days" h="220px" delay={240}>
          <Line data={trendData} options={lineOpts} />
        </ChartCard>
      </div>

      <div className="am-chart-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem", marginBottom: "1.25rem",
      }}>
        <ChartCard title="By Business Type" h="260px" delay={300}>
          <Bar data={makeBarData(analytics.by_type, "Count")} options={barOpts} />
        </ChartCard>
        <ChartCard title="By Sector" h="260px" delay={360}>
          <Bar data={makeBarData(analytics.by_sector, "Count")} options={barOpts} />
        </ChartCard>
      </div>

      <div className="am-chart-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem", marginBottom: "1.25rem",
      }}>
        <ChartCard title="By Zone" h="260px" delay={420}>
          <Bar data={makeBarData(analytics.by_zone, "Count")} options={barOpts} />
        </ChartCard>
        <ChartCard title="By Region" h="260px" delay={480}>
          <Bar data={makeBarData(analytics.by_region, "Count")} options={barOpts} />
        </ChartCard>
      </div>

      <div className="am-chart-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
      }}>
        <ChartCard title="By Division" h="260px" delay={540}>
          <Bar data={makeBarData(analytics.by_division, "Count")} options={barOpts} />
        </ChartCard>
        <ChartCard title="Mentor Availability" h="260px" delay={600}>
          <Doughnut data={makeDoughnutData(analytics.by_mentor)} options={doughnutOpts} />
        </ChartCard>
        <ChartCard title="Years in Business" h="260px" delay={660}>
          <Doughnut data={makeDoughnutData(analytics.by_years)} options={doughnutOpts} />
        </ChartCard>
      </div>
    </div>
  );
}

function SubmissionsPage({ token }) {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const inputRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort_by: sortBy, sort_dir: sortDir, page, per_page: 20, search });
      const { data } = await axios.get(`/api/admin/submissions?${params}`, AUTH_HEADER(token));
      setSubmissions(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch {} finally { setLoading(false); }
  }, [token, sortBy, sortDir, page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      await axios.delete(`/api/admin/submissions/${id}`, AUTH_HEADER(token));
      fetchData();
    } catch { alert("Delete failed"); }
  };

  const exportCSV = () => {
    const headers = ["ID", "Zone", "Region", "Division", "Pastor Name", "Pastor Contact", "Full Name", "Phone", "Business Name", "Business Type", "Location", "Sector", "Years", "Mentor", "Submitted"];
    const rows = submissions.map(r => [
      r.id, r.zone, r.region, r.division, r.pastor_name, r.pastor_contact,
      r.entrepreneur_full_name, r.entrepreneur_phone_whatsapp, r.entrepreneur_business_name,
      r.entrepreneur_business_type, r.entrepreneur_business_location, r.entrepreneur_sector,
      r.entrepreneur_years_in_business, r.entrepreneur_can_mentor, r.synced_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dclm_submissions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const thStyle = (col) => ({
    padding: "0.75rem 0.85rem", textAlign: "left", fontSize: "0.68rem", fontWeight: 700,
    color: G.textMuted, textTransform: "uppercase", letterSpacing: "0.08em",
    borderBottom: `1px solid ${G.border}`, cursor: "pointer", userSelect: "none",
    whiteSpace: "nowrap", background: "#f8fafc", position: "sticky", top: 0, zIndex: 2,
    transition: "color .15s",
  });

  const sortIndicator = (col) => {
    if (sortBy !== col) return <span style={{ opacity: 0.3, marginLeft: "0.3rem", fontSize: "0.65rem" }}>&#9650;&#9660;</span>;
    return <span style={{ color: G.accent, marginLeft: "0.3rem", fontSize: "0.65rem" }}>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>;
  };

  return (
    <div>
      <style>{SHARED_CSS}</style>

      <div className="am-enter" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "0.85rem", marginBottom: "1.25rem",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: G.text }}>Submissions</h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: G.textMuted }}>
            {total} total record{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", display: "flex" }}>
              <Icon type="search" />
            </span>
            <input ref={inputRef} className="am-input" type="text" placeholder="Search submissions..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding: "0.55rem 0.8rem 0.55rem 2.2rem", borderRadius: "10px",
                border: `1.5px solid ${G.border}`, fontSize: "0.82rem", fontFamily: "inherit",
                width: "220px", outline: "none", background: "#fff", color: G.text, transition: "all .2s",
              }}
            />
          </div>
          <button onClick={exportCSV} className="am-btn" style={{
            padding: "0.55rem 1rem", borderRadius: "10px",
            border: `1px solid ${G.border}`, background: "#fff",
            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", color: G.text,
            display: "flex", alignItems: "center", gap: "0.4rem", transition: "all .2s",
          }}>
            <Icon type="download" /> Export CSV
          </button>
        </div>
      </div>

      <div className="am-enter" style={{
        background: G.card,
        borderRadius: "14px", border: `1px solid ${G.border}`,
        overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        animationDelay: "100ms",
      }}>
        <div style={{ overflowX: "auto" }} className="am-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr>
                <th style={thStyle("id")} onClick={() => handleSort("id")}>#{sortIndicator("id")}</th>
                <th style={thStyle("entrepreneur_full_name")} onClick={() => handleSort("entrepreneur_full_name")}>Name{sortIndicator("entrepreneur_full_name")}</th>
                <th style={thStyle("entrepreneur_business_name")} onClick={() => handleSort("entrepreneur_business_name")}>Business{sortIndicator("entrepreneur_business_name")}</th>
                <th style={thStyle("entrepreneur_business_type")} onClick={() => handleSort("entrepreneur_business_type")}>Type{sortIndicator("entrepreneur_business_type")}</th>
                <th style={thStyle("zone")} onClick={() => handleSort("zone")}>Zone{sortIndicator("zone")}</th>
                <th style={thStyle("division")} onClick={() => handleSort("division")}>Division{sortIndicator("division")}</th>
                <th style={thStyle("entrepreneur_sector")} onClick={() => handleSort("entrepreneur_sector")}>Sector{sortIndicator("entrepreneur_sector")}</th>
                <th style={thStyle("entrepreneur_can_mentor")} onClick={() => handleSort("entrepreneur_can_mentor")}>Mentor{sortIndicator("entrepreneur_can_mentor")}</th>
                <th style={thStyle("synced_at")} onClick={() => handleSort("synced_at")}>Date{sortIndicator("synced_at")}</th>
                <th style={{ ...thStyle("actions"), cursor: "default" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: "3rem", textAlign: "center", color: G.textMuted }}>Loading...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: "3rem", textAlign: "center", color: G.textMuted }}>No submissions found</td></tr>
              ) : submissions.map((r, idx) => (
                <tr key={r.id} className="am-row" style={{
                  borderBottom: `1px solid ${G.border}88`, cursor: "pointer",
                  background: idx % 2 === 0 ? "transparent" : "#f8fafc",
                  transition: "background .15s",
                }}
                  onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}>
                  <td style={{ padding: "0.65rem 0.85rem", color: G.textMuted, fontVariantNumeric: "tabular-nums" }}>{r.id}</td>
                  <td style={{ padding: "0.65rem 0.85rem", fontWeight: 600, color: G.text }}>{r.entrepreneur_full_name}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: G.text }}>{r.entrepreneur_business_name}</td>
                  <td style={{ padding: "0.65rem 0.85rem" }}>
                    <span className="am-badge" style={{
                      background: `${G.accent}15`, color: G.accent,
                      border: `1px solid ${G.accent}33`,
                    }}>{r.entrepreneur_business_type || "—"}</span>
                  </td>
                  <td style={{ padding: "0.65rem 0.85rem", color: G.text }}>{r.zone}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: G.textMuted }}>{r.division}</td>
                  <td style={{ padding: "0.65rem 0.85rem", color: G.textMuted }}>{r.entrepreneur_sector}</td>
                  <td style={{ padding: "0.65rem 0.85rem" }}>
                    <span className="am-badge" style={{
                      background: r.entrepreneur_can_mentor === "Yes" ? `${G.success}15` : `${G.danger}15`,
                      color: r.entrepreneur_can_mentor === "Yes" ? G.success : G.danger,
                      border: `1px solid ${r.entrepreneur_can_mentor === "Yes" ? G.success : G.danger}33`,
                    }}>{r.entrepreneur_can_mentor}</span>
                  </td>
                  <td style={{ padding: "0.65rem 0.85rem", color: G.textMuted, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {r.synced_at ? r.synced_at.slice(0, 10) : "—"}
                  </td>
                  <td style={{ padding: "0.65rem 0.85rem" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDelete(r.id)} className="am-btn" style={{
                      padding: "0.35rem 0.6rem", borderRadius: "8px",
                      border: `1px solid ${G.danger}33`, background: `${G.danger}12`,
                      color: G.danger, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "0.3rem", transition: "all .15s",
                    }}>
                      <Icon type="trash" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.5rem", padding: "0.85rem", borderTop: `1px solid ${G.border}`,
            background: "#f8fafc",
          }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="am-btn"
              style={{
                padding: "0.4rem 0.85rem", borderRadius: "8px",
                border: `1px solid ${G.border}`, background: "#fff",
                fontSize: "0.78rem", fontWeight: 600, cursor: page <= 1 ? "not-allowed" : "pointer",
                opacity: page <= 1 ? 0.4 : 1, color: G.text, transition: "all .15s",
              }}>Prev</button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let pNum;
              if (pages <= 7) pNum = i + 1;
              else if (page <= 4) pNum = i + 1;
              else if (page >= pages - 3) pNum = pages - 6 + i;
              else pNum = page - 3 + i;
              return (
                <button key={pNum} onClick={() => setPage(pNum)}
                  style={{
                    padding: "0.4rem 0.7rem", borderRadius: "8px", border: "none",
                    background: page === pNum ? G.accent : "transparent",
                    color: page === pNum ? "#fff" : G.textMuted,
                    fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                    transition: "all .15s", minWidth: "32px",
                  }}>{pNum}</button>
              );
            })}
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
              className="am-btn"
              style={{
                padding: "0.4rem 0.85rem", borderRadius: "8px",
                border: `1px solid ${G.border}`, background: "#fff",
                fontSize: "0.78rem", fontWeight: 600, cursor: page >= pages ? "not-allowed" : "pointer",
                opacity: page >= pages ? 0.4 : 1, color: G.text, transition: "all .15s",
              }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApp({ onBack }) {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [page, setPage] = useState("dashboard");

  const handleLogin = (t) => setToken(t);
  const handleLogout = () => { localStorage.removeItem("admin_token"); setToken(""); };

  if (!token) return <LoginPage onLogin={handleLogin} />;

  const navBtn = (p, label, icon) => (
    <button key={p} onClick={() => setPage(p)} className="am-nav-btn" style={{
      padding: "0.5rem 0.95rem", borderRadius: "8px", border: "none",
      background: page === p ? "rgba(255,255,255,0.15)" : "transparent",
      color: page === p ? "#fff" : "rgba(255,255,255,0.55)",
      fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
      transition: "all .2s", display: "flex", alignItems: "center", gap: "0.4rem",
      letterSpacing: "0.01em",
    }}>
      <Icon type={icon} size={14} />
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: G.bgGrad, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{SHARED_CSS}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body{margin:0;background:${G.bgGrad};background-attachment:fixed;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
        .am-input::placeholder{color:${G.textMuted}88}
      `}</style>

      <header style={{
        background: G.headerGrad,
        padding: "0 1.75rem", height: "58px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${G.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={onBack} className="am-nav-btn" style={{
            padding: "0.4rem 0.75rem", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
            color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.3rem", transition: "all .15s",
          }}>
            <Icon type="back" /> Form
          </button>

          <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.15)", margin: "0 0.35rem" }} />

          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>

          <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.02em" }}>
            Admin Panel
          </span>

          <div style={{
            display: "flex", gap: "0.2rem", marginLeft: "0.75rem",
            background: `rgba(255,255,255,0.1)`, borderRadius: "10px", padding: "0.2rem",
            border: `1px solid rgba(255,255,255,0.15)`,
          }}>
            {navBtn("dashboard", "Dashboard", "chart")}
            {navBtn("submissions", "Submissions", "table")}
          </div>
        </div>

        <button onClick={handleLogout} className="am-nav-btn" style={{
          padding: "0.4rem 0.8rem", borderRadius: "8px",
          border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)",
          color: "#fca5a5", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: "0.35rem", transition: "all .15s",
        }}>
          <Icon type="logout" /> Logout
        </button>
      </header>

      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "1.75rem 1.25rem 3rem" }}>
        {page === "dashboard" && <DashboardPage token={token} />}
        {page === "submissions" && <SubmissionsPage token={token} />}
      </main>
    </div>
  );
}

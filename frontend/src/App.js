import { useState, useCallback, useMemo, memo } from "react";
import axios from "axios";
import AdminApp from "./AdminApp";

const API_URL = "";

const businessTypes = [
  "Agriculture & Agribusiness",
  "Manufacturing & Production",
  "Construction & Real Estate",
  "Retail & Wholesale Trade",
  "Information Technology & Digital Services",
  "Finance, Banking & Insurance",
  "Education & Training",
  "Health & Wellness",
  "Hospitality, Food & Tourism",
  "Beauty & Fashion",
  "Transportation & Logistics",
  "Media, Arts & Entertainment",
  "Professional Services (Law, Accounting, Consulting)",
  "Creative & Crafts Industry",
  "Import & Export",
  "Renewable Energy & Environmental Services",
];

const zone_region_divisions = {
  "Central Western Zone": {
    Tarkwa: ["Tarkwa div", "Enchi", "Asankragua"],
    Takoradi: ["Takoradi div", "Axim", "Half Assini"],
    "Cape Coast": [
      "Cape Coast div", "Swedru", "Assin Fosu",
      "Mankessim", "Winneba", "Elmina", "Asikuma",
    ],
  },
  "Greater Accra Zone": {
    "Accra Metro": ["Accra Metro div"],
    Kasoa: ["Kasoa div", "Weija"],
    Madina: ["Madina div", "La Dadekotopon"],
    Tema: ["Tema div", "Ashaiman", "Teshie-Nungua"],
    "Ga Central": ["Ga-Central div", "Nsawam", "Amasaman"],
  },
  "Ashanti Zone A": {
    Bibiani: ["Bibiani div", "Wiawso", "Essam Debiso"],
    "Kumasi South": ["Kumasi South div", "Bohyen"],
    Obuasi: ["Obuasi div", "Dunkwa", "Bekwai", "Subin", "New Edubiase"],
    Nkawie: ["Nkawie div", "Mankranso"],
  },
  "Ashanti Zone B": {
    "Kumasi North": ["Kumasi North div", "Offinso", "Asokore Mampong"],
    Mampong: ["Mampong div", "Atebubu", "Effiduase", "Ejura"],
    Konongo: ["Konongo div", "Agogo", "Juaso", "Ejisu"],
  },
  "Middle Belt Zone": {
    Sunyani: ["Sunyani div", "Dormaa Ahenkro", "Berekum", "Bechem", "Sampa"],
    Techiman: ["Techiman div", "Kintampo", "Wenchi", "Nkoranza"],
    Goaso: ["Goaso div", "Mim", "Kenyase", "Tepa"],
  },
  "Eastern Volta Zone": {
    Koforidua: ["Koforidua div", "Akropong", "Suhum", "Odumase"],
    "Akim Oda": ["Akim Oda div", "Donkorkrom", "Nkawkaw", "Asamankese"],
    Ho: ["Ho div", "Akatsi", "Keta", "Aflao"],
    Hohoe: ["Hohoe div", "Kpando", "Nkwanta", "Krachi"],
  },
  "Northern Zone": {
    Bolga: ["Bolga div", "Bawku", "Navrongo", "Walewale"],
    Wa: ["Wa div", "Tumu", "Bole"],
    Tamale: ["Tamale div", "Yendi", "Damango", "Salaga", "Buipe"],
  },
};

const hasNumbers = (text) => /\d/.test(text);
const isValidPhone = (phone) => /^\d{10}$/.test(phone);

const C = {
  bg: "#eef1f6",
  bgGrad: "linear-gradient(160deg,#e8ecf4 0%,#f4f6fa 40%,#eef1f6 100%)",
  card: "#ffffff",
  border: "#e2e8f0",
  borderFocus: "#2563eb",
  text: "#0f172a",
  textSub: "#334155",
  muted: "#64748b",
  accent: "#2563eb",
  accentLight: "#eff6ff",
  accentBorder: "#bfdbfe",
  success: "#16a34a",
  successBg: "#f0fdf4",
  successBorder: "#bbf7d0",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  header: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
  sectionGrad: "linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#3b82f6 100%)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  body{margin:0;padding:0;background:${C.bg};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
  *,*::before,*::after{box-sizing:border-box}
  @keyframes pFormUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pFormShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes pSpin{to{transform:rotate(360deg)}}
  @keyframes pShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
  @keyframes pPulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes pCheckScale{0%{transform:scale(0)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
  .p-up{animation:pFormUp .5s cubic-bezier(.22,1,.36,1) both}
  .p-up-d1{animation-delay:.05s}
  .p-up-d2{animation-delay:.12s}
  .p-up-d3{animation-delay:.19s}
  .p-shake{animation:pShake .4s ease}
  .p-card{background:${C.card};border-radius:16px;border:1px solid ${C.border};box-shadow:0 1px 3px rgba(0,0,0,.04),0 8px 32px rgba(0,0,0,.03);transition:box-shadow .25s ease,transform .25s ease;overflow:hidden}
  .p-card:hover{box-shadow:0 1px 3px rgba(0,0,0,.04),0 12px 40px rgba(0,0,0,.06)}
  .p-inp{width:100%;padding:.72rem 1rem;border-radius:10px;border:1.5px solid ${C.border};font-size:.88rem;font-family:inherit;box-sizing:border-box;outline:none;background:#fff;color:${C.text};transition:border-color .2s,box-shadow .2s,background .2s}
  .p-inp:hover{border-color:#93c5fd}
  .p-inp:focus{border-color:${C.borderFocus}!important;box-shadow:0 0 0 3.5px rgba(37,99,235,.12)!important;background:#fff}
  .p-inp.p-err{border-color:${C.danger}!important;box-shadow:0 0 0 3.5px rgba(220,38,38,.08)!important}
  .p-inp.p-err:focus{box-shadow:0 0 0 3.5px rgba(220,38,38,.12)!important}
  .p-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .9rem center;padding-right:2.2rem}
  .p-sel:disabled{background-color:#f8fafc!important;color:#94a3b8!important;cursor:not-allowed;opacity:.7}
  .p-sel option{padding:.5rem;background:#fff;color:${C.text}}
  .p-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border:none;border-radius:12px;font-family:inherit;font-weight:700;cursor:pointer;transition:all .25s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden}
  .p-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08)}
  .p-btn:active:not(:disabled){transform:translateY(0);filter:brightness(.97)}
  .p-btn:disabled{opacity:.6;cursor:not-allowed}
  .p-btn-submit{padding:.85rem 3.5rem;background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%);color:#fff;font-size:.95rem;box-shadow:0 4px 20px rgba(37,99,235,.3);letter-spacing:.02em}
  .p-btn-submit::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);background-size:200% 100%;opacity:0;transition:opacity .3s}
  .p-btn-submit:hover::before{opacity:1;animation:pFormShimmer 1.5s ease infinite}
  .p-badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.2);font-size:.72rem;font-weight:800;color:#fff;flex-shrink:0;backdrop-filter:blur(4px)}
  @media(max-width:640px){.p-g3,.p-g2{grid-template-columns:1fr!important}.p-hdr{flex-direction:column;text-align:center}.p-qr{margin-top:.75rem}}
`;

const SectionHeader = memo(function SectionHeader({ number, title }) {
  return (
    <div style={{
      padding: ".85rem 1.5rem",
      background: C.sectionGrad,
      display: "flex",
      alignItems: "center",
      gap: ".7rem",
    }}>
      <span className="p-badge">{number}</span>
      <h3 style={{ margin: 0, fontSize: ".92rem", fontWeight: 700, color: "#fff", letterSpacing: ".01em" }}>{title}</h3>
    </div>
  );
});

const FieldInput = memo(function FieldInput({ label, hint, maxLength, name, value, error, touched, onChange, onBlur, ...props }) {
  const err = touched && error;
  const len = value ? value.length : 0;
  const pct = maxLength ? Math.min((len / maxLength) * 100, 100) : 0;
  const counterColor = len >= maxLength ? C.danger : len >= maxLength - 2 ? "#d97706" : C.accent;

  return (
    <div style={{ marginBottom: ".15rem" }}>
      <label style={{
        fontWeight: 600, fontSize: ".72rem", display: "block", marginBottom: ".4rem",
        color: C.muted, textTransform: "uppercase", letterSpacing: ".06em",
      }}>
        {label} {hint && <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: ".7rem", textTransform: "none", letterSpacing: 0 }}>({hint})</span>}
        <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
      </label>
      <input
        className={`p-inp ${err ? "p-err" : ""}`}
        name={name}
        maxLength={maxLength}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="off"
        {...props}
      />
      {maxLength > 0 && (
        <div style={{ marginTop: ".35rem" }}>
          <div style={{ height: 3, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 2,
              background: counterColor,
              transition: "width .25s ease, background .25s ease",
            }} />
          </div>
          <p style={{ margin: ".2rem 0 0", fontSize: ".68rem", fontWeight: 600, color: counterColor, textAlign: "right" }}>
            {len} / {maxLength}
          </p>
        </div>
      )}
      {err && (
        <p style={{ margin: ".3rem 0 0", fontSize: ".73rem", color: C.danger, fontWeight: 500, display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <svg style={{width:12,height:12,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          {err}
        </p>
      )}
    </div>
  );
});

const FieldSelect = memo(function FieldSelect({ label, name, value, error, touched, onChange, onBlur, children, ...props }) {
  const err = touched && error;
  return (
    <div style={{ marginBottom: ".15rem" }}>
      <label style={{
        fontWeight: 600, fontSize: ".72rem", display: "block", marginBottom: ".4rem",
        color: C.muted, textTransform: "uppercase", letterSpacing: ".06em",
      }}>
        {label} <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
      </label>
      <select
        className={`p-inp p-sel ${err ? "p-err" : ""}`}
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      >{children}</select>
      {err && (
        <p style={{ margin: ".3rem 0 0", fontSize: ".73rem", color: C.danger, fontWeight: 500, display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <svg style={{width:12,height:12,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          {err}
        </p>
      )}
    </div>
  );
});

function App() {
  const [view, setView] = useState("form");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  const [formData, setFormData] = useState({
    zone: "", region: "", division: "",
    pastor_name: "", pastor_contact: "",
    entrepreneur_full_name: "", entrepreneur_phone_whatsapp: "",
    entrepreneur_business_name: "", entrepreneur_business_type: "",
    entrepreneur_business_location: "", entrepreneur_sector: "",
    entrepreneur_years_in_business: "", entrepreneur_can_mentor: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "zone": return !value ? "Zone is required" : "";
      case "region": return !value ? "Region is required" : "";
      case "division": return !value ? "Division is required" : "";
      case "pastor_name":
        if (!value.trim()) return "Pastor's Name is required";
        if (hasNumbers(value)) return "Cannot contain numbers";
        return "";
      case "pastor_contact":
        if (!value.trim()) return "Contact is required";
        if (!/^\d*$/.test(value)) return "Only digits allowed";
        if (value.length > 0 && value.length < 10) return `${value.length}/10 digits`;
        if (!isValidPhone(value)) return "Must be exactly 10 digits";
        return "";
      case "entrepreneur_full_name":
        if (!value.trim()) return "Full Name is required";
        if (hasNumbers(value)) return "Cannot contain numbers";
        return "";
      case "entrepreneur_phone_whatsapp":
        if (!value.trim()) return "Phone is required";
        if (!/^\d*$/.test(value)) return "Only digits allowed";
        if (value.length > 0 && value.length < 10) return `${value.length}/10 digits`;
        if (!isValidPhone(value)) return "Must be exactly 10 digits";
        return "";
      case "entrepreneur_business_name":
        if (!value.trim()) return "Business Name is required";
        if (hasNumbers(value)) return "Cannot contain numbers";
        return "";
      case "entrepreneur_business_type":
        return !value ? "Business Type is required" : "";
      case "entrepreneur_business_location":
        return !value.trim() ? "Location is required" : "";
      case "entrepreneur_sector":
        return !value ? "Select a sector" : "";
      case "entrepreneur_years_in_business":
        return !value ? "Select years in business" : "";
      case "entrepreneur_can_mentor":
        return !value ? "Select mentorship option" : "";
      default:
        return "";
    }
  }, []);

  const validateForm = () => {
    let errors = [];
    if (!selectedZone) errors.push("Zone is required");
    if (!selectedRegion) errors.push("Region is required");
    if (!selectedDivision) errors.push("Division is required");
    if (!formData.pastor_name.trim()) errors.push("Pastor's Name is required");
    else if (hasNumbers(formData.pastor_name)) errors.push("Pastor's Name cannot contain numbers");
    if (!formData.pastor_contact.trim()) errors.push("Pastor's Contact is required");
    else if (!isValidPhone(formData.pastor_contact)) errors.push("Pastor's Contact must be exactly 10 digits");
    if (!formData.entrepreneur_full_name.trim()) errors.push("Full Name is required");
    else if (hasNumbers(formData.entrepreneur_full_name)) errors.push("Full Name cannot contain numbers");
    if (!formData.entrepreneur_phone_whatsapp.trim()) errors.push("Phone is required");
    else if (!isValidPhone(formData.entrepreneur_phone_whatsapp)) errors.push("Phone must be exactly 10 digits");
    if (!formData.entrepreneur_business_name.trim()) errors.push("Business Name is required");
    else if (hasNumbers(formData.entrepreneur_business_name)) errors.push("Business Name cannot contain numbers");
    if (!formData.entrepreneur_business_type) errors.push("Business Type is required");
    if (!formData.entrepreneur_business_location.trim()) errors.push("Location of Business is required");
    if (!formData.entrepreneur_sector) errors.push("Select Business Sector");
    if (!formData.entrepreneur_years_in_business) errors.push("Select Years in Business");
    if (!formData.entrepreneur_can_mentor) errors.push("Select Mentorship option");
    return errors;
  };

  const markTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormData((curr) => {
      const err = validateField(name, curr[name] || "");
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
      return curr;
    });
  }, [validateField]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setTouched((prevT) => {
      if (prevT[name]) {
        const err = validateField(name, value);
        setFieldErrors((prevE) => ({ ...prevE, [name]: err }));
      }
      return prevT;
    });
  }, [validateField]);

  const handleBlur = useCallback((name) => () => markTouched(name), [markTouched]);

  const handleZoneChange = useCallback((e) => {
    const zone = e.target.value;
    setSelectedZone(zone);
    setSelectedRegion("");
    setSelectedDivision("");
    setFormData((prev) => ({ ...prev, zone, region: "", division: "" }));
    setTouched((prev) => ({ ...prev, zone: true, region: false, division: false }));
    setFieldErrors((prev) => ({ ...prev, zone: "", region: "", division: "" }));
  }, []);

  const handleRegionChange = useCallback((e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedDivision("");
    setFormData((prev) => ({ ...prev, region, division: "" }));
    setTouched((prev) => ({ ...prev, region: true, division: false }));
    setFieldErrors((prev) => ({ ...prev, region: "", division: "" }));
  }, []);

  const handleDivisionChange = useCallback((e) => {
    const division = e.target.value;
    setSelectedDivision(division);
    setFormData((prev) => ({ ...prev, division }));
    setTouched((prev) => ({ ...prev, division: true }));
    setFieldErrors((prev) => ({ ...prev, division: "" }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    const allErrors = {};
    Object.keys(formData).forEach((k) => {
      allTouched[k] = true;
      allErrors[k] = validateField(k, formData[k] || "");
    });
    allTouched.zone = true;
    allTouched.region = true;
    allTouched.division = true;
    allErrors.zone = !selectedZone ? "Zone is required" : "";
    allErrors.region = !selectedRegion ? "Region is required" : "";
    allErrors.division = !selectedDivision ? "Division is required" : "";
    setTouched(allTouched);
    setFieldErrors(allErrors);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors);
      return;
    }
    if (!window.confirm("Double-check all details before final submission.\n\nDo you want to submit now?")) return;
    setLoading(true);
    try {
      await axios.post(`/api/add-to-sheet/`, formData);
      setSubmitted(true);
      setSelectedZone("");
      setSelectedRegion("");
      setSelectedDivision("");
      setFormData({
        zone: "", region: "", division: "",
        pastor_name: "", pastor_contact: "",
        entrepreneur_full_name: "", entrepreneur_phone_whatsapp: "",
        entrepreneur_business_name: "", entrepreneur_business_type: "",
        entrepreneur_business_location: "", entrepreneur_sector: "",
        entrepreneur_years_in_business: "", entrepreneur_can_mentor: "",
      });
      setTouched({});
      setFieldErrors({});
    } catch (err) {
      setError([err.response?.data?.detail || err.message]);
    } finally {
      setLoading(false);
    }
  };

  const commonSelectProps = useCallback((name) => ({
    value: formData[name] || "",
    error: fieldErrors[name] || "",
    touched: !!touched[name],
    onChange: handleChange,
    onBlur: handleBlur(name),
  }), [formData, fieldErrors, touched, handleChange, handleBlur]);

  if (view === "admin") return <AdminApp onBack={() => setView("form")} />;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: C.bgGrad, padding: 0 }}>

        {/* ── Header ── */}
        <header className="p-hdr" style={{
          background: C.header,
          padding: "1.1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
            <img
              src="/dclmlogo.JPG" alt="DCLM"
              style={{ height: "44px", width: "auto", objectFit: "contain", borderRadius: "8px", background: "rgba(255,255,255,0.95)", padding: "4px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <h1 style={{ color: "#fff", fontSize: "clamp(0.95rem,2.5vw,1.15rem)", margin: 0, fontWeight: 800, lineHeight: 1.3, letterSpacing: "-.01em" }}>
                DCLM-Ghana Entrepreneurship Database
              </h1>
              <p style={{ color: "#94a3b8", fontSize: ".72rem", margin: "3px 0 0", fontWeight: 400, letterSpacing: ".01em" }}>
                Collect and manage entrepreneur data efficiently
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <div className="p-qr" style={{
              display: "flex", alignItems: "center", gap: ".55rem",
              background: "rgba(255,255,255,0.07)", borderRadius: "10px",
              padding: ".4rem .7rem", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <img src="/qr_code.png" alt="QR"
                style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#fff", padding: "2px" }} />
              <div>
                <p style={{ color: "#e2e8f0", fontSize: ".68rem", margin: 0, fontWeight: 600, lineHeight: 1.2 }}>Scan to open</p>
                <p style={{ color: "#64748b", fontSize: ".58rem", margin: 0, lineHeight: 1.2 }}>ent.dclmgh-report.com</p>
              </div>
            </div>
            <button
              onClick={() => setView("admin")}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px", padding: ".55rem .9rem", cursor: "pointer",
                color: "#e2e8f0", fontSize: ".75rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: ".4rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
              <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Admin
            </button>
          </div>
        </header>

        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "1.75rem 1rem 2.5rem" }}>

          {/* ── Alerts ── */}
          {error && (
            <div className="p-up p-shake" style={{
              background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderLeft: `4px solid ${C.danger}`,
              borderRadius: "12px", padding: "1rem 1.15rem", marginBottom: "1.25rem",
              boxShadow: "0 4px 16px rgba(220,38,38,0.08)",
            }}>
              <p style={{ margin: "0 0 .4rem", fontWeight: 700, fontSize: ".78rem", color: "#991b1b", textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: ".4rem" }}>
                <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Please fix the following
              </p>
              {error.map((msg, i) => (
                <p key={i} style={{ margin: ".2rem 0", fontSize: ".83rem", color: "#b91c1c", paddingLeft: "1.2rem" }}>• {msg}</p>
              ))}
            </div>
          )}
          {submitted && (
            <div className="p-up" style={{
              background: C.successBg, border: `1px solid ${C.successBorder}`, borderLeft: `4px solid ${C.success}`,
              borderRadius: "12px", padding: "1rem 1.15rem", marginBottom: "1.25rem",
              boxShadow: "0 4px 16px rgba(22,164,74,0.08)",
            }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: ".88rem", color: "#15803d", display: "flex", alignItems: "center", gap: ".4rem" }}>
                <svg style={{width:18,height:18,animation:"pCheckScale .4s ease"}} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
                Submitted successfully! Thank you for your entry.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* ── Section A: Region & Pastor ── */}
            <div className="p-card p-up p-up-d1">
              <SectionHeader number={1} title="Region & Pastor's Information" />
              <div style={{ padding: "1.35rem 1.5rem" }}>
                <div className="p-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".9rem", marginBottom: ".5rem" }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: ".72rem", display: "block", marginBottom: ".4rem", color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Zone <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
                    </label>
                    <select className={`p-inp p-sel ${touched.zone && fieldErrors.zone ? "p-err" : ""}`}
                      value={selectedZone} onChange={handleZoneChange}
                      onBlur={() => markTouched("zone")}>
                      <option value="">-- Select Zone --</option>
                      {Object.keys(zone_region_divisions).map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    {touched.zone && fieldErrors.zone && <p style={{ margin: ".3rem 0 0", fontSize: ".73rem", color: C.danger, fontWeight: 500, display: "flex", alignItems: "center", gap: ".3rem" }}><svg style={{width:12,height:12,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{fieldErrors.zone}</p>}
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: ".72rem", display: "block", marginBottom: ".4rem", color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Region <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
                    </label>
                    <select className={`p-inp p-sel ${touched.region && fieldErrors.region ? "p-err" : ""}`}
                      value={selectedRegion} onChange={handleRegionChange}
                      disabled={!selectedZone}
                      onBlur={() => markTouched("region")}>
                      <option value="">-- Select Region --</option>
                      {selectedZone && Object.keys(zone_region_divisions[selectedZone]).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {touched.region && fieldErrors.region && <p style={{ margin: ".3rem 0 0", fontSize: ".73rem", color: C.danger, fontWeight: 500, display: "flex", alignItems: "center", gap: ".3rem" }}><svg style={{width:12,height:12,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{fieldErrors.region}</p>}
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: ".72rem", display: "block", marginBottom: ".4rem", color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Division <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
                    </label>
                    <select className={`p-inp p-sel ${touched.division && fieldErrors.division ? "p-err" : ""}`}
                      value={selectedDivision} onChange={handleDivisionChange}
                      disabled={!selectedRegion}
                      onBlur={() => markTouched("division")}>
                      <option value="">-- Select Division --</option>
                      {selectedRegion && zone_region_divisions[selectedZone][selectedRegion].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {touched.division && fieldErrors.division && <p style={{ margin: ".3rem 0 0", fontSize: ".73rem", color: C.danger, fontWeight: 500, display: "flex", alignItems: "center", gap: ".3rem" }}><svg style={{width:12,height:12,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{fieldErrors.division}</p>}
                  </div>
                </div>
                <div className="p-g2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: ".9rem", marginTop: ".75rem" }}>
                  <FieldInput label="Pastor's Name" name="pastor_name" value={formData.pastor_name} error={fieldErrors.pastor_name} touched={!!touched.pastor_name} onChange={handleChange} onBlur={handleBlur("pastor_name")} />
                  <FieldInput label="Pastor's Contact" hint="10 digits" type="tel" maxLength={10} name="pastor_contact" value={formData.pastor_contact} error={fieldErrors.pastor_contact} touched={!!touched.pastor_contact} onChange={handleChange} onBlur={handleBlur("pastor_contact")} inputMode="numeric" pattern="\d*" />
                </div>
              </div>
            </div>

            {/* ── Section B: Entrepreneur Details ── */}
            <div className="p-card p-up p-up-d2">
              <SectionHeader number={2} title="Entrepreneur Details" />
              <div style={{ padding: "1.35rem 1.5rem" }}>
                <div className="p-g2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: ".9rem" }}>
                  <FieldInput label="Full Name" name="entrepreneur_full_name" value={formData.entrepreneur_full_name} error={fieldErrors.entrepreneur_full_name} touched={!!touched.entrepreneur_full_name} onChange={handleChange} onBlur={handleBlur("entrepreneur_full_name")} />
                  <FieldInput label="Phone / WhatsApp" hint="10 digits" type="tel" maxLength={10} name="entrepreneur_phone_whatsapp" value={formData.entrepreneur_phone_whatsapp} error={fieldErrors.entrepreneur_phone_whatsapp} touched={!!touched.entrepreneur_phone_whatsapp} onChange={handleChange} onBlur={handleBlur("entrepreneur_phone_whatsapp")} inputMode="numeric" pattern="\d*" />
                </div>
                <div style={{ marginTop: ".75rem" }}>
                  <FieldSelect label="Business Type" name="entrepreneur_business_type" {...commonSelectProps("entrepreneur_business_type")}>
                    <option value="">-- Select Business Type --</option>
                    {businessTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </FieldSelect>
                </div>
                <FieldInput label="Business Name" name="entrepreneur_business_name" value={formData.entrepreneur_business_name} error={fieldErrors.entrepreneur_business_name} touched={!!touched.entrepreneur_business_name} onChange={handleChange} onBlur={handleBlur("entrepreneur_business_name")} />
                <FieldInput label="Location of Business" hint="City, Town, District" name="entrepreneur_business_location" value={formData.entrepreneur_business_location} error={fieldErrors.entrepreneur_business_location} touched={!!touched.entrepreneur_business_location} onChange={handleChange} onBlur={handleBlur("entrepreneur_business_location")} />
                <div className="p-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".9rem", marginTop: ".5rem" }}>
                  <FieldSelect label="Sector" name="entrepreneur_sector" {...commonSelectProps("entrepreneur_sector")}>
                    <option value="">-- Select --</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Tech/ICT">Tech/ICT</option>
                    <option value="Trading/SME">Trading/SME</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Mining">Mining</option>
                    <option value="Other">Other</option>
                  </FieldSelect>
                  <FieldSelect label="Years in Business" name="entrepreneur_years_in_business" {...commonSelectProps("entrepreneur_years_in_business")}>
                    <option value="">-- Select --</option>
                    <option value="<1yr">&lt; 1 year</option>
                    <option value="1-3yrs">1–3 years</option>
                    <option value="3-5yrs">3–5 years</option>
                    <option value="5+yrs">5+ years</option>
                  </FieldSelect>
                  <FieldSelect label="Available to Mentor?" name="entrepreneur_can_mentor" {...commonSelectProps("entrepreneur_can_mentor")}>
                    <option value="">-- Select --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </FieldSelect>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="p-up p-up-d3" style={{ textAlign: "center", paddingTop: ".25rem" }}>
              <button type="submit" disabled={loading} className="p-btn p-btn-submit">
                {loading ? (
                  <>
                    <span style={{
                      width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      display: "inline-block", animation: "pSpin .6s linear infinite",
                    }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
                    Submit Form
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Footer ── */}
          <div style={{
            textAlign: "center", color: "#94a3b8", fontSize: ".7rem",
            marginTop: "2rem", borderTop: `1px solid ${C.border}`, paddingTop: "1rem",
            letterSpacing: ".01em",
          }}>
            DCLM-Ghana &middot; Entrepreneurship Database System &copy; 2026
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

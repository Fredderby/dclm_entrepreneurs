import { useState } from "react";
import axios from "axios";

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

function App() {
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

  const hasNumbers = (text) => /\d/.test(text);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleZoneChange = (e) => {
    const zone = e.target.value;
    setSelectedZone(zone);
    setSelectedRegion("");
    setSelectedDivision("");
    setFormData((prev) => ({ ...prev, zone, region: "", division: "" }));
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedDivision("");
    setFormData((prev) => ({ ...prev, region, division: "" }));
  };

  const handleDivisionChange = (e) => {
    const division = e.target.value;
    setSelectedDivision(division);
    setFormData((prev) => ({ ...prev, division }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setError([err.response?.data?.detail || err.message]);
    } finally {
      setLoading(false);
    }
  };

  const field = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "6px",
    border: "1.5px solid #d0d7de",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#fff",
    outline: "none",
    color: "#1a1a2e",
  };

  const lbl = {
    fontWeight: 600,
    fontSize: "0.8rem",
    display: "block",
    marginBottom: "0.35rem",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const req = <span style={{ color: "#dc2626" }}>*</span>;

  const Input = ({ label, hint, ...props }) => (
    <div style={{ marginBottom: "0.9rem" }}>
      <label style={lbl}>
        {label} {hint && <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.75rem", textTransform: "none", letterSpacing: 0 }}>{hint}</span>} {req}
      </label>
      <input className="fi" style={field} {...props} />
    </div>
  );

  const Select = ({ label, children, ...props }) => (
    <div style={{ marginBottom: "0.9rem" }}>
      <label style={lbl}>{label} {req}</label>
      <select className="fs" style={field} {...props}>{children}</select>
    </div>
  );

  return (
    <>
      <style>{`
        body { margin:0; padding:0; background:#eef1f6; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,sans-serif; }
        *,*::before,*::after { box-sizing:border-box; }
        .fi:focus,.fs:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.15) !important; }
        .fi:hover,.fs:hover { border-color:#93c5fd; }
        .fs:disabled { background:#f3f4f6 !important; color:#9ca3af !important; cursor:not-allowed; }
        .sub:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 25px rgba(37,99,235,0.35) !important; }
        .sub:active:not(:disabled) { transform:translateY(0); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation:fadeUp 0.4s ease-out both; }
        .fade-up-1 { animation-delay:0.05s; }
        .fade-up-2 { animation-delay:0.15s; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner { display:inline-block; width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; vertical-align:middle; margin-right:8px; }
        @media(max-width:640px){
          .g3,.g2 { grid-template-columns:1fr !important; }
          .hdr { flex-direction:column; text-align:center; }
          .qr-box { margin-top:0.75rem; }
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#e8ecf4 0%,#f4f6fa 40%,#eef1f6 100%)", padding:"0" }}>

        {/* ── Header ── */}
        <header className="hdr" style={{
          background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
          padding:"1.25rem 2rem",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          flexWrap:"wrap",
          gap:"1rem",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.85rem" }}>
            <img
              src="/dclmlogo.JPG" alt="DCLM"
              style={{ height:"44px", width:"auto", objectFit:"contain", borderRadius:"6px", background:"rgba(255,255,255,0.95)", padding:"4px 6px" }}
              onError={(e) => { e.target.style.display="none"; }}
            />
            <div>
              <h1 style={{ color:"#fff", fontSize:"clamp(0.95rem,2.5vw,1.2rem)", margin:0, fontWeight:700, lineHeight:1.3 }}>
                DCLM-Ghana Entrepreneurship Database
              </h1>
              <p style={{ color:"#94a3b8", fontSize:"0.75rem", margin:"2px 0 0", fontWeight:400 }}>
                Collect and manage entrepreneur data efficiently
              </p>
            </div>
          </div>
          <div className="qr-box" style={{
            display:"flex", alignItems:"center", gap:"0.6rem",
            background:"rgba(255,255,255,0.08)", borderRadius:"8px",
            padding:"0.45rem 0.75rem", border:"1px solid rgba(255,255,255,0.1)",
          }}>
            <img src="/qr_code.png" alt="QR"
              style={{ width:"44px", height:"44px", borderRadius:"4px", background:"#fff", padding:"2px" }} />
            <div>
              <p style={{ color:"#e2e8f0", fontSize:"0.7rem", margin:0, fontWeight:600, lineHeight:1.2 }}>Scan to open</p>
              <p style={{ color:"#64748b", fontSize:"0.6rem", margin:0, lineHeight:1.2 }}>ent.dclmgh-report.com</p>
            </div>
          </div>
        </header>

        <div style={{ maxWidth:"760px", margin:"0 auto", padding:"1.75rem 1rem 2.5rem" }}>

          {/* ── Alerts ── */}
          {error && (
            <div className="fade-up" style={{
              background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626",
              borderRadius:"8px", padding:"0.85rem 1rem", marginBottom:"1.25rem",
            }}>
              <p style={{ margin:"0 0 0.35rem", fontWeight:700, fontSize:"0.82rem", color:"#991b1b", textTransform:"uppercase", letterSpacing:"0.03em" }}>Please fix the following</p>
              {error.map((msg, i) => (
                <p key={i} style={{ margin:"0.15rem 0", fontSize:"0.85rem", color:"#b91c1c" }}>• {msg}</p>
              ))}
            </div>
          )}
          {submitted && (
            <div className="fade-up" style={{
              background:"#f0fdf4", border:"1px solid #bbf7d0", borderLeft:"4px solid #16a34a",
              borderRadius:"8px", padding:"0.85rem 1rem", marginBottom:"1.25rem",
            }}>
              <p style={{ margin:0, fontWeight:600, fontSize:"0.9rem", color:"#15803d" }}>Submitted successfully! Thank you for your entry.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

            {/* ── Section A ── */}
            <div className="fade-up fade-up-1" style={{
              background:"#fff", borderRadius:"10px", border:"1px solid #e2e8f0",
              boxShadow:"0 1px 3px rgba(0,0,0,0.04)", overflow:"hidden",
            }}>
              <div style={{
                padding:"0.9rem 1.5rem",
                background:"linear-gradient(90deg,#1e40af 0%,#2563eb 100%)",
                display:"flex", alignItems:"center", gap:"0.65rem",
              }}>
                <span style={{
                  width:"24px", height:"24px", borderRadius:"50%", background:"rgba(255,255,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.7rem", fontWeight:700, color:"#fff", flexShrink:0,
                }}>1</span>
                <h3 style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#fff" }}>Region & Pastor's Information</h3>
              </div>
              <div style={{ padding:"1.25rem 1.5rem" }}>
                <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.9rem", marginBottom:"0.75rem" }}>
                  <Select label="Zone" value={selectedZone} onChange={handleZoneChange}>
                    <option value="">-- Select Zone --</option>
                    {Object.keys(zone_region_divisions).map(z => <option key={z} value={z}>{z}</option>)}
                  </Select>
                  <Select label="Region" value={selectedRegion} onChange={handleRegionChange} disabled={!selectedZone}>
                    <option value="">-- Select Region --</option>
                    {selectedZone && Object.keys(zone_region_divisions[selectedZone]).map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                  <Select label="Division" value={selectedDivision} onChange={handleDivisionChange} disabled={!selectedRegion}>
                    <option value="">-- Select Division --</option>
                    {selectedRegion && zone_region_divisions[selectedZone][selectedRegion].map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div className="g2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"0.9rem" }}>
                  <Input label="Pastor's Name" name="pastor_name" value={formData.pastor_name} onChange={handleChange} />
                  <Input label="Pastor's Contact" hint="(10 digits)" type="tel" maxLength={10} name="pastor_contact" value={formData.pastor_contact} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* ── Section B ── */}
            <div className="fade-up fade-up-2" style={{
              background:"#fff", borderRadius:"10px", border:"1px solid #e2e8f0",
              boxShadow:"0 1px 3px rgba(0,0,0,0.04)", overflow:"hidden",
            }}>
              <div style={{
                padding:"0.9rem 1.5rem",
                background:"linear-gradient(90deg,#1e40af 0%,#2563eb 100%)",
                display:"flex", alignItems:"center", gap:"0.65rem",
              }}>
                <span style={{
                  width:"24px", height:"24px", borderRadius:"50%", background:"rgba(255,255,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.7rem", fontWeight:700, color:"#fff", flexShrink:0,
                }}>2</span>
                <h3 style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#fff" }}>Entrepreneur Details</h3>
              </div>
              <div style={{ padding:"1.25rem 1.5rem" }}>
                <div className="g2" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"0.9rem" }}>
                  <Input label="Full Name" name="entrepreneur_full_name" value={formData.entrepreneur_full_name} onChange={handleChange} />
                  <Input label="Phone / WhatsApp" type="tel" maxLength={10} name="entrepreneur_phone_whatsapp" value={formData.entrepreneur_phone_whatsapp} onChange={handleChange} />
                </div>
                <Select label="Business Type" name="entrepreneur_business_type" value={formData.entrepreneur_business_type} onChange={handleChange}>
                  <option value="">-- Select Business Type --</option>
                  {businessTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </Select>
                <Input label="Business Name" name="entrepreneur_business_name" value={formData.entrepreneur_business_name} onChange={handleChange} />
                <Input label="Location of Business" name="entrepreneur_business_location" value={formData.entrepreneur_business_location} onChange={handleChange} placeholder="e.g. City, Town, District" />
                <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.9rem" }}>
                  <Select label="Sector" name="entrepreneur_sector" value={formData.entrepreneur_sector} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Tech/ICT">Tech/ICT</option>
                    <option value="Trading/SME">Trading/SME</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Mining">Mining</option>
                    <option value="Other">Other</option>
                  </Select>
                  <Select label="Years in Business" name="entrepreneur_years_in_business" value={formData.entrepreneur_years_in_business} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option value="<1yr">&lt; 1 year</option>
                    <option value="1-3yrs">1–3 years</option>
                    <option value="3-5yrs">3–5 years</option>
                    <option value="5+yrs">5+ years</option>
                  </Select>
                  <Select label="Available to Mentor?" name="entrepreneur_can_mentor" value={formData.entrepreneur_can_mentor} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="fade-up" style={{ textAlign:"center", paddingTop:"0.25rem" }}>
              <button type="submit" disabled={loading} className="sub" style={{
                padding:"0.8rem 3rem",
                background: loading ? "#60a5fa" : "linear-gradient(135deg,#1d4ed8,#2563eb)",
                color:"#fff", border:"none", borderRadius:"8px", fontWeight:600,
                fontSize:"0.9rem", cursor: loading ? "not-allowed" : "pointer",
                minWidth:"220px", boxShadow:"0 2px 10px rgba(37,99,235,0.25)",
                transition:"all 0.2s ease", letterSpacing:"0.02em",
              }}>
                {loading ? <><span className="spinner" /> Submitting...</> : "Submit Form"}
              </button>
            </div>
          </form>

          {/* ── Footer ── */}
          <div style={{
            textAlign:"center", color:"#94a3b8", fontSize:"0.72rem",
            marginTop:"2rem", borderTop:"1px solid #e2e8f0", paddingTop:"1rem",
          }}>
            DCLM-Ghana &middot; Entrepreneurship Database System &copy; 2026
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

import { useState } from 'react';
import axios from 'axios';

// ✅ Correct API URL — matches backend port & prefix
const API_URL = "";

const zone_region_divisions = {
    "Central Western Zone": {
        "Tarkwa": ["Tarkwa div", "Enchi", "Asankragua"],
        "Takoradi": ["Takoradi div", "Axim", "Half Assini"],
        "Cape Coast": ["Cape Coast div", "Swedru", "Assin Fosu", "Mankessim", "Winneba", "Elmina", "Asikuma"]
    },
    "Greater Accra Zone": {
        "Accra Metro": ["Accra Metro div"],
        "Kasoa": ["Kasoa div", "Weija"],
        "Madina": ["Madina div", "La Dadekotopon"],
        "Tema": ["Tema div", "Ashaiman", "Teshie-Nungua"],
        "Ga Central": ["Ga-Central div", "Nsawam", "Amasaman"]
    },
    "Ashanti Zone A": {
        "Bibiani": ["Bibiani div", "Wiawso", "Essam Debiso"],
        "Kumasi South": ["Kumasi South div", "Bohyen"],
        "Obuasi": ["Obuasi div", "Dunkwa", "Bekwai", "Subin", "New Edubiase"],
        "Nkawie": ["Nkawie div", "Mankranso"]
    },
    "Ashanti Zone B": {
        "Kumasi North": ["Kumasi North div", "Offinso", "Asokore Mampong"],
        "Mampong": ["Mampong div", "Atebubu", "Effiduase", "Ejura"],
        "Konongo": ["Konongo div", "Agogo", "Juaso", "Ejisu"]
    },
    "Middle Belt Zone": {
        "Sunyani": ["Sunyani div", "Dormaa Ahenkro", "Berekum", "Bechem", "Sampa"],
        "Techiman": ["Techiman div", "Kintampo", "Wenchi", "Nkoranza"],
        "Goaso": ["Goaso div", "Mim", "Kenyase", "Tepa"]
    },
    "Eastern Volta Zone": {
        "Koforidua": ["Koforidua div", "Akropong", "Suhum", "Odumase"],
        "Akim Oda": ["Akim Oda div", "Donkorkrom", "Nkawkaw", "Asamankese"],
        "Ho": ["Ho div", "Akatsi", "Keta", "Aflao"],
        "Hohoe": ["Hohoe div", "Kpando", "Nkwanta", "Krachi"]
    },
    "Northern Zone": {
        "Bolga": ["Bolga div", "Bawku", "Navrongo", "Walewale"],
        "Wa": ["Wa div", "Tumu", "Bole"],
        "Tamale": ["Tamale div", "Yendi", "Damango", "Salaga", "Buipe"]
    }
};

function App() {
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  const [formData, setFormData] = useState({
    region_division_group_name: "",
    enterprise_coordinator_name: "",
    enterprise_coordinator_contact: "",
    entrepreneur_full_name: "",
    entrepreneur_phone_whatsapp: "",
    entrepreneur_business_name_type: "",
    entrepreneur_sector: "",
    entrepreneur_years_in_business: "",
    entrepreneur_can_mentor: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasNumbers = (text) => /\d/.test(text);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  const validateForm = () => {
    let errors = [];
    if (!selectedZone) errors.push("• Zone is required");
    if (!selectedRegion) errors.push("• Region is required");
    if (!selectedDivision) errors.push("• Division is required");

    if (!formData.enterprise_coordinator_name.trim()) errors.push("• Coordinator Name is required");
    else if (hasNumbers(formData.enterprise_coordinator_name)) errors.push("• Coordinator Name cannot contain numbers");

    if (!formData.enterprise_coordinator_contact.trim()) errors.push("• Coordinator Contact is required");
    else if (!isValidPhone(formData.enterprise_coordinator_contact)) errors.push("• Coordinator Contact must be exactly 10 digits");

    if (!formData.entrepreneur_full_name.trim()) errors.push("• Entrepreneur: Full Name required");
    else if (hasNumbers(formData.entrepreneur_full_name)) errors.push("• Entrepreneur: Name cannot have numbers");

    if (!formData.entrepreneur_phone_whatsapp.trim()) errors.push("• Entrepreneur: Phone required");
    else if (!isValidPhone(formData.entrepreneur_phone_whatsapp)) errors.push("• Entrepreneur: Phone must be 10 digits");

    if (!formData.entrepreneur_business_name_type.trim()) errors.push("• Entrepreneur: Business Name required");
    else if (hasNumbers(formData.entrepreneur_business_name_type)) errors.push("• Entrepreneur: Business Name cannot have numbers");

    if (!formData.entrepreneur_sector) errors.push("• Entrepreneur: Select Business Sector");
    if (!formData.entrepreneur_years_in_business) errors.push("• Entrepreneur: Select Years in Business");
    if (!formData.entrepreneur_can_mentor) errors.push("• Entrepreneur: Select Mentorship option");

    return errors;
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
    setError(null);
  };

  const handleZoneChange = (e) => {
    const zone = e.target.value;
    setSelectedZone(zone);
    setSelectedRegion("");
    setSelectedDivision("");
    setFormData(prev => ({ ...prev, region_division_group_name: zone }));
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedDivision("");
    setFormData(prev => ({ 
      ...prev, 
      region_division_group_name: selectedZone && region ? `${selectedZone} → ${region}` : selectedZone 
    }));
  };

  const handleDivisionChange = (e) => {
    const division = e.target.value;
    setSelectedDivision(division);
    setFormData(prev => ({ 
      ...prev, 
      region_division_group_name: selectedZone && selectedRegion && division 
        ? `${selectedZone} → ${selectedRegion} → ${division}` 
        : prev.region_division_group_name 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError("Please fix these issues:\n" + validationErrors.join("\n"));
      return;
    }
    if (!window.confirm("⚠️ Double-check all details before final submission.\n\nDo you want to submit now?")) return;
    setLoading(true);
    try {
      // ✅ Send data exactly matching MySQL schema
      await axios.post(`/api/add-to-sheet/`, formData);
      setSubmitted(true);
      setSelectedZone(""); setSelectedRegion(""); setSelectedDivision("");
      setFormData({
        region_division_group_name: "",
        enterprise_coordinator_name: "",
        enterprise_coordinator_contact: "",
        entrepreneur_full_name: "",
        entrepreneur_phone_whatsapp: "",
        entrepreneur_business_name_type: "",
        entrepreneur_sector: "",
        entrepreneur_years_in_business: "",
        entrepreneur_can_mentor: ""
      });
    } catch (err) {
      setError("Submission failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eaf4ff 0%, #f0f8ff 100%)', 
      padding: '1.5rem 1rem', 
      fontFamily: 'Segoe UI, Roboto, sans-serif', 
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '820px', 
        margin: '0 auto', 
        background: '#ffffff', 
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(26, 115, 232, 0.12)', 
        padding: '2rem 1.5rem 2.5rem',
        border: '1px solid rgba(26, 115, 232, 0.08)', 
        width: '100%', 
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '2.5rem',
          borderBottom: '2px solid #eaf4ff', 
          padding: '1.5rem',
          flexWrap: 'nowrap',
          minWidth: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          borderRadius: '12px'
        }}>
          <img 
            src="/dclmlogo.JPG" 
            alt="Logo" 
            style={{ 
              height: 'clamp(45px, 10vw, 75px)', 
              width: 'auto',
              objectFit: 'contain',
              flexShrink: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '0.4rem',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.insertAdjacentHTML('afterend', '<div style="font-weight:bold; font-size:clamp(1.1rem,4vw,1.4rem); color:#1a73e8; background:rgba(255,255,255,0.9); padding:0.5rem 0.7rem; border-radius:10px; flex-shrink:0;">DCLM</div>');
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ 
              color: '#1a73e8', 
              fontSize: 'clamp(1.1rem, 3.5vw, 1.9rem)', 
              margin: 0, 
              fontWeight: 700,
              lineHeight: 1.3,
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)'
            }}>
              DCLM-Ghana Entrepreneurship Database
            </h1>
          </div>
        </div>

        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: '4px solid #c62828', whiteSpace: 'pre-line', lineHeight: '1.5' }}>❌ {error}</div>}
        {submitted && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: '4px solid #2e7d32' }}>✅ Submitted successfully!</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ 
            background: '#f8fbff', 
            padding: '1.8rem 1.5rem', 
            borderRadius: '16px', 
            border: '1px solid #eaf4ff', 
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ 
              color: '#1a73e8', 
              marginTop: 0, 
              marginBottom: '1.5rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem',
              fontSize: '1.1rem'
            }}>
              <span style={{
                background:'#1a73e8',
                color:'white',
                width:'26px',
                height:'26px',
                borderRadius:'50%',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize:'0.9rem',
                flexShrink: 0
              }}>A</span>
              Region/Division Information
            </h3>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '1.4rem', 
              marginBottom: '1.5rem',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ width: '100%' }}>
                <label style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>Zone <span style={{color:'red'}}>*</span></label>
                <select value={selectedZone} onChange={handleZoneChange} required style={{width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #cfd8dc', fontSize: '0.95rem', boxSizing: 'border-box'}}>
                  <option value="">-- Select Zone --</option>
                  {Object.keys(zone_region_divisions).map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>Region <span style={{color:'red'}}>*</span></label>
                <select value={selectedRegion} onChange={handleRegionChange} required disabled={!selectedZone} style={{width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #cfd8dc', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: selectedZone ? 'white' : '#f5f5f5'}}>
                  <option value="">-- Select Region --</option>
                  {selectedZone && Object.keys(zone_region_divisions[selectedZone]).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>Division <span style={{color:'red'}}>*</span></label>
                <select value={selectedDivision} onChange={handleDivisionChange} required disabled={!selectedRegion} style={{width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #cfd8dc', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: selectedRegion ? 'white' : '#f5f5f5'}}>
                  <option value="">-- Select Division --</option>
                  {selectedRegion && zone_region_divisions[selectedZone][selectedRegion].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={{marginBottom: '1.5rem', width: '100%', boxSizing: 'border-box'}}>
              <label style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>Full Location</label>
              <input type="text" name="region_division_group_name" value={formData.region_division_group_name} readOnly style={{width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #e0e7ee', backgroundColor: '#f8f9fa', fontSize: '0.95rem', boxSizing: 'border-box'}} />
            </div>

            <div style={{marginBottom: '1.2rem', width: '100%', boxSizing: 'border-box'}}>
              <label style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>Coordinator Name <span style={{color:'red'}}>*</span></label>
              <input type="text" name="enterprise_coordinator_name" value={formData.enterprise_coordinator_name} onChange={handleChange} required style={{width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #cfd8dc', fontSize: '0.95rem', boxSizing: 'border-box'}} />
            </div>
            <div style={{width: '100%', boxSizing: 'border-box'}}>
              <label style={{ fontWeight: 500, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>Coordinator Contact <small style={{color:'#78909c', fontWeight: 'normal'}}>(10 digits)</small> <span style={{color:'red'}}>*</span></label>
              <input type="tel" maxLength={10} name="enterprise_coordinator_contact" value={formData.enterprise_coordinator_contact} onChange={handleChange} required style={{width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #cfd8dc', fontSize: '0.95rem', boxSizing: 'border-box'}} />
            </div>
          </div>

          <div style={{ 
            background: '#f8fbff', 
            padding: '1.8rem 1.5rem', 
            borderRadius: '16px', 
            border: '1px solid #eaf4ff', 
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ 
              color: '#1a73e8', 
              marginTop: 0, 
              marginBottom: '1.5rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem',
              fontSize: '1.1rem'
            }}>
              <span style={{
                background:'#1a73e8',
                color:'white',
                width:'26px',
                height:'26px',
                borderRadius:'50%',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize:'0.9rem',
                flexShrink: 0
              }}>B</span>
              Entrepreneur Details
            </h3>

            <div style={{
              background:'white',
              padding:'1.5rem',
              borderRadius:'12px',
              border:'1px solid #e0e7ee',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
                gap:'1.4rem',
                marginBottom:'1.5rem',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{width: '100%', boxSizing: 'border-box'}}>
                  <label style={{ fontSize:'0.95rem', display:'block', marginBottom:'0.5rem' }}>Full Name <span style={{color:'red'}}>*</span></label>
                  <input type="text" name="entrepreneur_full_name" value={formData.entrepreneur_full_name} onChange={handleChange} required style={{width:'100%', padding:'0.9rem 1rem', borderRadius:'8px', border:'1px solid #cfd8dc', fontSize:'0.95rem', boxSizing: 'border-box'}} />
                </div>
                <div style={{width: '100%', boxSizing: 'border-box'}}>
                  <label style={{ fontSize:'0.95rem', display:'block', marginBottom:'0.5rem' }}>Phone / WhatsApp <span style={{color:'red'}}>*</span></label>
                  <input type="tel" maxLength={10} name="entrepreneur_phone_whatsapp" value={formData.entrepreneur_phone_whatsapp} onChange={handleChange} required style={{width:'100%', padding:'0.9rem 1rem', borderRadius:'8px', border:'1px solid #cfd8dc', fontSize:'0.95rem', boxSizing: 'border-box'}} />
                </div>
              </div>

              <div style={{marginBottom:'1.5rem', width: '100%', boxSizing: 'border-box'}}>
                <label style={{ fontSize:'0.95rem', display:'block', marginBottom:'0.5rem' }}>Business Name & Type <span style={{color:'red'}}>*</span></label>
                <input type="text" name="entrepreneur_business_name_type" value={formData.entrepreneur_business_name_type} onChange={handleChange} required style={{width:'100%', padding:'0.9rem 1rem', borderRadius:'8px', border:'1px solid #cfd8dc', fontSize:'0.95rem', boxSizing: 'border-box'}} />
              </div>

              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
                gap:'1.2rem',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{width: '100%', boxSizing: 'border-box'}}>
                  <label style={{ fontSize:'0.95rem', display:'block', marginBottom:'0.5rem' }}>Sector <span style={{color:'red'}}>*</span></label>
                  <select name="entrepreneur_sector" value={formData.entrepreneur_sector} onChange={handleChange} required style={{width:'100%', padding:'0.9rem 1rem', borderRadius:'8px', border:'1px solid #cfd8dc', fontSize:'0.95rem', boxSizing: 'border-box'}}>
                    <option value="">-- Select --</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Tech/ICT">Tech/ICT</option>
                    <option value="Trading/SME">Trading/SME</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Mining">Mining</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{width: '100%', boxSizing: 'border-box'}}>
                  <label style={{ fontSize:'0.95rem', display:'block', marginBottom:'0.5rem' }}>Years in Business <span style={{color:'red'}}>*</span></label>
                  <select name="entrepreneur_years_in_business" value={formData.entrepreneur_years_in_business} onChange={handleChange} required style={{width:'100%', padding:'0.9rem 1rem', borderRadius:'8px', border:'1px solid #cfd8dc', fontSize:'0.95rem', boxSizing: 'border-box'}}>
                    <option value="">-- Select --</option>
                    <option value="<1yr">&lt; 1 year</option>
                    <option value="1-3yrs">1–3 years</option>
                    <option value="3-5yrs">3–5 years</option>
                    <option value="5+yrs">5+ years</option>
                  </select>
                </div>
                <div style={{width: '100%', boxSizing: 'border-box'}}>
                  <label style={{ fontSize:'0.95rem', display:'block', marginBottom:'0.5rem' }}>Can Mentor? <span style={{color:'red'}}>*</span></label>
                  <select name="entrepreneur_can_mentor" value={formData.entrepreneur_can_mentor} onChange={handleChange} required style={{width:'100%', padding:'0.9rem 1rem', borderRadius:'8px', border:'1px solid #cfd8dc', fontSize:'0.95rem', boxSizing: 'border-box'}}>
                    <option value="">-- Select --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{textAlign:'center', marginTop: '0.5rem'}}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                padding:'1rem 3.5rem',
                background: loading ? '#90caf9' : 'linear-gradient(135deg,#1a73e8,#0d47a1)',
                color:'white',
                border:'none',
                borderRadius:'10px',
                fontWeight:600,
                fontSize:'1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: '180px'
              }}
            >
              {loading ? "Processing..." : "✓ Submit Form"}
            </button>
          </div>
        </form>

        <div style={{
          textAlign:'center',
          color:'#78909c',
          fontSize:'0.85rem',
          marginTop:'2.5rem',
          borderTop:'1px solid #eaf4ff',
          paddingTop:'1.2rem'
        }}>
          DCLM-Ghana • Entrepreneurship Database System
        </div>
      </div>
    </div>
  );
}

export default App;
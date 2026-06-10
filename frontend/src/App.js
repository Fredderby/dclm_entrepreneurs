import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8080";

// ✅ YOUR EXACT ZONE-REGION-DIVISION DATA
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
  const [settings, setSettings] = useState({
    num_entrepreneurs: 2,
    num_professionals: 2
  });
  const [step, setStep] = useState(1);

  // ✅ DROPDOWN STATE
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  const [formData, setFormData] = useState({
    region_division_group_name: "",
    enterprise_coordinator_name: "",
    enterprise_coordinator_contact: "",
    entrepreneurs: [],
    professionals: [],
    investment_opportunities: "",
    diaspora_name: "",
    diaspora_country: "",
    diaspora_skill_interest: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ VALIDATION HELPERS
  const hasNumbers = (text) => /\d/.test(text);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  // ✅ FULL FORM VALIDATION
  const validateForm = () => {
    let errors = [];

    if (!selectedZone) errors.push("• Zone is required");
    if (!selectedRegion) errors.push("• Region is required");
    if (!selectedDivision) errors.push("• Division is required");

    if (!formData.enterprise_coordinator_name.trim()) errors.push("• Coordinator Name is required");
    else if (hasNumbers(formData.enterprise_coordinator_name)) errors.push("• Coordinator Name cannot contain numbers");

    if (!formData.enterprise_coordinator_contact.trim()) errors.push("• Coordinator Contact is required");
    else if (!isValidPhone(formData.enterprise_coordinator_contact)) errors.push("• Coordinator Contact must be exactly 10 digits");

    // Validate Entrepreneurs
    formData.entrepreneurs.forEach((ent, idx) => {
      if (!ent.full_name.trim()) errors.push(`• Entrepreneur ${idx+1}: Full Name required`);
      else if (hasNumbers(ent.full_name)) errors.push(`• Entrepreneur ${idx+1}: Name cannot have numbers`);

      if (!ent.phone_whatsapp.trim()) errors.push(`• Entrepreneur ${idx+1}: Phone required`);
      else if (!isValidPhone(ent.phone_whatsapp)) errors.push(`• Entrepreneur ${idx+1}: Phone must be 10 digits`);

      if (!ent.business_name_type.trim()) errors.push(`• Entrepreneur ${idx+1}: Business Name required`);
      else if (hasNumbers(ent.business_name_type)) errors.push(`• Entrepreneur ${idx+1}: Business Name cannot have numbers`);

      if (!ent.sector) errors.push(`• Entrepreneur ${idx+1}: Select Business Sector`);
      if (!ent.years_in_business) errors.push(`• Entrepreneur ${idx+1}: Select Years in Business`);
      if (!ent.can_mentor) errors.push(`• Entrepreneur ${idx+1}: Select Mentorship option`);
    });

    // Validate Professionals
    formData.professionals.forEach((prof, idx) => {
      if (!prof.full_name.trim()) errors.push(`• Professional ${idx+1}: Full Name required`);
      else if (hasNumbers(prof.full_name)) errors.push(`• Professional ${idx+1}: Name cannot have numbers`);

      if (!prof.skill_profession.trim()) errors.push(`• Professional ${idx+1}: Skill/Profession required`);
      else if (hasNumbers(prof.skill_profession)) errors.push(`• Professional ${idx+1}: Skill cannot have numbers`);

      if (!prof.willing_to_train) errors.push(`• Professional ${idx+1}: Select Training option`);
    });

    return errors;
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const entrepreneurs = Array.from({ length: settings.num_entrepreneurs }, () => ({
      full_name: "", phone_whatsapp: "", business_name_type: "", sector: "", years_in_business: "", can_mentor: ""
    }));
    const professionals = Array.from({ length: settings.num_professionals }, () => ({
      full_name: "", skill_profession: "", willing_to_train: ""
    }));
    setFormData(prev => ({ ...prev, entrepreneurs, professionals }));
    setStep(2);
  };

  const handleChange = (e, section, index, field) => {
    const val = e.target.value;
    if (section) {
      setFormData(prev => {
        const arr = [...prev[section]];
        arr[index] = { ...arr[index], [field]: val };
        return { ...prev, [section]: arr };
      });
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: val }));
    }
    setError(null);
  };

  // ✅ DEPENDENT DROPDOWN LOGIC
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
      const payload = { ...formData, ...settings };
      await axios.post(`${API_URL}/add-to-sheet/`, payload);
      setSubmitted(true);
      // Reset everything
      setStep(1);
      setSelectedZone(""); setSelectedRegion(""); setSelectedDivision("");
      setFormData({
        region_division_group_name: "", enterprise_coordinator_name: "", enterprise_coordinator_contact: "",
        entrepreneurs: [], professionals: [], investment_opportunities: "", diaspora_name: "", diaspora_country: "", diaspora_skill_interest: ""
      });
    } catch (err) {
      setError("Submission failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', background: 'linear-gradient(135deg, #eaf4ff 0%, #f0f8ff 100%)', 
      padding: '1rem 0.8rem', fontFamily: 'Segoe UI, Roboto, sans-serif', boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '820px', margin: '0 auto', background: '#ffffff', borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(26, 115, 232, 0.12)', padding: '1.5rem 1.2rem 2rem',
        border: '1px solid rgba(26, 115, 232, 0.08)', width: '100%', boxSizing: 'border-box'
      }}>
        {/* HEADER */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem',
          borderBottom: '2px solid #eaf4ff', paddingBottom: '1rem', flexWrap: 'wrap'
        }}>
          <img 
            src="/dclmlogo.JPG" alt="Logo" 
            style={{ height: 'clamp(50px, 12vw, 75px)', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.insertAdjacentHTML('afterend', '<div style="font-weight:bold; font-size:clamp(1.1rem,4vw,1.4rem); color:#1a73e8; background:#eaf4ff; padding:0.5rem 0.7rem; border-radius:10px;">DCLM</div>');
            }}
          />
          <div>
            <h1 style={{ color: '#1a73e8', fontSize: 'clamp(1.3rem, 4.5vw, 1.9rem)', margin: 0, fontWeight: 700 }}>
              DCLM-Ghana Entrepreneurship Database
            </h1>
            <h2 style={{ color: '#2c3e50', fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', margin: '0.3rem 0 0', opacity: 0.85 }}>
              Let Africa Go - Member Skills & Business Mapping
            </h2>
          </div>
        </div>

        {/* MESSAGES */}
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '0.9rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '4px solid #c62828', whiteSpace: 'pre-line' }}>❌ {error}</div>}
        {submitted && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.9rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '4px solid #2e7d32' }}>✅ Submitted successfully!</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ background: '#f8fbff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #eaf4ff' }}>
            <h3 style={{ color: '#1a73e8', marginTop: 0 }}>Step 1: Set Number of Entries</h3>
            <form onSubmit={handleSettingsSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Entrepreneurs <span style={{color:'red'}}>*</span></label>
                  <input type="number" min="1" max="10" value={settings.num_entrepreneurs} onChange={(e)=>setSettings(p=>({...p,num_entrepreneurs:+e.target.value}))} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc'}} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Professionals <span style={{color:'red'}}>*</span></label>
                  <input type="number" min="1" max="10" value={settings.num_professionals} onChange={(e)=>setSettings(p=>({...p,num_professionals:+e.target.value}))} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc'}} />
                </div>
              </div>
              <button type="submit" style={{marginTop:'1.5rem',padding:'0.85rem 2rem',background:'linear-gradient(135deg,#1a73e8,#0d47a1)',color:'white',border:'none',borderRadius:'10px',fontWeight:600,cursor:'pointer'}}>Continue →</button>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            {/* SECTION A: DROPDOWNS */}
            <div style={{ background: '#f8fbff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #eaf4ff', marginBottom: '1.8rem' }}>
              <h3 style={{ color: '#1a73e8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{background:'#1a73e8',color:'white',width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>A</span>
                Region/Division Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                {/* Zone */}
                <div>
                  <label style={{fontWeight:500,fontSize:'0.9rem'}}>Zone <span style={{color:'red'}}>*</span></label>
                  <select value={selectedZone} onChange={handleZoneChange} required style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}}>
                    <option value="">-- Select Zone --</option>
                    {Object.keys(zone_region_divisions).map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                {/* Region */}
                <div>
                  <label style={{fontWeight:500,fontSize:'0.9rem'}}>Region <span style={{color:'red'}}>*</span></label>
                  <select value={selectedRegion} onChange={handleRegionChange} required disabled={!selectedZone} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem', background: selectedZone ? 'white' : '#f5f5f5'}}>
                    <option value="">-- Select Region --</option>
                    {selectedZone && Object.keys(zone_region_divisions[selectedZone]).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {/* Division */}
                <div>
                  <label style={{fontWeight:500,fontSize:'0.9rem'}}>Division <span style={{color:'red'}}>*</span></label>
                  <select value={selectedDivision} onChange={handleDivisionChange} required disabled={!selectedRegion} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem', background: selectedRegion ? 'white' : '#f5f5f5'}}>
                    <option value="">-- Select Division --</option>
                    {selectedRegion && zone_region_divisions[selectedZone][selectedRegion].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Read-only combined location */}
              <div style={{margin:'1rem 0'}}>
                <label style={{fontWeight:500,fontSize:'0.9rem'}}>Full Location</label>
                <input type="text" name="region_division_group_name" value={formData.region_division_group_name} readOnly style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #e0e7ee',background:'#f8f9fa',marginTop:'0.3rem'}} />
              </div>

              {/* Coordinator Details */}
              <div style={{margin:'1rem 0'}}>
                <label style={{fontWeight:500,fontSize:'0.9rem'}}>Coordinator Name <span style={{color:'red'}}>*</span></label>
                <input type="text" name="enterprise_coordinator_name" value={formData.enterprise_coordinator_name} onChange={handleChange} required style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
              </div>
              <div style={{margin:'1rem 0'}}>
                <label style={{fontWeight:500,fontSize:'0.9rem'}}>Coordinator Contact <small style={{color:'#78909c'}}>(10 digits)</small> <span style={{color:'red'}}>*</span></label>
                <input type="tel" maxLength={10} name="enterprise_coordinator_contact" value={formData.enterprise_coordinator_contact} onChange={handleChange} required style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
              </div>
            </div>

            {/* SECTION B: ENTREPRENEURS */}
            <div style={{ background: '#f8fbff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #eaf4ff', marginBottom: '1.8rem' }}>
              <h3 style={{ color: '#1a73e8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{background:'#1a73e8',color:'white',width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>B</span>
                Entrepreneurs ({settings.num_entrepreneurs})
              </h3>

              {formData.entrepreneurs.map((ent, idx) => (
                <div key={idx} style={{background:'white',padding:'1.2rem',borderRadius:'12px',border:'1px solid #e0e7ee',margin:'1.2rem 0'}}>
                  <h4 style={{color:'#0d47a1',marginTop:0}}>Entrepreneur {idx+1}</h4>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',margin:'1rem 0'}}>
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Full Name <span style={{color:'red'}}>*</span></label>
                      <input type="text" value={ent.full_name} onChange={(e)=>handleChange(e,'entrepreneurs',idx,'full_name')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
                    </div>
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Phone <span style={{color:'red'}}>*</span></label>
                      <input type="tel" maxLength={10} value={ent.phone_whatsapp} onChange={(e)=>handleChange(e,'entrepreneurs',idx,'phone_whatsapp')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
                    </div>
                  </div>
                  <div style={{margin:'1rem 0'}}>
                    <label style={{fontSize:'0.85rem'}}>Business Name & Type <span style={{color:'red'}}>*</span></label>
                    <input type="text" value={ent.business_name_type} onChange={(e)=>handleChange(e,'entrepreneurs',idx,'business_name_type')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'0.8rem'}}>
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Sector <span style={{color:'red'}}>*</span></label>
                      <select value={ent.sector} onChange={(e)=>handleChange(e,'entrepreneurs',idx,'sector')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}}>
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
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Years in Business <span style={{color:'red'}}>*</span></label>
                      <select value={ent.years_in_business} onChange={(e)=>handleChange(e,'entrepreneurs',idx,'years_in_business')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}}>
                        <option value="">-- Select --</option>
                        <option value="<1yr">&lt; 1 year</option>
                        <option value="1-3yrs">1–3 years</option>
                        <option value="3-5yrs">3–5 years</option>
                        <option value="5+yrs">5+ years</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Can Mentor? <span style={{color:'red'}}>*</span></label>
                      <select value={ent.can_mentor} onChange={(e)=>handleChange(e,'entrepreneurs',idx,'can_mentor')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}}>
                        <option value="">-- Select --</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION C: PROFESSIONALS */}
            <div style={{ background: '#f8fbff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #eaf4ff', marginBottom: '1.8rem' }}>
              <h3 style={{ color: '#1a73e8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{background:'#1a73e8',color:'white',width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>C</span>
                Professionals ({settings.num_professionals})
              </h3>

              {formData.professionals.map((prof, idx) => (
                <div key={idx} style={{background:'white',padding:'1.2rem',borderRadius:'12px',border:'1px solid #e0e7ee',margin:'1.2rem 0'}}>
                  <h4 style={{color:'#0d47a1',marginTop:0}}>Professional {idx+1}</h4>
                  <div style={{margin:'1rem 0'}}>
                    <label style={{fontSize:'0.85rem'}}>Full Name <span style={{color:'red'}}>*</span></label>
                    <input type="text" value={prof.full_name} onChange={(e)=>handleChange(e,'professionals',idx,'full_name')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Skill / Profession <span style={{color:'red'}}>*</span></label>
                      <input type="text" value={prof.skill_profession} onChange={(e)=>handleChange(e,'professionals',idx,'skill_profession')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
                    </div>
                    <div>
                      <label style={{fontSize:'0.85rem'}}>Willing to Train? <span style={{color:'red'}}>*</span></label>
                      <select value={prof.willing_to_train} onChange={(e)=>handleChange(e,'professionals',idx,'willing_to_train')} required style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}}>
                        <option value="">-- Select --</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION D & E + SUBMIT */}
            <div style={{ background: '#f8fbff', padding: '1.2rem', borderRadius: '16px', border: '1px solid #eaf4ff', marginBottom: '1.8rem' }}>
              <h3 style={{ color: '#1a73e8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{background:'#1a73e8',color:'white',width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>D</span>
                Investment & Diaspora Info
              </h3>
              <textarea name="investment_opportunities" value={formData.investment_opportunities} onChange={handleChange} rows={4} placeholder="Opportunities available..." style={{width:'100%',padding:'0.9rem',borderRadius:'10px',border:'1px solid #cfd8dc',margin:'1rem 0'}} />

              <div style={{margin:'1rem 0'}}>
                <label style={{fontWeight:500,fontSize:'0.9rem'}}>Diaspora Name</label>
                <input type="text" name="diaspora_name" value={formData.diaspora_name} onChange={handleChange} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
              </div>
              <div style={{margin:'1rem 0'}}>
                <label style={{fontWeight:500,fontSize:'0.9rem'}}>Country</label>
                <input type="text" name="diaspora_country" value={formData.diaspora_country} onChange={handleChange} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
              </div>
              <div style={{margin:'1rem 0'}}>
                <label style={{fontWeight:500,fontSize:'0.9rem'}}>Contribution / Skill</label>
                <input type="text" name="diaspora_skill_interest" value={formData.diaspora_skill_interest} onChange={handleChange} style={{width:'100%',padding:'0.8rem',borderRadius:'10px',border:'1px solid #cfd8dc',marginTop:'0.3rem'}} />
              </div>
            </div>

            {/* BUTTONS */}
            <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
              <button type="button" onClick={()=>setStep(1)} style={{padding:'0.9rem 1.5rem',background:'#eaf4ff',color:'#1a73e8',border:'none',borderRadius:'10px',fontWeight:600,flex:'1 1 120px'}}>← Back</button>
              <button type="submit" disabled={loading} style={{padding:'0.9rem',background:loading?'#90caf9':'linear-gradient(135deg,#1a73e8,#0d47a1)',color:'white',border:'none',borderRadius:'10px',fontWeight:600,flex:'2 1 200px',cursor:loading?'not-allowed':'pointer'}}>
                {loading ? "Processing..." : "✓ Submit Form"}
              </button>
            </div>
          </form>
        )}

        <div style={{textAlign:'center',color:'#78909c',fontSize:'0.8rem',marginTop:'2rem',borderTop:'1px solid #eaf4ff',paddingTop:'1rem'}}>
          DCLM-Ghana • Entrepreneurship Database System
        </div>
      </div>
    </div>
  );
}

export default App;
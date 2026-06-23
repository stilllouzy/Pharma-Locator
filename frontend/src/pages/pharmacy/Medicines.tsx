import { useState } from "react";

/*
  ════════════════════════════════════════════════════════════
  DESIGN SYSTEM  —  100% mirrored from theme.ts + existing layouts
  ════════════════════════════════════════════════════════════
  Font      : DM Sans (loaded in index.html via Google Fonts)
  Primary   : #0D3B6E  (NAVY)
  Accent    : #5BC4A0  (TEAL) — pharmacy role colour from PharmaSidebar
  Surface   : #F4F7FB
  Text/Pri  : #0D1B2A
  Text/Sec  : #546E7A
  Text/Dis  : #90A4AE
  Radius    : 10px cards (theme.shape), 8px inputs/buttons, 6px chips
  Icons     : MUI @mui/icons-material — Outlined variants, 20px in nav
  Sidebar   : 248px open, 72px collapsed — same as DRAWER_WIDTH / RAIL_WIDTH
  TopBar    : 64px, white, 0.5px navy border-bottom
  Toggle    : MenuIcon / MenuOpenIcon in TopBar (not sidebar) — AdminLayout pattern
  ════════════════════════════════════════════════════════════
*/

// ── Tokens ────────────────────────────────────────────────
const NAVY    = "#0D3B6E";
const TEAL    = "#5BC4A0";
const SURFACE = "#F4F7FB";
const T_PRI   = "#0D1B2A";
const T_SEC   = "#546E7A";
const T_DIS   = "#90A4AE";

const DRAWER_WIDTH = 248;
const RAIL_WIDTH   = 72;

// ── Status colour map (mirrors theme.ts palette exactly) ──
const STATUS = {
  pending:        { bg: "#FFF8E1", color: "#F57F17" },
  paid:           { bg: "#E3F2FD", color: "#1565C0" },
  delivered:      { bg: "#E8F5E9", color: "#2E7D32" },
  cancelled:      { bg: "#FFEBEE", color: "#C62828" },
  approved:       { bg: "#E8F5E9", color: "#2E7D32" },
  rejected:       { bg: "#FFEBEE", color: "#C62828" },
  "In Stock":     { bg: "#E8F5E9", color: "#2E7D32" },
  "Low Stock":    { bg: "#FFF8E1", color: "#F57F17" },
  "Out of Stock": { bg: "#FFEBEE", color: "#C62828" },
  NEW:            { bg: "#E8F5E9", color: "#2E7D32" },
  SEEN:           { bg: "#F0F4F8", color: "#90A4AE" },
};

// ── Mock data ─────────────────────────────────────────────
const MEDS = [
  { _id:"1", name:"Amoxicillin 500mg", category:"Antibiotic", price:12.50, stock:240, status:"In Stock"     },
  { _id:"2", name:"Metformin 850mg",   category:"Diabetes",   price:8.00,  stock:58,  status:"Low Stock"    },
  { _id:"3", name:"Losartan 50mg",     category:"Cardiac",    price:15.00, stock:0,   status:"Out of Stock" },
  { _id:"4", name:"Cetirizine 10mg",   category:"Allergy",    price:5.50,  stock:320, status:"In Stock"     },
  { _id:"5", name:"Omeprazole 20mg",   category:"GI",         price:9.75,  stock:134, status:"In Stock"     },
];

const ORDERS = [
  { _id:"o1", customer:"Maria Santos",   items:"Amoxicillin ×2, Cetirizine ×1", total:30.50, method:"Delivery", status:"pending",   time:"9:14 AM"    },
  { _id:"o2", customer:"Juan Dela Cruz", items:"Metformin ×3",                   total:24.00, method:"Pickup",   status:"paid",      time:"8:55 AM"    },
  { _id:"o3", customer:"Ana Reyes",      items:"Omeprazole ×2",                  total:19.50, method:"Delivery", status:"delivered", time:"8:32 AM"    },
  { _id:"o4", customer:"Carlo Bautista", items:"Losartan ×1, Amoxicillin ×1",    total:27.50, method:"Pickup",   status:"cancelled", time:"Yesterday"  },
];

const SCRIPTS = [
  { _id:"s1", name:"Maria Santos",   email:"maria@email.com", status:"pending",  date:"Jun 23, 2026" },
  { _id:"s2", name:"Roberto Lim",    email:"rob@email.com",   status:"approved", date:"Jun 22, 2026" },
  { _id:"s3", name:"Elena Gonzalez", email:"elena@email.com", status:"rejected", date:"Jun 21, 2026" },
];

const PODS = [
  { _id:"p1", title:"Order #ORD-00187 — Maria Santos",  isRead:false, time:"Today 9:40 AM"       },
  { _id:"p2", title:"Order #ORD-00183 — Ana Reyes",     isRead:true,  time:"Today 8:55 AM"       },
  { _id:"p3", title:"Order #ORD-00176 — Josel Navarro", isRead:true,  time:"Yesterday 5:12 PM"   },
];

// ════════════════════════════════════════════════════════════
// Shared primitives
// ════════════════════════════════════════════════════════════

/** Chip — radius:20, height:24, font 0.7rem 600 — matches theme MuiChip */
function Chip({ label }) {
  const s = STATUS[label] || { bg:"#F0F4F8", color:T_SEC };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"0 10px", height:24, borderRadius:20,
      fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.04em",
      textTransform:"uppercase",
      backgroundColor:s.bg, color:s.color,
      whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

/** Icon pill — 40×40, radius 10 — matches Dashboard.tsx IconPill */
function IconPill({ children, bg, color }) {
  return (
    <div style={{
      width:40, height:40, borderRadius:10, flexShrink:0,
      backgroundColor:bg, color,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</div>
  );
}

/** Section eyebrow — overline style from theme.ts */
function Eyebrow({ children }) {
  return (
    <p style={{
      margin:"0 0 4px", fontSize:"0.65rem", fontWeight:700,
      letterSpacing:"0.08em", textTransform:"uppercase", color:T_SEC,
    }}>{children}</p>
  );
}

/** Page title block */
function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h2 style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:NAVY, lineHeight:1.3 }}>{title}</h2>
      <p  style={{ margin:"4px 0 0", fontSize:"0.875rem", color:T_SEC, lineHeight:1.7 }}>{sub}</p>
    </div>
  );
}

/** White card */
function Card({ children, style={} }) {
  return (
    <div style={{
      backgroundColor:"#fff", borderRadius:10,
      boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
      ...style,
    }}>{children}</div>
  );
}

// ── SVG icons matching MUI Outlined variants ──────────────
// Using inline SVGs so the mock renders without MUI installed,
// but every shape and stroke-width matches the real MUI icons.
const Icon = {
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </svg>
  ),
  MenuOpen: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z"/>
    </svg>
  ),
  Medication: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6.5 10h2v2H10v2H8.5v2h-2v-2H5v-2h1.5V10zm9.3-5.7a4.5 4.5 0 0 0-6.36 6.37l6.36-6.37zm.7.7-6.36 6.37a4.5 4.5 0 0 0 6.37-6.37z" strokeLinejoin="round"/>
    </svg>
  ),
  Receipt: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V2l-1.5 1.5zM19 19a1 1 0 0 1-2 0v-1H6v1a1 1 0 0 1-2 0v-1h15v1zm0-3H5V5h14v11z"/>
      <path d="M9 7h6M9 10h6M9 13h4" strokeLinecap="round"/>
    </svg>
  ),
  Description: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeLinejoin="round"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/>
    </svg>
  ),
  TaskAlt: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m7 12 3.5 3.5L17 8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Photo: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Doc: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/>
    </svg>
  ),
};

// ════════════════════════════════════════════════════════════
// Sidebar  —  PharmaSidebar.tsx pattern exactly
// ════════════════════════════════════════════════════════════
const NAV = [
  { id:"medicines",     label:"Medicines",         Icon: Icon.Medication   },
  { id:"orders",        label:"Orders",            Icon: Icon.Receipt      },
  { id:"prescriptions", label:"Prescriptions",     Icon: Icon.Description  },
  { id:"pod",           label:"Proof of Delivery", Icon: Icon.TaskAlt      },
];

function Sidebar({ active, setActive, open }) {
  const w = open ? DRAWER_WIDTH : RAIL_WIDTH;

  return (
    <nav style={{
      width: w, flexShrink:0, height:"100vh",
      position:"fixed", top:0, left:0, zIndex:200,
      backgroundColor: NAVY,
      display:"flex", flexDirection:"column",
      transition:"width 0.25s ease", overflow:"hidden",
    }}>
      {/* Brand — 64px tall, same height as AppBar */}
      <div style={{
        height:64, flexShrink:0, display:"flex", alignItems:"center",
        gap:10, padding: open ? "0 20px" : 0,
        justifyContent: open ? "flex-start" : "center",
      }}>
        <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:TEAL, flexShrink:0 }} />
        {open && (
          <span style={{ color:"#fff", fontSize:"0.875rem", fontWeight:500, whiteSpace:"nowrap", fontFamily:"DM Sans, Inter, sans-serif" }}>
            Pharma Locator
          </span>
        )}
      </div>

      <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.12)" }} />

      {/* Nav section label — overline style */}
      <div style={{ padding: open ? "10px 20px 4px" : "10px 0 4px", overflow:"hidden", height: open ? "auto" : 0 }}>
        {open && (
          <span style={{
            fontSize:"0.65rem", fontWeight:700, color:"rgba(255,255,255,0.32)",
            letterSpacing:"0.08em", textTransform:"uppercase",
            fontFamily:"DM Sans, Inter, sans-serif",
          }}>Pharmacy</span>
        )}
      </div>

      {/* Nav links */}
      <div style={{ flex:1, padding: open ? "4px 12px" : "4px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {NAV.map(({ id, label, Icon: NavIcon }) => {
          const isActive = active === id;
          const inner = (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={!open ? label : undefined}
              style={{
                display:"flex", alignItems:"center",
                gap:10, padding: open ? "9px 12px" : "10px 0",
                justifyContent: open ? "flex-start" : "center",
                borderRadius:8, border:"none", cursor:"pointer",
                width:"100%", position:"relative",
                color: isActive ? "#fff" : "rgba(255,255,255,0.62)",
                backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                transition:"background-color 0.15s, color 0.15s",
                fontFamily:"DM Sans, Inter, sans-serif",
                fontSize:"0.84rem", fontWeight: isActive ? 600 : 400,
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div style={{
                  position:"absolute", left:0, top:"20%", bottom:"20%",
                  width:3, borderRadius:"0 3px 3px 0", backgroundColor:TEAL,
                }} />
              )}
              <NavIcon />
              {open && <span style={{ whiteSpace:"nowrap" }}>{label}</span>}
            </button>
          );
          return inner;
        })}
      </div>

      <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.12)" }} />

      {/* Logout */}
      <div style={{ padding: open ? "8px 12px" : "8px" }}>
        <button style={{
          display:"flex", alignItems:"center",
          gap:10, padding: open ? "9px 12px" : "10px 0",
          justifyContent: open ? "flex-start" : "center",
          borderRadius:8, border:"none", cursor:"pointer",
          width:"100%", color:"rgba(255,255,255,0.62)",
          backgroundColor:"transparent", transition:"background-color 0.15s, color 0.15s",
          fontFamily:"DM Sans, Inter, sans-serif",
          fontSize:"0.84rem", fontWeight:400,
        }}>
          <Icon.Logout />
          {open && <span>Log out</span>}
        </button>
      </div>
    </nav>
  );
}

// ════════════════════════════════════════════════════════════
// Top AppBar  —  PharmacyLayout.tsx pattern exactly
// Toggle button (MenuIcon/MenuOpenIcon) lives HERE, not in sidebar
// ════════════════════════════════════════════════════════════
const PAGE_LABELS = {
  medicines:"Medicines", orders:"Orders",
  prescriptions:"Prescriptions", pod:"Proof of Delivery",
};

function AppBar({ page, open, onToggle, sidebarW }) {
  return (
    <header style={{
      position:"fixed", top:0,
      left:sidebarW, right:0, height:64, zIndex:199,
      backgroundColor:"#fff",
      borderBottom:"0.5px solid rgba(13,59,110,0.12)",
      display:"flex", alignItems:"center",
      padding:"0 24px", gap:10,
      transition:"left 0.25s ease",
      fontFamily:"DM Sans, Inter, sans-serif",
    }}>
      {/* Toggle — MenuOpenIcon when open, MenuIcon when collapsed */}
      <button
        onClick={onToggle}
        style={{
          width:36, height:36, borderRadius:8,
          border:"none", backgroundColor:"transparent",
          cursor:"pointer", color:NAVY,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0,
        }}
      >
        {open ? <Icon.MenuOpen /> : <Icon.Menu />}
      </button>

      {/* Breadcrumb — Pharmacy › [Page] */}
      <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
        <span style={{ fontSize:"0.875rem", fontWeight:400, color:T_SEC }}>Pharmacy</span>
        <Icon.ChevronRight />
        <span style={{ fontSize:"0.95rem", fontWeight:600, color:T_PRI }}>{PAGE_LABELS[page]}</span>
      </div>

      {/* Bell with badge */}
      <div style={{ position:"relative", cursor:"pointer", color:T_SEC }}>
        <Icon.Bell />
        <div style={{
          position:"absolute", top:-1, right:-2,
          width:8, height:8, borderRadius:"50%",
          backgroundColor:"#C62828", border:"2px solid #fff",
        }} />
      </div>

      {/* Avatar — "PH" initials, matches PharmacyLayout */}
      <div style={{
        width:34, height:34, borderRadius:"50%",
        backgroundColor:NAVY, color:"#fff",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"0.72rem", fontWeight:700, flexShrink:0, cursor:"pointer",
        fontFamily:"DM Sans, Inter, sans-serif",
      }}>PH</div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════
// Page: Medicines
// ════════════════════════════════════════════════════════════
function MedicinesPage() {
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(false); // "add" | "edit" | false
  const [editRow, setEditRow]   = useState(null);
  const [form, setForm]         = useState({ name:"", category:"", price:"", stock:"", description:"" });

  const filtered = MEDS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ name:"", category:"", price:"", stock:"", description:"" }); setEditRow(null); setModal("add"); };
  const openEdit = row => { setForm({ name:row.name, category:row.category, price:row.price, stock:row.stock, description:"" }); setEditRow(row); setModal("edit"); };

  const totalMeds  = MEDS.length;
  const lowStock   = MEDS.filter(m => m.stock > 0 && m.stock < 100).length;
  const outOfStock = MEDS.filter(m => m.stock === 0).length;

  return (
    <div>
      <PageHeader title="Medicines" sub="Manage your pharmacy's medicine inventory" />

      {/* KPI cards — IconPill + overline + value, Dashboard.tsx pattern */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Medicines", value:totalMeds,  bg:"#EEF4FB", color:NAVY        },
          { label:"Low Stock",       value:lowStock,   bg:"#FFF8E1", color:"#F57F17"   },
          { label:"Out of Stock",    value:outOfStock, bg:"#FFEBEE", color:"#C62828"   },
        ].map(c => (
          <Card key={c.label} style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:16 }}>
            <IconPill bg={c.bg} color={c.color}>
              <Icon.Medication />
            </IconPill>
            <div>
              <Eyebrow>{c.label}</Eyebrow>
              <p style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:c.color, lineHeight:1.2 }}>{c.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T_DIS }}><Icon.Search /></span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search medicines…"
            style={{
              width:"100%", padding:"9px 12px 9px 38px", boxSizing:"border-box",
              borderRadius:8, border:"1px solid #D0DCE8",
              fontSize:"0.875rem", color:T_PRI, outline:"none",
              backgroundColor:"#fff", fontFamily:"DM Sans, Inter, sans-serif",
            }}
          />
        </div>
        <button onClick={openAdd} style={{
          padding:"9px 18px", borderRadius:8, border:"none",
          backgroundColor:NAVY, color:"#fff",
          fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
          fontFamily:"DM Sans, Inter, sans-serif",
          display:"flex", alignItems:"center", gap:6,
        }}>+ Add Medicine</button>
      </div>

      {/* Table */}
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.875rem", fontFamily:"DM Sans, Inter, sans-serif" }}>
          <thead>
            <tr style={{ backgroundColor:SURFACE }}>
              {["Medicine Name","Category","Price","Stock","Status","Actions"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.65rem", fontWeight:700, color:T_SEC, letterSpacing:"0.08em", textTransform:"uppercase", borderBottom:"1px solid #E8EEF4" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F0F4F8" : "none" }}>
                <td style={{ padding:"14px 16px", fontWeight:500, color:T_PRI }}>{m.name}</td>
                <td style={{ padding:"14px 16px", color:T_SEC }}>{m.category}</td>
                <td style={{ padding:"14px 16px", color:T_PRI }}>₱{m.price.toFixed(2)}</td>
                <td style={{ padding:"14px 16px", color: m.stock < 100 ? "#F57F17" : T_PRI, fontWeight: m.stock < 100 ? 600 : 400 }}>{m.stock}</td>
                <td style={{ padding:"14px 16px" }}><Chip label={m.status} /></td>
                <td style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => openEdit(m)} style={{ padding:"5px 14px", borderRadius:6, border:`1px solid ${NAVY}`, backgroundColor:"transparent", color:NAVY, fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>Edit</button>
                    <button style={{ padding:"5px 14px", borderRadius:6, border:"1px solid #FFCDD2", backgroundColor:"transparent", color:"#C62828", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign:"center", padding:"40px 0", color:T_DIS, fontSize:"0.875rem", margin:0 }}>No medicines match your search.</p>
        )}
      </Card>

      {/* Modal — Add / Edit */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position:"fixed", inset:0, backgroundColor:"rgba(13,27,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor:"#fff", borderRadius:14, padding:28, width:420, boxShadow:"0 20px 60px rgba(13,59,110,0.15)", fontFamily:"DM Sans, Inter, sans-serif" }}>
            <h3 style={{ margin:"0 0 20px", fontSize:"1rem", fontWeight:700, color:NAVY, padding:"0 0 12px", borderBottom:"0.5px solid rgba(0,0,0,0.07)" }}>
              {modal === "add" ? "Add Medicine" : "Edit Medicine"}
            </h3>
            {[
              { label:"Medicine Name", key:"name",        type:"text"   },
              { label:"Category",      key:"category",    type:"text"   },
              { label:"Price (₱)",     key:"price",       type:"number" },
              { label:"Stock",         key:"stock",       type:"number" },
              { label:"Description",   key:"description", type:"text"   },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:T_SEC, marginBottom:5 }}>{f.label}</label>
                <input
                  type={f.type} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #D0DCE8", fontSize:"0.875rem", outline:"none", boxSizing:"border-box", fontFamily:"DM Sans, Inter, sans-serif" }}
                />
              </div>
            ))}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid #D0DCE8", backgroundColor:"transparent", color:T_SEC, fontSize:"0.82rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>Cancel</button>
              <button style={{ flex:1, padding:"10px", borderRadius:8, border:"none", backgroundColor:NAVY, color:"#fff", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>
                {modal === "add" ? "Save Medicine" : "Update Medicine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Page: Orders
// ════════════════════════════════════════════════════════════
function OrdersPage() {
  const [filter, setFilter] = useState("all");
  const FILTERS = ["all","pending","paid","delivered","cancelled"];
  const counts = Object.fromEntries(FILTERS.map(f => [f, f === "all" ? ORDERS.length : ORDERS.filter(o => o.status === f).length]));
  const list = filter === "all" ? ORDERS : ORDERS.filter(o => o.status === filter);

  return (
    <div>
      <PageHeader title="Orders" sub="Review and update incoming customer orders" />

      {/* Filter pills */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:"0.8rem", fontWeight:600, textTransform:"capitalize",
            fontFamily:"DM Sans, Inter, sans-serif",
            backgroundColor: filter === f ? NAVY : "#fff",
            color: filter === f ? "#fff" : T_SEC,
            boxShadow: filter === f ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
            transition:"background-color 0.15s, color 0.15s",
          }}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {list.map(order => (
          <Card key={order._id} style={{ padding:"18px 20px", display:"flex", alignItems:"flex-start", gap:20 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:"0.875rem", fontWeight:600, color:T_PRI, fontFamily:"DM Sans, Inter, sans-serif" }}>{order.customer}</span>
                <Chip label={order.status} />
                <span style={{ marginLeft:"auto", fontSize:"0.72rem", color:T_DIS, fontFamily:"DM Sans, Inter, sans-serif" }}>{order.time}</span>
              </div>
              <p style={{ margin:"0 0 4px", fontSize:"0.8rem", color:T_SEC, fontFamily:"DM Sans, Inter, sans-serif" }}>{order.items}</p>
              <div style={{ display:"flex", gap:16, fontSize:"0.8rem", color:T_SEC, fontFamily:"DM Sans, Inter, sans-serif" }}>
                <span>₱{order.total.toFixed(2)}</span>
                <span>·</span>
                <span>{order.method}</span>
              </div>
            </div>
            <div style={{ flexShrink:0 }}>
              <Eyebrow>Update Status</Eyebrow>
              <select defaultValue={order.status} style={{
                padding:"7px 12px", borderRadius:8, border:"1px solid #D0DCE8",
                fontSize:"0.8rem", color:T_PRI, cursor:"pointer", outline:"none",
                backgroundColor:"#fff", fontFamily:"DM Sans, Inter, sans-serif",
              }}>
                {["pending","paid","delivered","cancelled"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <p style={{ textAlign:"center", padding:"48px 0", color:T_DIS, fontSize:"0.875rem", margin:0, fontFamily:"DM Sans, Inter, sans-serif" }}>No orders with this status.</p>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Page: Prescriptions
// ════════════════════════════════════════════════════════════
function PrescriptionsPage() {
  const [scripts, setScripts] = useState(SCRIPTS);
  const [active, setActive]   = useState("s1");
  const [reason, setReason]   = useState({});

  const selected = scripts.find(s => s._id === active);
  const approve  = id => setScripts(ss => ss.map(p => p._id === id ? { ...p, status:"approved" } : p));
  const reject   = id => setScripts(ss => ss.map(p => p._id === id ? { ...p, status:"rejected" } : p));

  return (
    <div>
      <PageHeader title="Prescription Verification" sub="Review and verify customer prescriptions" />

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16 }}>
        {/* List */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {scripts.map(s => {
            const isActive = active === s._id;
            return (
              <div key={s._id} onClick={() => setActive(s._id)} style={{
                padding:"14px 16px", borderRadius:10, cursor:"pointer",
                backgroundColor: isActive ? NAVY : "#fff",
                boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                transition:"background-color 0.15s",
                fontFamily:"DM Sans, Inter, sans-serif",
              }}>
                <p style={{ margin:"0 0 2px", fontWeight:600, fontSize:"0.875rem", color: isActive ? "#fff" : T_PRI }}>{s.name}</p>
                <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color: isActive ? "rgba(255,255,255,0.65)" : T_SEC }}>{s.email}</p>
                <Chip label={s.status} />
              </div>
            );
          })}
        </div>

        {/* Detail */}
        {selected && (
          <Card style={{ padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, fontFamily:"DM Sans, Inter, sans-serif" }}>
              <div style={{ flex:1 }}>
                <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:"0.95rem", color:T_PRI }}>{selected.name}</p>
                <p style={{ margin:0, fontSize:"0.8rem", color:T_SEC }}>{selected.email} · Uploaded {selected.date}</p>
              </div>
              <Chip label={selected.status} />
            </div>

            {/* Image placeholder */}
            <div style={{
              width:"100%", aspectRatio:"4/3", maxHeight:240,
              backgroundColor:SURFACE, borderRadius:10,
              border:"1px dashed #C9D6E3", marginBottom:18,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:8, color:T_DIS,
            }}>
              <Icon.Doc />
              <span style={{ fontSize:"0.8rem", fontFamily:"DM Sans, Inter, sans-serif" }}>Prescription image</span>
            </div>

            {selected.status === "pending" ? (
              <div>
                <input
                  placeholder="Rejection reason (optional)"
                  value={reason[selected._id] || ""}
                  onChange={e => setReason({ ...reason, [selected._id]: e.target.value })}
                  style={{
                    width:"100%", padding:"9px 12px", borderRadius:8,
                    border:"1px solid #D0DCE8", fontSize:"0.875rem", outline:"none",
                    marginBottom:12, boxSizing:"border-box",
                    fontFamily:"DM Sans, Inter, sans-serif",
                  }}
                />
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => approve(selected._id)} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", backgroundColor:"#2E7D32", color:"#fff", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>Approve</button>
                  <button onClick={() => reject(selected._id)}  style={{ flex:1, padding:"10px", borderRadius:8, border:"none", backgroundColor:"#C62828", color:"#fff", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>Reject</button>
                </div>
              </div>
            ) : (
              <div style={{ padding:"12px 16px", borderRadius:8, backgroundColor:SURFACE, fontSize:"0.875rem", color:T_SEC, fontFamily:"DM Sans, Inter, sans-serif" }}>
                This prescription has been <strong style={{ color:T_PRI }}>{selected.status}</strong>.
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Page: Proof of Delivery
// ════════════════════════════════════════════════════════════
function PODPage() {
  const newCount = PODS.filter(p => !p.isRead).length;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:12, marginBottom:24 }}>
        <div>
          <h2 style={{ margin:0, fontSize:"1.5rem", fontWeight:700, color:NAVY, lineHeight:1.3, fontFamily:"DM Sans, Inter, sans-serif" }}>Proof of Delivery</h2>
          <p  style={{ margin:"4px 0 0", fontSize:"0.875rem", color:T_SEC, lineHeight:1.7, fontFamily:"DM Sans, Inter, sans-serif" }}>Delivery photos submitted by riders</p>
        </div>
        {newCount > 0 && <Chip label="NEW" />}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {PODS.map(pod => (
          <Card key={pod._id} style={{
            padding:"18px 20px",
            borderLeft: !pod.isRead ? `3px solid ${TEAL}` : "3px solid transparent",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, fontFamily:"DM Sans, Inter, sans-serif" }}>
              <span style={{ fontWeight:600, fontSize:"0.875rem", color:T_PRI, flex:1 }}>{pod.title}</span>
              <Chip label={pod.isRead ? "SEEN" : "NEW"} />
              <span style={{ fontSize:"0.72rem", color:T_DIS }}>{pod.time}</span>
            </div>

            {/* Photo placeholder */}
            <div style={{
              width:"100%", height:160, backgroundColor:SURFACE, borderRadius:8,
              border:"1px dashed #C9D6E3",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:8, color:T_DIS,
            }}>
              <Icon.Photo />
              <span style={{ fontSize:"0.8rem", fontFamily:"DM Sans, Inter, sans-serif" }}>Delivery photo from rider</span>
            </div>

            <div style={{ marginTop:12, display:"flex", gap:10 }}>
              <button style={{ padding:"7px 14px", borderRadius:6, border:`1px solid ${NAVY}`, backgroundColor:"transparent", color:NAVY, fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>View Full Photo</button>
              <button style={{ padding:"7px 14px", borderRadius:6, border:"1px solid #D0DCE8", backgroundColor:"transparent", color:T_SEC, fontSize:"0.8rem", fontWeight:600, cursor:"pointer", fontFamily:"DM Sans, Inter, sans-serif" }}>Mark as Seen</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Root
// ════════════════════════════════════════════════════════════
const PAGE_MAP = {
  medicines:     MedicinesPage,
  orders:        OrdersPage,
  prescriptions: PrescriptionsPage,
  pod:           PODPage,
};

export default function PharmacyDashboard() {
  const [page, setPage]       = useState("medicines");
  const [open, setOpen]       = useState(true);
  const sidebarW = open ? DRAWER_WIDTH : RAIL_WIDTH;
  const PageComponent = PAGE_MAP[page];

  return (
    <div style={{ display:"flex", fontFamily:"DM Sans, Inter, sans-serif", backgroundColor:SURFACE, minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Sidebar active={page} setActive={setPage} open={open} />
      <AppBar  page={page} open={open} onToggle={() => setOpen(o => !o)} sidebarW={sidebarW} />

      <main style={{
        marginLeft: sidebarW, marginTop:64,
        flex:1, minHeight:"calc(100vh - 64px)",
        padding:28, backgroundColor:SURFACE,
        transition:"margin-left 0.25s ease",
      }}>
        <PageComponent />
      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import Dashboard from "./RevisionTree.jsx";
import {Routes, Route, Navigate, useNavigate} from "react-router-dom" 
import Topics from "./Topics.jsx"
import { TopicPage } from "./Topics.jsx";
import ConfusedVaultDemo from "./confusedVault.jsx";

// ─── Logo: spinning arrow loop ───────────────────────────────────────────────
function IterateLogo({ size = 36, spin = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={spin ? { animation: "spin 3s linear infinite" } : {}}
    >
      <circle cx="18" cy="18" r="15" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
      {/* Arrow going clockwise around the circle */}
      <path
        d="M18 3 A15 15 0 1 1 6.5 27"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <path
        d="M3.5 24 L6.5 27 L9.5 24"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Side Nav ────────────────────────────────────────────────────────────────
function SideNav({ page, setPage }) {
  const links = [
    { id: "topics",    label: "Courses",    icon: "" },
    { id: "progress", label: "Progress", icon: "" },
    { id: "sessions",  label: "Confused",  icon: "" },
    { id: "settings",  label: "Settings",  icon: "" },
  ];
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function callApi(){
      try{
      const userData = await fetch("http://localhost:1700/api/users/",{ credentials: 'include' }).then(res=>res.json())
      
      if (userData){
        setUser(userData)
      }
    }catch(err){
      console.error(err)
    }
    }
    callApi()
  },[])
    
  
  const navigate=useNavigate();
  return (
    <nav style={styles.nav}>
      <div style={styles.navLogo} onClick={() => setPage("landing")}>
        <IterateLogo size={28} spin />
        <span style={styles.navBrand}>iterate</span>
      </div>
      <div style={styles.navLinks}>
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => navigate(`/${l.label}`)}
            style={{
              ...styles.navLink,
              ...(page === l.id ? styles.navLinkActive : {}),
            }}
          >
            <span style={styles.navIcon}>{l.icon}</span>
            {l.label}
          </button>
        ))}
      </div>
      <div style={styles.navFooter}>
        <div style={styles.navAvatar}>A</div>
        <span style={{ fontSize: 12, color: "#888" }}>{user?.data?.email || "User"}</span>
      </div>
    </nav>
  );
}

// ─── Topic Tree Node ──────────────────────────────────────────────────────────
function TreeNode({ label, done, locked, question }) {
  const base = {
    width: 62,
    height: 62,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'Georgia', serif",
    cursor: locked ? "default" : "pointer",
    userSelect: "none",
    transition: "transform 0.15s",
    position: "relative",
    zIndex: 1,
  };
  if (question) return (
    <div style={{ ...base, border: "2px dashed #C0BBB0", background: "transparent", color: "#C0BBB0", fontSize: 18 }}>?</div>
  );
  if (locked) return (
    <div style={{ ...base, border: "2px dashed #C0BBB0", background: "transparent", color: "#888", fontSize: 10 }}>{label}</div>
  );
  if (done) return (
    <div style={{ ...base, background: "#1A1A1A", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>{label}</div>
  );
  return (
    <div style={{ ...base, background: "#1A1A1A", color: "#fff", opacity: 0.85 }}>{label}</div>
  );
}

// ─── SVG Connector Lines ──────────────────────────────────────────────────────
function TreeLines() {
  // hand-tuned coordinates matching the layout below
  const solid = [
    // Intro -> D&C
    [200, 62, 130, 152],
    // Intro -> Sort
    [200, 62, 370, 152],
    // D&C -> Heap
    [130, 214, 90, 304],
    // D&C -> Hash
    [130, 214, 230, 304],
    // Sort -> BST
    [370, 214, 330, 304],
    // Sort -> Grph
    [370, 214, 460, 304],
    // Heap -> BFS
    [90, 366, 60, 456],
    // Heap -> DFS
    [90, 366, 150, 456],
    // Hash -> DP
    [230, 366, 205, 456],
    // Hash -> Grdy
    [230, 366, 290, 456],
  ];
  const dashed = [
    [330, 366, 310, 456],
    [330, 366, 380, 456],
    [460, 366, 430, 456],
    [460, 366, 510, 456],
  ];
  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {solid.map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#999" strokeWidth="1.5" />
      ))}
      {dashed.map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C0BBB0" strokeWidth="1.5" strokeDasharray="5,4" />
      ))}
    </svg>
  );
}

// // ─── Dashboard Page ───────────────────────────────────────────────────────────
// function Dashboard() {
//   return (
//     <div style={styles.dashWrapper}>
//       {/* Stats bar */}
//       <div style={styles.statsRow}>
//         <div style={styles.statCard}>
//           <div style={styles.statLabel}>done</div>
//           <div style={styles.statValue}>5</div>
//         </div>
//         <div style={styles.statCard}>
//           <div style={styles.statLabel}>left</div>
//           <div style={styles.statValue}>10</div>
//         </div>
//         <div style={{ ...styles.statCard, flex: 1.2 }}>
//           <div style={styles.statLabel}>progress</div>
//           <div style={{ ...styles.statValue, fontSize: 28, color: "#1A1A1A" }}>33%</div>
//           <div style={styles.progressBar}>
//             <div style={{ ...styles.progressFill, width: "33%" }} />
//           </div>
//         </div>
//       </div>

//       {/* Tree */}
//       <div style={styles.treePanel}>
//         <div style={styles.treeContainer}>
//           <TreeLines />

//           {/* Row 0: Intro */}
//           <div style={{ ...styles.treeRow, top: 0 }}>
//             <div style={{ position: "absolute", left: "calc(50% - 31px)" }}>
//               <TreeNode label="Intro" done />
//             </div>
//           </div>

//           {/* Row 1: D&C, Sort */}
//           <div style={{ ...styles.treeRow, top: 90 }}>
//             <div style={{ position: "absolute", left: "calc(50% - 31px - 140px)" }}>
//               <TreeNode label="D&C" done />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 140px)" }}>
//               <TreeNode label="Sort" done />
//             </div>
//           </div>

//           {/* Row 2: Heap, Hash, BST, Grph */}
//           <div style={{ ...styles.treeRow, top: 180 }}>
//             <div style={{ position: "absolute", left: "calc(50% - 31px - 200px)" }}>
//               <TreeNode label="Heap" done />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px - 60px)" }}>
//               <TreeNode label="Hash" done />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 80px)" }}>
//               <TreeNode label="BST" locked />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 210px)" }}>
//               <TreeNode label="Grph" locked />
//             </div>
//           </div>

//           {/* Row 3: BFS, DFS, DP, Grdy, ?, ?, ?, ? */}
//           <div style={{ ...styles.treeRow, top: 270 }}>
//             <div style={{ position: "absolute", left: "calc(50% - 31px - 240px)" }}>
//               <TreeNode label="BFS" done />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px - 155px)" }}>
//               <TreeNode label="DFS" done />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px - 70px)" }}>
//               <TreeNode label="DP" locked />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 15px)" }}>
//               <TreeNode label="Grdy" locked />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 100px)" }}>
//               <TreeNode question />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 170px)" }}>
//               <TreeNode question />
//             </div>
//             <div style={{ position: "absolute", left: "calc(50% - 31px + 240px)" }}>
//               <TreeNode question />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Up next card */}
//       <div style={styles.upNextCard}>
//         <div style={styles.upNextTitle}>Dynamic Programming</div>
//         <div style={styles.upNextSub}>up next — ace this session to unlock the next branch</div>
//         <div style={styles.upNextTags}>
//           <span style={styles.tag}>up next</span>
//           <span style={styles.tag}>level 4</span>
//           <span style={styles.tag}>CSE221</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// ─── Landing / Onboarding ────────────────────────────────────────────────────
function Landing({ setPage }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const navigate=useNavigate()

 const handleSubmit = () => {
    setIsLoading(true); 
    window.location.href = "http://localhost:1700/api/auth/google";
  };

  return (
    <div style={styles.landingWrapper}>
      {/* Subtle lined-paper background lines */}
      <div style={styles.landingLines} aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{ ...styles.landingLine, top: 60 + i * 32 }} />
        ))}
      </div>

      <div style={styles.onboardCard}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <IterateLogo size={44} spin />
          <span style={styles.brandName}>iterate</span>
        </div>

        {!submitted ? (
          <>
            <h1 style={styles.heroHeadline}>Learn CS.<br />Actually retain it.</h1>
            <p style={styles.heroSub}>
              Iterate builds a personalised revision tree from your syllabus — unlocking topics as you master their prerequisites.
            </p>

            <div style={styles.inputRow}>
              <button onClick={handleSubmit} style={styles.ctaButton}>
                Sign in with Google →
              </button>
            </div>
            <p style={styles.finePrint}>No password. No card. Just your email.</p>

            <div style={styles.featureRow}>
              {[
                ["◈", "Skill tree progress", "Visual map of what you know"],
                ["⊞", "Spaced repetition", "Sessions timed to your forgetting curve"],
                ["⊙", "Syllabus-aware", "Import your course — it maps itself"],
              ].map(([icon, title, desc]) => (
                <div key={title} style={styles.featureCard}>
                  <div style={styles.featureIcon}>{icon}</div>
                  <div style={styles.featureTitle}>{title}</div>
                  <div style={styles.featureDesc}>{desc}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={styles.successState}>
            <div style={{ animation: "spin 1s linear", display: "inline-block" }}>
              <IterateLogo size={56} spin />
            </div>
            <div style={styles.successText}>You're in. Loading your tree…</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const showNav = page !== "landing";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F6F2; font-family: 'Inter', sans-serif; width:100vw;}
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { outline: 2px solid #1A1A1A; outline-offset: 2px; }
        button:focus-visible { outline: 2px solid #1A1A1A; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #D4D0C8; border-radius: 3px; }
      `}</style>
      <Routes>
        <Route path="/" element={ <Landing/>} />
        <Route path="/progress" element={ <Dashboard/>} />
        <Route path="/courses" element={<TopicPage />} />
        <Route path="/confused" element={<ConfusedVaultDemo/>} />
      </Routes>

      {/* <div style={{ display: "flex", minHeight: "100vh", background: "#F7F6F2" }}>
        {page!=="landing" && <SideNav page={page} setPage={setPage} />}
        <main style={{ flex: 1, overflow: "auto" }}>
          {page === "landing" && <Landing setPage={setPage} />}
          {(page === "dashboard" || page === "sessions" || page === "topics" || page === "settings") && (
            <Dashboard />
          )}
          {(page === "topics") && (
            <Topics />
          )}
        </main>
      </div> */}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  // Nav
  nav: {
    minWidth: "12%",
    minHeight: "100vh",
    background: "#EFEDE8",
    borderRight: "1px solid #DDD9D0",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    flexShrink: 0,
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 20px 28px",
    cursor: "pointer",
  },
  navBrand: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    color: "#1A1A1A",
    letterSpacing: "-0.3px",
  },
  navLinks: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#666",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    textAlign: "left",
    borderRadius: 0,
    transition: "background 0.1s, color 0.1s",
  },
  navLinkActive: { background: "#E3E0D8", color: "#1A1A1A" },
  navIcon: { fontSize: 15, width: 18, textAlign: "center" },
  navFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #DDD9D0",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#1A1A1A",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
  },

  // Dashboard
  dashWrapper: {
    padding: "32px 36px",
    maxWidth: 720,
    margin: "0 auto",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #E0DDD5",
    borderRadius: 6,
    padding: "14px 20px",
  },
  statLabel: { fontSize: 10, color: "#999", textTransform: "lowercase", letterSpacing: "0.05em", marginBottom: 4 },
  statValue: { fontSize: 34, fontFamily: "'DM Serif Display', serif", color: "#1A1A1A", lineHeight: 1 },
  progressBar: { height: 3, background: "#E8E5DE", borderRadius: 2, marginTop: 8 },
  progressFill: { height: "100%", background: "#1A1A1A", borderRadius: 2 },

  treePanel: {
    background: "#fff",
    border: "1px solid #E0DDD5",
    borderRadius: 6,
    padding: "28px 16px 32px",
    marginBottom: 20,
    // lined paper
    backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 31px, #EAE8E2 31px, #EAE8E2 32px)",
    backgroundPositionY: "8px",
    overflow: "hidden",
  },
  treeContainer: {
    position: "relative",
    height: 380,
    width: "100%",
    maxWidth: 580,
    margin: "0 auto",
  },
  treeRow: { position: "absolute", left: 0, right: 0, height: 62 },

  upNextCard: {
    background: "#fff",
    border: "1px solid #E0DDD5",
    borderRadius: 6,
    padding: "20px 24px",
    backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 31px, #EAE8E2 31px, #EAE8E2 32px)",
    backgroundPositionY: "8px",
  },
  upNextTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1A1A1A", marginBottom: 4 },
  upNextSub: { fontSize: 12, color: "#888", marginBottom: 14 },
  upNextTags: { display: "flex", gap: 8 },
  tag: {
    fontSize: 11,
    border: "1px solid #C8C5BC",
    borderRadius: 3,
    padding: "3px 10px",
    color: "#555",
    background: "#F7F6F2",
  },

  // Landing
  landingWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    padding: 24,
  },
  landingLines: { position: "absolute", inset: 0, pointerEvents: "none" },
  landingLine: { position: "absolute", left: 0, right: 0, height: 1, background: "#E8E5DE" },

  onboardCard: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #E0DDD5",
    borderRadius: 10,
    padding: "44px 48px",
    maxWidth: 520,
    width: "100%",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  brandName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    color: "#1A1A1A",
    letterSpacing: "-0.5px",
  },
  heroHeadline: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 38,
    lineHeight: 1.15,
    color: "#1A1A1A",
    marginBottom: 14,
    letterSpacing: "-0.5px",
  },
  heroSub: {
    fontSize: 14,
    color: "#666",
    lineHeight: 1.7,
    marginBottom: 28,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    marginBottom: 10,
  },
  emailInput: {
    flex: 1,
    padding: "11px 14px",
    border: "1.5px solid #C8C5BC",
    borderRadius: 5,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    background: "#FAFAF8",
    color: "#1A1A1A",
  },
  ctaButton: {
    padding: "11px 20px",
    background: "#1A1A1A",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    whiteSpace: "nowrap",
    transition: "opacity 0.15s",
  },
  finePrint: { fontSize: 11, color: "#AAA", marginBottom: 32 },
  featureRow: {
    display: "flex",
    gap: 12,
    borderTop: "1px solid #E8E5DE",
    paddingTop: 24,
  },
  featureCard: { flex: 1 },
  featureIcon: { fontSize: 16, marginBottom: 6, color: "#1A1A1A" },
  featureTitle: { fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginBottom: 3 },
  featureDesc: { fontSize: 11, color: "#999", lineHeight: 1.5 },

  successState: {
    textAlign: "center",
    padding: "32px 0",
  },
  successText: {
    marginTop: 20,
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    color: "#1A1A1A",
  },
};

export {SideNav};
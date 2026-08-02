import { useEffect, useState } from "react";
import Dashboard from "./RevisionTree.jsx";
import {Routes, Route, Navigate, useNavigate, useLocation, useParams} from "react-router-dom" 
import { TopicPage } from "./Topics.jsx";
import ConfusedVaultDemo from "./confusedVault.jsx";
import {InterviewPageWithNav} from "./interviewPage.jsx";
import { CompanyGuidePageWithNav } from "./companyGuidePage.jsx"
import { ProtectedRoute } from "./protectedRoute.jsx";
import { UserProvider, useUser } from "./context/UserContext.jsx";
import { ReportedContentPageWithNav } from "./ReportedContentPage.jsx";
import { SupportPageWithNav } from "./SupportPage.jsx";
import "./iterate-app.css";
import HomePage from "./HomePage.jsx";
import IterateLogo from "./logo.jsx";



// ─── Side Nav ────────────────────────────────────────────────────────────────
// Previously took page/setPage props that Dashboard never actually passed in
// (it renders <SideNav /> with no props), so the active-item highlight could
// never fire. Also navigate(`/${l.label}`) sent you to "/Progress" etc while
// the real routes are lowercase ("/progress") — case mismatch, wrong page.
// Now derives the current page from the URL directly via useLocation, and
// paths match the actual <Routes> exactly.
function SideNav() {
  const { courseCode} = useParams()
  const {user, loading} = useUser()
  const links = [
    { path: "/courses",  label: "Courses" },
    { path: `/progress/${courseCode ?? user?.enRolledCourses[0] ?? "CSE220"}`,  label: "Progress" },
    { path: "/vault",    label: "Vault" },
    { path: "/interview", label: "Interview" },
    { path: "/reports", label: "Reports" },
    { path: "/support", label: "Support" }

  ];
  const [users, setUsers] = useState(null);
  useEffect(() => {
    async function callApi(){
      try{
      const userData = await fetch("https://api.iterate-app.me/api/users/",{ credentials: 'include' }).then(res=>res.json())
      
      if (userData){
        setUsers(userData)
      }
    }catch(err){
      console.error(err)
    }
    }
    callApi()
  },[])
    
  
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!user;

  async function handleAuthClick() {
    if (isLoggedIn) {
      try {
        await fetch("https://api.iterate-app.me/api/auth/logout", { method: "POST", credentials: "include" });
      } catch (err) {
        console.error(err);
      } finally {
        navigate("/login");
      }
    } else {
      window.location.href = "https://api.iterate-app.me/api/auth/google";
    }
  }
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate("/")}>
        <IterateLogo size={28} spin />
        <span className="nav-brand">iterate</span>
      </div>
      <div className="nav-links">
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className={`nav-link ${location.pathname === l.path ? "nav-link-active" : ""}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="nav-footer sidenav-footer">
        <div className="nav-avatar">{user?.name[0]}</div>
        <div className="nav-footer-info sidenav-footer-info">
          <span className="nav-username sidenav-username">{user?.name || "Logged out"}</span>
          <button
            className={`nav-auth-btn ${isLoggedIn ? "nav-auth-btn-out" : "nav-auth-btn-in"}`}
            onClick={handleAuthClick}
          >
            {isLoggedIn ? "← Log out" : "Log in →"}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Topic Tree Node ──────────────────────────────────────────────────────────
function TreeNode({ label, done, locked, question }) {
  if (question) return (
    <div className="tree-node-base tree-node-question">?</div>
  );
  if (locked) return (
    <div className="tree-node-base tree-node-locked">{label}</div>
  );
  if (done) return (
    <div className="tree-node-base tree-node-done">{label}</div>
  );
  return (
    <div className="tree-node-base tree-node-default">{label}</div>
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



// ─── Landing / Onboarding ────────────────────────────────────────────────────
function Landing({ setPage }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const navigate=useNavigate()

 const handleSubmit = () => {
    setIsLoading(true); 
    window.location.href = "https://api.iterate-app.me/api/auth/google";
  };

  return (
    <div className="landing-wrapper">
      {/* Subtle lined-paper background lines */}
      <div className="landing-lines" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="landing-line" style={{ top: 60 + i * 32 }} />
        ))}
      </div>

      <div className="onboard-card">
        {/* Logo */}
        <div className="logo-row">
          <IterateLogo size={44} spin />
          <span className="brand-name">iterate</span>
        </div>

        {!submitted ? (
          <>
            <h1 className="hero-headline">Learn CS.<br />Actually retain it.</h1>
            <p className="hero-sub">
              Iterate builds a personalised revision tree from your syllabus — unlocking topics as you master their prerequisites.
            </p>

            <div className="input-row">
              <button onClick={handleSubmit} className="cta-button">
                Sign in with Google →
              </button>
            </div>
            <p className="fine-print">No password. No card. Just your email.</p>

            <div className="feature-row">
              {[
                ["◈", "Skill tree progress", "Visual map of what you know"],
                ["⊞", "Spaced repetition", "Sessions timed to your forgetting curve"],
                ["⊙", "Syllabus-aware", "Import your course — it maps itself"],
              ].map(([icon, title, desc]) => (
                <div key={title} className="feature-card">
                  <div className="feature-icon">{icon}</div>
                  <div className="feature-title">{title}</div>
                  <div className="feature-desc">{desc}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="success-state">
            <div style={{ animation: "spin 1s linear", display: "inline-block" }}>
              <IterateLogo size={56} spin />
            </div>
            <div className="success-text">You're in. Loading your tree…</div>
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
      <UserProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={ <Landing/>} />
        <Route path="/progress/:courseCode" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><ConfusedVaultDemo/></ProtectedRoute>} />
        <Route path="/interview" element={<InterviewPageWithNav/>} />
        <Route path="/interview/:company" element={<CompanyGuidePageWithNav/>} />
        <Route path="/reports" element={<ProtectedRoute><ReportedContentPageWithNav/></ProtectedRoute>} />
        <Route path="/support" element={<SupportPageWithNav/>} />
      </Routes>   
      </UserProvider>
    </>
  );
}

export {SideNav};
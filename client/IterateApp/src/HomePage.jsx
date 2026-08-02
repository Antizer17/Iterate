import { useNavigate } from "react-router-dom";

// ── Design tokens (scoped to .hm-root) ──────────────────────────────────────
// Same variable names / font as Topics.jsx, confusedVault.jsx, RevisionTree.jsx,
// interviewPage.jsx, companyGuidePage.jsx, ReportedContentPage.jsx,
// SupportPage.jsx — colorless ink/paper palette, no accent colors, so this
// reads as the front door of the same app rather than a separate marketing site.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.hm-root *{box-sizing:border-box;margin:0;padding:0}
.hm-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  width:100%;min-height:100vh;
}

/* ── Top bar ── */
.hm-topbar{display:flex;align-items:center;justify-content:space-between;
  padding:1.25rem 1.75rem;border-bottom:1.5px solid var(--gray4)}
.hm-brand{display:flex;align-items:center;gap:8px;cursor:pointer}
.hm-brand-name{font-family:var(--font);font-size:22px;font-weight:700}
.hm-login-btn{font-family:var(--font);font-size:16px;font-weight:600;padding:5px 16px;
  background:var(--paper);border:1.5px solid var(--ink);color:var(--ink);cursor:pointer;
  border-radius:4px;transition:all .12s}
.hm-login-btn:hover{background:var(--ink);color:var(--paper)}

.hm-wrap{max-width:900px;margin:0 auto;padding:0 1.5rem}

/* ── Hero ── */
.hm-hero{text-align:center;padding:4rem 0 3rem;border-bottom:1.5px solid var(--gray4)}
.hm-hero-title{font-family:var(--font);font-size:56px;font-weight:700;line-height:1.1;
  display:inline-block;transform:rotate(-0.5deg)}
.hm-hero-sub{font-size:20px;color:var(--gray1);font-style:italic;max-width:560px;
  margin:1rem auto 0;line-height:1.4}
.hm-hero-ctas{display:flex;gap:14px;justify-content:center;align-items:center;margin-top:1.75rem;flex-wrap:wrap}
.hm-cta-primary{font-family:var(--font);font-size:19px;font-weight:700;padding:10px 26px;
  background:var(--ink);color:var(--paper);border:1.5px solid var(--ink);cursor:pointer;
  border-radius:4px;transition:transform .12s ease, box-shadow .12s ease}
.hm-cta-primary:hover{transform:translateY(-2px);box-shadow:0 8px 18px -8px rgba(26,26,24,0.4)}
.hm-cta-secondary{font-family:var(--font);font-size:16px;color:var(--gray2);background:none;
  border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.hm-cta-secondary:hover{color:var(--ink)}
.hm-fine-print{font-size:14px;color:var(--gray3);font-style:italic;margin-top:12px}

/* ── Section headers ── */
.hm-section{padding:3rem 0;border-bottom:1.5px solid var(--gray4)}
.hm-section:last-of-type{border-bottom:none}
.hm-section-title{font-family:var(--font);font-size:32px;font-weight:700;
  display:inline-block;transform:rotate(-0.4deg);margin-bottom:0.5rem}
.hm-section-sub{font-size:16.5px;color:var(--gray2);font-style:italic;margin-bottom:2rem;max-width:560px}

/* ── How it works: numbered steps ── */
.hm-steps{list-style:none;display:flex;flex-direction:column;gap:12px}
.hm-step{display:flex;gap:14px;align-items:flex-start;background:var(--paper);
  border:1.5px solid var(--gray4);padding:0.9rem 1.1rem;position:relative;transform:rotate(-0.15deg)}
.hm-step::before{content:'';position:absolute;top:-1px;right:-1px;width:8px;height:8px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.hm-step-num{font-family:var(--font);font-size:17px;font-weight:700;color:var(--paper);
  background:var(--ink);width:28px;height:28px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;margin-top:2px}
.hm-step-body{flex:1}
.hm-step-title{font-family:var(--font);font-size:21px;font-weight:700;margin-bottom:2px}
.hm-step-text{font-size:16px;color:var(--gray1);line-height:1.45}

.hm-why-email{margin-top:1.25rem;padding:0.9rem 1.1rem;border-left:2px solid var(--gray4);
  background:var(--paper2)}
.hm-why-email-label{font-family:var(--font);font-size:16px;font-weight:700;margin-bottom:3px}
.hm-why-email-text{font-size:15.5px;color:var(--gray1);font-style:italic;line-height:1.45}

/* ── Three pillars ── */
.hm-pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.hm-pillar{--r:0deg;background-color:var(--paper);
  background-image:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%),
    repeating-linear-gradient(to bottom, transparent, transparent 24px, var(--gray4) 24px, var(--gray4) 25px);
  background-position:0 0, 0 4px;
  border:1.5px solid var(--gray4);border-radius:2px 14px 4px 12px;padding:1.2rem 1.2rem 1.1rem;
  position:relative;transform:rotate(var(--r));
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25);
  transition:box-shadow .15s ease}
.hm-pillar:hover{box-shadow:3px 5px 0 rgba(26,26,24,0.07), 0 12px 24px -10px rgba(26,26,24,0.28)}
.hm-pillar::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.hm-pillar-icon{width:38px;height:38px;border-radius:50%;border:1.5px solid var(--gray4);
  display:flex;align-items:center;justify-content:center;color:var(--ink);margin-bottom:10px}
.hm-pillar-title{font-family:var(--font);font-size:23px;font-weight:700;margin-bottom:6px}
.hm-pillar-text{font-size:15.5px;color:var(--gray1);line-height:1.45}

/* ── Closing CTA ── */
.hm-closing{text-align:center;padding:3.5rem 0}
.hm-closing-title{font-family:var(--font);font-size:34px;font-weight:700;
  display:inline-block;transform:rotate(-0.4deg);margin-bottom:1.25rem}

/* ── Footer ── */
.hm-footer{text-align:center;padding:1.75rem 0 2.5rem;font-size:14.5px;color:var(--gray3);font-style:italic}
.hm-footer a{color:var(--gray1);text-decoration:underline;text-underline-offset:2px}

@media (max-width:640px){
  .hm-hero{padding:3rem 0 2.25rem}
  .hm-hero-title{font-size:38px}
  .hm-hero-sub{font-size:17px}
  .hm-section-title{font-size:26px}
}
`;

// ── Icons (small, monochrome, stroke-only — same style as the app's nav icons) ──
function TreeIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5.5" r="2.1" />
      <circle cx="6" cy="15.5" r="2.1" />
      <circle cx="18" cy="15.5" r="2.1" />
      <path d="M12 7.6 6 13.4M12 7.6l6 5.8" />
    </svg>
  );
}
function VaultIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15" r="1.3" />
    </svg>
  );
}
function BriefcaseIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.8" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3.5 12.5h17" />
    </svg>
  );
}
function IterateLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="15" stroke="#1A1A1A" strokeWidth="2.5" fill="none" />
      <path d="M18 3 A15 15 0 1 1 6.5 27" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M3.5 24 L6.5 27 L9.5 24" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  function scrollToHowItWorks() {
    document.getElementById("hm-how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="hm-root">
      <style>{CSS}</style>

      <div className="hm-topbar">
        <div className="hm-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <IterateLogo size={26} />
          <span className="hm-brand-name">iterate</span>
        </div>
        <button className="hm-login-btn" onClick={() => navigate("/login")}>log in →</button>
      </div>

      <div className="hm-wrap">
        {/* ── Hero ── */}
        <div className="hm-hero">
          <span className="hm-hero-title">Stop figuring out what to study. Just start studying.</span>
          <p className="hm-hero-sub">Enroll in your courses, and we’ll slide high-yield, interview-relevant refreshers of topics you've already studied, straight into your inbox.
          </p>
          <div className="hm-hero-ctas">
            <button className="hm-cta-primary" onClick={() => navigate("/login")}>
              get started
            </button>
            <button className="hm-cta-secondary" onClick={scrollToHowItWorks}>
              see how it works ↓
            </button>
          </div>
          <p className="hm-fine-print">no clutter, just your student email</p>
        </div>

        {/* ── How it works ── */}
        <div className="hm-section" id="hm-how-it-works">
          <span className="hm-section-title">how it works</span>
          <p className="hm-section-sub">three steps, then it runs itself.</p>

          <ol className="hm-steps">
            <li className="hm-step">
              <span className="hm-step-num">1</span>
              <div className="hm-step-body">
                <div className="hm-step-title">enroll in your courses.</div>
                <p className="hm-step-text">
                  Pick the courses you want to keep sharp on.
                </p>
              </div>
            </li>
            <li className="hm-step">
              <span className="hm-step-num">2</span>
              <div className="hm-step-body">
                <div className="hm-step-title">get a refresher in your inbox</div>
                <p className="hm-step-text">
                  Cutting out the fluff of the syllabus to deliver only what you actually learned in class that matters for interviews.

Each one comes with 2 quick MCQs and a PDF holding the answers, so once it's in your inbox you don't need internet to revise. Bus, flight, stuck in traffic? doesn't matter.
                </p>
              </div>
            </li>
            <li className="hm-step">
              <span className="hm-step-num">3</span>
              <div className="hm-step-body">
                <div className="hm-step-title">tap one button</div>
                <p className="hm-step-text">
                  "Aced" logs the topic and grows your binary revision tree in real time and shows your progress. "Confused"
                  saves it to your vault with the top explainer videos already queued up.
                </p>
              </div>
            </li>
          </ol>

          <div className="hm-why-email">
            <div className="hm-why-email-label">why email, and not a notification?</div>
            <p className="hm-why-email-text">
              Because it nudges you to actually open your inbox,  a habit that pays off
              well past revision, in uni life and later at work. And unlike a notification,
              once it's there, it's fully yours: read it, answer it, and check your work,
              all offline.
            </p>
          </div>
        </div>

        {/* ── Three pillars ── */}
        <div className="hm-section">
          <span className="hm-section-title">what you get</span>
          <p className="hm-section-sub">three features that work together.</p>

          <div className="hm-pillars">
            <div className="hm-pillar" style={{ "--r": "-0.3deg" }}>
              <div className="hm-pillar-icon"><TreeIcon /></div>
              <div className="hm-pillar-title">progress</div>
              <p className="hm-pillar-text">
                A living map for every course you're enrolled in, a revision tree in the shape of a binary tree
                showing exactly what you've mastered, and when you aced it.
              </p>
            </div>
            <div className="hm-pillar" style={{ "--r": "0.25deg" }}>
              <div className="hm-pillar-icon"><VaultIcon /></div>
              <div className="hm-pillar-title">confused vault</div>
              <p className="hm-pillar-text">
                Didn't understand? It's saved here automatically, with the 3 most-watched
                YouTube explainers on that exact topic queued up so the confusion doesn't linger.
              </p>
            </div>
            <div className="hm-pillar" style={{ "--r": "-0.2deg" }}>
              <div className="hm-pillar-icon"><BriefcaseIcon /></div>
              <div className="hm-pillar-title">interview guides</div>
              <p className="hm-pillar-text">
                Real questions and stages that Bangladesh tech companies ask and their complete interview guide pulled from a crowd-sourced GitHub repo of
                interview experiences, organized and readable.
              </p>
            </div>
          </div>
        </div>

        {/* ── Closing CTA ── */}
        <div className="hm-closing">
          <span className="hm-closing-title">ready to actually retain what you study?</span>
          <div>
            <button className="hm-cta-primary" onClick={() => navigate("/login")}>
              get started — it's free
            </button>
          </div>
        </div>
      </div>

      <div className="hm-footer">
        built by a CS student, for CS students · <a href="/support">support iterate</a>
      </div>
    </div>
  );
}
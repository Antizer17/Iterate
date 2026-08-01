import { useState } from "react";
import { SideNav } from "./iterate-app";

// ── Design tokens (scoped to .sp-root) ──────────────────────────────────────
// Same variable names / font as InterviewPage.jsx / CompanyGuidePage.jsx /
// ReportedContentPage.jsx so this reads as the same app.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.sp-root *{box-sizing:border-box;margin:0;padding:0}
.sp-root{
  --ink:#1a1a18;--paper:#faf8f4;--paper2:#f3f1eb;--paper3:#eceae3;
  --gray1:#4a4845;--gray2:#7a7870;--gray3:#aaa89f;--gray4:#ccc9c0;
  --ok:#5f8d63;--bkash:#e2136e;
  --font:'Caveat',cursive;
  background:var(--paper);color:var(--ink);font-family:var(--font);
  width:100%;
}
.sp-wrap{padding:1.5rem 1.5rem 2.5rem;max-width:90%;margin:0 auto}

.sp-header{text-align:left;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1.5px solid var(--gray4)}
.sp-title{font-family:var(--font);font-size:44px;font-weight:700;display:inline-block;transform:rotate(-0.5deg)}
.sp-sub{font-family:var(--font);font-size:17px;color:var(--gray2);font-style:italic;margin-top:4px}

.sp-card{background:linear-gradient(178deg, var(--paper) 0%, var(--paper2) 100%);
  border:1.5px solid var(--gray4);border-radius:2px 14px 4px 12px;padding:1.4rem 1.5rem;
  position:relative;margin-bottom:1.5rem;
  box-shadow:2px 3px 0 rgba(26,26,24,0.05), 0 8px 18px -10px rgba(26,26,24,0.25)}
.sp-card::before{content:'';position:absolute;top:-1px;right:-1px;width:9px;height:9px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}

.sp-method-row{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.sp-bkash-badge{font-family:var(--font);font-size:16px;font-weight:700;color:#fff;
  background:var(--bkash);padding:3px 14px;border-radius:20px;transform:rotate(-1deg)}
.sp-method-label{font-size:15px;color:var(--gray2);font-style:italic}

.sp-number-row{display:flex;align-items:center;justify-content:space-between;gap:12px;
  background:var(--paper3);border:1.5px dashed var(--gray4);border-radius:8px;
  padding:0.75rem 1rem;margin-bottom:6px}
.sp-number{font-family:'Courier New',monospace;font-size:22px;font-weight:700;letter-spacing:1px;color:var(--ink)}
.sp-copy-btn{font-family:var(--font);font-size:15px;font-weight:700;color:var(--ink);
  background:var(--paper);border:1.5px solid var(--gray4);border-radius:20px;
  padding:4px 14px;cursor:pointer;transition:background .15s ease, color .15s ease}
.sp-copy-btn:hover{background:var(--ink);color:var(--paper)}
.sp-copy-btn--copied{background:var(--ok);color:#fff;border-color:var(--ok)}
.sp-type{font-size:14.5px;color:var(--gray2);font-style:italic}

.sp-section-title{font-family:var(--font);font-size:22px;font-weight:700;margin-bottom:0.75rem;
  display:inline-block;transform:rotate(-0.3deg)}

.sp-amounts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:8px}
.sp-amount-btn{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;
  font-family:var(--font);font-size:22px;font-weight:700;color:var(--ink);
  background:var(--paper);border:1.5px solid var(--gray4);border-radius:2px 12px 4px 10px;
  padding:0.7rem 0.5rem;transition:transform .12s ease, box-shadow .12s ease, background .12s ease}
.sp-amount-btn:hover{transform:translateY(-2px);box-shadow:0 6px 14px -6px rgba(26,26,24,0.3)}
.sp-amount-btn--active{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.sp-amount-sub{font-size:12px;font-weight:400;display:block;margin-top:2px;opacity:.75}

.sp-custom-row{display:flex;align-items:center;gap:8px;margin-top:4px}
.sp-custom-row span{font-size:19px;color:var(--gray2)}
.sp-custom-row input{font-family:var(--font);font-size:19px;padding:6px 12px;background:var(--paper);
  border:1.5px solid var(--gray4);color:var(--ink);width:130px}
.sp-custom-row input:focus{outline:none;border-color:var(--ink)}

.sp-steps{list-style:none;margin-top:1rem}
.sp-step{display:flex;align-items:baseline;gap:10px;background:var(--paper);
  border:1.5px solid var(--gray4);padding:0.55rem 0.85rem;margin-bottom:8px;
  position:relative;transform:rotate(-0.15deg)}
.sp-step::before{content:'';position:absolute;top:-1px;right:-1px;width:7px;height:7px;
  border-top:1.5px solid var(--gray3);border-right:1.5px solid var(--gray3)}
.sp-step-num{font-family:var(--font);font-size:15px;font-weight:700;color:var(--paper);
  background:var(--ink);width:22px;height:22px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center}
.sp-step-text{font-size:16.5px;color:var(--gray1)}
.sp-step-text b{color:var(--ink)}

.sp-note{font-size:15px;color:var(--gray2);font-style:italic;text-align:center;
  margin-top:1.5rem;padding-top:1rem;border-top:1px dashed var(--gray4)}
`;

const PRESET_AMOUNTS = [
  { value: 50, note: "" },
  { value: 100, note: "" },
  { value: 200, note: "" },
  { value: 500, note: "" },
];

// Replace with your real bKash Personal/Merchant number.
const BKASH_NUMBER = "01626986592";
const BKASH_TYPE = "Personal — Send Money";

export default function SupportPage() {
  const [selected, setSelected] = useState(100);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState(false);

  const activeAmount = custom ? Number(custom) : selected;

  function handleCopy() {
    navigator.clipboard?.writeText(BKASH_NUMBER).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handlePreset(value) {
    setSelected(value);
    setCustom("");
  }

  return (
    <div className="sp-root">
      <style>{CSS}</style>
      <div className="sp-wrap">
        <div className="sp-header">
          <span className="sp-title">Support Iterate</span>
          <p className="sp-sub">Help us keep this free!</p>
        </div>

        <div className="sp-card">
          <div className="sp-method-row">
            <span className="sp-bkash-badge">bKash</span>
            <span className="sp-method-label">{BKASH_TYPE}</span>
          </div>

          <div className="sp-number-row">
            <span className="sp-number">{BKASH_NUMBER}</span>
            <button
              className={`sp-copy-btn ${copied ? "sp-copy-btn--copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "copied ✓" : "copy"}
            </button>
          </div>
          <p className="sp-type">tap "copy", open bKash → Send Money, and paste the number</p>
        </div>

        <span className="sp-section-title">pick an amount</span>
        <div className="sp-amounts" style={{ marginTop: "0.75rem" }}>
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a.value}
              className={`sp-amount-btn ${!custom && selected === a.value ? "sp-amount-btn--active" : ""}`}
              onClick={() => handlePreset(a.value)}
            >
              ৳{a.value}
              <span className="sp-amount-sub">{a.note}</span>
            </button>
          ))}
        </div>

        <div className="sp-custom-row">
          <span>or ৳</span>
          <input
            type="number"
            min="1"
            placeholder="custom amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </div>

        <span className="sp-section-title" style={{ marginTop: "1.75rem", display: "block" }}>
          how to send
        </span>
        <ol className="sp-steps">
          <li className="sp-step">
            <span className="sp-step-num">1</span>
            <span className="sp-step-text">Open your bKash app and choose <b>Send Money</b></span>
          </li>
          <li className="sp-step">
            <span className="sp-step-num">2</span>
            <span className="sp-step-text">
              Enter the number above and send <b>৳{activeAmount || 0}</b>
            </span>
          </li>
          <li className="sp-step">
            <span className="sp-step-num">3</span>
            <span className="sp-step-text">Add "iterate support" as the reference — thank you 🤍</span>
          </li>
        </ol>

        <p className="sp-note">every bit goes straight back into keeping iterate free for students</p>
      </div>
    </div>
  );
}

function SupportPageWithNav() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideNav />
      <SupportPage />
    </div>
  );
}
export { SupportPageWithNav };
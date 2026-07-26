"use client";

import { useState } from "react";

const samples = {
  "Lottery Scam": "Congratulations! You have won a lottery prize. Click the link now to claim your reward.",
  "Bank Phishing": "Urgent: your bank account will be blocked. Verify your OTP and account details immediately.",
  "Valid OTP": "Your verification OTP is 482971. Do not share this code with anyone.",
  "Normal Message": "Hi, can we meet tomorrow afternoon to discuss the project?"
};

const riskyWords = ["urgent", "winner", "won", "lottery", "prize", "claim", "click", "verify", "otp", "blocked", "account", "reward", "bank", "offer", "free"];

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ spam: boolean; score: number } | null>(null);
  const analyze = () => {
    const words = message.toLowerCase().match(/[a-z]+/g) ?? [];
    const hits = words.filter((word) => riskyWords.includes(word)).length;
    const score = Math.min(100, Math.max(8, Math.round((hits / Math.max(words.length, 1)) * 190 + hits * 9)));
    setResult({ spam: hits >= 2 || /(http|bit\.ly|www\.)/i.test(message), score });
  };

  return (
    <main>
      <header><div className="brand"><span>◈</span><b>SpamShield</b></div><small>100% Client-Side · Zero Backend</small></header>
      <section className="hero">
        <p className="tag">• AI-POWERED DETECTION ENGINE</p>
        <h1>Detect Spam &amp;<br /><em>Phishing Instantly</em></h1>
        <p className="subtitle">Paste any SMS, WhatsApp alert or email below. Get an instant spam probability score — all in your browser.</p>
        <div className="panel">
          <label>MESSAGE TO ANALYZE</label>
          <textarea value={message} maxLength={3000} onChange={(event) => { setMessage(event.target.value); setResult(null); }} placeholder="Paste or type your message here..." />
          <p className="count">{message.length} characters</p>
          <div className="examples">Try an example → {Object.entries(samples).map(([label, value]) => <button key={label} onClick={() => { setMessage(value); setResult(null); }}>{label}</button>)}</div>
          <button className="analyze" onClick={analyze} disabled={!message.trim()}>⌕ &nbsp; Analyze Message &nbsp; →</button>
          {result && <div className={result.spam ? "result danger" : "result safe"}><b>{result.spam ? "Spam detected" : "Message looks safe"}</b><span>{result.score}% confidence</span></div>}
        </div>
      </section>
    </main>
  );
}

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zen-Duo · Master Growth Plan</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root {
  --jade:    #1a7a5e;
  --jade-l:  #e8f5f0;
  --jade-d:  #0f4a38;
  --amber:   #e07b20;
  --amber-l: #fef3e8;
  --amber-d: #9a520f;
  --rose:    #c73d5a;
  --rose-l:  #fce8ec;
  --rose-d:  #8a2840;
  --sky:     #2b7cb8;
  --sky-l:   #e6f2fb;
  --sky-d:   #1a4d75;
  --plum:    #7045a8;
  --plum-l:  #f0eaf8;
  --plum-d:  #4b2e73;
  --gold:    #c8a420;
  --gold-l:  #fdf6e3;
  --ink:     #161b22;
  --ink-2:   #2d3748;
  --muted:   #64748b;
  --border:  #e2e8f0;
  --bg:      #f8fafb;
  --card:    #ffffff;
  --r:       10px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.65;
  font-size: 15px;
}

/* ──────── HERO ──────── */
.hero {
  background: var(--ink);
  color: #fff;
  padding: 80px 48px 72px;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 50%, rgba(26,122,94,.35) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 85% 20%, rgba(112,69,168,.25) 0%, transparent 60%);
}
.hero-inner { position: relative; max-width: 900px; margin: 0 auto; }
.hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px; font-weight: 500; letter-spacing: .06em;
  color: rgba(255,255,255,.7);
  margin-bottom: 28px;
  text-transform: uppercase;
}
.hero-tag span { width: 6px; height: 6px; border-radius: 50%; background: var(--jade); display: inline-block; }
h1 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(36px, 6vw, 62px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -.03em;
  margin-bottom: 20px;
}
h1 em { font-style: normal; color: #68d4a8; }
.hero-sub {
  font-size: 17px; color: rgba(255,255,255,.65);
  max-width: 600px; line-height: 1.7;
  margin-bottom: 44px;
}
.hero-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 13px; color: rgba(255,255,255,.8);
}
.chip strong { color: #fff; }

/* ──────── LAYOUT ──────── */
.wrap { max-width: 960px; margin: 0 auto; padding: 0 32px; }

/* ──────── SECTION TITLES ──────── */
.section-header { padding: 56px 0 32px; }
.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: 8px;
}
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 28px; font-weight: 700;
  color: var(--ink);
}

/* ──────── AUDIT TABLE ──────── */
.audit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 48px;
}
.audit-card {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 24px;
}
.audit-card.good  { border-left: 4px solid var(--jade); }
.audit-card.bad   { border-left: 4px solid var(--rose); }
.audit-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 14px; font-weight: 700;
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.audit-card.good h3 { color: var(--jade-d); }
.audit-card.bad  h3 { color: var(--rose-d); }
.audit-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.audit-list li {
  font-size: 13.5px; color: var(--ink-2);
  display: flex; align-items: flex-start; gap: 8px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--border);
}
.audit-list li:last-child { border-bottom: none; padding-bottom: 0; }
.audit-list li::before { flex-shrink: 0; margin-top: 2px; }
.audit-card.good .audit-list li::before { content: '✓'; color: var(--jade); font-weight: 700; font-size: 12px; }
.audit-card.bad  .audit-list li::before { content: '✗'; color: var(--rose); font-weight: 700; font-size: 12px; }

/* ──────── GAP ANALYSIS ──────── */
.gap-table {
  width: 100%; border-collapse: collapse;
  margin-bottom: 48px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  font-size: 13.5px;
}
.gap-table th {
  background: var(--ink); color: #fff;
  padding: 12px 16px; text-align: left;
  font-family: 'Syne', sans-serif;
  font-size: 12px; font-weight: 600; letter-spacing: .04em;
}
.gap-table td { padding: 11px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
.gap-table tr:last-child td { border-bottom: none; }
.gap-table tr:nth-child(even) td { background: #fafbfc; }
.sev {
  display: inline-block;
  padding: 2px 9px; border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: .04em;
}
.sev-crit { background: var(--rose-l); color: var(--rose-d); }
.sev-high { background: var(--amber-l); color: var(--amber-d); }
.sev-med  { background: var(--sky-l);   color: var(--sky-d);   }
.sev-low  { background: var(--jade-l);  color: var(--jade-d);  }

/* ──────── PHASES ──────── */
.phase {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  margin-bottom: 20px;
  overflow: hidden;
}
.phase-header {
  display: flex; align-items: center; gap: 18px;
  padding: 22px 28px;
  cursor: pointer;
  user-select: none;
  transition: background .15s;
}
.phase-header:hover { background: #fafbfc; }
.phase-badge {
  flex-shrink: 0;
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif;
  font-size: 13px; font-weight: 700;
  color: #fff;
}
.phase-meta { flex: 1; }
.phase-title {
  font-family: 'Syne', sans-serif;
  font-size: 17px; font-weight: 700;
  color: var(--ink); margin-bottom: 3px;
}
.phase-sub { font-size: 13px; color: var(--muted); }
.phase-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.ptag {
  font-size: 11px; font-weight: 500;
  padding: 2px 8px; border-radius: 4px;
  letter-spacing: .03em;
}
.phase-toggle {
  font-size: 20px; color: var(--muted);
  transition: transform .25s;
  flex-shrink: 0;
}
.phase.open .phase-toggle { transform: rotate(180deg); }
.phase-body {
  display: none;
  padding: 0 28px 28px;
  border-top: 1px solid var(--border);
}
.phase.open .phase-body { display: block; }

/* Phase color themes */
.ph-0 .phase-badge { background: var(--rose); }
.ph-0 .phase-header { border-left: 4px solid var(--rose); }
.ph-1 .phase-badge { background: var(--amber); }
.ph-1 .phase-header { border-left: 4px solid var(--amber); }
.ph-2 .phase-badge { background: var(--sky); }
.ph-2 .phase-header { border-left: 4px solid var(--sky); }
.ph-3 .phase-badge { background: var(--jade); }
.ph-3 .phase-header { border-left: 4px solid var(--jade); }
.ph-4 .phase-badge { background: var(--plum); }
.ph-4 .phase-header { border-left: 4px solid var(--plum); }
.ph-5 .phase-badge { background: var(--rose); }
.ph-5 .phase-header { border-left: 4px solid var(--rose); }
.ph-6 .phase-badge { background: var(--amber); }
.ph-6 .phase-header { border-left: 4px solid var(--amber); }
.ph-7 .phase-badge { background: var(--gold); }
.ph-7 .phase-header { border-left: 4px solid var(--gold); }
.ph-8 .phase-badge { background: var(--sky); }
.ph-8 .phase-header { border-left: 4px solid var(--sky); }
.ph-9 .phase-badge { background: var(--jade); }
.ph-9 .phase-header { border-left: 4px solid var(--jade); }
.ph-10 .phase-badge { background: var(--plum); }
.ph-10 .phase-header { border-left: 4px solid var(--plum); }

/* Phase body content */
.baby-view {
  margin: 20px 0;
  background: linear-gradient(135deg, #fffbf0, #fff8ed);
  border: 1.5px solid #f6d58a;
  border-radius: 10px;
  padding: 16px 18px;
  font-size: 13.5px;
}
.baby-view strong {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; color: var(--amber-d);
  letter-spacing: .05em; text-transform: uppercase;
  margin-bottom: 8px;
}

.feature-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; margin: 16px 0;
}
.feature-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
}
.feature-item h4 {
  font-size: 13px; font-weight: 600; color: var(--ink);
  margin-bottom: 5px;
  display: flex; align-items: center; gap: 6px;
}
.feature-item p { font-size: 12.5px; color: var(--muted); line-height: 1.55; }

.impl-note {
  background: var(--sky-l);
  border: 1px solid #b8d8ef;
  border-radius: 8px;
  padding: 14px 18px;
  font-size: 13px; color: var(--sky-d);
  margin-top: 14px;
}
.impl-note strong { color: var(--sky-d); }

.warn-note {
  background: var(--rose-l);
  border: 1px solid #f0b8c0;
  border-radius: 8px;
  padding: 14px 18px;
  font-size: 13px; color: var(--rose-d);
  margin-top: 10px;
}

.body-p { font-size: 14px; color: var(--ink-2); line-height: 1.7; margin: 12px 0; }
.body-ul { padding-left: 20px; margin: 10px 0; }
.body-ul li { font-size: 13.5px; color: var(--ink-2); margin-bottom: 6px; }

/* ──────── SPECIAL PHASE CONTENT ──────── */
.bug-list { display: flex; flex-direction: column; gap: 10px; margin: 14px 0; }
.bug-item {
  display: flex; align-items: flex-start; gap: 12px;
  background: var(--rose-l);
  border: 1px solid #f0b8c0;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px; color: var(--rose-d);
}
.bug-item .bug-icon { flex-shrink: 0; font-size: 16px; }
.bug-item strong { display: block; font-weight: 600; margin-bottom: 2px; color: var(--rose-d); }

.fix-item {
  background: var(--jade-l);
  border: 1px solid #aad8c8;
  color: var(--jade-d);
}

/* Level grid */
.level-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px; margin: 14px 0;
}
.level-card {
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 8px; padding: 12px;
  text-align: center; font-size: 12px;
}
.level-card .emo { font-size: 22px; margin-bottom: 4px; }
.level-card .lnum { font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
.level-card .ltitle { font-size: 11.5px; font-weight: 600; color: var(--ink); margin-top: 3px; }
.level-card.new-level { border-color: var(--jade); background: var(--jade-l); }
.level-card.new-level .lnum { color: var(--jade); }

/* Timeline bar */
.timeline {
  display: flex; gap: 0;
  margin: 32px 0; border-radius: 8px; overflow: hidden;
  border: 1.5px solid var(--border);
}
.tbar {
  padding: 14px 10px;
  text-align: center;
  font-size: 11px; font-weight: 700;
  color: #fff; cursor: default;
  flex: 1;
}
.tbar span { display: block; font-size: 10px; font-weight: 400; opacity: .8; margin-top: 2px; }

/* Beyond section */
.beyond-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 14px; margin: 16px 0;
}
.beyond-card {
  border-radius: 10px; padding: 20px 18px;
  font-size: 13px;
}
.beyond-card h4 {
  font-family: 'Syne', sans-serif;
  font-size: 14px; font-weight: 700; margin-bottom: 8px;
}
.beyond-card.b1 { background: var(--plum-l); color: var(--plum-d); border: 1px solid #c4aee4; }
.beyond-card.b2 { background: var(--jade-l); color: var(--jade-d); border: 1px solid #9ed4bf; }
.beyond-card.b3 { background: var(--amber-l); color: var(--amber-d); border: 1px solid #e8c48a; }

/* Duolingo compare */
.compare-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; border: 1.5px solid var(--border);
  border-radius: var(--r); overflow: hidden;
  margin: 20px 0;
}
.compare-col { padding: 0; }
.compare-col:first-child { border-right: 1px solid var(--border); }
.compare-head {
  padding: 14px 20px;
  font-family: 'Syne', sans-serif;
  font-size: 13px; font-weight: 700;
  letter-spacing: .02em;
}
.compare-head.duo  { background: #e8f5e2; color: #2d6a1a; }
.compare-head.zen  { background: var(--jade-l); color: var(--jade-d); }
.compare-row {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 9px 18px;
  border-top: 1px solid var(--border);
  font-size: 13px;
}
.compare-row .ci { flex-shrink: 0; margin-top: 2px; font-size: 12px; }
.ci-no  { color: var(--rose); }
.ci-yes { color: var(--jade); }
.ci-fut { color: var(--amber); }

/* Footer */
footer {
  background: var(--ink);
  color: rgba(255,255,255,.5);
  text-align: center;
  padding: 32px;
  font-size: 13px;
  margin-top: 80px;
}
footer strong { color: #68d4a8; }

/* Responsive */
@media (max-width: 640px) {
  .audit-grid { grid-template-columns: 1fr; }
  .feature-grid { grid-template-columns: 1fr; }
  .level-grid { grid-template-columns: repeat(3, 1fr); }
  .beyond-grid { grid-template-columns: 1fr; }
  .compare-grid { grid-template-columns: 1fr; }
  .compare-col:first-child { border-right: none; border-bottom: 1px solid var(--border); }
  .hero { padding: 48px 24px 44px; }
  .wrap { padding: 0 20px; }
}
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-inner">
    <div class="hero-tag"><span></span> Zen-Duo · Master Roadmap · June 2026</div>
    <h1>From first tap to<br><em>beating Duolingo</em></h1>
    <p class="hero-sub">A phase-by-phase growth plan for teaching babies &amp; kids — seen through the eyes of a child who has never received any instructions.</p>
    <div class="hero-chips">
      <div class="chip"><strong>11 Phases</strong> of work</div>
      <div class="chip"><strong>Vietnamese–English</strong> focus</div>
      <div class="chip"><strong>Local AI</strong> powered (zen-tts + zen-lights)</div>
      <div class="chip"><strong>Offline-first</strong> PWA</div>
      <div class="chip"><strong>Ages 1–8</strong> target</div>
    </div>
  </div>
</div>

<div class="wrap">

<!-- SECTION: CODE AUDIT -->
<div class="section-header">
  <div class="section-label">Step 1 · Code Audit</div>
  <div class="section-title">What exists today — honest review</div>
</div>

<div class="audit-grid">
  <div class="audit-card good">
    <h3>✓ Strong Foundations</h3>
    <ul class="audit-list">
      <li>Clean Vite SPA — fast, easy to iterate on</li>
      <li>4 solid challenge types: matching, choice, listening, builder</li>
      <li>Local AI stack (zen-tts + zen-lights) is genuinely unique</li>
      <li>XP / hearts / streak system with localStorage persistence</li>
      <li>Curiosity Sandbox — no equivalent in Duolingo Kids</li>
      <li>Fredoka font + 3D tactile buttons feel playful and right</li>
      <li>Dark / light mode support</li>
      <li>TTS speaks every word clicked — great passive listening</li>
    </ul>
  </div>
  <div class="audit-card bad">
    <h3>✗ Critical Problems Found</h3>
    <ul class="audit-list">
      <li><code>alert()</code> and <code>confirm()</code> used everywhere — kills immersion completely</li>
      <li>Lesson complete uses <code>alert()</code> — no celebration screen</li>
      <li>Hearts-runout uses <code>alert()</code> inside <code>setTimeout</code></li>
      <li>Exit button uses <code>confirm()</code> — children cannot process this</li>
      <li>Sandbox has a text input field — toddlers cannot type</li>
      <li>Review mode is entirely hardcoded, ignores all lesson content</li>
      <li>No first-run onboarding — child has zero guidance</li>
      <li>Challenge instructions are text-only — pre-readers are lost</li>
      <li>Only 4 levels (~10–15 minutes of content total)</li>
      <li>Path map is a straight vertical line — no visual journey feeling</li>
    </ul>
  </div>
</div>

<!-- SECTION: DUOLINGO GAP ANALYSIS -->
<div class="section-header">
  <div class="section-label">Step 2 · Gap Analysis</div>
  <div class="section-title">Feature gaps vs Duolingo (Kids edition)</div>
</div>

<table class="gap-table">
  <thead>
    <tr>
      <th>Feature / Dimension</th>
      <th>Duolingo</th>
      <th>Zen-Duo (today)</th>
      <th>Impact on a 3-year-old</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Mascot / Guide character</strong></td>
      <td>Duo the owl — iconic, emotional, ever-present</td>
      <td>None</td>
      <td>Child has no "friend" — no emotional attachment to the app</td>
      <td><span class="sev sev-crit">Critical</span></td>
    </tr>
    <tr>
      <td><strong>Onboarding flow</strong></td>
      <td>Guided first-lesson with Duo walking you through each step</td>
      <td>None — cold start</td>
      <td>Child opens app and sees a map with no explanation</td>
      <td><span class="sev sev-crit">Critical</span></td>
    </tr>
    <tr>
      <td><strong>Lesson completion screen</strong></td>
      <td>Full-screen celebration with stars, XP animation, character</td>
      <td><code>alert()</code> dialog</td>
      <td>Jarring browser dialog in place of joyful celebration</td>
      <td><span class="sev sev-crit">Critical</span></td>
    </tr>
    <tr>
      <td><strong>Animated path map</strong></td>
      <td>Winding path with checkpoints, animations, scenery</td>
      <td>Straight vertical column</td>
      <td>No sense of journey or progress</td>
      <td><span class="sev sev-high">High</span></td>
    </tr>
    <tr>
      <td><strong>Audio-narrated instructions</strong></td>
      <td>Instructions spoken aloud by Duo in kids mode</td>
      <td>Text only</td>
      <td>Pre-readers (age 2–4) cannot read challenge instructions</td>
      <td><span class="sev sev-crit">Critical</span></td>
    </tr>
    <tr>
      <td><strong>Heart refill system</strong></td>
      <td>Timed refill, gem purchase, or practice exercises</td>
      <td>Hearts reset each lesson — no refill mechanic</td>
      <td>No cost to mistakes — hearts have zero meaning</td>
      <td><span class="sev sev-high">High</span></td>
    </tr>
    <tr>
      <td><strong>Curriculum depth</strong></td>
      <td>Hundreds of levels, years of content</td>
      <td>4 levels (~10–15 min)</td>
      <td>Child exhausts content in one sitting</td>
      <td><span class="sev sev-crit">Critical</span></td>
    </tr>
    <tr>
      <td><strong>Spaced repetition (SRS)</strong></td>
      <td>Intelligent review scheduling for retention</td>
      <td>None — review is hardcoded slideshow</td>
      <td>Words are never revisited strategically — poor retention</td>
      <td><span class="sev sev-high">High</span></td>
    </tr>
    <tr>
      <td><strong>Achievement badges</strong></td>
      <td>Dozens of achievement types, trophy collection</td>
      <td>None</td>
      <td>No milestone celebration beyond lesson end</td>
      <td><span class="sev sev-med">Medium</span></td>
    </tr>
    <tr>
      <td><strong>Streak rewards / protection</strong></td>
      <td>Streak freeze, streak bonus, streak society</td>
      <td>Streak counted but no meaning or protection</td>
      <td>Streak is just a number — no motivation to protect it</td>
      <td><span class="sev sev-med">Medium</span></td>
    </tr>
    <tr>
      <td><strong>Pronunciation / speaking</strong></td>
      <td>Speak challenges with voice recognition scoring</td>
      <td>None</td>
      <td>No output practice — only passive input</td>
      <td><span class="sev sev-med">Medium</span></td>
    </tr>
    <tr>
      <td><strong>Gem/coin economy</strong></td>
      <td>Lingots / gems fund hearts, power-ups, cosmetics</td>
      <td>None</td>
      <td>No reward loop beyond XP number going up</td>
      <td><span class="sev sev-med">Medium</span></td>
    </tr>
    <tr>
      <td><strong>Parent dashboard</strong></td>
      <td>Family plan with progress reports</td>
      <td>None</td>
      <td>Parents have no visibility into what child is learning</td>
      <td><span class="sev sev-med">Medium</span></td>
    </tr>
    <tr>
      <td><strong>Adaptive difficulty</strong></td>
      <td>Adjusts challenge difficulty per learner</td>
      <td>Fixed difficulty</td>
      <td>No personalization — same experience for all ages</td>
      <td><span class="sev sev-med">Medium</span></td>
    </tr>
    <tr>
      <td><strong>PWA / offline support</strong></td>
      <td>Full offline via mobile app</td>
      <td>None (in TODO)</td>
      <td>Cannot use in airplane, car, or poor-connectivity areas</td>
      <td><span class="sev sev-high">High</span></td>
    </tr>
  </tbody>
</table>

<!-- SECTION: TIMELINE -->
<div class="section-header">
  <div class="section-label">Step 3 · Roadmap</div>
  <div class="section-title">Phased delivery timeline</div>
</div>

<div class="timeline">
  <div class="tbar" style="background:var(--rose)">P0<span>Now</span></div>
  <div class="tbar" style="background:var(--amber)">P1<span>M1</span></div>
  <div class="tbar" style="background:var(--sky)">P2<span>M2</span></div>
  <div class="tbar" style="background:var(--jade)">P3<span>M2–3</span></div>
  <div class="tbar" style="background:var(--plum)">P4<span>M3–4</span></div>
  <div class="tbar" style="background:#c73d7a">P5<span>M4–5</span></div>
  <div class="tbar" style="background:var(--amber)">P6<span>M5–6</span></div>
  <div class="tbar" style="background:var(--gold)">P7<span>M6–7</span></div>
  <div class="tbar" style="background:var(--sky)">P8<span>M7–8</span></div>
  <div class="tbar" style="background:var(--jade)">P9<span>M8–10</span></div>
  <div class="tbar" style="background:var(--plum)">P10<span>M10+</span></div>
</div>

<!-- PHASES -->

<!-- PHASE 0 -->
<div class="phase ph-0 open" id="p0">
  <div class="phase-header" onclick="toggle('p0')">
    <div class="phase-badge">P0</div>
    <div class="phase-meta">
      <div class="phase-title">🚨 Critical Fixes — Remove All Blockers</div>
      <div class="phase-sub">The app must not crash a child's experience before they even start</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--rose-l);color:var(--rose-d)">Do first</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">~1 week</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      A 3-year-old picks up the tablet. She taps the level icon. She finishes her first lesson. A gray browser alert box appears. She taps anywhere on the screen — the browser chrome. She's confused. She hands the tablet back. <em>Session over.</em>
    </div>

    <p class="body-p">These are bugs, not features. Every single <code>alert()</code> and <code>confirm()</code> must be replaced before shipping to any child. This is the minimum viable state for a real child to use the app unsupervised.</p>

    <div class="bug-list">
      <div class="bug-item">
        <span class="bug-icon">🚫</span>
        <div>
          <strong>alert() on lesson complete (line 600, main.js)</strong>
          Replace with a full-screen celebration modal: stars earned, XP animation, confetti burst, mascot celebrating, "Continue" button. This is the emotional peak of every lesson — treat it that way.
        </div>
      </div>
      <div class="bug-item">
        <span class="bug-icon">🚫</span>
        <div>
          <strong>alert() on hearts runout (line 562–565, main.js)</strong>
          Replace with an animated "hearts empty" screen — a sad/sleepy mascot, gentle music, a "Try Again" button. No jarring dialog. No browser chrome involvement.
        </div>
      </div>
      <div class="bug-item">
        <span class="bug-icon">🚫</span>
        <div>
          <strong>confirm() on lesson exit button (line 223, main.js)</strong>
          Replace with an in-app slide-up sheet: "Leave this lesson? Your progress will be lost." with Yes/No large-tap buttons. Children cannot read confirm dialogs.
        </div>
      </div>
      <div class="bug-item">
        <span class="bug-icon">🚫</span>
        <div>
          <strong>Text-only challenge instructions</strong>
          Add <code>speak(challenge.instruction)</code> on every challenge render. The instruction text must be read aloud automatically with a small delay. Pre-readers depend on this entirely.
        </div>
      </div>
      <div class="bug-item">
        <span class="bug-icon">🚫</span>
        <div>
          <strong>Hardcoded review vocabulary (line 698–710, main.js)</strong>
          The review slideshow shows a fixed list of 11 words completely disconnected from what the child has learned. Build a vocabulary index from LEVELS → lessons → challenges and pull from there.
        </div>
      </div>
      <div class="bug-item">
        <span class="bug-icon">🚫</span>
        <div>
          <strong>Sandbox text input field</strong>
          Children ages 2–5 cannot type. Add a "picture category picker" grid as the primary mode: big tap-friendly icons for Animals, Food, Colors, etc. Keep the text input as a secondary "Advanced" mode.
        </div>
      </div>
    </div>

    <div class="impl-note">
      <strong>Implementation note:</strong> Create a shared <code>showModal(type, data)</code> function in a new <code>modal.js</code> file. Types: <code>'lesson-complete'</code>, <code>'hearts-empty'</code>, <code>'exit-confirm'</code>, <code>'level-unlock'</code>. This prevents future alert() regression and gives a consistent overlay system.
    </div>
  </div>
</div>

<!-- PHASE 1 -->
<div class="phase ph-1" id="p1">
  <div class="phase-header" onclick="toggle('p1')">
    <div class="phase-badge">P1</div>
    <div class="phase-meta">
      <div class="phase-title">💛 Heart & Soul — Mascot + World Building</div>
      <div class="phase-sub">Give the app a personality a child will love and miss</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--amber-l);color:var(--amber-d)">High impact</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 1</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      Without a mascot, zen-duo is a worksheet. With one, it's a friend. When Duo the owl celebrates with a child, Duolingo becomes emotionally sticky. Zen-duo needs that same character — a creature the child will ask to "visit" every day.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>🐼 Design "Zen" — the mascot</h4>
        <p>A small friendly creature (panda? cloud spirit? leaf-dragon?). SVG-based with 6 emotion states: Happy, Excited, Sleeping, Sad, Thinking, Celebrating. Designed as a simple SVG that zen-lights can render at any size.</p>
      </div>
      <div class="feature-item">
        <h4>🗺️ Winding path map</h4>
        <p>Replace straight vertical column with a zigzag/winding path SVG. Level nodes sit on the path like Duolingo. Completed sections show a filled green trail. Locked sections are greyed out with a lock icon.</p>
      </div>
      <div class="feature-item">
        <h4>👋 First-run onboarding</h4>
        <p>Zen appears on first launch. "Xin chào! I'm Zen! Let me show you around." 3-screen guided tour with large tap zones. No text reading required — Zen speaks everything. Stores completion flag in localStorage.</p>
      </div>
      <div class="feature-item">
        <h4>🎊 Animated celebration screens</h4>
        <p>Lesson complete: Zen dances, stars animate in (1–3 based on mistakes made), XP counter ticks up, confetti rains. Level unlock: Zen gasps, the path glows, new node animates into the map. Full-screen modal every time.</p>
      </div>
      <div class="feature-item">
        <h4>💔 Emotional error recovery</h4>
        <p>Wrong answer: Zen looks worried, shakes head gently, then shows "Let's try again!" Wrong answer 3× in a row: Zen says something encouraging in Vietnamese. Hearts empty: Zen looks sleepy, "Zen needs a rest..." — much softer than current behavior.</p>
      </div>
      <div class="feature-item">
        <h4>🌟 Daily greeting</h4>
        <p>Each session start, Zen greets the child based on time of day: "Good morning!" / "Good afternoon!" / "Good night!". Streak shown as "Zen has visited X days in a row!". Creates daily attachment ritual.</p>
      </div>
    </div>

    <div class="impl-note">
      <strong>Implementation note:</strong> Create <code>zen-mascot.js</code> as an SVG sprite system. Zen's states are SVG frames accessible via CSS class swap. The mascot component should be reusable anywhere — map, lesson, sandbox, review — with a <code>setEmotion(type)</code> API.
    </div>
  </div>
</div>

<!-- PHASE 2 -->
<div class="phase ph-2" id="p2">
  <div class="phase-header" onclick="toggle('p2')">
    <div class="phase-badge">P2</div>
    <div class="phase-meta">
      <div class="phase-title">📱 PWA + Touch Perfection</div>
      <div class="phase-sub">Make it feel like a native app, work offline, and respond to tiny fingers</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--sky-l);color:var(--sky-d)">Technical</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 2</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      A child on a car journey in a tunnel. Dad taps the app icon on the home screen (like a real app). It opens instantly. No loading spinner. No "you need internet" message. The child plays normally. This is the offline PWA promise.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>⚡ PWA Installation</h4>
        <p>Install <code>@vite-pwa/plugin</code>. Configure manifest with zen-duo icons, splash screen, theme color. Service worker caches: all SVG icons, CSS fonts (Fredoka), lesson data, TTS audio for completed levels.</p>
      </div>
      <div class="feature-item">
        <h4>✋ Drag-and-drop sentence builder</h4>
        <p>Replace click-to-add with native <code>pointerdown/move/up</code> drag events. Word blocks can be physically dragged into the answer slot. This is how children instinctively interact with tablets — the current click-to-add feels unnatural.</p>
      </div>
      <div class="feature-item">
        <h4>📲 Bottom tab navigation</h4>
        <p>Replace the hamburger + sidebar with a fixed bottom tab bar on mobile (like every native app). 4 tabs: Learn, Sandbox, Review, Profile. The current hidden sidebar is invisible to children.</p>
      </div>
      <div class="feature-item">
        <h4>👆 Touch target sizing</h4>
        <p>Every tappable element must be at minimum 56×56px on mobile. Audit all option cards, word blocks, and nav items. Add generous padding. Children have imprecise fine motor control — small tap zones cause frustration.</p>
      </div>
      <div class="feature-item">
        <h4>📳 Haptic feedback</h4>
        <p>Use <code>navigator.vibrate()</code> for key moments: correct answer (short double pulse), wrong answer (long buzz), lesson complete (triple pulse pattern). Adds physical reward sensation beyond just sound.</p>
      </div>
      <div class="feature-item">
        <h4>🔄 Orientation lock</h4>
        <p>Add <code>screen.orientation.lock('portrait')</code> on install. Zen-duo is designed portrait. Accidental rotation to landscape during excited tapping should not break the layout.</p>
      </div>
    </div>

    <div class="impl-note">
      <strong>Local service caching strategy:</strong> zen-tts audio responses should be cached in IndexedDB keyed by word. zen-lights SVG outputs cached by word in localStorage. Once a child has heard and seen a word, it should load &lt;50ms on every subsequent visit even offline.
    </div>
  </div>
</div>

<!-- PHASE 3 -->
<div class="phase ph-3" id="p3">
  <div class="phase-header" onclick="toggle('p3')">
    <div class="phase-badge">P3</div>
    <div class="phase-meta">
      <div class="phase-title">📚 Content Explosion — 20+ Levels</div>
      <div class="phase-sub">Fill the learning world with vocabulary that matters to children</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--jade-l);color:var(--jade-d)">Most visible impact</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 2–3</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      A child completes all 4 levels in one day. They tap the map the next morning. All levels are already gold. There's nothing new to do. They put the tablet down and don't come back. <em>Churn from content exhaustion.</em>
    </div>

    <p class="body-p">The current 4 levels represent roughly 10–15 minutes of content. A child who learns efficiently can exhaust this in a single session. We need at least 20 levels for the first month of engagement, growing toward 50+ over the year. Each level = 2–3 lessons = ~15 minutes of play.</p>

    <div class="level-grid">
      <div class="level-card"><div class="emo">🐶</div><div class="lnum">L1 (exists)</div><div class="ltitle">Pets & Sounds</div></div>
      <div class="level-card"><div class="emo">🍎</div><div class="lnum">L2 (exists)</div><div class="ltitle">Yummy Foods</div></div>
      <div class="level-card"><div class="emo">🏠</div><div class="lnum">L3 (exists)</div><div class="ltitle">My Sweet Home</div></div>
      <div class="level-card"><div class="emo">🌈</div><div class="lnum">L4 (exists)</div><div class="ltitle">Sky & Colors</div></div>

      <div class="level-card new-level"><div class="emo">🔢</div><div class="lnum">L5 · NEW</div><div class="ltitle">Numbers 1–10</div></div>
      <div class="level-card new-level"><div class="emo">👋</div><div class="lnum">L6 · NEW</div><div class="ltitle">Hello World</div></div>
      <div class="level-card new-level"><div class="emo">👨‍👩‍👧</div><div class="lnum">L7 · NEW</div><div class="ltitle">My Family</div></div>
      <div class="level-card new-level"><div class="emo">😊</div><div class="lnum">L8 · NEW</div><div class="ltitle">How I Feel</div></div>
      <div class="level-card new-level"><div class="emo">👕</div><div class="lnum">L9 · NEW</div><div class="ltitle">Getting Dressed</div></div>
      <div class="level-card new-level"><div class="emo">🌦️</div><div class="lnum">L10 · NEW</div><div class="ltitle">Weather & Sky</div></div>
      <div class="level-card new-level"><div class="emo">🚗</div><div class="lnum">L11 · NEW</div><div class="ltitle">Vroom Vroom</div></div>
      <div class="level-card new-level"><div class="emo">⚽</div><div class="lnum">L12 · NEW</div><div class="ltitle">Let's Play</div></div>
      <div class="level-card new-level"><div class="emo">🌿</div><div class="lnum">L13 · NEW</div><div class="ltitle">Nature Walk</div></div>
      <div class="level-card new-level"><div class="emo">🎒</div><div class="lnum">L14 · NEW</div><div class="ltitle">At School</div></div>
      <div class="level-card new-level"><div class="emo">⬛</div><div class="lnum">L15 · NEW</div><div class="ltitle">Shapes</div></div>
      <div class="level-card new-level"><div class="emo">🕐</div><div class="lnum">L16 · NEW</div><div class="ltitle">What Time Is It?</div></div>
      <div class="level-card new-level"><div class="emo">💪</div><div class="lnum">L17 · NEW</div><div class="ltitle">My Body</div></div>
      <div class="level-card new-level"><div class="emo">🌸</div><div class="lnum">L18 · NEW</div><div class="ltitle">Seasons & Tết</div></div>
      <div class="level-card new-level"><div class="emo">🔢</div><div class="lnum">L19 · NEW</div><div class="ltitle">Numbers 10–20</div></div>
      <div class="level-card new-level"><div class="emo">🌍</div><div class="lnum">L20 · NEW</div><div class="ltitle">My World</div></div>
    </div>

    <p class="body-p"><strong>New challenge types to add in Phase 3:</strong></p>
    <ul class="body-ul">
      <li><strong>Tap the picture (type: "tap-image")</strong> — Show 4–6 pictures, speak a word, child taps the right one. Zero reading required. Best exercise for ages 2–3.</li>
      <li><strong>Yes or No (type: "yes-no")</strong> — Show a picture + say a word. Two giant YES / NO buttons. "Is this a cat? Yes!" Great for very early learners.</li>
      <li><strong>Drag to sort (type: "drag-sort")</strong> — Two buckets (e.g. Animals / Foods). Drag each item to the right bucket. Uses pointer events from Phase 2.</li>
      <li><strong>Fill the blank (type: "fill-blank")</strong> — "The ___ is red." with 3 word choices. Introduces simple grammar in context.</li>
    </ul>

    <div class="impl-note">
      <strong>Content generation strategy:</strong> Use zen-lights (the local Qwen-Coder model) to auto-generate lesson JSON from a topic + word list prompt. This dramatically speeds up authoring new levels. Define a <code>lesson-template.json</code> schema and have the AI fill it. Human review each generated lesson before shipping.
    </div>
  </div>
</div>

<!-- PHASE 4 -->
<div class="phase ph-4" id="p4">
  <div class="phase-header" onclick="toggle('p4')">
    <div class="phase-badge">P4</div>
    <div class="phase-meta">
      <div class="phase-title">🧠 Smart Learning Engine</div>
      <div class="phase-sub">Make the app adapt to each child — not the other way around</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--plum-l);color:var(--plum-d)">Pedagogy</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 3–4</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      A 4-year-old knows "dog" and "cat" perfectly but keeps getting "fish" wrong. The app keeps testing "dog" and "cat" anyway — and never drills "fish" enough. A smart system sees the weak word and serves it more often until it sticks. This is how human tutors work.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>🔁 Spaced Repetition (SRS)</h4>
        <p>Track per-word performance (attempts, correct rate, last seen). Score words 1–5 stars. Schedule review using a simplified Leitner box system: 5-star words appear weekly, 1-star words appear in every session.</p>
      </div>
      <div class="feature-item">
        <h4>📉 Adaptive difficulty</h4>
        <p>Track rolling 5-challenge performance. If &gt;80% correct → increase challenge complexity (fewer choices, harder distractors, longer sentences). If &lt;50% → simplify (more visual cues, fewer options, shorter words).</p>
      </div>
      <div class="feature-item">
        <h4>🩹 Auto-generated mistake review</h4>
        <p>After every session, collect all incorrectly answered words. If ≥3 errors, create a "Fix It!" mini-lesson on the map: a special red node that replays those specific words in simplified form until mastered.</p>
      </div>
      <div class="feature-item">
        <h4>🔬 Dynamic curiosity levels</h4>
        <p>Track words searched in the Sandbox. If a child searches 3+ words in the same category (e.g. "dinosaur", "T-Rex", "volcano"), auto-generate and inject a "Dinosaur World" level on the map using zen-lights.</p>
      </div>
      <div class="feature-item">
        <h4>⭐ Word mastery stars</h4>
        <p>Each word has 0–5 stars visible in a "My Words" dictionary view. Stars fill as the word is correctly answered across sessions (not just within one lesson). A word is "mastered" at 5 stars.</p>
      </div>
      <div class="feature-item">
        <h4>🌡️ Difficulty toggle</h4>
        <p>A parent-accessible "pace" setting: Gentle (fewer choices, more audio hints), Standard, Explorer (harder distractors, less audio scaffolding, reverse translation). Defaults to Gentle for ages 0–3.</p>
      </div>
    </div>

    <div class="impl-note">
      <strong>Data model:</strong> Create a <code>wordBank</code> object in state/localStorage keyed by word ID. Each entry: <code>{ word, attempts, correct, lastSeen, level, starRating }</code>. The SRS scheduler runs at session start and appends flagged words to the lesson queue. This data also feeds the parent dashboard in Phase 8.
    </div>
  </div>
</div>

<!-- PHASE 5 -->
<div class="phase ph-5" id="p5">
  <div class="phase-header" onclick="toggle('p5')">
    <div class="phase-badge">P5</div>
    <div class="phase-meta">
      <div class="phase-title">🎤 Speaking & Pronunciation</div>
      <div class="phase-sub">The child's voice becomes part of the learning loop</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--rose-l);color:var(--rose-d)">AI integration</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 4–5</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      The child hears "cat" twenty times but never says it themselves. Passive input is valuable, but active output — actually speaking the word — creates far stronger neural pathways. When a child says "cat" and hears themselves say it correctly, something clicks that listening alone cannot create.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>🎙️ "Say it!" challenge type</h4>
        <p>New challenge type: show a picture, Zen asks "What is this?". Big microphone button. Child speaks. Local Whisper model transcribes. If the word matches → green explosion. Zero cloud, full privacy.</p>
      </div>
      <div class="feature-item">
        <h4>📊 Pronunciation scoring</h4>
        <p>Compare Whisper's transcription to target word. Exact match = 100%. Phonetically close = partial credit (use edit distance on IPA representation). Show a simple "Great! / Almost! / Try again!" — not a number score for kids.</p>
      </div>
      <div class="feature-item">
        <h4>🔁 Echo mode</h4>
        <p>New challenge: Zen says a word, then a waveform animates showing "your turn". Child says the word back. Whisper confirms. Simple imitation exercise — the lowest-friction speaking practice. Excellent for ages 2+.</p>
      </div>
      <div class="feature-item">
        <h4>🎵 Phonics module (pre-reading)</h4>
        <p>Before age 4 can read, they learn sounds. Add a phonics track: learn the /a/ sound → words that start with /a/ → tap the ones that start with /a/. Connects letter shapes to mouth sounds. Foundation for reading in Phase 6.</p>
      </div>
      <div class="feature-item">
        <h4>🦜 Parrot mode in Sandbox</h4>
        <p>In the Curiosity Sandbox, add a microphone button. Child can tap any word → hear it → tap microphone → say it → get score. Infinite speaking practice with any word they're curious about.</p>
      </div>
      <div class="feature-item">
        <h4>📻 Record &amp; Playback</h4>
        <p>After a speaking challenge, play back the child's own voice alongside the model pronunciation. Children are fascinated by hearing themselves. This metacognitive comparison accelerates pronunciation improvement dramatically.</p>
      </div>
    </div>

    <div class="impl-note">
      <strong>Local Whisper integration:</strong> Route audio via <code>/api/stt</code> proxy to a local Whisper endpoint (similar to existing zen-tts at :5055). Use Whisper Tiny or Base model for fast CPU inference. Add a new backend entry in <code>vite.config.js</code> proxy config. Web Audio API <code>MediaRecorder</code> captures .webm, converts to WAV, POSTs to endpoint.
    </div>
  </div>
</div>

<!-- PHASE 6 -->
<div class="phase ph-6" id="p6">
  <div class="phase-header" onclick="toggle('p6')">
    <div class="phase-badge">P6</div>
    <div class="phase-meta">
      <div class="phase-title">📖 Reading Foundation</div>
      <div class="phase-sub">Bridge from pictures to written words, gently and naturally</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--amber-l);color:var(--amber-d)">Age 4+</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 5–6</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      A 5-year-old sees the word "CAT" and sounds it out: /k/ /æ/ /t/. They've heard the word a hundred times in zen-duo. Now the letters connect. This moment — when spoken language and written symbols converge — is one of the most profound leaps in early childhood. Zen-duo can scaffold it.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>🔤 Letter recognition track</h4>
        <p>A separate "ABC" path alongside the main vocabulary path. Each letter: see the shape, hear the sound, trace it with a finger, find words that start with it. Uses phonics foundation from Phase 5.</p>
      </div>
      <div class="feature-item">
        <h4>✏️ Letter tracing</h4>
        <p>Touch-based tracing: a letter displayed in dashed outline, child traces over it with finger. Use Canvas API to detect if path follows the letter guide within tolerance. Gentle sparkle trail follows the finger.</p>
      </div>
      <div class="feature-item">
        <h4>🔍 Sight words module</h4>
        <p>The 100 most common English words (the, a, is, I, you, etc.) presented as a "power words" track. These cannot be sounded out phonetically — they must be memorized by sight. Flash-card style with SRS from Phase 4.</p>
      </div>
      <div class="feature-item">
        <h4>📕 First Readers</h4>
        <p>3–5 sentence illustrated stories using only mastered vocabulary. "The cat sat. The cat is red. The red cat runs." One sentence per screen, auto-spoken. Child can tap any word to hear it again. Beautiful illustrated backgrounds using zen-lights SVG.</p>
      </div>
      <div class="feature-item">
        <h4>🔡 Spell it! challenge</h4>
        <p>New challenge type for age 5+: show a picture (e.g. cat), provide letter tiles, child arranges them to spell the word. A scaled-up version of the sentence builder, applied to individual letters. Great prerequisite for writing.</p>
      </div>
      <div class="feature-item">
        <h4>📚 My Word Dictionary</h4>
        <p>All mastered words collected in a personal illustrated dictionary — the child's "book". Each entry: the word, its SVG illustration (from zen-lights), its Vietnamese translation, a star rating, and a tap-to-hear button. A trophy of learning.</p>
      </div>
    </div>
  </div>
</div>

<!-- PHASE 7 -->
<div class="phase ph-7" id="p7">
  <div class="phase-header" onclick="toggle('p7')">
    <div class="phase-badge">P7</div>
    <div class="phase-meta">
      <div class="phase-title">💎 Reward Ecosystem</div>
      <div class="phase-sub">Give children reasons to return every single day</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--gold-l);color:var(--amber-d)">Engagement loop</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 6–7</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      A child opens the app and sees their pet cloud-dragon has grown bigger since yesterday. It has a little hat because they earned enough gems. They want to come back tomorrow to see what happens next. This is the attachment mechanic that makes apps daily habits.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>💎 Gem currency</h4>
        <p>Gems earned from: perfect lessons (no mistakes), streak milestones, first completion of a level, daily bonus. Separate from XP (which measures progress). Gems buy cosmetics and consumables from the shop.</p>
      </div>
      <div class="feature-item">
        <h4>🥚 Zen's companion egg</h4>
        <p>At Level 5, Zen gives the child a mystery egg. It hatches after 3 days of activity. Inside: a companion animal (one of 12 types). The companion appears on the map path and in lesson celebrations. Can be fed/leveled up with gems.</p>
      </div>
      <div class="feature-item">
        <h4>🛒 Cosmetics shop</h4>
        <p>Spend gems on: Zen outfits (astronaut, chef, knight), map background themes (jungle, space, ocean), lesson card borders, celebration effect styles. All cosmetic — no pay-to-win. Children love customization.</p>
      </div>
      <div class="feature-item">
        <h4>🏆 Achievement badges</h4>
        <p>50+ badges categorized: Explorer (first lesson, first 5 levels), Scholar (10/50/100 words mastered), Streaker (7/30/100 day streak), Champion (perfect lesson, 5 perfect lessons in a row), Curious (20 sandbox searches). Shown in a trophy room.</p>
      </div>
      <div class="feature-item">
        <h4>🛡️ Streak freeze</h4>
        <p>Streak shield: buy with 50 gems, auto-activates if a day is missed. Without this, a 30-day streak lost on a sick day feels devastating to a child (and ends engagement). Essential for sustainable daily habit.</p>
      </div>
      <div class="feature-item">
        <h4>📅 Daily challenge node</h4>
        <p>A special "Star Challenge" node appears on the map every day. Completing it: 3× XP, gems, special badge. Auto-resets at midnight. This creates a daily reason to open the app independent of curriculum progress.</p>
      </div>
    </div>

    <div class="warn-note">
      <strong>Design principle:</strong> All rewards must be cosmetic or consumable practice aids. Never put vocabulary content, curriculum levels, or learning advancement behind a paywall or gem wall. The learning must always be 100% free — rewards are for decoration and motivation only.
    </div>
  </div>
</div>

<!-- PHASE 8 -->
<div class="phase ph-8" id="p8">
  <div class="phase-header" onclick="toggle('p8')">
    <div class="phase-badge">P8</div>
    <div class="phase-meta">
      <div class="phase-title">👨‍👩‍👧 Parent Portal</div>
      <div class="phase-sub">Give parents visibility, control, and peace of mind</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--sky-l);color:var(--sky-d)">Trust builder</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 7–8</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's view (via parent)</strong>
      "Mama, I know 'elephant' in English!" — and the parent can verify this in the portal. They see that their 3-year-old has practiced 47 words this week, knows 'elephant' at 4 stars, and struggles with 'purple'. The parent knows exactly how their child is doing without needing to sit next to them.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>🔒 PIN-protected parent mode</h4>
        <p>Long-press the Zen mascot in the map → PIN entry (4-digit parent PIN set on first run). Enters parent mode overlay without disrupting child's session or progress.</p>
      </div>
      <div class="feature-item">
        <h4>📊 Weekly progress report</h4>
        <p>Words learned this week (with illustrations). Lessons completed. Minutes spent each day (bar chart). Accuracy rate. Star ratings for each word category. Downloadable as PDF flashcard sheet.</p>
      </div>
      <div class="feature-item">
        <h4>⚙️ Learning controls</h4>
        <p>Set daily time limit (e.g. 20 min). Set daily lesson goal. Enable/disable specific content categories. Adjust difficulty preset (from Phase 4). Toggle Vietnamese translation visibility (hide it to increase challenge).</p>
      </div>
      <div class="feature-item">
        <h4>👶 Multiple child profiles</h4>
        <p>Support up to 4 child profiles per device. Each profile: name, age, avatar, separate progress/state. Child selects their profile on startup by tapping their picture. Profile switching is instant.</p>
      </div>
      <div class="feature-item">
        <h4>📅 Learning schedule</h4>
        <p>Set preferred lesson time (morning / afternoon / evening). When the scheduled time arrives and the app hasn't been opened, Zen sends a push notification: "Zen misses you! Ready to learn?" (Web Push API).</p>
      </div>
      <div class="feature-item">
        <h4>📖 Word list export</h4>
        <p>Export child's mastered word list as: printable flashcards (PDF), CSV for teachers, or WhatsApp-shareable image collage ("Look what Minh learned this week! 🎉"). Sharing creates social proof and parent engagement.</p>
      </div>
    </div>
  </div>
</div>

<!-- PHASE 9 -->
<div class="phase ph-9" id="p9">
  <div class="phase-header" onclick="toggle('p9')">
    <div class="phase-badge">P9</div>
    <div class="phase-meta">
      <div class="phase-title">🎨 Creative & Story Mode</div>
      <div class="phase-sub">Language becomes a creative tool, not just a test</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--jade-l);color:var(--jade-d)">Unique to zen-duo</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 8–10</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <div class="baby-view">
      <strong>👶 Baby's eye view</strong>
      The child searches "rainbow dragon" in the Sandbox. The AI draws it. The child colors it in with their finger. They say "rainbow dragon is red and yellow!" The sentence is recorded and played back. They show their creation to mum. Language is no longer something the app tests — it's something the child makes.
    </div>

    <div class="feature-grid">
      <div class="feature-item">
        <h4>🖌️ SVG Coloring Book</h4>
        <p>In Curiosity Sandbox: after an SVG loads from zen-lights, expose SVG path nodes. Child taps a section → color palette appears → they fill it. The completed colored image saves to their gallery. Promotes creative use of the vocabulary they know.</p>
      </div>
      <div class="feature-item">
        <h4>📖 Illustrated Story Builder</h4>
        <p>Select 3–5 mastered words. The app arranges them into a simple story with AI-generated SVG scenes: "The red cat sat on a big book. A blue fish swam by. 'Hello!' said the cat." Read aloud by zen-tts. Child "reads" along tapping each word.</p>
      </div>
      <div class="feature-item">
        <h4>✂️ Print & Play Cards</h4>
        <p>Generate a printable set of flashcards from mastered words: the SVG illustration on one side, the English word + Vietnamese on the other. Print to share with grandparents who don't have a device. Physical-digital bridge.</p>
      </div>
      <div class="feature-item">
        <h4>🎙️ Voice Story Recording</h4>
        <p>After creating a story, child records themselves reading it aloud. Playback with their voice. Send as a voice note to parents. "Listen, mum — I read this!" The most powerful home engagement feature possible.</p>
      </div>
      <div class="feature-item">
        <h4>🔍 Word Scavenger Hunt</h4>
        <p>Real-world mode: app shows a word and says "Find me something [red]!" Child uses device camera (or just looks around). They tap "Found it!" and say the word aloud. Bridges learning from screen to the physical world around them.</p>
      </div>
      <div class="feature-item">
        <h4>🏆 "My First Book" milestone</h4>
        <p>At 100 mastered words: the app generates a personalized illustrated book — "Minh's English Adventure" — as a downloadable PDF. Every page uses the child's actual learned words with zen-lights illustrations. A physical achievement they can hold.</p>
      </div>
    </div>
  </div>
</div>

<!-- PHASE 10 -->
<div class="phase ph-10" id="p10">
  <div class="phase-header" onclick="toggle('p10')">
    <div class="phase-badge">P10</div>
    <div class="phase-meta">
      <div class="phase-title">🚀 Go Beyond Duolingo</div>
      <div class="phase-sub">Features Duolingo cannot build — because zen-duo is built differently</div>
      <div class="phase-tags">
        <span class="ptag" style="background:var(--plum-l);color:var(--plum-d)">Competitive moat</span>
        <span class="ptag" style="background:var(--border);color:var(--muted)">Month 10+</span>
      </div>
    </div>
    <div class="phase-toggle">▾</div>
  </div>
  <div class="phase-body">
    <p class="body-p">Everything so far closes the gap with Duolingo. Phase 10 opens a new gap — in zen-duo's favor. These features are possible <em>because</em> zen-duo uses local AI, serves Vietnamese families, and is open-source. Duolingo cannot replicate them without fundamentally changing their business model.</p>

    <div class="beyond-grid">
      <div class="beyond-card b1">
        <h4>🔒 Privacy-first AI teaching</h4>
        <p>All AI inference is local — zen-tts, zen-lights, Whisper. No child's voice, no search terms, no performance data ever leaves the device. Parents of young children increasingly care about this deeply. Make it a core brand promise: "Zero cloud. Zero tracking. Zero concerns."</p>
      </div>
      <div class="beyond-card b2">
        <h4>🇻🇳 Vietnamese cultural bridge</h4>
        <p>Duolingo teaches English as a neutral Western context. Zen-duo can teach English through Vietnamese eyes: Tết vocabulary, traditional foods (bánh mì, phở), Vietnamese names, family honorifics (bà, ông, cô). The child sees their culture in the learning — profound emotional difference.</p>
      </div>
      <div class="beyond-card b3">
        <h4>👨‍👩‍👧 Parent-child co-play mode</h4>
        <p>Two-player mode: one device, parent and child face each other. Parent reads the Vietnamese, child answers in English. Or reverse. A shared game that makes learning a family activity rather than a screen-time substitute. No other mainstream app does this.</p>
      </div>
      <div class="beyond-card b1">
        <h4>🤖 AI-personalised adventures</h4>
        <p>Use zen-lights to generate a lesson pack from any topic the child loves: "Dinosaurs", "Space", "Minecraft". AI generates vocabulary list + SVG illustrations + challenges + short story. Every child gets a unique curriculum shaped by their curiosity.</p>
      </div>
      <div class="beyond-card b2">
        <h4>🌐 Offline-first for rural Vietnam</h4>
        <p>Many Vietnamese families live in areas with unreliable internet. Duolingo requires connectivity. Zen-duo's entire stack — TTS, SVG generation, lessons — is designed to run fully on-device. This is a profound accessibility advantage in Tier 2/3 cities and rural provinces.</p>
      </div>
      <div class="beyond-card b3">
        <h4>📱 Teacher mode</h4>
        <p>Export a class set of custom lessons as a zip. A kindergarten teacher in Hanoi creates "Animals of Vietnam" and shares it with 20 students. Each child loads it on their home device. Zen-duo becomes the infrastructure for community-created bilingual curricula.</p>
      </div>
    </div>
  </div>
</div>

<!-- SECTION: COMPARISON -->
<div class="section-header">
  <div class="section-label">Summary</div>
  <div class="section-title">Zen-duo vs Duolingo — by phase</div>
</div>

<div class="compare-grid">
  <div class="compare-col">
    <div class="compare-head duo">🟢 Duolingo Kids — today</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Duo the owl mascot</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Animated winding path map</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Hundreds of levels</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Guided onboarding</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Lesson celebration screens</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Heart refill mechanic</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Gem economy + shop</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Achievement badges</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Speaking challenges</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Mobile app (iOS/Android)</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Privacy-first (cloud dependent)</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Offline full AI (needs connection)</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Vietnamese cultural integration</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Curiosity sandbox</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Parent-child co-play</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Custom AI lesson generation</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>SVG coloring / creative mode</div>
    <div class="compare-row"><span class="ci ci-no">✗</span>Voice story recording</div>
  </div>
  <div class="compare-col">
    <div class="compare-head zen">🌿 Zen-duo — after all phases</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Zen mascot (Phase 1)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Winding path (Phase 1)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>20+ levels (Phase 3), growing</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Zen-guided onboarding (Phase 1)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Full celebration screens (Phase 0)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Gem-based refill (Phase 7)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Gem shop + pets (Phase 7)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>50+ badges (Phase 7)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Whisper pronunciation (Phase 5)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>PWA install (Phase 2)</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>100% local — zero cloud data</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Full offline AI stack (zen-tts + zen-lights)</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Vietnamese culture + language bridge</div>
    <div class="compare-row"><span class="ci ci-yes">✓</span>Curiosity Sandbox (unique)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Co-play mode (Phase 10)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>AI adventure generator (Phase 10)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>SVG coloring book (Phase 9)</div>
    <div class="compare-row"><span class="ci ci-fut">→</span>Voice story recording (Phase 9)</div>
  </div>
</div>

<div style="height:24px"></div>

<div style="background:var(--jade-l);border:1.5px solid #9ed4bf;border-radius:12px;padding:28px 32px;margin-bottom:32px;">
  <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--jade-d);margin-bottom:10px;">The North Star principle for every decision</div>
  <p style="font-size:14.5px;color:var(--jade-d);line-height:1.75;margin-bottom:12px;">Before implementing any feature, ask: <strong>"If a 3-year-old opened this app alone, with no parent nearby, no instructions, and no prior experience — would they understand what to do, feel safe, feel delighted, and want to come back tomorrow?"</strong></p>
  <p style="font-size:14px;color:var(--jade-d);line-height:1.7;">If the answer is no — the feature is not ready. If it requires reading, it needs audio. If it requires typing, it needs tapping. If it uses an alert(), it is broken. If there is no mascot reaction, it feels cold. Every screen must pass the <em>baby eye test</em> before it ships.</p>
</div>

</div><!-- end .wrap -->

<footer>
  <strong>Zen-Duo Master Roadmap</strong> · Generated June 2026 · For internal planning use<br>
  <span style="font-size:12px;opacity:.6;margin-top:6px;display:block">Built with love for the next generation of bilingual Vietnamese children 🇻🇳</span>
</footer>

<script>
function toggle(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
}
</script>
</body>
</html>
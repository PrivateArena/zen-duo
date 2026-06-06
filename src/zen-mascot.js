/**
 * Zen Mascot SVG Template Generator
 * Provides 6 emotional states for Zen the Penguin mascot.
 * States: happy, excited, sleeping, sad, thinking, celebrating
 */
export function getZenMascotSVG(emotion = 'happy', active = false) {
  let innerSVG = '';
  const emo = emotion.toLowerCase();
  
  if (emo === 'happy') {
    const jumpClass = active ? 'anim-jump' : '';
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%" class="zen-mascot-svg zen-happy">
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#cbd5e1" opacity="0.5" />
        <g class="${jumpClass}" style="transform-origin: 100px 130px; cursor: pointer;">
          <!-- Shadow -->
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <!-- Body -->
          <path d="M 100,35 Q 138,35 142,80 Q 146,125 100,125 Q 54,125 58,80 Q 62,35 100,35 Z" fill="#334155" />
          <!-- Belly -->
          <path d="M 100,45 Q 124,45 126,80 Q 128,118 100,118 Q 72,118 74,80 Q 76,45 100,45 Z" fill="#ffffff" />
          <!-- Left Wing (Happy waving) -->
          <path d="M 60,80 Q 35,55 42,48 Q 50,48 62,72 Z" fill="#334155" />
          <!-- Right Wing (Happy waving) -->
          <path d="M 140,80 Q 165,55 158,48 Q 150,48 138,72 Z" fill="#334155" />
          <!-- Left Foot -->
          <path d="M 78,123 Q 72,134 84,132 Q 90,130 88,123 Z" fill="#f59e0b" />
          <!-- Right Foot -->
          <path d="M 122,123 Q 128,134 116,132 Q 110,130 112,123 Z" fill="#f59e0b" />
          <!-- Eyes -->
          <path d="M 80,68 Q 86,62 92,68" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <path d="M 108,68 Q 114,62 120,68" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <!-- Rosy Cheeks -->
          <circle cx="74" cy="74" r="5" fill="#f472b6" opacity="0.6" />
          <circle cx="126" cy="74" r="5" fill="#f472b6" opacity="0.6" />
          <!-- Beak (Laughing Open) -->
          <path d="M 94,72 L 106,72 Q 100,86 94,72 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
          <path d="M 95,73 L 105,73 Q 100,80 95,73 Z" fill="#be123c" />
          <!-- Heart indicator -->
          ${active ? `
            <g class="anim-float" style="transform-origin: 160px 40px;">
              <path d="M 160,40 C 160,30 145,30 145,45 C 145,60 160,70 160,70 C 160,70 175,60 175,45 C 175,30 160,30 160,40 Z" fill="#f43f5e" transform="scale(0.5) translate(160, -20)" />
            </g>
          ` : ''}
        </g>
      </svg>
    `;
  } else if (emo === 'excited') {
    const bounceClass = active ? 'anim-bounce' : '';
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%" class="zen-mascot-svg zen-excited">
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#cbd5e1" opacity="0.5" />
        <g class="${bounceClass}" style="transform-origin: 100px 130px; cursor: pointer;">
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <path d="M 100,35 Q 138,35 142,80 Q 146,125 100,125 Q 54,125 58,80 Q 62,35 100,35 Z" fill="#334155" />
          <path d="M 100,45 Q 124,45 126,80 Q 128,118 100,118 Q 72,118 74,80 Q 76,45 100,45 Z" fill="#ffffff" />
          <!-- Clapping Wings -->
          <path d="M 60,80 Q 82,75 76,85 Z" fill="#334155" class="${active ? 'anim-wing-clap-left' : ''}" style="transform-origin: 60px 80px;" />
          <path d="M 140,80 Q 118,75 124,85 Z" fill="#334155" class="${active ? 'anim-wing-clap-right' : ''}" style="transform-origin: 140px 80px;" />
          <path d="M 78,123 Q 72,134 84,132 Q 90,130 88,123 Z" fill="#f59e0b" />
          <path d="M 122,123 Q 128,134 116,132 Q 110,130 112,123 Z" fill="#f59e0b" />
          <!-- Big Excited Eyes -->
          <circle cx="85" cy="68" r="8" fill="#1e293b" />
          <circle cx="83" cy="66" r="3" fill="#ffffff" />
          <polygon points="87,70 89,72 87,72" fill="#ffffff" />
          <circle cx="115" cy="68" r="8" fill="#1e293b" />
          <circle cx="113" cy="66" r="3" fill="#ffffff" />
          <polygon points="117,70 119,72 117,72" fill="#ffffff" />
          <!-- Cheeks -->
          <circle cx="72" cy="76" r="6" fill="#f472b6" opacity="0.8" />
          <circle cx="128" cy="76" r="6" fill="#f472b6" opacity="0.8" />
          <!-- Beak -->
          <path d="M 94,72 L 106,72 L 100,82 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
          <!-- Dynamic Stars -->
          ${active ? `
            <g fill="#f59e0b">
              <polygon points="50,40 53,46 60,46 55,50 57,56 50,52 43,56 45,50 40,46 47,46" class="anim-star-pop" style="--dx:-20px; --dy:-15px;" />
              <polygon points="150,35 153,41 160,41 155,45 157,51 150,47 143,51 145,45 140,41 147,41" class="anim-star-pop" style="--dx:20px; --dy:-20px;" />
            </g>
          ` : ''}
        </g>
      </svg>
    `;
  } else if (emo === 'sleeping') {
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%" class="zen-mascot-svg zen-sleeping">
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#cbd5e1" opacity="0.5" />
        <g class="anim-sleep-bob" style="transform-origin: 100px 130px; cursor: pointer;">
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <!-- Body tilted slightly -->
          <g transform="rotate(5 100 80)">
            <path d="M 100,35 Q 138,35 142,80 Q 146,125 100,125 Q 54,125 58,80 Q 62,35 100,35 Z" fill="#334155" />
            <path d="M 100,45 Q 124,45 126,80 Q 128,118 100,118 Q 72,118 74,80 Q 76,45 100,45 Z" fill="#ffffff" />
            <!-- Wings folded on belly -->
            <path d="M 58,84 Q 78,92 74,98 Z" fill="#334155" />
            <path d="M 142,84 Q 122,92 126,98 Z" fill="#334155" />
            <!-- Feet -->
            <path d="M 78,123 Q 72,134 84,132 Q 90,130 88,123 Z" fill="#f59e0b" />
            <path d="M 122,123 Q 128,134 116,132 Q 110,130 112,123 Z" fill="#f59e0b" />
            <!-- Sleeping eyes (downwards arcs) -->
            <path d="M 78,70 Q 84,76 90,70" stroke="#475569" stroke-width="3.5" fill="none" stroke-linecap="round" />
            <path d="M 110,70 Q 116,76 122,70" stroke="#475569" stroke-width="3.5" fill="none" stroke-linecap="round" />
            <!-- Tiny beak -->
            <path d="M 96,74 Q 100,80 104,74 Z" fill="#f59e0b" />
          </g>
          <!-- Zzz Letters floating -->
          ${active ? `
            <g class="anim-zzz" fill="#3b82f6" font-family="'Fredoka', sans-serif" font-weight="bold">
              <text x="145" y="55" font-size="12">z</text>
              <text x="155" y="40" font-size="16">z</text>
              <text x="168" y="22" font-size="22">Z</text>
            </g>
          ` : ''}
        </g>
      </svg>
    `;
  } else if (emo === 'sad') {
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%" class="zen-mascot-svg zen-sad">
        <!-- Cloud and rain backdrop -->
        ${active ? `
          <path d="M 70,30 Q 60,15 80,10 Q 100,5 110,20 Q 125,10 135,22 Q 150,25 140,40 Q 145,50 130,50 L 70,50 Z" fill="#94a3b8" opacity="0.6" />
          <line x1="80" y1="58" x2="78" y2="70" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="anim-rain" style="animation-delay: 0.1s" />
          <line x1="110" y1="58" x2="108" y2="72" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="anim-rain" style="animation-delay: 0.3s" />
          <line x1="130" y1="58" x2="128" y2="68" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="anim-rain" style="animation-delay: 0.5s" />
        ` : ''}
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#cbd5e1" opacity="0.5" />
        <g style="cursor: pointer;">
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <path d="M 100,35 Q 138,35 142,80 Q 146,125 100,125 Q 54,125 58,80 Q 62,35 100,35 Z" fill="#334155" />
          <path d="M 100,45 Q 124,45 126,80 Q 128,118 100,118 Q 72,118 74,80 Q 76,45 100,45 Z" fill="#ffffff" />
          <!-- Drooping wings -->
          <path d="M 58,80 Q 40,105 45,110 Z" fill="#334155" />
          <path d="M 142,80 Q 160,105 155,110 Z" fill="#334155" />
          <path d="M 78,123 Q 72,134 84,132 Q 90,130 88,123 Z" fill="#f59e0b" />
          <path d="M 122,123 Q 128,134 116,132 Q 110,130 112,123 Z" fill="#f59e0b" />
          <!-- Sad drooping eyes -->
          <path d="M 80,72 Q 86,78 92,72" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M 108,72 Q 114,78 120,72" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Frown mouth -->
          <path d="M 94,84 Q 100,78 106,84 Q 100,90 94,84 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
          <!-- Teardrops -->
          ${active ? `
            <circle class="anim-tear-left" cx="84" cy="80" r="3.5" fill="#38bdf8" />
            <circle class="anim-tear-right" cx="116" cy="80" r="3.5" fill="#38bdf8" />
          ` : ''}
        </g>
      </svg>
    `;
  } else if (emo === 'thinking') {
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%" class="zen-mascot-svg zen-thinking">
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#cbd5e1" opacity="0.5" />
        <g style="cursor: pointer;">
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <path d="M 100,35 Q 138,35 142,80 Q 146,125 100,125 Q 54,125 58,80 Q 62,35 100,35 Z" fill="#334155" />
          <path d="M 100,45 Q 124,45 126,80 Q 128,118 100,118 Q 72,118 74,80 Q 76,45 100,45 Z" fill="#ffffff" />
          <!-- Left Wing touching chin -->
          <path d="M 58,80 Q 82,90 76,95 Z" fill="#334155" />
          <!-- Right Wing resting on hip -->
          <path d="M 142,80 Q 158,95 148,100 Z" fill="#334155" />
          <!-- Tapping Left Foot -->
          <path d="M 78,123 Q 72,134 84,132 Q 90,130 88,123 Z" fill="#f59e0b" class="${active ? 'anim-foot-tap' : ''}" style="transform-origin: 88px 123px;" />
          <path d="M 122,123 Q 128,134 116,132 Q 110,130 112,123 Z" fill="#f59e0b" />
          <!-- Curious uneven eyes -->
          <circle cx="84" cy="68" r="6" fill="#1e293b" />
          <circle cx="83" cy="66" r="1.5" fill="#ffffff" />
          <!-- Right eye squinting -->
          <path d="M 110,68 Q 115,64 120,68" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Flat thinking mouth -->
          <line x1="94" y1="80" x2="106" y2="80" stroke="#d97706" stroke-width="3" stroke-linecap="round" />
          <!-- Floating bubble -->
          ${active ? `
            <g class="anim-float">
              <!-- Question Mark Bubble -->
              <ellipse cx="148" cy="40" rx="14" ry="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
              <circle cx="138" cy="52" r="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
              <circle cx="132" cy="58" r="1.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
              <text x="144" y="45" font-family="'Fredoka', sans-serif" font-weight="bold" font-size="16" fill="#475569">?</text>
            </g>
          ` : ''}
        </g>
      </svg>
    `;
  } else if (emo === 'celebrating') {
    const spinClass = active ? 'anim-spin-celebrate' : '';
    innerSVG = `
      <svg viewBox="0 0 200 160" width="100%" height="100%" class="zen-mascot-svg zen-celebrating">
        <ellipse cx="100" cy="138" rx="40" ry="6" fill="#cbd5e1" opacity="0.5" />
        <g class="${spinClass}" style="transform-origin: 100px 80px; cursor: pointer;">
          <!-- Shadow -->
          <ellipse cx="100" cy="130" rx="30" ry="6" fill="#000000" opacity="0.1" />
          <!-- Body -->
          <path d="M 100,35 Q 138,35 142,80 Q 146,125 100,125 Q 54,125 58,80 Q 62,35 100,35 Z" fill="#334155" />
          <!-- Belly -->
          <path d="M 100,45 Q 124,45 126,80 Q 128,118 100,118 Q 72,118 74,80 Q 76,45 100,45 Z" fill="#ffffff" />
          <!-- Both Wings Waving Upwards -->
          <path d="M 60,80 Q 35,50 42,42 Q 50,42 62,68 Z" fill="#334155" />
          <path d="M 140,80 Q 165,50 158,42 Q 150,42 138,68 Z" fill="#334155" />
          <!-- Feet spread out -->
          <path d="M 76,122 Q 68,131 78,132 Q 86,132 84,122 Z" fill="#f59e0b" />
          <path d="M 124,122 Q 132,131 122,132 Q 114,132 116,122 Z" fill="#f59e0b" />
          <!-- Happy closed eyes -->
          <path d="M 80,68 Q 86,62 92,68" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <path d="M 108,68 Q 114,62 120,68" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <!-- Rosy Cheeks -->
          <circle cx="74" cy="74" r="5" fill="#f472b6" opacity="0.6" />
          <circle cx="126" cy="74" r="5" fill="#f472b6" opacity="0.6" />
          <!-- Laughing Open Beak -->
          <path d="M 94,72 L 106,72 Q 100,86 94,72 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" />
          <path d="M 95,73 L 105,73 Q 100,80 95,73 Z" fill="#be123c" />
          <!-- Floating confetti -->
          ${active ? `
            <g opacity="0.8">
              <!-- Confetti rectangles -->
              <rect x="50" y="45" width="4" height="8" fill="#f43f5e" transform="rotate(15 50 45)" />
              <rect x="155" y="45" width="4" height="8" fill="#10b981" transform="rotate(-30 155 45)" />
              <rect x="60" y="100" width="3" height="6" fill="#3b82f6" transform="rotate(45 60 100)" />
              <rect x="140" y="100" width="3" height="6" fill="#f59e0b" transform="rotate(-15 140 100)" />
              <!-- Confetti circles -->
              <circle cx="80" cy="35" r="3.5" fill="#fcd34d" />
              <circle cx="120" cy="30" r="2.5" fill="#ec4899" />
              <circle cx="45" cy="80" r="3" fill="#a855f7" />
              <circle cx="160" cy="80" r="2" fill="#06b6d4" />
            </g>
          ` : ''}
        </g>
      </svg>
    `;
  }
  
  return innerSVG;
}

#!/usr/bin/env python3
"""E1 — Printable pack generator (Track E, UI-UX 2026-08-16).

Generates A4 print-ready static HTML printables (NO client scripts — checklist 1.12):
  - 25 coloring pages        -> printables/coloring/
  - 10 calligraphy sheets    -> printables/calligraphy/
  -  8 doa/readings sheets   -> printables/readings/

Re-run:  python3 tools/generate_printables.py
Outputs are overwritten; run E5 QA afterwards.
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "..", "printables")

FONT_LINK = (
    '<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700'
    '&family=Baloo+2:wght@600;700;800&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600'
    '&display=swap" rel="stylesheet" />'
)

ACCENTS = {
    "sky":   ('#0c4a6e', '#e0f2fe'),
    "rose":  ('#881337', '#ffe4e6'),
    "gold":  ('#78350f', '#fef3c7'),
    "mint":  ('#205844', '#d1fae5'),
    "violet":('#4c1d95', '#ede9fe'),
    "teal":  ('#134e4a', '#ccfbf1'),
}

def esc(s):
    return re.sub(r"&(?!amp;|lt;|gt;|quot;|#)", "&amp;", s).replace("<", "&lt;").replace(">", "&gt;")

def sheet(title, subtitle, body, accent="mint", category="Materi Belajar"):
    ink, soft = ACCENTS[accent]
    return f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)} — TPQ Qur'ani</title>
  <meta name="description" content="{esc(title)} — lembar cetak A4, TPQ Qur'ani." />
  {FONT_LINK}
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html {{ -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }}
    body {{
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 16px;
      font-family: "Nunito", ui-sans-serif, system-ui, sans-serif;
      color: #334155;
      background: #f2f7f4;
    }}
    .sheet {{
      position: relative;
      width: 210mm;
      min-height: 297mm;
      display: flex;
      flex-direction: column;
      padding: 12mm 14mm;
      background: linear-gradient(165deg, #ffffff 0%, #fdfefb 60%, {soft}66 100%);
      overflow: hidden;
    }}
    .head {{ display: flex; align-items: center; gap: 8px; }}
    .head .brand {{
      font-family: "Baloo 2", cursive; font-weight: 800; color: {ink};
      font-size: 11pt; letter-spacing: 0.02em;
    }}
    .head .chip {{
      margin-left: auto; font-size: 8.5pt; font-weight: 800; letter-spacing: 0.14em;
      text-transform: uppercase; color: {ink}; background: {soft};
      padding: 4px 12px; border-radius: 999px;
    }}
    .title {{
      font-family: "Baloo 2", cursive; font-weight: 800; text-align: center;
      font-size: 21pt; line-height: 1.15; color: {ink}; margin-top: 6mm;
    }}
    .subtitle {{
      text-align: center; font-size: 10pt; font-weight: 700; font-style: italic;
      color: #64748b; margin-top: 2mm;
    }}
    .art {{ flex: 1 1 auto; display: flex; align-items: center; justify-content: center; margin: 6mm 0; }}
    .art svg {{ width: 100%; height: auto; max-height: 190mm; }}
    .foot {{
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-size: 8.5pt; font-weight: 800; letter-spacing: 0.12em;
      text-transform: uppercase; color: {ink};
    }}
    .foot .l {{ height: 1.2px; width: 24mm; background: linear-gradient(90deg, transparent, {ink}88); }}
    .foot .l:last-child {{ transform: scaleX(-1); }}
    .ar {{ font-family: "Amiri", serif; direction: rtl; }}
    @page {{ size: A4 portrait; margin: 0; }}
    @media print {{
      body {{ padding: 0; background: #fff; }}
      .sheet {{ min-height: auto; height: 297mm; box-shadow: none; background: #fff !important; }}
    }}
  </style>
</head>
<body>
  <main class="sheet">
    <header class="head">
      <span class="brand">TPQ Qur&rsquo;ani</span>
      <span class="chip">{esc(category)}</span>
    </header>
    <h1 class="title">{esc(title)}</h1>
    {('<p class="subtitle">' + esc(subtitle) + "</p>") if subtitle else ""}
    {body}
    <footer class="foot">
      <span class="l"></span><span>{esc(category)} &middot; TPQ Qur&rsquo;ani</span><span class="l"></span>
    </footer>
  </main>
</body>
</html>
"""

# --------------------------------------------------------------------------
# Coloring scene builders (outline-only SVGs for kids to color)
# --------------------------------------------------------------------------
INK = "#334155"
def outline_svg(view, inner):
    return (f'<svg viewBox="{view}" fill="none" stroke="{INK}" stroke-width="7" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>')

def scene_mosque(variant):
    if variant == 1:
        inner = (
            '<rect x="30" y="330" width="340" height="30" rx="10"/>'
            '<rect x="70" y="250" width="24" height="88" rx="8"/>'
            '<rect x="306" y="250" width="24" height="88" rx="8"/>'
            '<circle cx="82" cy="238" r="20" stroke-width="6"/>'
            '<circle cx="318" cy="238" r="20" stroke-width="6"/>'
            '<path d="M200 110 Q 118 190 122 330 L 278 330 Q 282 190 200 110 Z"/>'
            '<path d="M200 130 Q 148 190 152 320 L 248 320 Q 252 190 200 130 Z"/>'
            '<circle cx="200" cy="92" r="16" stroke-width="6"/>'
            '<path d="M200 76 L 206 90 L 221 91 L 210 101 L 213 116 L 200 107 L 187 116 L 190 101 L 179 91 L 194 90 Z"/>'
            '<rect x="176" y="300" width="48" height="30" rx="8"/>'
        )
    elif variant == 2:
        inner = (
            '<rect x="30" y="330" width="340" height="28" rx="10"/>'
            '<path d="M200 120 Q 110 210 114 330 L 286 330 Q 290 210 200 120 Z"/>'
            '<rect x="52" y="180" width="18" height="150" rx="7"/>'
            '<rect x="330" y="180" width="18" height="150" rx="7"/>'
            '<circle cx="61" cy="168" r="16"/>'
            '<circle cx="339" cy="168" r="16"/>'
            '<path d="M200 104 L 208 122 L 228 124 L 214 135 L 218 155 L 200 143 L 182 155 L 186 135 L 172 124 L 192 122 Z"/>'
            '<rect x="180" y="306" width="40" height="24" rx="7"/>'
            '<path d="M120 306 Q 140 286 160 306 M 240 306 Q 260 286 280 306"/>'
        )
    elif variant == 3:
        inner = (
            '<rect x="30" y="330" width="340" height="30" rx="10"/>'
            '<path d="M200 100 Q 96 200 100 330 L 300 330 Q 304 200 200 100 Z"/>'
            '<path d="M200 130 Q 128 200 132 322 L 268 322 Q 272 200 200 130 Z"/>'
            '<circle cx="200" cy="84" r="14"/>'
            '<rect x="130" y="330" width="140" height="34" rx="8"/>'
            '<rect x="182" y="300" width="36" height="30" rx="6"/>'
            '<rect x="76" y="262" width="16" height="76" rx="6"/>'
            '<rect x="308" y="262" width="16" height="76" rx="6"/>'
            '<path d="M120 296 L 160 296 M 240 296 L 280 296"/>'
        )
    else:  # variant 4 kampung
        inner = (
            '<rect x="30" y="330" width="340" height="26" rx="10"/>'
            '<path d="M200 140 Q 130 210 134 330 L 266 330 Q 270 210 200 140 Z"/>'
            '<rect x="84" y="240" width="60" height="90" rx="6"/>'
            '<path d="M84 240 L 114 210 L 144 240 Z"/>'
            '<rect x="256" y="260" width="52" height="70" rx="6"/>'
            '<path d="M256 260 L 282 234 L 308 260 Z"/>'
            '<circle cx="178" cy="90" r="12"/>'
            '<path d="M96 330 L 96 300 L 132 300 L 132 330 M 256 330 L 256 310"/>'
        )
    return outline_svg("0 0 400 380", inner)

def scene_star_moon():
    inner = (
        '<circle cx="150" cy="150" r="66"/>'
        '<circle cx="176" cy="126" r="52" fill="#ffffff"/>'
        '<path d="M270 90 L 280 116 L 308 120 L 288 138 L 294 166 L 270 152 L 246 166 L 252 138 L 232 120 L 260 116 Z"/>'
        '<path d="M96 240 L 104 258 L 124 262 L 110 275 L 115 295 L 96 284 L 77 295 L 82 275 L 68 262 L 88 258 Z"/>'
        '<path d="M300 250 L 308 266 L 326 270 L 313 281 L 317 299 L 300 289 L 283 299 L 287 281 L 274 270 L 292 266 Z"/>'
        '<path d="M60 300 Q 90 270 120 300 Q 90 312 60 300 Z"/>'
        '<path d="M280 320 Q 310 292 340 320 Q 310 330 280 320 Z"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_star8():
    inner = ""
    for cx, cy in [(200, 190), (90, 90), (310, 90), (90, 300), (310, 300)]:
        inner += (
            f'<g transform="translate({cx} {cy})">'
            '<rect x="-74" y="-74" width="148" height="148" transform="rotate(45)"/>'
            '<rect x="-74" y="-74" width="148" height="148"/>'
            '<circle r="26"/>'
            '</g>'
        )
    inner += '<path d="M120 190 L 280 190 M 200 110 L 200 270"/>'
    return outline_svg("0 0 400 380", inner)

def scene_night():
    inner = (
        '<circle cx="292" cy="100" r="54"/>'
        '<circle cx="314" cy="82" r="42" fill="#ffffff"/>'
        '<path d="M60 120 L 68 138 L 88 142 L 74 155 L 79 175 L 60 164 L 41 175 L 46 155 L 32 142 L 52 138 Z"/>'
        '<path d="M150 60 L 156 76 L 174 80 L 162 90 L 166 108 L 150 98 L 134 108 L 138 90 L 126 80 L 144 76 Z"/>'
        '<path d="M40 320 Q 80 284 120 320 M 240 340 Q 280 306 320 340"/>'
        '<path d="M120 320 Q 160 288 200 320"/>'
        '<path d="M60 260 Q 88 234 116 260 Q 88 270 60 260 Z"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_sun():
    inner = (
        '<circle cx="200" cy="180" r="70"/>'
        '<circle cx="182" cy="166" r="6" fill="#334155" stroke="none"/>'
        '<circle cx="218" cy="166" r="6" fill="#334155" stroke="none"/>'
        '<path d="M182 196 Q 200 214 218 196" stroke-width="6"/>'
        '<path d="M200 86 L 200 60 M 200 274 L 200 300 M 116 180 L 92 180 M 284 180 L 308 180 M 141 121 L 124 104 M 259 121 L 276 104 M 141 239 L 124 256 M 259 239 L 276 256"/>'
        '<path d="M60 330 Q 96 298 132 330 Q 168 298 204 330 M 160 330 Q 196 300 232 330 Q 268 300 304 330"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_rainbow():
    inner = (
        '<path d="M110 260 A 110 110 0 0 1 290 260"/>'
        '<path d="M130 260 A 90 90 0 0 1 270 260"/>'
        '<path d="M150 260 A 70 70 0 0 1 250 260"/>'
        '<path d="M170 260 A 50 50 0 0 1 230 260"/>'
        '<path d="M190 260 A 30 30 0 0 1 210 260"/>'
        '<path d="M70 150 Q 104 120 138 150 Q 104 160 70 150 Z"/>'
        '<path d="M262 176 Q 296 146 330 176 Q 296 186 262 176 Z"/>'
        '<circle cx="60" cy="320" r="10"/><circle cx="80" cy="310" r="14"/><circle cx="100" cy="322" r="9"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_flower_butterfly():
    inner = (
        '<circle cx="150" cy="180" r="46"/>'
        '<circle cx="108" cy="168" r="24"/><circle cx="108" cy="196" r="24"/>'
        '<circle cx="192" cy="168" r="24"/><circle cx="192" cy="196" r="24"/>'
        '<circle cx="150" cy="138" r="24"/><circle cx="150" cy="222" r="24"/>'
        '<circle cx="150" cy="180" r="12"/>'
        '<path d="M60 320 L 240 320 M 60 344 L 240 344"/>'
        '<g transform="translate(292 170)">'
        '<ellipse cx="-26" cy="-22" rx="26" ry="34" transform="rotate(-25 -26 -22)"/>'
        '<ellipse cx="26" cy="-22" rx="26" ry="34" transform="rotate(25 26 -22)"/>'
        '<ellipse cx="-20" cy="30" rx="18" ry="24" transform="rotate(18 -20 30)"/>'
        '<ellipse cx="20" cy="30" rx="18" ry="24" transform="rotate(-18 20 30)"/>'
        '<rect x="-3" y="-8" width="6" height="34" rx="3"/>'
        '<circle cx="0" cy="-14" r="5"/>'
        '</g>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_palm():
    inner = (
        '<rect x="188" y="210" width="24" height="140" rx="10"/>'
        '<path d="M200 210 Q 140 180 96 150 M 200 210 Q 120 210 84 200 M 200 210 Q 260 180 304 150 M 200 210 Q 280 210 316 200"/>'
        '<path d="M200 210 Q 160 150 168 96 M 200 210 Q 240 150 232 96"/>'
        '<circle cx="168" cy="90" r="26"/><circle cx="232" cy="90" r="26"/>'
        '<ellipse cx="150" cy="270" rx="16" ry="22"/>'
        '<ellipse cx="182" cy="280" rx="16" ry="22"/>'
        '<ellipse cx="216" cy="280" rx="16" ry="22"/>'
        '<ellipse cx="248" cy="270" rx="16" ry="22"/>'
        '<path d="M60 344 L 340 344"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_dates():
    inner = (
        '<ellipse cx="200" cy="300" rx="150" ry="34"/>'
        '<ellipse cx="200" cy="290" rx="120" ry="26"/>'
        '<ellipse cx="140" cy="270" rx="24" ry="32" transform="rotate(-12 140 270)"/>'
        '<ellipse cx="188" cy="262" rx="24" ry="32"/>'
        '<ellipse cx="236" cy="262" rx="24" ry="32"/>'
        '<ellipse cx="278" cy="272" rx="24" ry="32" transform="rotate(12 278 272)"/>'
        '<circle cx="140" cy="266" r="7"/><circle cx="188" cy="258" r="7"/><circle cx="236" cy="258" r="7"/><circle cx="278" cy="268" r="7"/>'
        '<path d="M120 220 Q 200 200 280 220 M 130 240 Q 200 224 270 240"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_quran():
    inner = (
        '<path d="M60 140 Q 120 116 200 128 L 200 296 Q 120 284 60 308 Z"/>'
        '<path d="M340 140 Q 280 116 200 128 L 200 296 Q 280 284 340 308 Z"/>'
        '<path d="M200 128 L 200 296"/>'
        '<rect x="96" y="176" width="84" height="10" rx="5"/>'
        '<rect x="96" y="200" width="70" height="10" rx="5"/>'
        '<rect x="96" y="224" width="78" height="10" rx="5"/>'
        '<rect x="220" y="176" width="84" height="10" rx="5"/>'
        '<rect x="220" y="200" width="70" height="10" rx="5"/>'
        '<rect x="220" y="224" width="78" height="10" rx="5"/>'
        '<path d="M140 330 L 140 356 L 200 346 L 260 356 L 260 330"/>'
        '<path d="M180 330 L 200 356 L 220 330"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_tasbih():
    inner = (
        '<circle cx="200" cy="180" r="96"/>'
        '<circle cx="200" cy="180" r="56"/>'
        '<circle cx="200" cy="84" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="200" cy="276" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="104" cy="180" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="296" cy="180" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="132" cy="112" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="268" cy="112" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="132" cy="248" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="268" cy="248" r="9" fill="#334155" stroke="none"/>'
        '<circle cx="200" cy="336" r="10" fill="#334155" stroke="none"/>'
        '<path d="M200 336 L 200 350 M 200 350 Q 194 358 188 354 M 200 350 Q 206 358 212 354"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_praying_hands():
    inner = (
        '<path d="M140 340 Q 96 300 96 220 Q 96 150 140 130 Q 148 150 152 180 Q 156 140 176 120 Q 184 150 186 190 Q 194 150 214 140 Q 220 170 218 210 Q 230 180 248 190 Q 240 230 226 250 Q 220 300 200 340 Z"/>'
        '<path d="M260 340 Q 304 300 304 220 Q 304 150 260 130 Q 252 150 248 180 Q 244 140 224 120 Q 216 150 214 190 Q 206 150 186 140 Q 180 170 182 210 Q 170 180 152 190 Q 160 230 174 250 Q 180 300 200 340 Z"/>'
        '<path d="M200 340 L 200 356"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_lantern():
    inner = (
        '<path d="M176 96 Q 200 80 224 96 L 216 132 L 184 132 Z"/>'
        '<path d="M150 132 Q 132 200 136 260 Q 138 292 176 298 L 224 298 Q 262 292 264 260 Q 268 200 250 132 Z"/>'
        '<path d="M150 132 L 250 132"/>'
        '<path d="M200 96 L 200 70 M 200 70 Q 194 62 188 66 M 200 70 Q 206 62 212 66"/>'
        '<path d="M164 180 Q 178 168 196 172 M 164 200 Q 180 190 198 193"/>'
        '<path d="M150 240 L 250 240 M 150 258 L 250 258"/>'
        '<circle cx="176" cy="300" r="6" fill="#334155" stroke="none"/>'
        '<circle cx="224" cy="300" r="6" fill="#334155" stroke="none"/>'
        '<path d="M200 298 L 200 330 Q 192 336 184 332 M 200 330 Q 208 336 216 332"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_ketupat():
    inner = (
        '<g transform="translate(200 190)">'
        '<rect x="-130" y="-130" width="260" height="260" transform="rotate(45)"/>'
        '<rect x="-106" y="-106" width="212" height="212" transform="rotate(45)"/>'
        '<path d="M0 -150 L 0 -130 M 0 130 L 0 150 M -150 0 L -130 0 M 130 0 L 150 0" transform="rotate(45)"/>'
        '<path d="M-130 0 L 0 -130 M 0 -130 L 130 0 M 130 0 L 0 130 M 0 130 L -130 0" transform="rotate(45)"/>'
        '<path d="M-60 -130 L -60 130 M 60 -130 L 60 130 M -130 -60 L 130 -60 M -130 60 L 130 60" transform="rotate(45)"/>'
        '</g>'
        '<path d="M150 340 Q 170 320 190 330 M 210 330 Q 230 320 250 340"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_sheep():
    inner = (
        '<ellipse cx="190" cy="240" rx="110" ry="62"/>'
        '<circle cx="120" cy="230" r="18"/><circle cx="152" cy="206" r="18"/><circle cx="192" cy="198" r="18"/>'
        '<circle cx="232" cy="206" r="18"/><circle cx="264" cy="226" r="18"/>'
        '<circle cx="300" cy="196" r="30"/>'
        '<path d="M296 176 L 308 150 M 308 150 Q 314 160 310 172" stroke-width="6"/>'
        '<ellipse cx="300" cy="196" rx="12" ry="6"/>'
        '<rect x="150" y="292" width="14" height="44" rx="6"/>'
        '<rect x="206" y="292" width="14" height="44" rx="6"/>'
        '<path d="M80 344 L 320 344"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_boat():
    inner = (
        '<path d="M60 290 Q 130 330 200 330 Q 270 330 340 290 L 320 330 L 80 330 Z"/>'
        '<path d="M200 290 L 200 120 M 200 120 L 292 250 L 200 250 Z"/>'
        '<path d="M200 130 L 168 250 M 200 150 L 152 250"/>'
        '<path d="M60 300 Q 100 286 140 300 M 260 300 Q 300 286 340 300"/>'
        '<path d="M60 322 Q 100 308 140 322 M 260 322 Q 300 308 340 322"/>'
        '<circle cx="286" cy="96" r="14"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_teaset():
    inner = (
        '<ellipse cx="200" cy="292" rx="130" ry="20"/>'
        '<circle cx="150" cy="180" r="64"/>'
        '<path d="M150 116 Q 150 96 168 96 L 132 96 Q 150 96 150 116" stroke-width="6"/>'
        '<path d="M150 116 L 150 140"/>'
        '<circle cx="150" cy="148" r="9" fill="#334155" stroke="none"/>'
        '<path d="M214 190 Q 260 190 260 152 Q 260 126 234 126 L 214 126"/>'
        '<path d="M282 300 Q 290 320 306 320 Q 322 320 330 300 L 322 282 L 290 282 Z"/>'
        '<path d="M306 320 L 306 344"/>'
        '<rect x="150" y="340" width="100" height="12" rx="6"/>'
    )
    return outline_svg("0 0 400 380", inner)

def scene_letter(text):
    inner = (
        f'<text x="200" y="250" text-anchor="middle" class="ar" '
        f'style="font-family: Amiri, serif; font-size: 240px; fill: none; '
        f'stroke: {INK}; stroke-width: 7; font-weight: 700;" lang="ar" dir="rtl">{text}</text>'
        '<path d="M80 330 L 320 330 M 80 350 L 320 350"/>'
        '<path d="M60 120 L 72 138 L 92 142 L 78 155 L 83 175 L 60 164 L 37 175 L 42 155 L 28 142 L 48 138 Z"/>'
        '<path d="M320 250 L 330 268 L 350 272 L 336 285 L 341 305 L 320 294 L 299 305 L 304 285 L 290 272 L 310 268 Z"/>'
    )
    return outline_svg("0 0 400 380", inner)

# --------------------------------------------------------------------------
# Manifest
# --------------------------------------------------------------------------
COLORING = [
    ("01-masjid-berkubah",    "Mewarnai Masjid Berkubah",    "Coloring · Mosque with Dome",     scene_mosque(1), "mint"),
    ("02-masjid-menara",       "Mewarnai Masjid dengan Menara","Coloring · Mosque with Minarets",scene_mosque(2), "teal"),
    ("03-masjid-raya",         "Mewarnai Masjid Raya",        "Coloring · Grand Mosque",         scene_mosque(3), "gold"),
    ("04-masjid-kampung",      "Mewarnai Masjid di Kampung",  "Coloring · Village Mosque",       scene_mosque(4), "rose"),
    ("05-bulan-bintang",       "Mewarnai Bulan Sabit & Bintang","Coloring · Crescent & Star",    scene_star_moon(), "violet"),
    ("06-bintang-delapan",     "Mewarnai Bintang Delapan",    "Coloring · Eight-Pointed Star",   scene_star8(), "gold"),
    ("07-langit-malam",        "Mewarnai Langit Malam",       "Coloring · Night Sky",            scene_night(), "violet"),
    ("08-matahari-ceria",      "Mewarnai Matahari Ceria",     "Coloring · Happy Sun",            scene_sun(), "gold"),
    ("09-awan-pelangi",        "Mewarnai Awan & Pelangi",     "Coloring · Rainbow & Clouds",     scene_rainbow(), "sky"),
    ("10-bunga-kupu",          "Mewarnai Bunga & Kupu-kupu",  "Coloring · Flower & Butterfly",   scene_flower_butterfly(), "rose"),
    ("11-pohon-kurma",         "Mewarnai Pohon Kurma",        "Coloring · Date Palm",            scene_palm(), "mint"),
    ("12-kurma-di-piring",     "Mewarnai Kurma di Piring",    "Coloring · Dates on a Plate",     scene_dates(), "gold"),
    ("13-kitab-quran",         "Mewarnai Kitab Al-Qur'an",    "Coloring · The Qur'an",           scene_quran(), "teal"),
    ("14-tasbih",              "Mewarnai Tasbih",             "Coloring · Prayer Beads",         scene_tasbih(), "mint"),
    ("15-tangan-berdoa",       "Mewarnai Tangan Berdoa",      "Coloring · Praying Hands",        scene_praying_hands(), "sky"),
    ("16-lentera-ramadhan",    "Mewarnai Lentera Ramadhan",   "Coloring · Ramadan Lantern",      scene_lantern(), "gold"),
    ("17-ketupat",             "Mewarnai Ketupat",            "Coloring · Ketupat",              scene_ketupat(), "rose"),
    ("18-huruf-alif",          "Mewarnai Huruf Alif (ا)",     "Coloring · Letter Alif",          (lambda: scene_letter("ا")), "sky"),
    ("19-huruf-ba",            "Mewarnai Huruf Ba (ب)",       "Coloring · Letter Ba",            (lambda: scene_letter("ب")), "rose"),
    ("20-huruf-ta",            "Mewarnai Huruf Ta (ت)",       "Coloring · Letter Ta",            (lambda: scene_letter("ت")), "mint"),
    ("21-huruf-mim",           "Mewarnai Huruf Mim (م)",      "Coloring · Letter Mim",           (lambda: scene_letter("م")), "violet"),
    ("22-lafaz-allah",         "Mewarnai Lafaz Allah",        "Coloring · Word Allah",           (lambda: scene_letter("الله")), "teal"),
    ("23-lafaz-muhammad",      "Mewarnai Lafaz Muhammad",     "Coloring · Word Muhammad",        (lambda: scene_letter("مُحَمَّد")), "gold"),
    ("24-kambing-qurban",      "Mewarnai Kambing Qurban",     "Coloring · Qurban Sheep",         scene_sheep(), "rose"),
    ("25-perahu-di-laut",      "Mewarnai Perahu di Laut",     "Coloring · Boat at Sea",          scene_boat(), "sky"),
]

CALLIGRAPHY = [
    ("01-bismillah",            "Kaligrafi Bismillah",           "Calligraphy · In the Name of Allah", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "Dengan nama Allah Yang Maha Pengasih, lagi Maha Penyayang.", "gold"),
    ("02-alhamdulillah",        "Kaligrafi Alhamdulillah",       "Calligraphy · All Praise to Allah", "الْحَمْدُ لِلَّهِ", "Segala puji bagi Allah.", "mint"),
    ("03-subhanallah",          "Kaligrafi Subhanallah",         "Calligraphy · Glory to Allah",      "سُبْحَانَ اللَّهِ", "Maha Suci Allah.", "sky"),
    ("04-allahu-akbar",         "Kaligrafi Allahu Akbar",        "Calligraphy · Allah is Greatest",   "اللَّهُ أَكْبَرُ", "Allah Maha Besar.", "violet"),
    ("05-la-ilaha-illallah",    "Kaligrafi La Ilaha Illallah",   "Calligraphy · No God but Allah",    "لَا إِلَٰهَ إِلَّا اللَّهُ", "Tiada Tuhan selain Allah.", "teal"),
    ("06-syahadat",             "Kaligrafi Syahadat",            "Calligraphy · The Shahada",         "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ", "Aku bersaksi tiada Tuhan selain Allah, dan Muhammad adalah utusan-Nya.", "gold"),
    ("07-ar-rahman",            "Kaligrafi Ar-Rahman",           "Calligraphy · The Most Gracious",   "الرَّحْمَنُ", "Yang Maha Pengasih.", "rose"),
    ("08-ar-rahim",             "Kaligrafi Ar-Rahim",            "Calligraphy · The Most Merciful",   "الرَّحِيمُ", "Yang Maha Penyayang.", "mint"),
    ("09-al-malik",             "Kaligrafi Al-Malik",            "Calligraphy · The King",            "الْمَلِكُ", "Yang Maha Merajai.", "violet"),
    ("10-basmalah-panjang",     "Kaligrafi Bismillah (Panjang)", "Calligraphy · Bismillah (Extended)", "بِسْمِ اللَّهِ", "Dengan nama Allah.", "sky"),
]

READINGS = [
    ("01-bangun-tidur",     "Doa Bangun Tidur",     "Prayer Before Waking",  "اَلْحَمْدُ لِلّٰهِ الَّذِيْ اَحْيَانَا بَعْدَ مَا اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ",
     "Alhamdu lillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur",
     "\u201cSegala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.\u201d",
     "\u201cAll praise is for Allah who gave us life after death, and to Him we return.\u201d", "sky"),
    ("02-masuk-masjid",     "Doa Masuk Masjid",     "Prayer Entering Mosque", "اَللّٰهُمَّ افْتَحْ لِيْ اَبْوَابَ رَحْمَتِكَ",
     "Allaahummaftah lii abwaaba rahmatik",
     "\u201cYa Allah, bukakanlah untukku pintu-pintu rahmat-Mu.\u201d",
     "\u201cO Allah, open the doors of Your mercy for me.\u201d", "mint"),
    ("03-keluar-masjid",    "Doa Keluar Masjid",    "Prayer Leaving Mosque",  "اَللّٰهُمَّ اِنِّيْ اَسْأَلُكَ مِنْ فَضْلِكَ",
     "Allaahumma innii as'aluka min fadhlik",
     "\u201cYa Allah, sesungguhnya aku memohon karunia-Mu.\u201d",
     "\u201cO Allah, I ask of Your bounty.\u201d", "mint"),
    ("04-naik-kendaraan",   "Doa Naik Kendaraan",   "Prayer Traveling",      "سُبْحَانَ الَّذِيْ سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِيْنَ وَاِنَّا اِلٰى رَبِّنَا لَمُنْقَلِبُوْنَ",
     "Subhaanal-ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahu muqriniin wa innaa ilaa rabbinaa lamunqalibuun",
     "\u201cMaha Suci Allah yang menundukkan kendaraan ini bagi kami, padahal kami tidak mampu, dan kepada Tuhan kami kembali.\u201d",
     "\u201cGlory to Allah who subdued this for us, though we could not have subdued it, and to our Lord we return.\u201d", "sky"),
    ("05-sebelum-belajar",  "Doa Sebelum Belajar",  "Prayer Before Study",   "رَبِّ زِدْنِيْ عِلْمًا وَارْزُقْنِيْ فَهْمًا",
     "Rabbii zidnii 'ilmaa warzuqnii fahmaa",
     "\u201cYa Tuhanku, tambahkanlah ilmuku dan berilah aku pemahaman.\u201d",
     "\u201cMy Lord, increase my knowledge and grant me understanding.\u201d", "gold"),
    ("06-sesudah-belajar",  "Doa Sesudah Belajar",  "Prayer After Study",    "اَللّٰهُمَّ اِنْفَعْنِيْ بِمَا عَلَّمْتَنِيْ وَعَلِّمْنِيْ مَا يَنْفَعُنِيْ وَزِدْنِيْ عِلْمًا",
     "Allaahummanfa'nii bimaa 'allamtanii wa 'allimnii maa yanfa'unii wa zidnii 'ilmaa",
     "\u201cYa Allah, berilah manfaat ilmu yang Engkau ajarkan, ajarkanlah ilmu yang bermanfaat, dan tambahkanlah ilmuku.\u201d",
     "\u201cO Allah, benefit me with what You taught me, teach me what benefits me, and increase my knowledge.\u201d", "gold"),
    ("07-al-ikhlas",        "Bacaan Surat Al-Ikhlas","Surah Al-Ikhlas",      "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
     "Qul huwallaahu ahad · Allaahus-samad · Lam yalid wa lam yuulad · Wa lam yakul lahuu kufuwan ahad",
     "\u201cKatakanlah: Dialah Allah Yang Maha Esa; Allah tempat meminta segala sesuatu; Dia tidak beranak dan tidak diperanakkan; dan tidak ada seorang pun yang setara dengan-Nya.\u201d",
     "\u201cSay: He is Allah, the One; Allah the Eternal Refuge; He neither begets nor is born; and there is none like unto Him.\u201d", "teal"),
    ("08-an-nas",           "Bacaan Surat An-Nas",  "Surah An-Nas",          "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
     "Qul a'uudzu birabbin-naas · Malikin-naas · Ilaahin-naas · Min syarril-waswaasil-khannaas · Alladzii yuwaswisu fii shuduurin-naas · Minal-jinnati wan-naas",
     "\u201cKatakanlah: Aku berlindung kepada Tuhan manusia; Raja manusia; Sembahan manusia; dari kejahatan bisikan setan yang bersembunyi; yang membisikkan ke dalam dada manusia; dari jin dan manusia.\u201d",
     "\u201cSay: I seek refuge in the Lord of mankind; the King of mankind; the God of mankind; from the evil of the sneaking whisperer; who whispers in the breasts of mankind; from jinn and men.\u201d", "teal"),
]

def build_coloring(item):
    fname, title, subtitle, scene_fn, accent = item
    art = scene_fn() if callable(scene_fn) else scene_fn
    body = f'<div class="art">{art}</div>'
    return sheet(title, subtitle, body, accent, "Mewarnai")

def build_calligraphy(item):
    fname, title, subtitle, arabic, meaning, accent = item
    body = f"""
    <div class="art" style="flex-direction: column; gap: 8mm;">
      <div style="font-family: Amiri, serif; direction: rtl; font-weight: 700;
                  font-size: 34pt; line-height: 2; color: {ACCENTS[accent][0]};
                  text-align: center; padding: 8mm 4mm;
                  border: 2.5px solid {ACCENTS[accent][1]}; border-radius: 10mm;
                  background: rgba(255,255,255,0.7); width: 100%;" lang="ar">{arabic}</div>
      <p style="text-align: center; font-size: 12pt; font-weight: 800; color: #475569;">{esc(meaning)}</p>
      <div style="width: 100%;">
        <div style="height: 1.6pt; background: {ACCENTS[accent][0]}55; margin: 7mm 0;"></div>
        <p style="font-size: 9pt; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #64748b; margin-bottom: 4mm;">LATIHAN MENEBALKAN</p>
        <div style="border-bottom: 1.4pt solid {ACCENTS[accent][0]}44; height: 16mm; margin-bottom: 3mm;"></div>
        <div style="border-bottom: 1.4pt solid {ACCENTS[accent][0]}44; height: 16mm; margin-bottom: 3mm;"></div>
        <div style="border-bottom: 1.4pt solid {ACCENTS[accent][0]}44; height: 16mm;"></div>
      </div>
    </div>"""
    return sheet(title, subtitle, body, accent, "Kaligrafi")

def build_reading(item):
    fname, title, subtitle, arabic, latin, meaning_id, meaning_en, accent = item
    body = f"""
    <div class="art" style="flex-direction: column; gap: 6mm; width: 100%;">
      <div style="width: 100%; text-align: center; padding: 9mm 6mm; border-radius: 8mm;
                  background: rgba(255,255,255,0.75); border: 2px solid {ACCENTS[accent][1]};">
        <p class="ar" lang="ar" dir="rtl" style="font-weight: 700; font-size: 26pt; line-height: 1.9; color: {ACCENTS[accent][0]};">{arabic}</p>
      </div>
      <p style="font-size: 12.5pt; font-weight: 700; font-style: italic; text-align: center; color: {ACCENTS[accent][0]};">{esc(latin)}</p>
      <p style="font-size: 11.5pt; font-weight: 700; text-align: center; color: #475569; line-height: 1.7;">{esc(meaning_id)}</p>
      <p style="font-size: 10.5pt; font-weight: 600; font-style: italic; text-align: center; color: #64748b; line-height: 1.6;">{esc(meaning_en)}</p>
      <div style="width: 100%; margin-top: 2mm;">
        <p style="font-size: 9pt; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #64748b; margin-bottom: 3mm;">LATIHAN MEMBACA</p>
        <div style="border-bottom: 1.3pt solid {ACCENTS[accent][0]}44; height: 13mm;"></div>
      </div>
    </div>"""
    return sheet(title, subtitle, body, accent, "Doa & Bacaan")

def main():
    count = 0
    for folder, items, builder, cat in (
        ("coloring", COLORING, build_coloring, "mewarnai"),
        ("calligraphy", CALLIGRAPHY, build_calligraphy, "kaligrafi"),
        ("readings", READINGS, build_reading, "doa"),
    ):
        d = os.path.join(OUT, folder)
        os.makedirs(d, exist_ok=True)
        for item in items:
            fname = item[0]
            html = builder(item)
            path = os.path.join(d, f"{cat}-{fname}.html")
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
            count += 1
            print("wrote", os.path.relpath(path, ROOT))
    print(f"\nGenerated {count} printables into {os.path.normpath(OUT)}")

if __name__ == "__main__":
    main()

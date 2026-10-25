# Image provenance — TPQ Qur'ani web

All photographs are from **Pexels** under the [Pexels License](https://www.pexels.com/license/):
free for commercial use, no attribution required (credited here anyway), no
model release needed for non-sensitive use. Files are local (`public/images/`)
so the site needs no remote image host, and each one is pre-cropped to the exact
aspect ratio of its slot before `next/image` optimisation.

Editorial rule applied when choosing: **no child's face is the front-and-centre
subject.** These cards are parent-facing marketing, so hands-on-books, backs of
heads and classroom activity are used instead of identifiable portraits.

| Slot | File | Dimensions | Source | Why this one |
|---|---|---|---|---|
| Hero (`Hero.tsx`, 6:5) | `hero.jpg` | 1200×1000 (crop 1078×899 from 1600×899) | https://www.pexels.com/photo/children-learning-the-quran-20627702 | Wide Quran-study classroom; foreground hand on a mushaf, faces turned down/blurred |
| PAUD card (`paud.jpg`, 4:3) | `paud.jpg` | 1000×750 (crop 1600×1200 @ y=1150) | https://www.pexels.com/photo/photo-of-child-playing-with-wooden-blocks-3933279 | Toddler with wooden blocks, hand-on-object focus; crop biased low so blocks stay in frame |
| TK card (`tk.jpg`, 4:3) | `tk.jpg` | 1000×750 | https://www.pexels.com/photo/kids-doing-artwork-8535599 | Kindergarten art table with teacher; faces small / turned away |
| TPA card (`tpa.jpg`, 4:3) | `tpa.jpg` | 1000×750 | https://www.pexels.com/photo/photo-of-person-reading-quran-683833 | Boys reading Qurans seen from behind — no faces at all |
| Category `prayers` | `prayers.jpg` | 800×600 | https://www.pexels.com/photo/close-up-of-hands-holding-islamic-prayer-beads-36732537 | Tasbih + mushaf in hands, no face |
| Category `readings` | `readings.jpg` | 800×600 | https://www.pexels.com/photo/an-open-quran-book-on-a-wooden-table-9325760 | Open mushaf on a rehal |
| Category `coloring` | `coloring.jpg` | 800×600 | https://www.pexels.com/photo/flat-lay-shot-of-colored-pencils-5208783 | Colored pencils, big negative space for the label chip |
| Category `calligraphy` | `calligraphy.jpg` | 800×600 | https://www.pexels.com/photo/vintage-calligraphy-pen-and-ink-on-arabic-script-36441741 | Dip pen + ink on Arabic-script page |
| Category `documents` | `documents.jpg` | 800×600 | https://www.pexels.com/photo/kid-s-hands-writing-letters-on-paper-with-pencil-on-blue-table-8363159 | Child hands tracing a worksheet, face out of frame |

## Rejected candidates (and why)

| Photo | Reason |
|---|---|
| 35105938 children reading Quran (studio) | Three faces fill the frame — identifiable minors as the subject |
| 27976845 children reading the quran in a mosque | Faces clearly identifiable, dark documentary tone, tight crop with no copy space |
| 4521947 boy in head covering reading quran | Face is the focal point, direct eye contact |
| 32108431 young child reading quran in mosque interior | Black-and-white and heavily moody; clashes with the warm palette |
| 29478672 young boy reading Quran on rug | Black-and-white, subject shot from above with head bowed — reads as a mound of fabric |
| 29157804 handwriting arabic calligraphy | Script is Arabic-derived but **not Arabic** (Tibetan/Nastaliq hand) — wrong subject for an Islamic calligraphy tile |
| 12956020 / 8422180 / 8613314 | Close duplicates of the PAUD play scene; kept one |

## Reproduce

```bash
# download (any Pexels photo id)
curl -sL -o "src.jpg" "https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=1600"
# crop to the slot ratio, then scale (example: 4:3 tile)
ffmpeg -i src.jpg -vf "crop=1600:1200:0:1150,scale=800:600:flags=lanczos" -q:v 3 public/images/documents.jpg
```

`object-position` is varied deterministically per resource slug
(`CategoryIllustration` → `positionFor(seed)`) so two cards in the same category
do not show an identical crop.

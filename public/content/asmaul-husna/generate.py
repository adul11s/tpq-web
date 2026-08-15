#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generator: Asmaul Husna tracing pages + index gallery.
Run: python3 generate.py  (writes 01-*.html ... 99-*.html and index.html)
"""
import html
import os
import re
import unicodedata

OUT = os.path.dirname(os.path.abspath(__file__))

# (num, arabic, transliteration, english, indonesian, c1, c2, motif)
NAMES = [
    (1, "الرَّحْمَنُ", "Ar-Rahman", "The Most Gracious", "Yang Maha Pengasih", "#d98a9f", "#f6dbe2", "cloud"),
    (2, "الرَّحِيمُ", "Ar-Rahim", "The Most Merciful", "Yang Maha Penyayang", "#c96a7e", "#f8e4e8", "rain"),
    (3, "الْمَلِكُ", "Al-Malik", "The King", "Yang Maha Merajai", "#b8860b", "#f7e8c8", "crown"),
    (4, "الْقُدُّوسُ", "Al-Quddus", "The Most Holy", "Yang Maha Suci", "#7d6bb4", "#e9e4f6", "rays"),
    (5, "السَّلَامُ", "As-Salam", "The Source of Peace", "Yang Maha Sejahtera", "#4a90c9", "#dcebf7", "dove"),
    (6, "الْمُؤْمِنُ", "Al-Mu'min", "The Granter of Security", "Yang Maha Memberi Keamanan", "#2b8778", "#d9efe9", "shield"),
    (7, "الْمُهَيْمِنُ", "Al-Muhaymin", "The Guardian", "Yang Maha Memelihara", "#4a5bb4", "#e2e5f7", "eye"),
    (8, "الْعَزِيزُ", "Al-'Aziz", "The Almighty", "Yang Maha Perkasa", "#b04a4a", "#f6e2e2", "mountain"),
    (9, "الْجَبَّارُ", "Al-Jabbar", "The Compeller", "Yang Maha Kuasa", "#5a6472", "#e6e9ec", "bolt"),
    (10, "الْمُتَكَبِّرُ", "Al-Mutakabbir", "The Supreme", "Yang Maha Megah", "#8a4a9f", "#f0e2f6", "column"),
    (11, "الْخَالِقُ", "Al-Khaliq", "The Creator", "Yang Maha Pencipta", "#1f8a5f", "#dff2e8", "palette"),
    (12, "الْبَارِئُ", "Al-Bari'", "The Evolver", "Yang Maha Mengadakan", "#3aa494", "#e0f5f0", "sprout"),
    (13, "الْمُصَوِّرُ", "Al-Musawwir", "The Fashioner", "Yang Maha Membentuk Rupa", "#c05a9a", "#f7e2f0", "flower"),
    (14, "الْغَفَّارُ", "Al-Ghaffar", "The Great Forgiver", "Yang Maha Pengampun", "#6a8fd4", "#e4ecf9", "rainbow"),
    (15, "الْقَهَّارُ", "Al-Qahhar", "The Subduer", "Yang Maha Menundukkan", "#3a4a8a", "#e2e6f4", "wave"),
    (16, "الْوَهَّابُ", "Al-Wahhab", "The Bestower", "Yang Maha Pemberi Karunia", "#e0785a", "#fbe7de", "gift"),
    (17, "الرَّزَّاقُ", "Ar-Razzaq", "The Provider", "Yang Maha Pemberi Rezeki", "#7a8a2f", "#eef0d9", "basket"),
    (18, "الْفَتَّاحُ", "Al-Fattah", "The Opener", "Yang Maha Pembuka", "#d99a1e", "#f9ecd3", "key"),
    (19, "الْعَلِيمُ", "Al-'Alim", "The All-Knowing", "Yang Maha Mengetahui", "#2f5ab8", "#dfe7f8", "book"),
    (20, "الْقَابِضُ", "Al-Qabid", "The Constrictor", "Yang Maha Menyempitkan", "#5a6a7a", "#e6eaee", "hand"),
    (21, "الْبَاسِطُ", "Al-Basit", "The Expander", "Yang Maha Melapangkan", "#5aa93f", "#e6f5de", "hand"),
    (22, "الْخَافِضُ", "Al-Khafid", "The Abaser", "Yang Maha Merendahkan", "#7a8aa0", "#e9edf3", "arrow"),
    (23, "الرَّافِعُ", "Ar-Rafi'", "The Exalter", "Yang Maha Meninggikan", "#3f9ad4", "#def0fa", "arrow"),
    (24, "الْمُعِزُّ", "Al-Mu'izz", "The Honorer", "Yang Maha Memuliakan", "#a5712f", "#f3e7d3", "trophy"),
    (25, "الْمُذِلُّ", "Al-Mudhill", "The Dishonorer", "Yang Maha Menghinakan", "#8a8a8a", "#f0f0f0", "arrow"),
    (26, "السَّمِيعُ", "As-Sami'", "The All-Hearing", "Yang Maha Mendengar", "#3aa0b4", "#def2f5", "waves"),
    (27, "الْبَصِيرُ", "Al-Basir", "The All-Seeing", "Yang Maha Melihat", "#2f8fd9", "#def0fb", "eye"),
    (28, "الْحَكَمُ", "Al-Hakam", "The Judge", "Yang Maha Menetapkan", "#5a6ab4", "#e4e8f7", "scales"),
    (29, "الْعَدْلُ", "Al-'Adl", "The Just", "Yang Maha Adil", "#5a8a6a", "#e5f0e8", "scales"),
    (30, "اللَّطِيفُ", "Al-Latif", "The Subtle", "Yang Maha Lembut", "#d48a9f", "#f9e7ec", "feather"),
    (31, "الْخَبِيرُ", "Al-Khabir", "The Aware", "Yang Maha Mengetahui", "#23705e", "#dff0ea", "magnifier"),
    (32, "الْحَلِيمُ", "Al-Halim", "The Forbearing", "Yang Maha Penyantun", "#6a9a6a", "#e7f1e7", "lake"),
    (33, "الْعَظِيمُ", "Al-'Azim", "The Magnificent", "Yang Maha Agung", "#7a4a9f", "#eee2f6", "galaxy"),
    (34, "الْغَفُورُ", "Al-Ghafur", "The All-Forgiving", "Yang Maha Pengampun", "#8aa8e0", "#e9f0fb", "leaf"),
    (35, "الشَّكُورُ", "Ash-Shakur", "The Appreciative", "Yang Maha Pembalas Budi", "#8a9a2f", "#f0f1d9", "heart"),
    (36, "الْعَلِيُّ", "Al-'Aliyy", "The Most High", "Yang Maha Tinggi", "#2f7ad4", "#deebfa", "eagle"),
    (37, "الْكَبِيرُ", "Al-Kabir", "The Greatest", "Yang Maha Besar", "#c97a2f", "#f9ead9", "sun"),
    (38, "الْحَفِيظُ", "Al-Hafiz", "The Preserver", "Yang Maha Menjaga", "#1f6a45", "#e0efe5", "lock"),
    (39, "الْمُقِيتُ", "Al-Muqit", "The Sustainer", "Yang Maha Pemberi Kecukupan", "#b08a3a", "#f5ead5", "cup"),
    (40, "الْحَسِيبُ", "Al-Hasib", "The Reckoner", "Yang Maha Membuat Perhitungan", "#3a5aa8", "#e2e8f7", "abacus"),
    (41, "الْجَلِيلُ", "Al-Jalil", "The Majestic", "Yang Maha Luhur", "#6a3aa8", "#eae0f6", "column"),
    (42, "الْكَرِيمُ", "Al-Karim", "The Generous", "Yang Maha Pemurah", "#b43a5a", "#f8e2e8", "cup"),
    (43, "الرَّقِيبُ", "Ar-Raqib", "The Watchful", "Yang Maha Mengawasi", "#2f4a7a", "#e2e8f2", "telescope"),
    (44, "الْمُجِيبُ", "Al-Mujib", "The Responsive", "Yang Maha Mengabulkan", "#2fa06a", "#dff3e9", "bell"),
    (45, "الْوَاسِعُ", "Al-Wasi'", "The Vast", "Yang Maha Luas", "#5aa0c9", "#e6f2f8", "sun"),
    (46, "الْحَكِيمُ", "Al-Hakim", "The Wise", "Yang Maha Bijaksana", "#8a6a2f", "#f2ead8", "lantern"),
    (47, "الْوَدُودُ", "Al-Wadud", "The Loving", "Yang Maha Mengasihi", "#d45a7a", "#fbe3ea", "heart"),
    (48, "الْمَجِيدُ", "Al-Majid", "The Glorious", "Yang Maha Mulia", "#8a6ab4", "#efe8f7", "laurel"),
    (49, "الْبَاعِثُ", "Al-Ba'ith", "The Resurrector", "Yang Maha Membangkitkan", "#e08a3a", "#fbebd9", "sunrise"),
    (50, "الشَّهِيدُ", "Ash-Shahid", "The Witness", "Yang Maha Menyaksikan", "#4a6a9f", "#e4eaf5", "rays"),
    (51, "الْحَقُّ", "Al-Haqq", "The Truth", "Yang Maha Benar", "#2f8a4a", "#e1f2e6", "compass"),
    (52, "الْوَكِيلُ", "Al-Wakil", "The Trustee", "Yang Maha Memelihara", "#2f8a7a", "#e0f1ec", "umbrella"),
    (53, "الْقَوِيُّ", "Al-Qawiyy", "The Strong", "Yang Maha Kuat", "#5a5a6a", "#e9e9ee", "mountain"),
    (54, "الْمَتِينُ", "Al-Matin", "The Firm", "Yang Maha Kokoh", "#6a6a6a", "#eeeeee", "column"),
    (55, "الْوَلِيُّ", "Al-Waliyy", "The Protecting Friend", "Yang Maha Melindungi", "#6a7ad4", "#e7eaf8", "dove"),
    (56, "الْحَمِيدُ", "Al-Hamid", "The Praiseworthy", "Yang Maha Terpuji", "#4a8a2f", "#e8f2df", "laurel"),
    (57, "الْمُحْصِي", "Al-Muhsi", "The Accounter", "Yang Maha Menghitung", "#3a4a7a", "#e4e8f2", "abacus"),
    (58, "الْمُبْدِئُ", "Al-Mubdi'", "The Originator", "Yang Maha Memulai", "#e8a03a", "#fbeed9", "sunrise"),
    (59, "الْمُعِيدُ", "Al-Mu'id", "The Restorer", "Yang Maha Mengembalikan", "#3a9a8a", "#e0f2ee", "cycle"),
    (60, "الْمُحْيِي", "Al-Muhyi", "The Giver of Life", "Yang Maha Menghidupkan", "#5ab43f", "#e9f7e0", "flower"),
    (61, "الْمُمِيتُ", "Al-Mumit", "The Bringer of Death", "Yang Maha Mematikan", "#7a7a8a", "#efeff2", "flame"),
    (62, "الْحَيُّ", "Al-Hayy", "The Ever-Living", "Yang Maha Hidup", "#d9a03a", "#f9eed8", "flame"),
    (63, "الْقَيُّومُ", "Al-Qayyum", "The Self-Sustaining", "Yang Maha Berdiri Sendiri", "#1f7a6a", "#dff0eb", "column"),
    (64, "الْوَاجِدُ", "Al-Wajid", "The Finder", "Yang Maha Menemukan", "#a87a1f", "#f6ebd4", "sparkle"),
    (65, "الْمَاجِدُ", "Al-Majid", "The Illustrious", "Yang Maha Mulia", "#8aa0c9", "#eaf0f8", "pearl"),
    (66, "الْوَاحِدُ", "Al-Wahid", "The One", "Yang Maha Esa", "#d9b23a", "#f9f1d9", "star"),
    (67, "الْأَحَدُ", "Al-Ahad", "The Only One", "Yang Maha Tunggal", "#3a8a6a", "#e3f2e9", "sun"),
    (68, "الصَّمَدُ", "As-Samad", "The Eternal Refuge", "Yang Maha Dibutuhkan", "#7a7a6a", "#f0f0ea", "castle"),
    (69, "الْقَادِرُ", "Al-Qadir", "The Capable", "Yang Maha Berkuasa", "#5a5aa0", "#e5e5f5", "bolt"),
    (70, "الْمُقْتَدِرُ", "Al-Muqtadir", "The Determiner", "Yang Maha Menentukan", "#4a5a7a", "#e5e9f0", "clock"),
    (71, "الْمُقَدِّمُ", "Al-Muqaddim", "The Expediter", "Yang Maha Mendahulukan", "#e07a2f", "#fbeddd", "arrow"),
    (72, "الْمُؤَخِّرُ", "Al-Mu'akhkhir", "The Delayer", "Yang Maha Mengakhirkan", "#a05a3a", "#f6e6dc", "hourglass"),
    (73, "الْأَوَّلُ", "Al-Awwal", "The First", "Yang Maha Awal", "#f0b03a", "#fdf2da", "sunrise"),
    (74, "الْآخِرُ", "Al-Akhir", "The Last", "Yang Maha Akhir", "#b06a4a", "#f6e7de", "sunset"),
    (75, "الظَّاهِرُ", "Az-Zahir", "The Manifest", "Yang Maha Nyata", "#d9a02f", "#faf0d9", "sun"),
    (76, "الْبَاطِنُ", "Al-Batin", "The Hidden", "Yang Maha Ghaib", "#6a5a9f", "#eae6f4", "moon"),
    (77, "الْوَالِي", "Al-Wali", "The Governor", "Yang Maha Memerintah", "#6a9a2f", "#edf2df", "scepter"),
    (78, "الْمُتَعَالِي", "Al-Muta'ali", "The Exalted", "Yang Maha Tinggi", "#3f8ad9", "#e0eefa", "eagle"),
    (79, "الْبَرُّ", "Al-Barr", "The Source of Goodness", "Yang Maha Baik", "#3f9a4a", "#e4f3e4", "leaf"),
    (80, "التَّوَّابُ", "At-Tawwab", "The Accepter of Repentance", "Yang Maha Penerima Taubat", "#5a8ad9", "#e6edf9", "door"),
    (81, "الْمُنْتَقِمُ", "Al-Muntaqim", "The Avenger", "Yang Maha Pemberi Balasan", "#9f3a3a", "#f6e3e3", "sword"),
    (82, "الْعَفُوُّ", "Al-'Afuww", "The Pardoner", "Yang Maha Pemaaf", "#8aa8d4", "#edf2f9", "dove"),
    (83, "الرَّءُوفُ", "Ar-Ra'uf", "The Kind", "Yang Maha Belas Kasihan", "#e09aa0", "#fbeff0", "heart"),
    (84, "مَالِكُ الْمُلْكِ", "Malik-ul-Mulk", "Owner of Sovereignty", "Yang Maha Memiliki Kerajaan", "#b8862f", "#f6ead2", "crown"),
    (85, "ذُو الْجَلَالِ وَالْإِكْرَامِ", "Dhul-Jalali wal-Ikram", "Lord of Majesty and Generosity", "Yang Maha Pemilik Kebesaran dan Kemuliaan", "#8a4aa8", "#f0e4f6", "arch"),
    (86, "الْمُقْسِطُ", "Al-Muqsit", "The Equitable", "Yang Maha Adil", "#5a7a9f", "#e7ecf3", "scales"),
    (87, "الْجَامِعُ", "Al-Jami'", "The Gatherer", "Yang Maha Mengumpulkan", "#d47a5a", "#fbeae2", "circle"),
    (88, "الْغَنِيُّ", "Al-Ghaniyy", "The Self-Sufficient", "Yang Maha Kaya", "#b08a1f", "#f7edd5", "chest"),
    (89, "الْمُغْنِي", "Al-Mughni", "The Enricher", "Yang Maha Memberi Kekayaan", "#c9a02f", "#f8f0da", "coins"),
    (90, "الْمَانِعُ", "Al-Mani'", "The Preventer", "Yang Maha Mencegah", "#8a8a7a", "#f1f1ec", "wall"),
    (91, "الضَّارُّ", "Ad-Darr", "The Distresser", "Yang Maha Memberi Derita", "#4a5a6a", "#e4e8ec", "storm"),
    (92, "النَّافِعُ", "An-Nafi'", "The Benefactor", "Yang Maha Memberi Manfaat", "#3f9a6a", "#e3f3ea", "sun"),
    (93, "النُّورُ", "An-Nur", "The Light", "Yang Maha Bercahaya", "#e8b03a", "#fbf2dc", "rays"),
    (94, "الْهَادِي", "Al-Hadi", "The Guide", "Yang Maha Pemberi Petunjuk", "#d98a2f", "#faeeda", "lantern"),
    (95, "الْبَدِيعُ", "Al-Badi'", "The Incomparable", "Yang Maha Pencipta Keindahan", "#9a5ad4", "#f0e6fa", "sparkle"),
    (96, "الْبَاقِي", "Al-Baqi", "The Everlasting", "Yang Maha Kekal", "#2f7a8a", "#e0f0f3", "cycle"),
    (97, "الْوَارِثُ", "Al-Warith", "The Inheritor", "Yang Maha Pewaris", "#a5712f", "#f5e9d6", "scroll"),
    (98, "الرَّشِيدُ", "Ar-Rashid", "The Guide to the Right Path", "Yang Maha Pandai", "#4a8a3f", "#e6f2e1", "path"),
    (99, "الصَّبُورُ", "As-Sabur", "The Patient", "Yang Maha Sabar", "#5a8ab4", "#e6eef6", "river"),
]

# --- motif icons (viewBox 0 0 100 100, stroke currentColor) ---
MOTIFS = {
    "sun": '<circle cx="50" cy="50" r="15"/><path d="M50 10v12M50 78v12M10 50h12M78 50h12M22 22l9 9M69 69l9 9M78 22l-9 9M31 69l-9 9"/>',
    "moon": '<path d="M63 12a40 40 0 1 0 8 74 32 32 0 1 1-8-74z"/>',
    "star": '<path d="M50 8l12.4 25.4L90 37l-20 19.6 4.8 28L50 73.4 25.2 84.6 30 56.6 10 37l27.6-3.6z"/>',
    "sparkle": '<path d="M50 16l8.6 23.4L82 48l-23.4 8.6L50 80l-8.6-23.4L18 48l23.4-8.6z"/>',
    "cloud": '<path d="M26 68a14 14 0 0 1-2-27 18 18 0 0 1 34-6 13 13 0 0 1 9 33z"/><path d="M26 68h49"/>',
    "rain": '<path d="M26 40a14 14 0 0 1-2-27 18 18 0 0 1 34-6 13 13 0 0 1 9 33z"/><path d="M26 40h49"/><path d="M30 74l-6 12M50 74l-6 12M70 74l-6 12"/>',
    "rainbow": '<path d="M16 72a34 34 0 0 1 68 0M25 72a25 25 0 0 1 50 0M34 72a16 16 0 0 1 32 0M43 72a7 7 0 0 1 14 0"/><path d="M43 72h14"/>',
    "wave": '<path d="M6 44c9-13 18-13 27 0s18 13 27 0 18-13 27 0M6 62c9-13 18-13 27 0s18 13 27 0 18-13 27 0M6 80c9-13 18-13 27 0s18 13 27 0 18-13 27 0"/>',
    "mountain": '<path d="M14 76L38 30l14 22 10-14 24 38z"/><path d="M14 76h72"/>',
    "bolt": '<path d="M54 6L20 56h22l-8 38 38-54H50z"/>',
    "rays": '<path d="M50 10v12M50 78v12M10 50h12M78 50h12M22 22l9 9M69 69l9 9M78 22l-9 9M31 69l-9 9"/><circle cx="50" cy="50" r="13"/>',
    "dove": '<path d="M50 66c-20 0-34-12-38-26 4 6 10 10 16 10-2-10 2-20 10-28C28 20 14 30 10 44c-2 8 0 16 4 22 8 10 22 14 34 12l2 16 10-8-8-12c-2-4-3-8-2-12z"/>',
    "shield": '<path d="M50 8l30 10v24c0 18-12 34-30 44C32 76 20 60 20 42V18z"/><path d="M36 44l10 10 18-20"/>',
    "heart": '<path d="M50 80C20 58 10 42 10 30a14 14 0 0 1 28-6 14 14 0 0 1 28 6 14 14 0 0 1 28 6c0 12-10 28-44 44z"/>',
    "scales": '<path d="M50 12v76M28 20h44M28 20l-8 18M72 20l8 18M20 38v6a14 14 0 0 0 28 0v-6zM80 38v6a14 14 0 0 1-28 0v-6z"/>',
    "key": '<circle cx="30" cy="70" r="14"/><path d="M40 60L82 18M68 32l10 10M58 42l10 10"/>',
    "book": '<path d="M50 24c-8-8-20-10-36-8v64c16-2 28 0 36 8 8-8 20-10 36-8V16c-16-2-28 0-36 8z"/><path d="M50 24v64"/>',
    "flower": '<circle cx="50" cy="50" r="7"/><circle cx="50" cy="20" r="9"/><circle cx="50" cy="80" r="9"/><circle cx="20" cy="50" r="9"/><circle cx="80" cy="50" r="9"/>',
    "leaf": '<path d="M20 80C24 40 40 16 80 20c-4 40-20 64-60 60z"/><path d="M26 74C40 60 56 44 72 28"/>',
    "feather": '<path d="M30 86V24M30 36c12-6 20-4 24 2-10 4-18 4-24-2zM30 54c12-6 20-4 24 2-10 4-18 4-24-2zM30 72c12-6 20-4 24 2-10 4-18 4-24-2z"/>',
    "pearl": '<circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="10"/><circle cx="32" cy="68" r="6"/><circle cx="68" cy="68" r="6"/>',
    "eye": '<path d="M8 50c12-16 28-24 42-24s30 8 42 24c-12 16-28 24-42 24S20 66 8 50z"/><circle cx="50" cy="50" r="9"/>',
    "compass": '<circle cx="50" cy="50" r="32"/><path d="M50 50l12-18-6 20zM50 50L38 68l6-20z"/><circle cx="50" cy="50" r="3"/>',
    "lantern": '<path d="M40 12h20M50 12v8"/><path d="M34 20h32l6 14-10 34H38L28 34z"/><path d="M38 50h24M38 62h24"/>',
    "hourglass": '<path d="M32 12h36M32 88h36"/><path d="M32 12c0 14 18 18 18 36S32 74 32 88M68 12c0 14-18 18-18 36s18 26 18 40"/>',
    "column": '<path d="M32 14h36v72H32z"/><path d="M22 14h56M22 86h56M40 30h20M40 42h20M40 54h20M40 66h20"/>',
    "trophy": '<path d="M34 14h32v10c0 12-6 20-16 20s-16-8-16-20z"/><path d="M34 18H22a8 8 0 0 0 8 14M66 18h12a8 8 0 0 1-8 14M50 44v12M36 72h28l4 14H32z"/>',
    "gift": '<path d="M14 44h72v22H14zM14 50h72"/><path d="M50 44v42M50 44c-16 0-24-6-24-18 0-6 4-8 8-8 10 0 16 10 16 26zM50 44c16 0 24-6 24-18 0-6-4-8-8-8-10 0-16 10-16 26z"/>',
    "basket": '<path d="M18 52h64l-8 24a8 8 0 0 1-8 6H34a8 8 0 0 1-8-6z"/><path d="M14 52h72v6H14zM32 28l10 24M50 28v24M68 28l-10 24"/>',
    "cup": '<path d="M30 16h40l-4 42a14 14 0 0 1-14 14h-4a14 14 0 0 1-14-14z"/><path d="M70 28h8a10 10 0 0 1 0 20h-6"/>',
    "bell": '<path d="M50 8c-14 0-20 10-20 22v14l-8 14h56l-8-14V30c0-12-6-22-20-22z"/><path d="M40 66a10 10 0 0 0 20 0"/>',
    "lock": '<path d="M30 42v-8a20 20 0 0 1 40 0v8"/><path d="M22 42h56v36H22z"/><circle cx="50" cy="60" r="6"/><path d="M50 66v6"/>',
    "magnifier": '<circle cx="38" cy="38" r="20"/><path d="M54 54l28 28"/>',
    "abacus": '<path d="M20 12h60v76H20zM20 32h60M20 52h60M20 72h60"/><circle cx="34" cy="22" r="6"/><circle cx="66" cy="22" r="6"/><circle cx="50" cy="42" r="6"/><circle cx="34" cy="62" r="6"/><circle cx="66" cy="62" r="6"/>',
    "telescope": '<path d="M28 82l28-52 24 10-20 38zM40 30l8 16M56 40l16 8"/><path d="M24 82h10"/>',
    "umbrella": '<path d="M12 46a38 38 0 0 1 76 0z"/><path d="M50 46v28a8 8 0 0 0 16 0"/><path d="M50 88V46"/>',
    "laurel": '<path d="M16 62C28 42 44 36 56 50c-10-8-26-4-40 12zM84 62C72 42 56 36 44 50c10-8 26-4 40 12z"/>',
    "sunrise": '<path d="M12 78h76"/><path d="M50 78V50M50 50a16 16 0 0 1 14 24M50 50a16 16 0 0 0-14 24"/><path d="M22 44l8-12M78 44l-8-12M50 18v-8"/>',
    "sunset": '<path d="M12 78h76"/><path d="M50 78a16 16 0 0 0 0-32 16 16 0 0 0 0 32z"/><path d="M22 48l8 8M78 48l-8 8"/>',
    "lake": '<path d="M14 42h72M14 58c12-8 24-8 36 0s24 8 36 0M14 74c12-8 24-8 36 0s24 8 36 0M20 42l16-18 14 18M52 42l10-12 12 12"/>',
    "eagle": '<path d="M50 22c-8 10-16 12-26 10 6-8 14-12 26-10zM50 22c8 10 16 12 26 10-6-8-14-12-26-10z"/><path d="M50 26l-6 16h12zM34 44l-10 8 14-6zM66 44l10 8-14-6z"/>',
    "castle": '<path d="M24 78V42l8-8h14l14 14v30M24 78h12V50M42 78h16v-8M58 78h18V56l-6-16h-10"/><path d="M36 36v-8h8M58 40v-8h8"/>',
    "sword": '<path d="M24 76l44-44M68 32l8-8M60 40l8-8M52 48l8-8"/><path d="M26 78l-6 6M70 16l6 6M20 62h12l-6 16"/>',
    "arrow": '<path d="M14 50h72M62 28l22 22-22 22"/>',
    "cycle": '<path d="M50 14a36 36 0 1 0 28 12"/><path d="M78 14v18H60"/>',
    "flame": '<path d="M50 8c10 14 22 24 22 42a22 22 0 0 1-44 0c0-10 6-18 10-24 2 8 6 12 12 14-2-14-2-24 0-32z"/>',
    "chest": '<path d="M18 40h64v34H18zM18 40l6-12h52l6 12M30 28h40M36 52h28"/>',
    "coins": '<circle cx="50" cy="28" r="18"/><circle cx="34" cy="66" r="16"/><circle cx="68" cy="66" r="16"/><path d="M42 28h16M44 66h12"/>',
    "wall": '<path d="M12 78h76"/><path d="M12 56l26-22 22 18 28-24v50H12z"/><path d="M34 78V44M58 78V50"/>',
    "storm": '<path d="M26 56a14 14 0 0 1-2-27 18 18 0 0 1 34-6 13 13 0 0 1 9 33z"/><path d="M26 56h49"/><path d="M58 56l-8 16h12l-8 16"/>',
    "circle": '<circle cx="50" cy="50" r="34"/><circle cx="50" cy="50" r="10"/><circle cx="24" cy="30" r="4"/><circle cx="76" cy="30" r="4"/><circle cx="24" cy="70" r="4"/><circle cx="76" cy="70" r="4"/>',
    "clock": '<circle cx="50" cy="50" r="34"/><path d="M50 28v22l14 8"/>',
    "door": '<path d="M28 86V28a22 22 0 0 1 44 0v58z"/><circle cx="58" cy="52" r="4"/><path d="M28 86H18M82 86H72"/>',
    "path": '<path d="M50 86C40 72 40 64 52 56c10-6 8-14-4-18M34 86c-8-8-6-16 2-20M64 86c-6-6-4-12 2-14"/><path d="M56 50l8-6"/>',
    "scroll": '<path d="M28 18h44v14a14 14 0 0 0 14 14 14 14 0 0 0-14 14v22H28z"/><path d="M72 18c8 0 12-4 12-10M72 82c8 0 12 4 12 10"/><path d="M38 34h24M38 50h24M38 66h14"/>',
    "river": '<path d="M12 26c16 12 24 16 40 8s24-8 36 2M12 52c16 12 24 16 40 8s24-8 36 2M12 78c16 12 24 16 40 8s24-8 36 2"/><path d="M24 20l6 8M58 44l6 8M30 68l6 8"/>',
    "arch": '<path d="M20 86V44a30 30 0 0 1 60 0v42zM20 86H12M80 86h8"/><path d="M32 86V52a18 18 0 0 1 36 0v34"/>',
    "scepter": '<path d="M36 84l8-8M40 80l4-4M44 76l26-42M64 28l10-10M70 22l6 6M58 34l-6 6M74 48l-8 6"/><circle cx="50" cy="50" r="3"/>',
    "sprout": '<path d="M50 86V50M50 50c-16-4-24-14-24-30 16 0 26 10 24 30zM50 50c16-4 24-14 24-30-16 0-26 10-24 30z"/>',
    "palette": '<path d="M50 14a36 36 0 1 0 0 72h6a6 6 0 0 0 0-12h-8a8 8 0 0 1 0-16h10a8 8 0 0 0 8-8v-8a14 14 0 0 0-14-14z"/><circle cx="30" cy="34" r="4"/><circle cx="36" cy="58" r="4"/><circle cx="64" cy="30" r="4"/><circle cx="72" cy="56" r="4"/>',
    "hand": '<path d="M40 52V24a8 8 0 0 1 16 0v16M56 40V20a8 8 0 0 1 16 0v22M72 42V26a8 8 0 0 1 16 0v24c0 22-14 36-36 36-12 0-22-6-26-16l-10-18a8 8 0 0 1 14-7l8 11V32a8 8 0 0 1 16 0"/>',
    "waves": '<path d="M20 38a14 14 0 0 1 0 24M40 30a30 30 0 0 1 0 40M60 24a44 44 0 0 1 0 52"/><circle cx="12" cy="50" r="4"/>',
    "galaxy": '<path d="M50 50c2-20 12-32 28-32-4 24-14 36-28 32zM50 50c-2 20-12 32-28 32 4-24 14-36 28-32z"/><circle cx="70" cy="24" r="3"/><circle cx="24" cy="74" r="3"/><circle cx="62" cy="70" r="3"/>',
    "gear": '<circle cx="50" cy="50" r="14"/><path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l9 9M68 68l9 9M77 23l-9 9M32 68l-9 9"/>',
}

def group_letters(name):
    groups = []
    for ch in name:
        cat = unicodedata.category(ch)
        if cat.startswith("M") or ch in "\u0640":
            if groups:
                groups[-1] += ch
        elif ch == " ":
            groups.append(" ")
        else:
            groups.append(ch)
    return groups

def hex_to_rgba(hexc, a):
    h = hexc.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return f"rgba({r}, {g}, {b}, {a})"

def slug(t):
    s = re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    return s

PAGE_TMPL = """<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>%%NUM%% · %%TR%% — Asmaul Husna</title>
  <meta name="description" content="%%NUM%%/99 Asmaul Husna: %%AR%% — %%EN%%. Lembar latihan menebalkan huruf." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --c1: %%C1%%;
      --c2: %%C2%%;
      --c1-soft: %%C1SOFT%%;
      --c1-faint: %%C1FAINT%%;
      --c2-faint: %%C2FAINT%%;
      --ink: #2c3e35;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }

    body {
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: clamp(12px, 3vw, 36px);
      font-family: "Nunito", ui-sans-serif, system-ui, sans-serif;
      color: var(--ink);
      background:
        radial-gradient(900px 600px at 85% -10%, var(--c2-faint), transparent 60%),
        radial-gradient(800px 550px at -10% 110%, var(--c2-faint), transparent 55%),
        linear-gradient(160deg, #fdfefb 0%, #f6faf5 55%, #f1f8f2 100%);
      overflow-x: hidden;
    }

    .motif-bg {
      position: fixed;
      top: 50%;
      left: 50%;
      width: clamp(280px, 52vmin, 620px);
      height: clamp(280px, 52vmin, 620px);
      transform: translate(-50%, -50%);
      color: var(--c1);
      opacity: 0.09;
      pointer-events: none;
      z-index: 0;
      animation: breathe 14s ease-in-out infinite;
    }

    @keyframes breathe {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.05); }
    }

    .page {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 860px;
      text-align: center;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: clamp(0.8rem, 2vw, 1.4rem);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: clamp(0.7rem, 1.8vw, 0.85rem);
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--c1);
    }

    .badge .n {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--c1);
      color: #fff;
      font-size: 0.85rem;
    }

    .link-home {
      font-size: clamp(0.7rem, 1.8vw, 0.85rem);
      font-weight: 700;
      color: var(--c1);
      text-decoration: none;
      border-bottom: 1.5px dashed var(--c1-soft);
      padding-bottom: 2px;
    }

    .name {
      font-family: "Amiri", serif;
      font-weight: 700;
      font-size: clamp(2.4rem, 8.5vw, 5.2rem);
      line-height: 1.35;
      color: var(--c1);
      text-shadow: 0 2px 26px var(--c1-faint);
      direction: rtl;
      margin-bottom: clamp(0.6rem, 2vw, 1.1rem);
    }

    .trace-label {
      font-size: clamp(0.75rem, 2vw, 0.9rem);
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--c1);
      opacity: 0.75;
      margin-bottom: 0.6rem;
    }

    .trace {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: flex-end;
      gap: clamp(4px, 1.2vw, 12px);
      direction: rtl;
      margin-bottom: clamp(0.9rem, 2.5vw, 1.5rem);
    }

    .letter {
      position: relative;
      flex: 1 1 auto;
      min-width: clamp(1.9rem, 9vw, 3.4rem);
      max-width: clamp(3.2rem, 16vw, 5.4rem);
      height: clamp(3rem, 13vh, 5.6rem);
      display: grid;
      place-items: center;
      container-type: inline-size;
      border: 1px solid var(--c1-faint);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.55);
    }

    .letter.gap {
      border: none;
      background: none;
      min-width: clamp(0.5rem, 2vw, 1rem);
      max-width: clamp(0.5rem, 2vw, 1rem);
    }

    .letter .gl {
      font-family: "Amiri", serif;
      font-weight: 700;
      font-size: 56cqi;
      line-height: 1;
      color: transparent;
      -webkit-text-stroke: clamp(1px, 0.12cqi, 2.5px) var(--c1-soft);
      user-select: none;
    }

    @supports not (-webkit-text-stroke: 1px) {
      .letter .gl { color: var(--c1-faint); }
    }

    .letter::after {
      content: "";
      position: absolute;
      left: 12%;
      right: 12%;
      bottom: 10%;
      border-bottom: 2px dotted var(--c1-soft);
    }

    .meaning {
      display: flex;
      align-items: center;
      gap: clamp(12px, 3vw, 20px);
      text-align: left;
      padding: clamp(14px, 3vw, 22px) clamp(16px, 4vw, 28px);
      border-radius: 20px;
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5));
      -webkit-backdrop-filter: blur(14px) saturate(1.2);
      backdrop-filter: blur(14px) saturate(1.2);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 16px 44px -24px var(--c1-faint);
    }

    .meaning .icon {
      flex: 0 0 auto;
      width: clamp(40px, 8vw, 54px);
      height: clamp(40px, 8vw, 54px);
      color: var(--c1);
      opacity: 0.85;
    }

    .meaning .tr {
      font-weight: 800;
      font-size: clamp(0.95rem, 2.6vw, 1.15rem);
      color: var(--c1);
    }

    .meaning .en {
      font-style: italic;
      font-weight: 600;
      font-size: clamp(0.85rem, 2.4vw, 1rem);
      color: #3d5c4a;
      margin-top: 2px;
    }

    .meaning .id {
      font-size: clamp(0.8rem, 2.3vw, 0.95rem);
      color: #5c7266;
      margin-top: 2px;
    }

    .nav {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-top: clamp(0.9rem, 2.5vw, 1.4rem);
    }

    .nav a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: clamp(0.75rem, 2vw, 0.88rem);
      font-weight: 800;
      color: #fff;
      background: var(--c1);
      text-decoration: none;
      padding: 7px 16px;
      border-radius: 999px;
      box-shadow: 0 8px 20px -10px var(--c1);
      opacity: 0.95;
      transition: opacity 0.2s;
    }

    .nav a:hover { opacity: 1; }
    .nav a.disabled { opacity: 0.35; pointer-events: none; }

    @media (max-height: 640px) {
      .name { font-size: clamp(1.8rem, 7vw, 3.4rem); margin-bottom: 0.4rem; }
      .letter { height: clamp(2.4rem, 18vh, 4rem); }
      .trace { margin-bottom: 0.5rem; }
      .topbar { margin-bottom: 0.4rem; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
    }
  </style>
</head>
<body>
  <svg class="motif-bg" viewBox="0 0 100 100" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      %%MOTIF%%
    </g>
  </svg>

  <main class="page">
    <header class="topbar">
      <span class="badge"><span class="n">%%NUM%%</span> Asmaul Husna</span>
      <a class="link-home" href="index.html">99 Nama &rarr;</a>
    </header>

    <h1 class="name" lang="ar" dir="rtl">%%AR%%</h1>

    <p class="trace-label">Tebalkan huruf-huruf berikut</p>
    <div class="trace" dir="rtl" aria-label="Tracing letters">
      %%LETTERS%%
    </div>

    <section class="meaning">
      <svg class="icon" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
          %%MOTIF%%
        </g>
      </svg>
      <div>
        <div class="tr">%%TR%%</div>
        <div class="en">%%EN%%</div>
        <div class="id">%%ID%%</div>
      </div>
    </section>

    <nav class="nav">
      %%PREV%%
      <a href="index.html">Semua Nama</a>
      %%NEXT%%
    </nav>
  </main>
</body>
</html>
"""

INDEX_TMPL = """<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Asmaul Husna — 99 Nama Allah</title>
  <meta name="description" content="99 halaman kaligrafi & latihan menebalkan huruf Asmaul Husna dengan tema unik per nama." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    body {
      min-height: 100vh;
      padding: clamp(20px, 4vw, 48px);
      font-family: "Nunito", ui-sans-serif, system-ui, sans-serif;
      color: #2c3e35;
      background:
        radial-gradient(1000px 700px at 85% -10%, #e4f3e9, transparent 60%),
        radial-gradient(900px 600px at -10% 110%, #eaf2f8, transparent 55%),
        linear-gradient(160deg, #fdfefb 0%, #f5faf6 55%, #eef7f1 100%);
    }

    header { max-width: 1200px; margin: 0 auto clamp(1.2rem, 3vw, 2rem); text-align: center; }
    .title { font-family: "Amiri", serif; font-weight: 700; font-size: clamp(1.9rem, 6vw, 3.4rem); color: #1f6a45; }
    .subtitle { color: #52705e; font-weight: 600; margin-top: 4px; font-size: clamp(0.85rem, 2.2vw, 1rem); }

    .searchwrap { max-width: 560px; margin: 1.1rem auto 0; position: relative; }
    .searchwrap input {
      width: 100%;
      padding: 13px 18px;
      border-radius: 999px;
      border: 1.5px solid #cfe7d8;
      background: rgba(255, 255, 255, 0.85);
      font-family: inherit;
      font-size: 0.95rem;
      color: #2c3e35;
      outline: none;
      box-shadow: 0 10px 30px -18px rgba(31, 106, 69, 0.4);
    }
    .searchwrap input:focus { border-color: #3aa494; }
    .count { margin-top: 8px; font-size: 0.8rem; font-weight: 700; color: #6b8575; }

    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: clamp(10px, 2vw, 18px);
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px 16px 14px;
      border-radius: 18px;
      background: linear-gradient(155deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.55));
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 12px 32px -20px rgba(31, 60, 45, 0.35);
      text-decoration: none;
      color: inherit;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 18px 40px -20px rgba(31, 60, 45, 0.45); }

    .card .num { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; color: var(--c1); }
    .card .ar {
      font-family: "Amiri", serif;
      font-weight: 700;
      font-size: 1.9rem;
      line-height: 1.4;
      color: var(--c1);
      direction: rtl;
      text-align: center;
    }
    .card .tr { font-weight: 800; font-size: 0.9rem; text-align: center; color: #2c3e35; }
    .card .en { font-size: 0.74rem; font-weight: 600; text-align: center; color: #55705f; font-style: italic; line-height: 1.35; }
    .card .dot { width: 26px; height: 26px; border-radius: 50%; background: var(--c1); margin: 2px auto 0; opacity: 0.85; }

    .empty { grid-column: 1 / -1; text-align: center; color: #6b8575; font-weight: 700; padding: 40px 0; }

    @media (max-width: 480px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <header>
    <h1 class="title">Asmaul Husna</h1>
    <p class="subtitle">99 Nama Allah — kaligrafi &amp; latihan menebalkan huruf, satu tema per nama</p>
    <div class="searchwrap">
      <input id="q" type="search" placeholder="Cari nama, makna, atau artinya…" autocomplete="off" />
      <p class="count" id="count"></p>
    </div>
  </header>

  <main class="grid" id="grid">
    %%CARDS%%
  </main>

  <script>
    const grid = document.getElementById("grid");
    const q = document.getElementById("q");
    const count = document.getElementById("count");
    const cards = Array.from(grid.querySelectorAll(".card"));

    function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, ""); }

    function filter() {
      const f = norm(q.value.trim());
      let n = 0;
      for (const c of cards) {
        const hit = !f || norm(c.dataset.search).includes(f);
        c.style.display = hit ? "" : "none";
        if (hit) n++;
      }
      count.textContent = n + " / 99 nama";
      grid.classList.toggle("has-empty", n === 0);
    }

    let emptyEl;
    function ensureEmpty() {
      if (!emptyEl) {
        emptyEl = document.createElement("p");
        emptyEl.className = "empty";
        emptyEl.textContent = "Tidak ada nama yang cocok.";
        grid.appendChild(emptyEl);
      }
    }
    const obs = new MutationObserver(() => {
      const h = grid.querySelector(".empty");
      if (grid.classList.contains("has-empty") && !h) { ensureEmpty(); grid.appendChild(h || emptyEl); }
    });

    q.addEventListener("input", filter);
    filter();
  </script>
</body>
</html>
"""

def render_letters(arabic):
    parts = []
    for g in group_letters(arabic):
        if g == " ":
            parts.append('<div class="letter gap" aria-hidden="true"></div>')
        else:
            esc = html.escape(g)
            parts.append(f'<div class="letter"><span class="gl">{esc}</span></div>')
    return "\n".join(parts)

def render_motif(key):
    return MOTIFS.get(key, MOTIFS["star"])

def main():
    files = []
    for i, (num, ar, tr, en, ids, c1, c2, motif) in enumerate(NAMES):
        c1_soft = hex_to_rgba(c1, 0.5)
        c1_faint = hex_to_rgba(c1, 0.28)
        c2_faint = hex_to_rgba(c2, 0.65)
        prev_a, next_a = "", ""
        if i > 0:
            p = NAMES[i - 1]
            prev_a = f'<a href="{p[0]:02d}-{slug(p[2])}.html" title="{p[2]}">&#8592; Sebelumnya</a>'
        if i < len(NAMES) - 1:
            n = NAMES[i + 1]
            next_a = f'<a href="{n[0]:02d}-{slug(n[2])}.html" title="{n[2]}">Berikutnya &#8594;</a>'

        page = (PAGE_TMPL
                .replace("%%NUM%%", f"{num:02d}")
                .replace("%%TR%%", tr)
                .replace("%%AR%%", ar)
                .replace("%%EN%%", en)
                .replace("%%ID%%", ids)
                .replace("%%C1%%", c1)
                .replace("%%C2%%", c2)
                .replace("%%C1SOFT%%", c1_soft)
                .replace("%%C1FAINT%%", c1_faint)
                .replace("%%C2FAINT%%", c2_faint)
                .replace("%%MOTIF%%", render_motif(motif))
                .replace("%%LETTERS%%", render_letters(ar))
                .replace("%%PREV%%", prev_a)
                .replace("%%NEXT%%", next_a))
        fname = f"{num:02d}-{slug(tr)}.html"
        with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
            f.write(page)
        files.append(fname)

    cards = []
    for num, ar, tr, en, ids, c1, c2, motif in NAMES:
        cards.append(
            f'<a class="card" href="{num:02d}-{slug(tr)}.html" style="--c1:{c1}" data-search="{html.escape(tr + " " + ar + " " + en + " " + ids + " " + str(num))}">'
            f'<span class="num">{num:02d} / 99</span>'
            f'<span class="ar">{ar}</span>'
            f'<span class="tr">{tr}</span>'
            f'<span class="en">{en}</span>'
            f'<span class="dot"></span></a>'
        )
    index = INDEX_TMPL.replace("%%CARDS%%", "\n    ".join(cards))
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index)

    print(f"generated {len(files)} pages + index.html")

if __name__ == "__main__":
    main()

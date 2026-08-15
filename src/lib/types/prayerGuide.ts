export interface PrayerGuide {
  id: number;
  occasion: string;
  occasionSlug: string;
  arabicText: string;
  transliteration: string;
  meaningId: string;
  meaningEn: string | null;
  sortOrder: number;
}

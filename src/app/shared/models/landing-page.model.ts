export interface LandingPageHero {
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
  author?: {
    name: string;
    title: string;
    avatar: string;
  };
}

export interface LandingPageSpot {
  code: string;
  slug: string;
  name: string;
  city: string;
  type: string;
  score: number;
  image: string | null;
  description: string[];
  lat: number;
  lng: number;
  distance?: string;
  facilities?: string[];
  note?: string;
}

export interface ProTip {
  title: string;
  content: string;
  icon?: string;
}

export interface LandingPageData {
  slug: string;
  hero: LandingPageHero;
  introText: string;
  title: string;
  description: string;
  spotsCount: number;
  spots: LandingPageSpot[];
  proTips?: ProTip[];
  generatedAt: string;
  canonicalUrl?: string;
  ogImage?: string;
}

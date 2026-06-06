/**
 * Enterprise Personalization (P8)
 *
 * Cross-device profile synchronization, multilingual scent profiles,
 * and localized recommendation engine for global markets.
 */

import { products, type Product } from "../data/products";

// ── Supported Locales ────────────────────────────────────────────────────────

export type SupportedLocale = "en" | "hi" | "fr" | "de" | "ja" | "ar";

export interface LocalizedContent {
  headline: string;
  subtitle: string;
  ctaText: string;
  profileNames: Record<string, string>;
}

const LOCALE_CONTENT: Record<SupportedLocale, LocalizedContent> = {
  en: {
    headline: "Your Scent, Your Story",
    subtitle: "Personalized candles matched to your unique fragrance profile.",
    ctaText: "Shop Your Profile",
    profileNames: { woody: "Woody", floral: "Floral", fresh: "Fresh", spicy: "Spicy" },
  },
  hi: {
    headline: "आपकी खुशबू, आपकी कहानी",
    subtitle: "आपकी अनूठी सुगंध प्रोफाइल के अनुसार व्यक्तिगत मोमबत्तियाँ।",
    ctaText: "अपनी प्रोफाइल खरीदें",
    profileNames: { woody: "वुडी", floral: "पुष्पीय", fresh: "ताज़ा", spicy: "मसालेदार" },
  },
  fr: {
    headline: "Votre Parfum, Votre Histoire",
    subtitle: "Des bougies personnalisées selon votre profil olfactif.",
    ctaText: "Explorez Votre Profil",
    profileNames: { woody: "Boisé", floral: "Floral", fresh: "Frais", spicy: "Épicé" },
  },
  de: {
    headline: "Ihr Duft, Ihre Geschichte",
    subtitle: "Personalisierte Kerzen, abgestimmt auf Ihr Duftprofil.",
    ctaText: "Profil Entdecken",
    profileNames: { woody: "Holzig", floral: "Blumig", fresh: "Frisch", spicy: "Würzig" },
  },
  ja: {
    headline: "あなたの香り、あなたの物語",
    subtitle: "あなたのフレグランスプロファイルに合わせたキャンドル。",
    ctaText: "プロファイルを見る",
    profileNames: { woody: "ウッディ", floral: "フローラル", fresh: "フレッシュ", spicy: "スパイシー" },
  },
  ar: {
    headline: "عطرك، قصتك",
    subtitle: "شموع مخصصة تتناسب مع ملفك العطري الفريد.",
    ctaText: "تسوق ملفك",
    profileNames: { woody: "خشبي", floral: "زهري", fresh: "منعش", spicy: "حار" },
  },
};

/** Returns localized content for the given locale. */
export function getLocalizedContent(locale: SupportedLocale): LocalizedContent {
  return LOCALE_CONTENT[locale] || LOCALE_CONTENT.en;
}

/** Detects user locale from browser settings. */
export function detectLocale(): SupportedLocale {
  const browserLang = navigator.language.split("-")[0];
  return Object.keys(LOCALE_CONTENT).includes(browserLang)
    ? (browserLang as SupportedLocale)
    : "en";
}

// ── Cross-Device Profile Sync ────────────────────────────────────────────────

export interface SyncableProfile {
  userId: string;
  scentProfile: string | null;
  viewedProducts: string[];
  purchasedProducts: string[];
  locale: SupportedLocale;
  devices: string[];
  lastSyncedAt: string;
}

/**
 * Syncs the local user profile to the cloud for cross-device continuity.
 * In production, this calls a secure API endpoint.
 */
export async function syncProfileToCloud(profile: SyncableProfile): Promise<boolean> {
  try {
    const res = await fetch("/api/profile/sync", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profile,
        deviceId: getDeviceId(),
        lastSyncedAt: new Date().toISOString(),
      }),
    });
    if (res.ok) console.log("[Profile] Synced to cloud");
    return res.ok;
  } catch {
    console.warn("[Profile] Cloud sync failed, will retry");
    return false;
  }
}

/**
 * Fetches the user profile from cloud, merging with local data.
 * Cloud data takes precedence for purchases; local data for views.
 */
export async function fetchCloudProfile(userId: string): Promise<SyncableProfile | null> {
  try {
    const res = await fetch(`/api/profile/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Merges a cloud profile with local data. */
export function mergeProfiles(
  local: SyncableProfile,
  cloud: SyncableProfile,
): SyncableProfile {
  return {
    userId: cloud.userId,
    scentProfile: cloud.scentProfile || local.scentProfile,
    viewedProducts: [...new Set([...cloud.viewedProducts, ...local.viewedProducts])],
    purchasedProducts: [...new Set([...cloud.purchasedProducts, ...local.purchasedProducts])],
    locale: cloud.locale,
    devices: [...new Set([...cloud.devices, getDeviceId()])],
    lastSyncedAt: new Date().toISOString(),
  };
}

function getDeviceId(): string {
  const key = "lumiere_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${navigator.platform}-${crypto.randomUUID().slice(0, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Localized Recommendations ────────────────────────────────────────────────

interface LocalizedProduct extends Product {
  localizedCategory: string;
  relevanceScore: number;
}

const REGION_PREFERENCES: Record<string, string[]> = {
  en: ["signature", "seasonal"],
  hi: ["signature", "limited"],
  fr: ["signature", "seasonal"],
  de: ["signature", "seasonal"],
  ja: ["limited", "signature"],
  ar: ["limited", "seasonal"],
};

/**
 * Returns recommendations localized to the user's region.
 * Boosts products from categories preferred in that locale.
 */
export function getLocalizedRecommendations(
  locale: SupportedLocale,
  scentProfile: string | null,
  limit = 4,
): LocalizedProduct[] {
  const preferredCategories = REGION_PREFERENCES[locale] || REGION_PREFERENCES.en;
  const content = getLocalizedContent(locale);

  const PROFILE_NOTES: Record<string, string[]> = {
    woody: ["cedarwood", "sandalwood", "oud", "amber"],
    floral: ["jasmine", "rose", "lavender", "peony"],
    fresh: ["sea salt", "bergamot", "eucalyptus", "citrus"],
    spicy: ["cinnamon", "cardamom", "black pepper", "clove"],
  };
  const targetNotes = scentProfile ? (PROFILE_NOTES[scentProfile.toLowerCase()] || []) : [];

  return products
    .filter((p) => p.inStock)
    .map((p) => {
      let score = 0;

      // Region category boost
      const catIndex = preferredCategories.indexOf(p.category);
      if (catIndex >= 0) score += (preferredCategories.length - catIndex) * 3;

      // Scent alignment
      const noteOverlap = p.notes.filter((n) => targetNotes.includes(n.toLowerCase())).length;
      score += noteOverlap * 4;

      return {
        ...p,
        localizedCategory: content.profileNames[p.category] || p.category,
        relevanceScore: score,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

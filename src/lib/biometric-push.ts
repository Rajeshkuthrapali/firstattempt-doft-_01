/**
 * PWA: Biometric Auth & Contextual Push (P10)
 *
 * - WebAuthn biometric authentication for offline-first checkout
 * - Location-aware and seasonal push notification targeting
 */

// ── WebAuthn Biometric Authentication ────────────────────────────────────────

export interface BiometricCredential {
  credentialId: string;
  userId: string;
  publicKey: string;
  createdAt: string;
  lastUsed: string;
}

const CRED_STORE_KEY = "lumiere_biometric_creds";

/**
 * Registers a new WebAuthn credential for the user.
 * Prompts fingerprint / Face ID depending on device.
 */
export async function registerBiometric(userId: string, displayName: string): Promise<boolean> {
  if (!("credentials" in navigator)) {
    console.warn("[Biometric] WebAuthn not supported");
    return false;
  }

  try {
    // Challenge should come from server in production
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Lumière Candles", id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },   // ES256
          { type: "public-key", alg: -257 },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",  // Device biometric (Face ID / fingerprint)
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
      },
    });

    if (!credential) return false;

    // Store credential reference (public key goes to server in production)
    const stored: BiometricCredential[] = JSON.parse(localStorage.getItem(CRED_STORE_KEY) || "[]");
    stored.push({
      credentialId: btoa(String.fromCharCode(...new Uint8Array((credential as PublicKeyCredential).rawId))),
      userId,
      publicKey: "server-stored",  // In production, the public key is stored server-side
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });
    localStorage.setItem(CRED_STORE_KEY, JSON.stringify(stored));

    console.log("[Biometric] Credential registered for", userId);
    return true;
  } catch (err) {
    console.error("[Biometric] Registration failed:", err);
    return false;
  }
}

/**
 * Authenticates a user via biometric challenge.
 * Returns true if biometric verification succeeds.
 */
export async function authenticateWithBiometric(userId: string): Promise<boolean> {
  if (!("credentials" in navigator)) return false;

  const stored: BiometricCredential[] = JSON.parse(localStorage.getItem(CRED_STORE_KEY) || "[]");
  const userCreds = stored.filter((c) => c.userId === userId);
  if (userCreds.length === 0) return false;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const allowCredentials = userCreds.map((c) => ({
      type: "public-key" as const,
      id: Uint8Array.from(atob(c.credentialId), (ch) => ch.charCodeAt(0)),
    }));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials,
        userVerification: "required",
        timeout: 60000,
      },
    });

    if (!assertion) return false;

    // In production: verify assertion signature server-side
    // Update last-used timestamp
    const updated = stored.map((c) =>
      c.userId === userId
        ? { ...c, lastUsed: new Date().toISOString() }
        : c
    );
    localStorage.setItem(CRED_STORE_KEY, JSON.stringify(updated));

    console.log("[Biometric] Authentication successful for", userId);
    return true;
  } catch (err) {
    console.warn("[Biometric] Authentication failed:", err);
    return false;
  }
}

/** Returns whether biometrics are available on the current device. */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!("credentials" in navigator) || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Returns stored biometric credentials for a user. */
export function getBiometricCredentials(userId: string): BiometricCredential[] {
  const stored: BiometricCredential[] = JSON.parse(localStorage.getItem(CRED_STORE_KEY) || "[]");
  return stored.filter((c) => c.userId === userId);
}

// ── Contextual Push Notifications ────────────────────────────────────────────

export type Season = "spring" | "summer" | "monsoon" | "autumn" | "winter";
export type LocationContext = "home" | "work" | "traveling" | "unknown";

export interface ContextualPushTrigger {
  season: Season;
  locationContext: LocationContext;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayType: "weekday" | "weekend";
  upcomingHoliday: string | null;   // e.g. "Diwali", "Christmas"
  daysUntilHoliday: number;
}

export interface ContextualNotification {
  title: string;
  body: string;
  url: string;
  tag: string;
  scheduleDelay: number;  // milliseconds
}

/** Detects the current season based on date and hemisphere. */
export function detectSeason(hemisphere: "north" | "south" = "north"): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if (hemisphere === "north") {
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 7) return "monsoon";   // India context
    if (month >= 8 && month <= 9) return "summer";
    if (month >= 10 && month <= 11) return "autumn";
    return "winter";
  }
  // Southern hemisphere (inverted)
  if (month >= 9 && month <= 11) return "spring";
  if (month >= 12 || month <= 2) return "summer";
  if (month >= 3 && month <= 5) return "autumn";
  return "winter";
}

/** Detects time of day. */
export function detectTimeOfDay(): ContextualPushTrigger["timeOfDay"] {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const SEASONAL_COLLECTIONS: Record<Season, string> = {
  spring: "Floral & Fresh",
  summer: "Citrus & Marine",
  monsoon: "Earthy & Warm",
  autumn: "Spice & Wood",
  winter: "Amber & Oud",
};

/**
 * Generates a contextually personalized push notification
 * based on season, time of day, location, and upcoming holidays.
 */
export function generateContextualPush(ctx: ContextualPushTrigger): ContextualNotification {
  // Holiday-urgency override
  if (ctx.upcomingHoliday && ctx.daysUntilHoliday <= 7) {
    return {
      title: `${ctx.upcomingHoliday} gifting made easy 🎁`,
      body: `Only ${ctx.daysUntilHoliday} days left — order now for guaranteed delivery.`,
      url: "/collections?occasion=gift",
      tag: "holiday-urgency",
      scheduleDelay: 0,
    };
  }

  // Seasonal collection prompts
  const collection = SEASONAL_COLLECTIONS[ctx.season];
  if (ctx.timeOfDay === "evening" && ctx.dayType === "weekend") {
    return {
      title: `Perfect ${ctx.season} evening starts with the right scent`,
      body: `Our ${collection} collection is hand-picked for moments like this.`,
      url: `/collections?season=${ctx.season}`,
      tag: "seasonal-evening",
      scheduleDelay: 0,
    };
  }

  // Morning calm messages
  if (ctx.timeOfDay === "morning") {
    return {
      title: "Start your day with intention 🕯️",
      body: `New arrivals in our ${collection} collection. Perfect for your morning ritual.`,
      url: "/collections",
      tag: "morning-calm",
      scheduleDelay: 30 * 60 * 1000,  // 30min delay for morning delivery
    };
  }

  // Traveling context — suggest gifting
  if (ctx.locationContext === "traveling") {
    return {
      title: "The perfect souvenir from Lumière",
      body: "Discover our travel-sized candle sets — perfect to bring home.",
      url: "/collections?size=travel",
      tag: "travel-gifting",
      scheduleDelay: 0,
    };
  }

  // Default seasonal
  return {
    title: `${collection} — now available`,
    body: "Shop the seasonal edit, curated for this time of year.",
    url: `/collections?season=${ctx.season}`,
    tag: "seasonal-default",
    scheduleDelay: 0,
  };
}

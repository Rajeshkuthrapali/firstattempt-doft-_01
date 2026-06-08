import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAccessToken } from "../lib/api/client";
import { trackEvent } from "../lib/analytics";

/** A saved address in the address book. */
export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/** Order summary stored in history. */
export interface OrderSummary {
  id: string;
  date: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: Array<{ name: string; qty: number; price: number }>;
}

/** Authenticated user profile. */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: "email" | "google" | "facebook";
}

interface AuthState {
  user: UserProfile | null;
  addresses: Address[];
  orders: OrderSummary[];
  isLoading: boolean;
  error: string | null;

  /** Sign in with email + password (calls VITE_API_BASE_URL/auth/login). */
  login: (email: string, password: string) => Promise<void>;

  /** Register new account via email. */
  register: (name: string, email: string, password: string) => Promise<void>;

  /** Initiate Google OAuth flow (redirects to provider). */
  loginWithGoogle: () => void;

  /** Clear session. */
  logout: () => void;

  /** Add or update an address. */
  saveAddress: (address: Omit<Address, "id">) => void;

  /** Remove an address by id. */
  removeAddress: (id: string) => void;

  /** Set default address. */
  setDefaultAddress: (id: string) => void;

  /** Append an order to history (called after payment success). */
  addOrder: (order: OrderSummary) => void;

  clearError: () => void;
}

/**
 * Zustand auth + account store.
 * Persists session (user, addresses, orders) to localStorage.
 * Uses the centralized API client for network calls.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      orders: [],
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<{
            success: boolean;
            user: UserProfile;
            tokens: { accessToken: string; refreshToken: string; expiresIn: number };
          }>("/api/auth/login", { email, password });
          setAccessToken(res.tokens.accessToken);
          localStorage.setItem("refreshToken", res.tokens.refreshToken);
          set({ user: res.user, isLoading: false });
          trackEvent("login", { method: "email" });
        } catch (err) {
          set({
            error: (err as Error).message ?? "Login failed",
            isLoading: false,
          });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<{
            success: boolean;
            user: UserProfile;
            tokens: { accessToken: string; refreshToken: string; expiresIn: number };
          }>("/api/auth/register", { name, email, password });
          setAccessToken(res.tokens.accessToken);
          localStorage.setItem("refreshToken", res.tokens.refreshToken);
          set({ user: res.user, isLoading: false });
          trackEvent("sign_up", { method: "email" });
        } catch (err) {
          set({
            error: (err as Error).message ?? "Registration failed",
            isLoading: false,
          });
        }
      },

      loginWithGoogle: () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
          | string
          | undefined;
        if (!clientId) {
          console.warn(
            "[Auth] VITE_GOOGLE_CLIENT_ID not set — Google OAuth unavailable",
          );
          return;
        }
        const redirect = encodeURIComponent(
          `${window.location.origin}/auth/callback`,
        );
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=openid+email+profile`;
      },

      logout: () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          api.post("/api/auth/logout", { refreshToken }).catch(() => {});
        }
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
        set({ user: null, orders: [], addresses: [] });
        trackEvent("logout", {});
      },

      saveAddress: (addr) => {
        const id = crypto.randomUUID();
        const addresses = get().addresses;
        // If first address or isDefault requested, clear others
        const updated = addr.isDefault
          ? addresses.map((a) => ({ ...a, isDefault: false }))
          : addresses;
        set({ addresses: [...updated, { ...addr, id }] });
      },

      removeAddress: (id) =>
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),

      setDefaultAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),

      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),

      clearError: () => set({ error: null }),
    }),
    { name: "lumiere-auth" },
  ),
);

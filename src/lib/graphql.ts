/**
 * GraphQL API Wrapper Layer (P4 Scaffold)
 *
 * Provides a typed query interface over our Prisma data,
 * designed to be consumed by the frontend via a thin fetch layer.
 * In production, this module would be replaced by an Apollo Server
 * or Yoga GraphQL endpoint.
 */

/** Schema type for a GraphQL product node. */
export interface GqlProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  notes: string[];
}

/** Schema type for a GraphQL order node. */
export interface GqlOrder {
  id: string;
  email: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

/**
 * Simulates a GraphQL-style query resolver.
 * In production, this would be an actual `gql` tagged template
 * sent to an Apollo/Yoga endpoint.
 */
export async function gqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data: T | null; errors?: string[] }> {
  try {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      return { data: null, errors: [`HTTP ${res.status}`] };
    }
    return await res.json();
  } catch (err) {
    console.error("[GraphQL] Query failed:", err);
    return { data: null, errors: ["Network error"] };
  }
}

/**
 * Predefined query strings for common storefront operations.
 * These mirror the GROQ queries in sanity.ts but target
 * the GraphQL gateway instead.
 */
export const QUERIES = {
  GET_PRODUCTS: `
    query GetProducts($category: String, $limit: Int) {
      products(category: $category, limit: $limit) {
        id
        title
        slug
        price
        category
        image
        inStock
        notes
      }
    }
  `,
  GET_ORDERS: `
    query GetOrders($status: String, $limit: Int) {
      orders(status: $status, limit: $limit) {
        id
        email
        status
        total
        createdAt
        itemCount
      }
    }
  `,
  GET_RECOMMENDATIONS: `
    query GetRecommendations($scentProfile: String!) {
      recommendations(scentProfile: $scentProfile) {
        id
        title
        slug
        price
        image
        notes
      }
    }
  `,
} as const;

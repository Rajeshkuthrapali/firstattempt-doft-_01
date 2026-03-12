import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY ?? "",
});

export interface SearchableProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  scentFamily: string;
  price: number;
  image: string;
  collections: string[];
}

export async function searchProducts(
  query: string,
  options?: { filter?: string; sort?: string[]; limit?: number },
) {
  const index = client.index("products");
  return index.search<SearchableProduct>(query, {
    filter: options?.filter,
    sort: options?.sort,
    limit: options?.limit ?? 20,
    attributesToHighlight: ["title", "description"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
  });
}

export { client as meiliClient };

import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { posts as staticPosts } from "../data/posts";

/**
 * Sanity CMS Client Scaffold.
 * Connects to a Sanity backend if environment variables are provided,
 * otherwise falls back to static fixture data for demo/development purposes.
 */

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-03-26",
      useCdn: true, // Use CDN edge cache
    })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlFor(source: any) {
  return builder ? builder.image(source) : source;
}

// GROQ Queries
export const queries = {
  allPosts: `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "category": category->title,
    excerpt,
    "coverImage": mainImage.asset->url,
    "author": author->name,
    "readingTime": readingTime,
    publishedAt
  }`,
  postBySlug: `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "category": category->title,
    "slug": slug.current,
    excerpt,
    body,
    "coverImage": mainImage.asset->url,
    "author": author->name,
    "readingTime": readingTime,
    publishedAt
  }`,
  campaignBySlug: `*[_type == "campaign" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    blocks[] {
      _type,
      _key,
      title,
      subtitle,
      ctaText,
      ctaLink,
      "backgroundImage": backgroundImage.asset->url,
      heading,
      description,
      items[] {
        _key,
        title,
        description,
        "image": image.asset->url,
        link
      }
    }
  }`,
  allCollections: `*[_type == "collection"] | order(sortOrder asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "coverImage": coverImage.asset->url
  }`,
};

/**
 * Fetch all posts, falling back to static data if no client exists.
 */
export async function fetchPosts() {
  if (sanityClient) {
    try {
      return await sanityClient.fetch(queries.allPosts);
    } catch (err) {
      console.warn("Sanity fetch failed, falling back to static posts.", err);
    }
  }
  return staticPosts;
}

/**
 * Fetch single post, falling back to static data if no client exists.
 */
export async function fetchPost(slug: string) {
  if (sanityClient) {
    try {
      const post = await sanityClient.fetch(queries.postBySlug, { slug });
      if (post) return post;
    } catch (err) {
      console.warn("Sanity fetch failed, falling back to static posts.", err);
    }
  }
  return staticPosts.find((p) => p.slug === slug) || null;
}

/** Fallback data for campaign pages when Sanity is not configured. */
const FALLBACK_CAMPAIGN = {
  title: "Private Reserve",
  slug: "private-reserve",
  blocks: [
    {
      _type: "heroBlock",
      _key: "h1",
      title: "Welcome to the Inner Circle",
      subtitle: "Exclusive access to our private reserve collection.",
      ctaText: "Shop the Reserve",
      ctaLink: "/collections",
      backgroundImage: "/cedarwood-bliss.png",
    },
    {
      _type: "gridBlock",
      _key: "g1",
      heading: "Featured Stories",
      items: [
        { _key: "gi1", title: "The Autumn Edit", description: "Warmth and spices", image: "/golden-hour.png", link: "/collections" },
        { _key: "gi2", title: "Gilded Evenings", description: "Rich oud notes", image: "/midnight-oud.png", link: "/collections" },
      ],
    },
    {
      _type: "signUpBlock",
      _key: "s1",
      title: "Join the Club",
      description: "Receive early access to seasonal launches.",
    },
  ],
};

/**
 * Fetch campaign landing page by slug.
 * Falls back to static mock data if Sanity is not configured.
 */
export async function fetchCampaign(slug: string) {
  if (sanityClient) {
    try {
      const campaign = await sanityClient.fetch(queries.campaignBySlug, { slug });
      if (campaign) return campaign;
    } catch (err) {
      console.warn("Sanity campaign fetch failed, using fallback.", err);
    }
  }
  return slug === FALLBACK_CAMPAIGN.slug ? FALLBACK_CAMPAIGN : null;
}

/**
 * Fetch CMS-managed collections for dynamic catalog pages.
 * Falls back to null (use static data) if Sanity is not configured.
 */
export async function fetchCollections() {
  if (sanityClient) {
    try {
      return await sanityClient.fetch(queries.allCollections);
    } catch (err) {
      console.warn("Sanity collections fetch failed.", err);
    }
  }
  return null;
}

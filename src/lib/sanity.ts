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

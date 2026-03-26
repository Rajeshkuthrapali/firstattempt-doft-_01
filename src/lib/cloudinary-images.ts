import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";
import { auto as autoFormat } from "@cloudinary/url-gen/qualifiers/format";
import { auto as autoQuality } from "@cloudinary/url-gen/qualifiers/quality";

/**
 * Cloudinary client configured from VITE_CLOUDINARY_CLOUD_NAME env var.
 * Falls back to the public "demo" cloud for local development without credentials.
 */
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "demo",
  },
});

/**
 * Returns an auto-formatted, auto-quality Cloudinary delivery URL for a public ID.
 * @param publicId - The Cloudinary public ID of the image.
 */
export function cloudinaryUrl(publicId: string): string {
  return cld
    .image(publicId)
    .delivery(format(autoFormat()))
    .delivery(quality(autoQuality()))
    .toURL();
}

/**
 * Returns a fill-cropped, resized, auto-optimised Cloudinary URL for product images.
 * @param publicId - The Cloudinary public ID.
 * @param w - Target width in pixels (default 600).
 * @param h - Target height in pixels (default 600).
 */
export function cloudinaryProductImage(
  publicId: string,
  w = 600,
  h = 600,
): string {
  return cld
    .image(publicId)
    .resize(fill().width(w).height(h).gravity(autoGravity()))
    .delivery(format(autoFormat()))
    .delivery(quality(autoQuality()))
    .toURL();
}

/**
 * Legacy-compatible helper.
 * - If `path` is already an absolute URL (starts with http/https), it is returned unchanged.
 * - Otherwise, `path` is treated as a Cloudinary public ID and a delivery URL is returned.
 */
export const cloudinaryImages = {
  url: (path: string): string =>
    path.startsWith("http") ? path : cloudinaryUrl(path),
};

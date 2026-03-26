import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchCampaign } from "../lib/sanity";
import HeroBlock from "../components/cms/HeroBlock";
import GridBlock from "../components/cms/GridBlock";
import SignUpBlock from "../components/cms/SignUpBlock";

interface CampaignBlock {
  _type: string;
  _key: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  heading?: string;
  description?: string;
  items?: { _key: string; title: string; description: string; image: string; link: string }[];
}

interface CampaignData {
  title: string;
  slug: string;
  blocks: CampaignBlock[];
}

/**
 * Dynamic Campaign Landing Page.
 * Fetches CMS block layout from Sanity by slug parameter,
 * falling back to static fixture data if Sanity is not configured.
 */
export default function Campaign() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign(slug || "private-reserve").then((data) => {
      setCampaign(data as CampaignData | null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-sm uppercase tracking-widest text-[#9a8d82]">Loading Campaign…</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-sm text-[#9a8d82]">Campaign not found.</p>
      </div>
    );
  }

  return (
    <main>
      {campaign.blocks.map((block) => {
        switch (block._type) {
          case "heroBlock":
            return (
              <HeroBlock
                key={block._key}
                title={block.title || ""}
                subtitle={block.subtitle || ""}
                ctaText={block.ctaText || "Explore"}
                ctaLink={block.ctaLink || "/collections"}
                backgroundImageUrl={block.backgroundImage || "/cedarwood-bliss.png"}
              />
            );
          case "gridBlock":
            return (
              <GridBlock
                key={block._key}
                heading={block.heading}
                items={(block.items || []).map((item) => ({
                  id: item._key,
                  title: item.title,
                  description: item.description,
                  image: item.image,
                  link: item.link,
                }))}
              />
            );
          case "signUpBlock":
            return (
              <SignUpBlock
                key={block._key}
                title={block.title || "Stay Connected"}
                description={block.description || "Subscribe for updates."}
              />
            );
          default:
            return null;
        }
      })}
    </main>
  );
}

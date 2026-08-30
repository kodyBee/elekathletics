import { openingHoursSpecification } from "@/lib/availability";
import { siteConfig, siteUrl } from "@/lib/site";

/**
 * LocalBusiness structured data, emitted site-wide.
 *
 * Everything here is derived from `lib/site` and `lib/availability`, so the
 * hours Google sees are the hours the booking calendar will actually accept.
 * Fields Jon hasn't confirmed yet (street address, postal code, Google
 * Business Profile) are omitted rather than guessed — filling them in
 * `lib/site.ts` is enough to publish them.
 */
export function StructuredData() {
  const { address, googleBusinessProfile, phone, email } = siteConfig.contact;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#business`,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    url: siteUrl,
    telephone: phone,
    email,
    priceRange: siteConfig.priceRange,
    image: `${siteUrl}/logo.png`,
    logo: `${siteUrl}/logo.png`,
    address: {
      "@type": "PostalAddress",
      ...(address.streetAddress
        ? { streetAddress: address.streetAddress }
        : {}),
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.addressCountry,
    },
    areaServed: [
      { "@type": "City", name: "Burbank" },
      { "@type": "City", name: "Los Angeles" },
      { "@type": "City", name: "Glendale" },
      { "@type": "City", name: "North Hollywood" },
    ],
    openingHoursSpecification,
    founder: {
      "@type": "Person",
      name: "Jonny Elek",
      jobTitle: "Personal Trainer & Strength Coach",
    },
    sameAs: [siteConfig.social.instagram, googleBusinessProfile].filter(Boolean),
    makesOffer: [
      {
        "@type": "Offer",
        name: "Free 15-minute consultation",
        price: 0,
        priceCurrency: "USD",
        url: `${siteUrl}/coaching/custom`,
      },
      {
        "@type": "Offer",
        name: "Everything Included Plan",
        price: 350,
        priceCurrency: "USD",
        url: `${siteUrl}/coaching/book`,
        eligibleDuration: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: "MON",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a value can never close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
      }}
    />
  );
}

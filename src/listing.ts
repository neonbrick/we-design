import { readFile } from "node:fs/promises";

export interface ListingContact {
  phone: string;
  email: string | null;
  bookingUrl: string | null;
}

export interface ListingAddress {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  serviceArea: string[];
}

export interface ListingHours {
  day: string;
  open: string | null;
  close: string | null;
}

export interface ListingReviews {
  rating: number;
  count: number;
  snippets: string[];
}

export interface ListingOwner {
  firstName: string;
  lastName: string;
  yearsExperience: number;
}

export interface Listing {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  owner: ListingOwner;
  contact: ListingContact;
  address: ListingAddress;
  hours: ListingHours[];
  services: string[];
  highlights: string[];
  reviews: ListingReviews;
  ingested: {
    source: string;
    sourceUrl: string | null;
    ingestedAt: string;
    hasWebsite: boolean;
    notes?: string;
  };
}

export interface GeneratedCopy {
  headline: string;
  subheadline: string;
  aboutParagraph: string;
  servicesIntro: string;
  ctaHeadline: string;
  ctaBody: string;
  trustLine: string;
}

export interface GeneratedListing {
  listing: Listing;
  copy: GeneratedCopy;
  generatedAt: string;
  model: string;
}

export async function loadListing(path: string): Promise<Listing> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as Listing;
  return parsed;
}

export async function loadGenerated(path: string): Promise<GeneratedListing> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as GeneratedListing;
  return parsed;
}

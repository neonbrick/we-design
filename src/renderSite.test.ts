import { describe, expect, it } from "vitest";
import type { GeneratedListing } from "./listing.js";
import { escapeHtml, formatHours, OFFER_PRICE_USD, renderSite } from "./renderSite.js";

const fixture: GeneratedListing = {
  generatedAt: "2026-04-24T00:00:00.000Z",
  model: "test-fixture",
  listing: {
    slug: "test-biz",
    name: "Test <Biz> & Co.",
    category: "Mobile mechanic",
    tagline: "Test tagline",
    owner: { firstName: "Pat", lastName: "Test", yearsExperience: 10 },
    contact: { phone: "(555) 010-0000", email: null, bookingUrl: null },
    address: {
      line1: "123 Test Way",
      city: "Testville",
      region: "CA",
      postalCode: "90000",
      country: "US",
      serviceArea: ["Testville", "Mocktown"],
    },
    hours: [
      { day: "Mon", open: "07:00", close: "18:00" },
      { day: "Sun", open: null, close: null },
    ],
    services: ["Brakes", "Tires"],
    highlights: ["Same-day work", "Flat quotes"],
    reviews: {
      rating: 4.8,
      count: 47,
      snippets: ["Great service", 'He said "done" and meant it'],
    },
    ingested: {
      source: "test",
      sourceUrl: null,
      ingestedAt: "2026-04-24",
      hasWebsite: false,
    },
  },
  copy: {
    headline: "Fast, honest mobile repair",
    subheadline: "We come to you in Testville",
    aboutParagraph: "Pat has been turning wrenches for a decade.",
    servicesIntro: "Here's what we handle.",
    ctaHeadline: "Book your flat-rate visit",
    ctaBody: "One price. No surprises.",
    trustLine: "Paid only after the job is done.",
  },
};

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  });

  it("escapes single quotes to &#39;", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });
});

describe("formatHours", () => {
  it("formats open and closed days", () => {
    const html = formatHours(fixture.listing.hours);
    expect(html).toContain('<th scope="row">Mon</th><td>07:00–18:00</td>');
    expect(html).toContain('<th scope="row">Sun</th><td>Closed</td>');
  });
});

describe("renderSite", () => {
  const html = renderSite(fixture);

  it("includes the business name, AI-generated headline, and category", () => {
    expect(html).toContain("Test &lt;Biz&gt; &amp; Co.");
    expect(html).toContain("Fast, honest mobile repair");
    expect(html).toContain("Mobile mechanic");
  });

  it("escapes unsafe review snippets", () => {
    expect(html).toContain("He said &quot;done&quot; and meant it");
    expect(html).not.toMatch(/<script>.*done.*<\/script>/);
  });

  it(`renders the $${OFFER_PRICE_USD} mock checkout CTA and confirmation modal`, () => {
    expect(html).toContain(`Book the $${OFFER_PRICE_USD} service`);
    expect(html).toContain('id="checkout-form"');
    expect(html).toContain('id="confirm-modal"');
    expect(html).toContain("hidden>");
  });

  it("uses hours table with every listed day", () => {
    expect(html).toContain('<table class="hours">');
    expect(html).toContain("Mon");
    expect(html).toContain("Sun");
  });

  it("renders a tel: link for the phone", () => {
    expect(html).toContain('href="tel:5550100000"');
  });

  it("is a complete HTML document", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("</html>");
  });
});

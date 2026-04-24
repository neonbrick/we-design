import type { GeneratedListing, Listing, ListingHours } from "./listing.js";

export const OFFER_PRICE_USD = 499;

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

export function formatHours(hours: ListingHours[]): string {
  return hours
    .map((h) => {
      const closed = h.open === null || h.close === null;
      const when = closed ? "Closed" : `${h.open}–${h.close}`;
      return `<tr><th scope="row">${escapeHtml(h.day)}</th><td>${escapeHtml(when)}</td></tr>`;
    })
    .join("");
}

function stars(rating: number): string {
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full === 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function addressLines(listing: Listing): string {
  const { address } = listing;
  const region = `${address.city}, ${address.region} ${address.postalCode}`;
  return `${escapeHtml(address.line1)}<br>${escapeHtml(region)}`;
}

export function renderSite(generated: GeneratedListing): string {
  const { listing, copy } = generated;
  const title = `${listing.name} — ${listing.category}`;
  const description = copy.subheadline;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<style>
  :root {
    --bg: #0f172a;
    --bg-soft: #111827;
    --card: #1e293b;
    --ink: #f8fafc;
    --muted: #cbd5e1;
    --accent: #f97316;
    --accent-ink: #0f172a;
    --border: rgba(148, 163, 184, 0.2);
    --max: 980px;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
    background: var(--bg);
    color: var(--ink);
    line-height: 1.55;
  }
  header.hero {
    padding: 72px 24px 56px;
    background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.2), transparent 60%), var(--bg);
    text-align: center;
  }
  .hero .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.8rem;
    color: var(--accent);
    margin: 0 0 12px;
    font-weight: 600;
  }
  .hero h1 {
    font-size: clamp(2rem, 5vw, 3.25rem);
    margin: 0 auto 16px;
    max-width: 22ch;
    line-height: 1.1;
  }
  .hero p.subhead {
    color: var(--muted);
    max-width: 48ch;
    margin: 0 auto 28px;
    font-size: 1.125rem;
  }
  .hero .call-row {
    display: inline-flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 22px;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 1rem;
    font-family: inherit;
  }
  .btn-primary {
    background: var(--accent);
    color: var(--accent-ink);
  }
  .btn-primary:hover { filter: brightness(1.05); }
  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--border);
  }
  main {
    max-width: var(--max);
    margin: 0 auto;
    padding: 40px 24px 96px;
    display: grid;
    gap: 32px;
  }
  section.card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
  }
  section h2 {
    margin: 0 0 12px;
    font-size: 1.35rem;
  }
  section p { color: var(--muted); margin: 0 0 12px; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
  ul.bare { list-style: none; padding: 0; margin: 0; }
  ul.bare li {
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    color: var(--muted);
  }
  ul.bare li:last-child { border-bottom: 0; }
  table.hours {
    width: 100%;
    border-collapse: collapse;
  }
  table.hours th, table.hours td {
    padding: 8px 0;
    text-align: left;
    border-bottom: 1px solid var(--border);
    font-weight: 500;
    color: var(--muted);
  }
  table.hours th { color: var(--ink); width: 70px; }
  table.hours tr:last-child th, table.hours tr:last-child td { border-bottom: 0; }
  .reviews blockquote {
    margin: 0 0 14px;
    padding-left: 14px;
    border-left: 3px solid var(--accent);
    color: var(--muted);
    font-style: italic;
  }
  .rating-line { color: var(--ink); font-weight: 600; margin-bottom: 14px; }
  .rating-line .stars { color: var(--accent); letter-spacing: 2px; margin-right: 8px; }
  .cta {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.02));
    border-color: rgba(249, 115, 22, 0.4);
    text-align: center;
  }
  .cta .price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--ink);
    margin: 4px 0 6px;
  }
  .cta .price sup { font-size: 1rem; color: var(--muted); vertical-align: top; }
  .cta .price-note { color: var(--muted); margin-bottom: 18px; }
  footer {
    max-width: var(--max);
    margin: 0 auto;
    padding: 24px;
    color: var(--muted);
    font-size: 0.85rem;
    text-align: center;
  }
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(2, 6, 23, 0.7);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; z-index: 50;
  }
  .modal-backdrop[hidden] { display: none; }
  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    max-width: 440px;
    text-align: center;
  }
  .modal h3 { margin: 0 0 12px; font-size: 1.25rem; }
  .modal p { color: var(--muted); margin: 0 0 18px; }
  @media (max-width: 520px) {
    header.hero { padding: 48px 20px 40px; }
    main { padding: 24px 16px 64px; gap: 20px; }
    section.card { padding: 22px; }
  }
</style>
</head>
<body>
<header class="hero">
  <p class="eyebrow">${escapeHtml(listing.category)} · ${escapeHtml(listing.address.city)}, ${escapeHtml(listing.address.region)}</p>
  <h1>${escapeHtml(copy.headline)}</h1>
  <p class="subhead">${escapeHtml(copy.subheadline)}</p>
  <div class="call-row">
    <a class="btn btn-primary" href="tel:${escapeHtml(listing.contact.phone.replace(/[^+\d]/g, ""))}">Call ${escapeHtml(listing.contact.phone)}</a>
    <a class="btn btn-ghost" href="#book">Book a visit</a>
  </div>
</header>

<main>
  <section class="card">
    <h2>About ${escapeHtml(listing.name)}</h2>
    <p>${escapeHtml(copy.aboutParagraph)}</p>
    <p class="rating-line"><span class="stars" aria-hidden="true">${stars(listing.reviews.rating)}</span>${listing.reviews.rating.toFixed(1)} from ${listing.reviews.count} Google reviews</p>
  </section>

  <section class="card">
    <h2>What we do</h2>
    <p>${escapeHtml(copy.servicesIntro)}</p>
    <div class="grid-2">
      <ul class="bare">
        ${listing.services.map((s) => `<li>${escapeHtml(s)}</li>`).join("\n        ")}
      </ul>
      <ul class="bare">
        ${listing.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("\n        ")}
      </ul>
    </div>
  </section>

  <section class="card">
    <div class="grid-2">
      <div>
        <h2>Hours</h2>
        <table class="hours">
          <tbody>
            ${formatHours(listing.hours)}
          </tbody>
        </table>
      </div>
      <div>
        <h2>Service area &amp; contact</h2>
        <p>${addressLines(listing)}</p>
        <p>Serving: ${listing.address.serviceArea.map((a) => escapeHtml(a)).join(", ")}</p>
        <p><a class="btn btn-ghost" href="tel:${escapeHtml(listing.contact.phone.replace(/[^+\d]/g, ""))}">${escapeHtml(listing.contact.phone)}</a></p>
      </div>
    </div>
  </section>

  <section class="card reviews">
    <h2>What customers say</h2>
    ${listing.reviews.snippets.map((q) => `<blockquote>“${escapeHtml(q)}”</blockquote>`).join("\n    ")}
  </section>

  <section class="card cta" id="book">
    <h2>${escapeHtml(copy.ctaHeadline)}</h2>
    <p class="price"><sup>$</sup>${OFFER_PRICE_USD}<span style="font-size:1rem;color:var(--muted)"> flat rate</span></p>
    <p class="price-note">${escapeHtml(copy.ctaBody)}</p>
    <form id="checkout-form" novalidate>
      <button class="btn btn-primary" type="submit">Book the $${OFFER_PRICE_USD} service</button>
    </form>
    <p style="margin-top:14px;font-size:0.85rem;">${escapeHtml(copy.trustLine)}</p>
  </section>
</main>

<footer>
  <p>${escapeHtml(listing.name)} · Generated one-page site · <a href="#top" style="color:var(--accent);text-decoration:none">Back to top</a></p>
</footer>

<div id="confirm-modal" class="modal-backdrop" hidden>
  <div class="modal" role="dialog" aria-labelledby="confirm-title" aria-modal="true">
    <h3 id="confirm-title">Got it — we'll be in touch</h3>
    <p>Thanks. We'll call ${escapeHtml(listing.contact.phone)} within one business day to confirm your $${OFFER_PRICE_USD} booking with ${escapeHtml(listing.name)}.</p>
    <button id="confirm-close" class="btn btn-primary" type="button">Close</button>
  </div>
</div>

<script>
  (function () {
    var form = document.getElementById("checkout-form");
    var modal = document.getElementById("confirm-modal");
    var close = document.getElementById("confirm-close");
    if (!form || !modal || !close) return;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      modal.hidden = false;
    });
    close.addEventListener("click", function () { modal.hidden = true; });
    modal.addEventListener("click", function (ev) {
      if (ev.target === modal) modal.hidden = true;
    });
  })();
</script>
</body>
</html>
`;
}

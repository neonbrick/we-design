import { greet } from "./greet.js";

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  const heading = document.createElement("h1");
  heading.textContent = greet("We design");
  const tagline = document.createElement("p");
  tagline.textContent =
    "Foundation is up. Product scope lands in WED-2; first vertical slice ships in WED-4.";
  root.append(heading, tagline);
}

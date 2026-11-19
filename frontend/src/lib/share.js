import { toBlob } from "html-to-image";
import { formatEur } from "@/lib/currency";

export const renderBlob = async (node, opts) => {
  try {
    return await toBlob(node, opts);
  } catch {
    return toBlob(node, { ...opts, skipFonts: true });
  }
};

export const fileName = (city) => `what-rent-buys-${city}.png`.toLowerCase().replace(/\s+/g, "-");

export const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const copyImage = async (blob) => {
  if (!navigator.clipboard || !window.ClipboardItem) return false;
  try {
    await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
};

const BIG = [
  "Paying {rent}/mo in {origin} to hear my neighbor breathe, when I could have a {tier} in {target} + {topPerk}. I'm being scammed.",
  "My {origin} landlord is funding his third yacht while my {rent}/mo buys a {tier} in {target} + {topPerk}.",
  "Breaking news: My {rent}/mo shoebox in {origin} is literally a {tier} in {target} with {topPerk} left over. Booking a one-way flight.",
];
const MODEST = [
  "My {rent}/mo in {origin} gets me a {tier} in {target} + {topPerk}. Not rich, just living in the wrong postcode.",
  "Trading my {origin} rent ({rent}/mo) for a {tier} in {target} + {topPerk}. At least there I'd have a view.",
];
const REALITY = [
  "Humbled in 0.8 seconds: my {rent}/mo in {origin} is {gap}/mo short of even a {size}-bed in {target}. Guess I'm staying put.",
  "Checked what my {origin} rent buys in {target}. Turns out it buys a bus pass and a park bench. Need +{gap}/mo.",
  "Me: 'Maybe I'll move to {target}!' My bank account: 'You're {gap}/mo short, sit down.'",
];
const SALARY = "My {origin} rent alone is {salaryMultiplier}x the average monthly salary in {target}. I am not okay.";

const topPerkOf = (card, code) => {
  if (card.perks && card.perks[0]) return card.perks[0].text;
  if (card.savings >= 1) return `${formatEur(card.savings, code)} saved every month`;
  return "change to spare";
};

export const captionTemplates = (card) => {
  const base = card.reality ? REALITY : card.size === "3" ? BIG : MODEST;
  return card.salaryRatio > 1.5 ? [...base, SALARY] : base;
};

export const buildCaption = (template, { card, origin, code, rentLocal }) => {
  const vars = {
    rent: rentLocal,
    origin: origin.city,
    target: card.city.city,
    tier: card.reality ? "" : card.apartment.replace(/^(\d)-Bed · (City Centre|Outside Centre)$/, (_, n, loc) => `${n}-bed ${loc === "City Centre" ? "in the city centre" : "outside the centre"}`),
    topPerk: card.reality ? "" : topPerkOf(card, code),
    gap: card.reality ? formatEur(card.gap, code) : "",
    size: card.size,
    salaryMultiplier: card.salaryRatio.toFixed(1),
  };
  const text = template.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
  return `${text} See what your rent buys elsewhere: ${window.location.href}`;
};

const HEADER_ROASTS = {
  big: ["Your {origin} landlord is funding a yacht.", "Same rent. Actual sunlight and a living room.", "Trading a {origin} shoebox for a {target} upgrade."],
  modest: ["Not rich—just living in the wrong postcode.", "Same money, noticeably better view.", "Your {origin} rent goes further than you think."],
  reality: ["Pack a roommate—or a very nice tent.", "Your rent covers the commute, not the keys.", "Humbled in 0.8 seconds. Maybe stick to visiting."],
};

const seed = (str) => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 11);

export const headerRoast = (card, originName) => {
  const family = card.reality ? "reality" : card.size === "3" ? "big" : "modest";
  const list = HEADER_ROASTS[family];
  return list[seed(card.city.id) % list.length].replace("{origin}", originName).replace("{target}", card.city.city);
};

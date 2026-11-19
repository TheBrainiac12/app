const EURO = ["Austria", "Belgium", "Croatia", "Estonia", "Finland", "France", "Germany", "Greece", "Ireland", "Italy", "Latvia", "Lithuania", "Montenegro", "Netherlands", "Portugal", "Slovakia", "Slovenia", "Spain"];

const COUNTRY_CURRENCY = {
  Albania: "ALL", Argentina: "ARS", Armenia: "AMD", Australia: "AUD", Azerbaijan: "AZN", Belarus: "BYN",
  "Bosnia And Herzegovina": "BAM", Brazil: "BRL", Bulgaria: "BGN", Canada: "CAD", Chile: "CLP", China: "CNY",
  Colombia: "COP", "Costa Rica": "CRC", "Czech Republic": "CZK", Denmark: "DKK", "Dominican Republic": "DOP",
  Ecuador: "USD", Egypt: "EGP", Georgia: "GEL", "Hong Kong": "HKD", Hungary: "HUF", Iceland: "ISK", India: "INR",
  Indonesia: "IDR", Israel: "ILS", Japan: "JPY", Jordan: "JOD", Kazakhstan: "KZT", Kenya: "KES", Lebanon: "LBP",
  Macedonia: "MKD", Malaysia: "MYR", Mexico: "MXN", Moldova: "MDL", Morocco: "MAD", Nepal: "NPR",
  "New Zealand": "NZD", Norway: "NOK", Panama: "USD", Peru: "PEN", Philippines: "PHP", Poland: "PLN", Qatar: "QAR",
  Romania: "RON", Russia: "RUB", Serbia: "RSD", Singapore: "SGD", "South Africa": "ZAR", "South Korea": "KRW",
  "Sri Lanka": "LKR", Sweden: "SEK", Switzerland: "CHF", Taiwan: "TWD", Thailand: "THB", Tunisia: "TND",
  Turkey: "TRY", Ukraine: "UAH", "United Arab Emirates": "AED", "United Kingdom": "GBP", "United States": "USD",
  Uruguay: "UYU", Uzbekistan: "UZS", Vietnam: "VND",
};

// Units of currency per 1 EUR (fixed mid-2026 reference rates)
const RATES = {
  EUR: 1, USD: 1.16, GBP: 0.86, INR: 99.5, ALL: 98, ARS: 1400, AMD: 450, AUD: 1.78, AZN: 1.97, BYN: 3.8,
  BAM: 1.956, BRL: 6.4, BGN: 1.956, CAD: 1.6, CLP: 1100, CNY: 8.3, COP: 4700, CRC: 590, CZK: 24.5, DKK: 7.46,
  DOP: 72, EGP: 57, GEL: 3.15, HKD: 9.05, HUF: 395, ISK: 143, IDR: 19000, ILS: 4.1, JPY: 170, JOD: 0.82,
  KZT: 600, KES: 150, LBP: 104000, MKD: 61.5, MYR: 5.0, MXN: 21.5, MDL: 19.8, MAD: 10.7, NPR: 158, NZD: 1.95,
  NOK: 11.7, PEN: 4.2, PHP: 66, PLN: 4.25, QAR: 4.22, RON: 5.05, RUB: 92, RSD: 117, SGD: 1.5, ZAR: 20.8,
  KRW: 1600, LKR: 350, SEK: 11.0, CHF: 0.93, TWD: 35, THB: 38, TND: 3.4, TRY: 47, UAH: 48, AED: 4.26,
  UYU: 47, UZS: 14500, VND: 30000,
};

export const currencyOf = (country) => {
  if (EURO.includes(country)) return "EUR";
  const code = COUNTRY_CURRENCY[country];
  return code && RATES[code] ? code : "USD";
};

export const toEur = (amount, code) => amount / RATES[code];
export const fromEur = (eur, code) => eur * RATES[code];

export const formatMoney = (amount, code) =>
  new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

export const formatEur = (eur, code) => formatMoney(fromEur(eur, code), code);
export const formatUsd = (eur) => formatMoney(fromEur(eur, "USD"), "USD");

export const niceRound = (x) => {
  if (x <= 0) return 0;
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
  return Math.round(x / mag) * mag;
};

export const sliderStep = (max) => Math.max(1, Math.pow(10, Math.floor(Math.log10(max)) - 2));

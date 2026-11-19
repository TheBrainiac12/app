const ISO = {
  Albania: "AL", Argentina: "AR", Armenia: "AM", Australia: "AU", Austria: "AT", Azerbaijan: "AZ", Belarus: "BY",
  Belgium: "BE", "Bosnia And Herzegovina": "BA", Brazil: "BR", Bulgaria: "BG", Canada: "CA", Chile: "CL", China: "CN",
  Colombia: "CO", "Costa Rica": "CR", Croatia: "HR", "Czech Republic": "CZ", Denmark: "DK", "Dominican Republic": "DO",
  Ecuador: "EC", Egypt: "EG", Estonia: "EE", Finland: "FI", France: "FR", Georgia: "GE", Germany: "DE", Greece: "GR",
  "Hong Kong": "HK", Hungary: "HU", Iceland: "IS", India: "IN", Indonesia: "ID", Ireland: "IE", Israel: "IL",
  Italy: "IT", Japan: "JP", Jordan: "JO", Kazakhstan: "KZ", Kenya: "KE", Latvia: "LV", Lebanon: "LB", Lithuania: "LT",
  Macedonia: "MK", Malaysia: "MY", Mexico: "MX", Moldova: "MD", Montenegro: "ME", Morocco: "MA", Nepal: "NP",
  Netherlands: "NL", "New Zealand": "NZ", Norway: "NO", Panama: "PA", Peru: "PE", Philippines: "PH", Poland: "PL",
  Portugal: "PT", Qatar: "QA", Romania: "RO", Russia: "RU", Serbia: "RS", Singapore: "SG", Slovakia: "SK",
  Slovenia: "SI", "South Africa": "ZA", "South Korea": "KR", Spain: "ES", "Sri Lanka": "LK", Sweden: "SE",
  Switzerland: "CH", Taiwan: "TW", Thailand: "TH", Tunisia: "TN", Turkey: "TR", Ukraine: "UA",
  "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US", Uruguay: "UY", Uzbekistan: "UZ", Vietnam: "VN",
};

export const flagOf = (country) => {
  const code = ISO[country];
  return code ? String.fromCodePoint(...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)) : "";
};

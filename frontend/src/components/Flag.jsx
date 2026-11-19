import * as Flags from "country-flag-icons/react/3x2";
import { isoOf } from "@/lib/flags";

export const Flag = ({ country, height = 20, className = "", style }) => {
  const Svg = Flags[isoOf(country)];
  if (!Svg) return null;
  return (
    <Svg
      title={country}
      data-testid="country-flag"
      className={className}
      style={{ height, width: height * 1.5, borderRadius: 3, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 1px rgba(0,0,0,0.25)", ...style }}
    />
  );
};

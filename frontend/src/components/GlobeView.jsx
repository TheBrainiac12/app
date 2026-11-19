import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { styleFor } from "@/lib/theme";
import { CITIES, isCovered } from "@/lib/engine";

const EMERALD = "#10E39A";
const CORAL = "#FF5A7A";

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const useWindowSize = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return size;
};

const makeLabel = (d, onClick) => {
  const wrap = document.createElement("div");
  wrap.style.pointerEvents = "none";
  const btn = document.createElement("button");
  btn.setAttribute("data-testid", d.origin ? "globe-origin-label" : `globe-label-${d.city.id}`);
  btn.className = "globe-pill";
  btn.style.setProperty("--pill", d.color);
  btn.innerHTML = d.origin
    ? `<span class="globe-pill-dot"></span><span><b>You</b> · ${d.city.city}</span>`
    : `<span class="globe-pill-dot"></span><span><b>${d.city.city}</b><small>${d.sub}</small></span>`;
  if (!d.origin) btn.onclick = (e) => { e.stopPropagation(); onClick(d); };
  wrap.appendChild(btn);
  return wrap;
};

export const GlobeView = ({ origin, cards, explore, rentEur, focus, onPick }) => {
  const ref = useRef(null);
  const { w, h } = useWindowSize();
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  const onReady = useCallback(() => {
    const g = ref.current;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.minDistance = 150;
    controls.maxDistance = 520;
    controls.addEventListener("start", () => { controls.autoRotate = false; });
    g.pointOfView({ lat: 20, lng: 20, altitude: 2.4 });
  }, []);

  useEffect(() => {
    if (!focus || !ref.current) return;
    ref.current.controls().autoRotate = false;
    ref.current.pointOfView({ lat: focus.lat, lng: focus.lng, altitude: focus.altitude }, 1400);
  }, [focus]);

  const dests = useMemo(
    () => cards.map((c) => ({ city: c.city, card: c, color: styleFor(c).hex, sub: c.reality ? "Reality check" : c.apartment, lat: c.city.coords.lat, lng: c.city.coords.lng })),
    [cards]
  );

  useEffect(() => {
    let raf;
    const layout = () => {
      const items = [...document.querySelectorAll(".globe-pill")]
        .map((el) => {
          const a = el.parentElement.getBoundingClientRect();
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          const dx = parseFloat(el.style.getPropertyValue("--dx")) || 0;
          const dy = parseFloat(el.style.getPropertyValue("--dy")) || 0;
          return { el, w: el.offsetParent ? w : 0, h, left: a.left - w / 2, top: a.top - 10 - h, dx, dy, origin: el.dataset.testid === "globe-origin-label" };
        })
        .filter((it) => it.w > 0)
        .sort((a, b) => (b.origin - a.origin) || a.top - b.top);
      const placed = [];
      items.forEach((it) => {
        const left = it.left < 8 ? 8 : it.left + it.w > window.innerWidth - 8 ? window.innerWidth - 8 - it.w : it.left;
        let top = it.top;
        for (let i = 0; i < 8; i++) {
          const hit = placed.find((p) => left < p.left + p.w + 4 && left + it.w + 4 > p.left && top < p.top + p.h + 4 && top + it.h + 4 > p.top);
          if (!hit) break;
          top = hit.top + hit.h + 4;
        }
        placed.push({ left, top, w: it.w, h: it.h });
        const ndx = left - it.left;
        const ndy = top - it.top;
        if (Math.abs(ndx - it.dx) > 0.5) it.el.style.setProperty("--dx", `${ndx}px`);
        if (Math.abs(ndy - it.dy) > 0.5) it.el.style.setProperty("--dy", `${ndy}px`);
      });
      raf = requestAnimationFrame(layout);
    };
    raf = requestAnimationFrame(layout);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labels = useMemo(() => {
    if (!origin) return [];
    const o = { origin: true, city: origin, color: "#FFFFFF", lat: origin.coords.lat, lng: origin.coords.lng };
    return [o, ...dests];
  }, [origin, dests]);

  const rings = useMemo(() => {
    if (!origin) return [];
    const o = { lat: origin.coords.lat, lng: origin.coords.lng, color: EMERALD, maxR: 5, speed: 2.2, period: 900 };
    return [o, ...dests.map((d) => ({ lat: d.lat, lng: d.lng, color: d.color, maxR: 3.5, speed: 1.6, period: 1300 }))];
  }, [origin, dests]);

  const arcs = useMemo(
    () => (origin ? dests.map((d) => ({ startLat: origin.coords.lat, startLng: origin.coords.lng, endLat: d.lat, endLng: d.lng, color: [rgba("#FFFFFF", 0.7), d.color] })) : []),
    [origin, dests]
  );

  const points = useMemo(
    () => (explore && origin ? CITIES.filter((c) => c.id !== origin.id).map((c) => ({ city: c, lat: c.coords.lat, lng: c.coords.lng, ok: isCovered(c, rentEur) })) : []),
    [explore, origin, rentEur]
  );

  return (
    <div data-testid="globe-container" className="fixed inset-0 z-0">
      <Globe
        ref={ref}
        width={w}
        height={h}
        onGlobeReady={onReady}
        globeImageUrl="/textures/earth-night.jpg"
        bumpImageUrl="/textures/earth-topology.png"
        backgroundImageUrl="/textures/night-sky.png"
        backgroundColor="#05070B"
        atmosphereColor="#3FD6FF"
        atmosphereAltitude={0.18}
        arcsData={arcs}
        arcColor="color"
        arcStroke={0.7}
        arcDashLength={0.45}
        arcDashGap={0.25}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={2200}
        arcAltitudeAutoScale={0.45}
        arcsTransitionDuration={800}
        ringsData={rings}
        ringColor={(d) => (t) => rgba(d.color, Math.max(0, 1 - t))}
        ringMaxRadius="maxR"
        ringPropagationSpeed="speed"
        ringRepeatPeriod="period"
        htmlElementsData={labels}
        htmlElement={(d) => makeLabel(d, (x) => pickRef.current(x.city, x.card, 1.1))}
        htmlAltitude={0.015}
        htmlTransitionDuration={600}
        pointsData={points}
        pointColor={(d) => (d.ok ? EMERALD : CORAL)}
        pointAltitude={0.012}
        pointRadius={0.42}
        pointsMerge={false}
        pointsTransitionDuration={500}
        pointLabel={(d) => `<div class="globe-tip"><b>${d.city.city}</b>, ${d.city.country}<br/><span style="color:${d.ok ? EMERALD : CORAL}">${d.ok ? "Your rent upgrades you here" : "Reality check: costs more"}</span></div>`}
        onPointClick={(d) => pickRef.current(d.city, null, 0.6)}
      />
    </div>
  );
};

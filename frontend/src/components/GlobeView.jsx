import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { AmbientLight, Color, DirectionalLight, Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader, Vector3 } from "three";
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

const PIN = (color, core) => `<svg viewBox="0 0 24 32" width="24" height="32" aria-hidden="true"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 32 12 32s12-11.2 12-20.1C24 5.3 18.6 0 12 0z" fill="${color}" stroke="rgba(0,0,0,0.45)" stroke-width="1"/><circle cx="12" cy="11.5" r="4.6" fill="${core}"/></svg>`;

const makeLabel = (d, onClick) => {
  const wrap = document.createElement("div");
  wrap.style.pointerEvents = "none";
  const pin = document.createElement("div");
  pin.className = "globe-pin";
  pin.setAttribute("data-testid", d.origin ? "globe-origin-pin" : `globe-pin-${d.city.id}`);
  pin.style.setProperty("--pill", d.origin ? EMERALD : d.color);
  pin.innerHTML = d.origin ? PIN("#FFFFFF", EMERALD) : PIN(d.color, "#0B0E15");
  if (!d.origin) pin.onclick = (e) => { e.stopPropagation(); onClick(d); };
  wrap.appendChild(pin);
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

const GLOBE_MATERIAL = new MeshPhongMaterial({ bumpScale: 10, specular: new Color("grey"), shininess: 15 });
new TextureLoader().load("/textures/earth-water.png", (tex) => { GLOBE_MATERIAL.specularMap = tex; GLOBE_MATERIAL.needsUpdate = true; });

const RANDOM_GAP = () => Math.random();
const SUBTLE = "rgba(160,220,255,0.85)";

export const GlobeView = ({ origin, cards, explore, rentEur, focus, onPick, selectMode, onSelectOrigin }) => {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const { w, h } = useWindowSize();
  const [hovered, setHovered] = useState(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const stateRef = useRef({});
  const resumeRef = useRef(null);
  stateRef.current = { selectMode, origin, onSelectOrigin };

  const onReady = useCallback(() => {
    const g = ref.current;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.minDistance = 150;
    controls.maxDistance = 520;
    controls.addEventListener("start", () => { controls.autoRotate = false; });
    g.pointOfView({ lat: 20, lng: 20, altitude: 2.4 });

    const sun = new DirectionalLight(0xffffff, 2.4);
    g.lights([new AmbientLight(0xffffff, 0.9), sun]);

    const clouds = new Mesh(
      new SphereGeometry(g.getGlobeRadius() * 1.004, 75, 75),
      new MeshPhongMaterial({ transparent: true, opacity: 0.25, depthWrite: false })
    );
    new TextureLoader().load("/textures/clouds.png", (tex) => { clouds.material.map = tex; clouds.material.needsUpdate = true; });
    g.scene().add(clouds);

    const up = new Vector3(0, 1, 0);
    const tick = () => {
      clouds.rotation.y += 0.00035;
      sun.position.copy(g.camera().position).applyAxisAngle(up, -0.7).add(new Vector3(0, 120, 0));
      requestAnimationFrame(tick);
    };
    tick();
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
          return { el, w: el.offsetParent ? w : 0, h, left: a.left - w / 2, top: a.top - 36 - h, dx, dy, origin: el.dataset.testid === "globe-origin-label" };
        })
        .filter((it) => it.w > 0)
        .sort((a, b) => (b.origin - a.origin) || b.top - a.top);
      const placed = [...document.querySelectorAll(".glass-panel, .globe-pin")].filter((el) => el.offsetParent).map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, w: r.width, h: r.height };
      });
      items.forEach((it) => {
        const left = it.left < 8 ? 8 : it.left + it.w > window.innerWidth - 8 ? window.innerWidth - 8 - it.w : it.left;
        const hitAt = (t) => placed.find((p) => left < p.left + p.w + 4 && left + it.w + 4 > p.left && t < p.top + p.h + 4 && t + it.h + 4 > p.top);
        const search = (up) => {
          let t = it.top;
          for (let i = 0; i < 24; i++) {
            const hit = hitAt(t);
            if (!hit) return t;
            t = up ? hit.top - it.h - 4 : hit.top + hit.h + 4;
          }
          return null;
        };
        const upTop = search(true);
        const top = upTop !== null && upTop >= 8 ? upTop : search(false) ?? it.top;
        placed.push({ left, top, w: it.w, h: it.h });
        const ndx = left - it.left;
        const ndy = top - it.top;
        if (Math.abs(ndx - it.dx) > 0.5) it.el.style.setProperty("--dx", `${ndx}px`);
        if (Math.abs(ndy - it.dy) > 0.5) {
          it.el.style.setProperty("--dy", `${ndy}px`);
          it.el.style.setProperty("--lead", `${Math.max(0, ndy - it.h - 6)}px`);
          it.el.style.setProperty("--lead-down", `${Math.max(0, -ndy)}px`);
        }
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

  const points = useMemo(() => {
    const others = CITIES.filter((c) => !origin || c.id !== origin.id);
    if (selectMode) return others.map((c) => ({ city: c, lat: c.coords.lat, lng: c.coords.lng, ok: null }));
    if (explore && origin) return others.map((c) => ({ city: c, lat: c.coords.lat, lng: c.coords.lng, ok: isCovered(c, rentEur) }));
    return [];
  }, [selectMode, explore, origin, rentEur]);

  const allRings = useMemo(
    () => (hovered ? [...rings, { lat: hovered.coords.lat, lng: hovered.coords.lng, color: "#FFFFFF", maxR: 1.8, speed: 1.2, period: 700 }] : rings),
    [rings, hovered]
  );

  const onHover = useCallback((d) => {
    const g = ref.current;
    if (wrapRef.current) wrapRef.current.style.cursor = d ? "pointer" : "";
    setHovered(d ? d.city : null);
    if (!g) return;
    const { selectMode: sel, origin: o } = stateRef.current;
    const controls = g.controls();
    clearTimeout(resumeRef.current);
    if (d) {
      controls.autoRotate = false;
      controls.enableDamping = false;
    } else {
      controls.enableDamping = true;
      if (sel && !o) resumeRef.current = setTimeout(() => { if (stateRef.current.selectMode && !stateRef.current.origin) controls.autoRotate = true; }, 700);
    }
  }, []);

  const onPointClick = useCallback((d) => {
    const { selectMode: sel, onSelectOrigin: pickOrigin } = stateRef.current;
    if (sel) pickOrigin(d.city);
    else pickRef.current(d.city, null, 0.6);
  }, []);

  const htmlElement = useCallback((d) => makeLabel(d, (x) => pickRef.current(x.city, x.card, 1.1)), []);
  const hid = hovered ? hovered.id : null;
  const pointColor = useCallback((d) => (d.city.id === hid ? "#FFFFFF" : d.ok === null ? SUBTLE : d.ok ? EMERALD : CORAL), [hid]);
  const pointRadius = useCallback((d) => (d.city.id === hid ? 0.55 : 0.3), [hid]);
  const ringColor = useCallback((d) => (t) => rgba(d.color, Math.max(0, 1 - t)), []);
  const pointLabel = useCallback(
    (d) => {
      const status = d.ok === null
        ? `<span style="color:#9fb3c8">Click to select as your city</span>`
        : `<span style="color:${d.ok ? EMERALD : CORAL}">${d.ok ? "Your rent upgrades you here" : "Reality check: costs more"}</span>`;
      return `<div class="globe-tip"><b>${d.city.city}</b>, ${d.city.country}<br/>${status}</div>`;
    },
    []
  );

  return (
    <div ref={wrapRef} data-testid="globe-container" className="fixed inset-0 z-0">
      <Globe
        ref={ref}
        width={w}
        height={h}
        onGlobeReady={onReady}
        globeMaterial={GLOBE_MATERIAL}
        globeImageUrl="/textures/earth-blue-marble.jpg"
        bumpImageUrl="/textures/earth-topology.png"
        backgroundImageUrl="/textures/night-sky.png"
        backgroundColor="#05070B"
        showAtmosphere
        atmosphereColor="#60a5fa"
        atmosphereAltitude={0.18}
        arcsData={arcs}
        arcColor="color"
        arcStroke={0.7}
        arcDashLength={0.45}
        arcDashGap={0.25}
        arcDashInitialGap={RANDOM_GAP}
        arcDashAnimateTime={2200}
        arcAltitudeAutoScale={0.45}
        arcsTransitionDuration={800}
        ringsData={allRings}
        ringColor={ringColor}
        ringMaxRadius="maxR"
        ringPropagationSpeed="speed"
        ringRepeatPeriod="period"
        htmlElementsData={labels}
        htmlElement={htmlElement}
        htmlAltitude={0.015}
        htmlTransitionDuration={600}
        pointsData={points}
        pointColor={pointColor}
        pointAltitude={0.001}
        pointRadius={pointRadius}
        pointsMerge={false}
        pointsTransitionDuration={150}
        onPointHover={onHover}
        pointLabel={pointLabel}
        onPointClick={onPointClick}
      />
    </div>
  );
};

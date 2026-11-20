import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  wrap.className = "globe-wrap";
  wrap.dataset.lat = d.lat;
  wrap.dataset.lng = d.lng;
  wrap.dataset.priority = d.origin ? 0 : d.priority;
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
const KEEP_VISIBLE = () => {};
const POINT_COLOR = (d) => (d.ok === null ? SUBTLE : d.ok ? EMERALD : CORAL);
const SUBTLE = "rgba(160,220,255,0.85)";

const HIT_PX = 16;

const tipHtml = (d) => {
  const status = d.ok === null
    ? `<span style="color:#9fb3c8">Click to select</span>`
    : `<span style="color:${d.ok ? EMERALD : CORAL}">${d.ok ? "Your rent upgrades you here" : "Reality check: costs more"} · click to compare</span>`;
  return `<b>${d.city.city}</b>, ${d.city.country}<br/>${status}`;
};

const GlobeViewInner = ({ origin, cards, explore, rentEur, focus, onPick, selectMode, onSelectOrigin }) => {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const tipRef = useRef(null);
  const hiRef = useRef(null);
  const mouseRef = useRef(null);
  const hoverRef = useRef(null);
  const downRef = useRef(null);
  const pointsRef = useRef([]);
  const { w, h } = useWindowSize();
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
    () => cards.map((c, i) => ({ priority: i + 1, city: c.city, card: c, color: styleFor(c).hex, sub: c.reality ? "Reality check" : c.apartment, lat: c.city.coords.lat, lng: c.city.coords.lng })),
    [cards]
  );

  useEffect(() => {
    let raf;
    const OFFSETS = [0, -28, 28, -56, 56, -84, 84, -112, 112, -140, 140, -168, 168, -196, 196];
    const layout = () => {
      const g = ref.current;
      if (!g) { raf = requestAnimationFrame(layout); return; }
      const cam = g.camera().position.clone().normalize();
      const W = window.innerWidth;
      const H = window.innerHeight;
      const items = [];
      document.querySelectorAll(".globe-wrap").forEach((wrap) => {
        const c = g.getCoords(+wrap.dataset.lat, +wrap.dataset.lng, 0);
        const len = Math.hypot(c.x, c.y, c.z);
        const dot = (c.x * cam.x + c.y * cam.y + c.z * cam.z) / len;
        const hidden = wrap.classList.contains("globe-wrap-hidden");
        const behind = hidden ? dot < -0.05 : dot < -0.1;
        if (behind !== hidden) wrap.classList.toggle("globe-wrap-hidden", behind);
        if (behind) return;
        const el = wrap.querySelector(".globe-pill");
        const a = wrap.getBoundingClientRect();
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        items.push({
          el, w, h, left: a.left - w / 2, top: a.top - 36 - h,
          dx: parseFloat(el.style.getPropertyValue("--dx")) || 0,
          dy: parseFloat(el.style.getPropertyValue("--dy")) || 0,
          priority: +wrap.dataset.priority,
          pin: wrap.querySelector(".globe-pin").getBoundingClientRect(),
        });
      });
      items.sort((a, b) => a.priority - b.priority);
      const placed = [...document.querySelectorAll(".glass-panel")].map((el) => el.getBoundingClientRect())
        .concat(items.map((it) => it.pin))
        .map((r) => ({ left: r.left, top: r.top, w: r.width, h: r.height }));
      items.forEach((it) => {
        const left = Math.min(Math.max(it.left, 16), W - 16 - it.w);
        const clampTop = (t) => Math.min(Math.max(t, 16), H - 16 - it.h);
        const free = (t) => !placed.some((p) => left < p.left + p.w + 4 && left + it.w + 4 > p.left && t < p.top + p.h + 4 && t + it.h + 4 > p.top);
        const prevTop = clampTop(it.top + it.dy);
        let top = free(prevTop) && Math.abs(prevTop - clampTop(it.top)) <= 196 ? prevTop : null;
        if (top === null) {
          for (const off of OFFSETS) {
            const t = clampTop(it.top + off);
            if (free(t)) { top = t; break; }
          }
        }
        if (top === null) {
          const pills = placed.filter((p) => p.pill);
          const overlap = (t) => pills.reduce((sum, p) => sum + Math.max(0, Math.min(left + it.w, p.left + p.w) - Math.max(left, p.left)) * Math.max(0, Math.min(t + it.h, p.top + p.h) - Math.max(t, p.top)), 0);
          let best = Infinity;
          for (let off = -336; off <= 336; off += 28) {
            const t = clampTop(it.top + off);
            const score = overlap(t) * 1000 + Math.abs(off);
            if (score < best) { best = score; top = t; }
          }
        }
        placed.push({ left, top, w: it.w, h: it.h, pill: true });
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

  pointsRef.current = points;

  const nearest = useCallback((m, radius, keepId) => {
    const g = ref.current;
    if (!g || !m) return null;
    const cam = g.camera().position;
    const r2 = g.getGlobeRadius() ** 2;
    let best = null;
    let bd = Infinity;
    for (const d of pointsRef.current) {
      const kept = d.city.id === keepId;
      const c = g.getCoords(d.lat, d.lng, 0);
      if (c.x * cam.x + c.y * cam.y + c.z * cam.z <= r2 * (kept ? 0.995 : 1.01)) continue;
      const sc = g.getScreenCoords(d.lat, d.lng, 0.001);
      const dist = (sc.x - m.x) ** 2 + (sc.y - m.y) ** 2;
      const limit = (kept ? radius * 1.4 : radius) ** 2;
      if (dist < limit && dist < bd) { bd = dist; best = { d, x: sc.x, y: sc.y }; }
    }
    return best;
  }, []);

  const applyHover = useCallback((hit) => {
    const g = ref.current;
    const prev = hoverRef.current;
    const tip = tipRef.current;
    const hi = hiRef.current;
    if (!g || !tip || !hi) return;
    hoverRef.current = hit;
    if (hit) {
      if (!prev || prev.d.city.id !== hit.d.city.id) {
        tip.innerHTML = tipHtml(hit.d);
        hi.style.setProperty("--dot", hit.d.ok === null ? "#FFFFFF" : hit.d.ok ? EMERALD : CORAL);
      }
      tip.style.transform = `translate(${hit.x}px, ${hit.y - 16}px) translate(-50%, -100%)`;
      hi.style.transform = `translate(${hit.x}px, ${hit.y}px) translate(-50%, -50%)`;
      tip.style.display = "block";
      hi.style.display = "block";
      wrapRef.current.style.cursor = "pointer";
      if (!prev) {
        clearTimeout(resumeRef.current);
        const controls = g.controls();
        controls.autoRotate = false;
        controls.enableDamping = false;
      }
    } else if (prev) {
      tip.style.display = "none";
      hi.style.display = "none";
      wrapRef.current.style.cursor = "";
      const controls = g.controls();
      controls.enableDamping = true;
      resumeRef.current = setTimeout(() => {
        if (stateRef.current.selectMode && !stateRef.current.origin && !hoverRef.current) controls.autoRotate = true;
      }, 700);
    }
  }, []);

  useEffect(() => {
    let raf;
    const loop = () => {
      if (mouseRef.current) applyHover(nearest(mouseRef.current, HIT_PX, hoverRef.current && hoverRef.current.d.city.id));
      else if (hoverRef.current) applyHover(null);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [applyHover, nearest]);

  const onMove = useCallback((e) => {
    mouseRef.current = e.target.tagName === "CANVAS" ? { x: e.clientX, y: e.clientY } : null;
  }, []);

  const onDown = useCallback((e) => { downRef.current = { x: e.clientX, y: e.clientY }; }, []);

  const onClick = useCallback((e) => {
    const down = downRef.current;
    if (e.target.tagName !== "CANVAS" || (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6)) return;
    const touch = e.pointerType === "touch";
    const hit = (!touch && hoverRef.current) || nearest({ x: e.clientX, y: e.clientY }, touch ? 24 : HIT_PX);
    if (touch) mouseRef.current = null;
    if (!hit) return;
    const { selectMode: sel, onSelectOrigin: pickOrigin } = stateRef.current;
    if (sel) pickOrigin(hit.d.city);
    else pickRef.current(hit.d.city, null, 0.6);
  }, [nearest]);

  const htmlElement = useCallback((d) => makeLabel(d, (x) => pickRef.current(x.city, x.card, 1.1)), []);
  const ringColor = useCallback((d) => (t) => rgba(d.color, Math.max(0, 1 - t)), []);

  return (
    <div
      ref={wrapRef}
      data-testid="globe-container"
      className="fixed inset-0 z-0"
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerLeave={() => { mouseRef.current = null; }}
      onClick={onClick}
    >
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
        ringsData={rings}
        ringColor={ringColor}
        ringMaxRadius="maxR"
        ringPropagationSpeed="speed"
        ringRepeatPeriod="period"
        htmlElementsData={labels}
        htmlElement={htmlElement}
        htmlElementVisibilityModifier={KEEP_VISIBLE}
        htmlAltitude={0.015}
        htmlTransitionDuration={600}
        pointsData={points}
        pointColor={POINT_COLOR}
        pointAltitude={0.001}
        pointRadius={0.22}
        pointsMerge
        pointsTransitionDuration={0}
      />
      <div ref={hiRef} data-testid="globe-hover-dot" className="globe-hover-dot" />
      <div ref={tipRef} data-testid="globe-hover-tooltip" className="globe-tip globe-hover-tip" />
    </div>
  );
};

const sameProps = (a, b) => Object.keys(a).every((k) => typeof a[k] === "function" || a[k] === b[k]);

export const GlobeView = memo(GlobeViewInner, sameProps);

// ==UserScript==
// @name         Evades
// @namespace    https://evades.io/
// @version      alpha-1
// @description  esc to enable/disable - this tas is highly detectable if spectated by a mod. don't get caught
// @author       kya <discord: @yeahdill>
// @match        https://*.evades.io/*
// @match        https://*.evades.online/*
// @icon         https://i.imgur.com/1HDWzex.png
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ===== your avg ingame ms change here =====
const ms = 40; // turn on in settings if needed, avg ping change there <<
// ===== this isnt obfuscated, you can add onto this all you want. =====
(() => {
  "use strict";
  let t = false;
  const e = 1e3 / 60;
  const n = 300 + ms;
  const s = 4;
  const o = 6;
  const i = 25;
  const a = Math.max(4, Math.floor(n / i));
  const c = 280;
  let l = 70;
  const r = 250;
  const f = 50;
  let y = 0;
  let u = 1;
  let d = null;
  let h = 0;
  let x = 0;
  let m = false;
  let g = { x: 0, y: 0 };
  const v = 4500;
  let p = 0;
  let M = { canvasX: 0, canvasY: 0, active: false };
  let w = null;
  let b = null;
  let E = { x: 0, y: 0 };
  function _() {
    d = document.querySelector("canvas");
    w = document.createElement("canvas");
    w.id = "cursor";
    Object.assign(w.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "9999998",
      pointerEvents: "none",
    });
    document.body.appendChild(w);
    b = w.getContext("2d");
    S();
  }
  function S() {
    if (w) {
      w.width = window.innerWidth;
      w.height = window.innerHeight;
    }
  }
  window.addEventListener("resize", S);
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    _();
  } else {
    window.addEventListener("DOMContentLoaded", _);
  }
  window.addEventListener(
    "mousemove",
    (t) => {
      if (!t.isTrusted) return;
      if (
        t.target &&
        t.target.tagName === "CANVAS" &&
        t.target.id !== "cursor"
      ) {
        d = t.target;
      }
      h = t.clientX;
      x = t.clientY;
    },
    true,
  );
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      t = !t;
      if (!t) {
        M.active = false;
      }
    }
  });
  const L = [];
  const T = [];
  const A = [];
  const I = [1, 0.8, 0.6, 0.4, 0.2, 0];
  for (let t = 0; t < I.length; t++) {
    const e = I[t];
    if (e === 0) {
      T.push({ x: 0, y: 0, mag: 0 });
    } else {
      for (let t = 0; t < 24; t++) {
        const n = (t / 24) * Math.PI * 2;
        T.push({ x: Math.cos(n) * e, y: Math.sin(n) * e, mag: e });
      }
    }
  }
  for (let t = 0; t < T.length; t++) {
    A.push({ vec: T[t], score: 0 });
  }
  let D = null;
  let P = null;
  function F() {
    try {
      if (!D || !document.body.contains(D)) {
        D = document.querySelector("div.quests-launcher");
        if (!D) return null;
        P = Object.keys(D).find((t) => t.startsWith("__reactFiber$"));
      }
      if (!P) return null;
      let t = D[P];
      let e = 0;
      while (t && e < 25) {
        if (t.stateNode?.gameState?.areaInfo?.self?.entity) {
          const e = t.stateNode;
          return {
            player: e.gameState.areaInfo.self.entity,
            camera: e.renderer?.camera,
            area: e.gameState.area,
            gameState: e.gameState,
            inputEngine: e.gameState.input || e.inputEngine || e,
          };
        }
        t = t.return;
        e++;
      }
    } catch (t) {}
    return null;
  }
  function q(t, n) {
    if (!t._evadeLastPos) {
      t._evadeLastPos = { x: t.x, y: t.y };
      t._evadeLastTime = n;
      t._vxMs = 0;
      t._vyMs = 0;
      return;
    }
    if (t.x !== t._evadeLastPos.x || t.y !== t._evadeLastPos.y) {
      const s = Math.max(1, Math.round((n - t._evadeLastTime) / e)) * e;
      if (s > 0.5) {
        t._vxMs = t._vxMs * 0.35 + ((t.x - t._evadeLastPos.x) / s) * 0.65;
        t._vyMs = t._vyMs * 0.35 + ((t.y - t._evadeLastPos.y) / s) * 0.65;
        t._evadeLastPos.x = t.x;
        t._evadeLastPos.y = t.y;
        t._evadeLastTime = n;
      }
    }
  }
  function C(t, e, n, s) {
    if (!e) return;
    const o = d ? d.width : window.innerWidth;
    const i = d ? d.height : window.innerHeight;
    const a = e.originalGameScale || e.scale || 1;
    const c = e.left || e.x - o / (2 * a);
    const l = e.top || e.y - i / (2 * a);
    const r = (n - c) * a;
    const f = (s - l) * a;
    const y = F();
    if (y && y.inputEngine) {
      if (y.inputEngine.mouse) {
        y.inputEngine.mouse.x = r;
        y.inputEngine.mouse.y = f;
        y.inputEngine.mouse.worldX = n;
        y.inputEngine.mouse.worldY = s;
      }
      if (y.inputEngine.rawMouse) {
        y.inputEngine.rawMouse.x = r;
      }
    }
    if (d) {
      const t = d.getBoundingClientRect();
      M.canvasX = t.left + r;
      M.canvasY = t.top + f;
      M.active = true;
      const e = new MouseEvent("mousemove", {
        clientX: t.left + r,
        clientY: t.top + f,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      d.dispatchEvent(e);
    }
  }
  function z(t, e, n) {
    const s = n.length;
    for (let o = 0; o < s; o++) {
      const s = n[o];
      if (
        t >= s.x - 1 &&
        t <= s.x + s.width + 1 &&
        e >= s.y - 1 &&
        e <= s.y + s.height + 1
      )
        return s;
    }
    return null;
  }
  function X(t, e, n, s, c) {
    let l = e.x;
    let r = e.y;
    const f = e.radius || 15;
    let y = 0;
    let u = 0;
    let d = 0;
    let h = 0;
    let x = s ? s.x + f : -Infinity;
    let m = Infinity;
    let g = s ? s.y + f : -Infinity;
    let v = s ? s.y + s.height - f : Infinity;
    const p = e._vxMs || 0;
    const M = e._vyMs || 0;
    const w = t.x * c * 0.7 + p * 0.3;
    const b = t.y * c * 0.7 + M * 0.3;
    const E = n.length;
    for (let t = 0; t < a; t++) {
      const e = t * i;
      let a = l + w * e;
      let c = r + b * e;
      if (s) {
        if (c < g || c > v) {
          return {
            collisions: 9999,
            spatialTrap: 9999,
            proximity: 9999,
            borderTrap: 9999,
            isAbsoluteDeadEnd: true,
            instantDeathStep: t,
          };
        }
      }
      if (a < x) a = x;
      if (c < g) c = g;
      if (c > v) c = v;
      if (s) {
        const t = a - s.x;
        const e = c - s.y;
        const n = s.y + s.height - c;
        if (t < o || e < o || n < o) {
          if (a >= s.x) {
            u += 1;
          }
        }
      }
      for (let t = 0; t < E; t++) {
        const s = n[t];
        const o = s.x + s.vx * e;
        const i = s.y + s.vy * e;
        const l = o - a;
        if (l > 180 || l < -180) continue;
        const r = i - c;
        if (r > 180 || r < -180) continue;
        const f = l * l + r * r;
        const u = s.combinedRadius;
        const h = u * u;
        if (f <= h) {
          y++;
        } else if (f < h * 3.5) {
          const t = Math.sqrt(f);
          const e = t - u;
          if (e > 0) {
            d += 400 / (e * e);
          }
        }
      }
    }
    return {
      collisions: y,
      spatialTrap: u,
      proximity: d,
      borderTrap: h,
      isAbsoluteDeadEnd: false,
      instantDeathStep: 99,
    };
  }
  function Y(n, s, i, a) {
    if (!t || !n || document.hidden) return;
    if (!d) d = document.querySelector("canvas");
    const M = performance.now();
    let w = z(n.x, n.y, i);
    let b = n.x;
    let _ = n.y;
    let S = false;
    if (a && d && (h !== 0 || x !== 0)) {
      const t = a.originalGameScale || a.scale || 1;
      const e = a.left || a.x - d.width / (2 * t);
      const n = a.top || a.y - d.height / (2 * t);
      const s = d.getBoundingClientRect();
      b = e + (h - s.left) / t;
      _ = n + (x - s.top) / t;
      S = true;
    }
    const I = b - n.x;
    const D = _ - n.y;
    const P = Math.hypot(I, D);
    const F = n.radius || 15;
    const q = Math.hypot(n._vxMs || 0, n._vyMs || 0);
    let Y = q > 0.015 ? q : 0.25;
    let N = Math.max(0.25, Math.min(Y, 0.7));
    L.length = 0;
    let O = Infinity;
    let k = false;
    const B = { x: S && P > 0 ? I / P : 0, y: S && P > 0 ? D / P : 0 };
    let R = 0;
    let W = 0;
    let j = 0;
    let G = 0;
    let H = 0;
    if (M - y > f) {
      y = M;
      if (q > 0.1) {
        const t = (n._vxMs || 0) / q;
        const e = (n._vyMs || 0) / q;
        const s = t * E.x + e * E.y;
        u = s < -0.2 ? 1.4 : 1;
      } else {
        u = 1;
      }
    }
    const $ = s.length;
    for (let t = 0; t < $; t++) {
      const o = s[t];
      const i = o.x - n.x;
      const a = o.y - n.y;
      const l = i * i + a * a;
      const r = c * c;
      if (l > r) continue;
      const f = Math.sqrt(l);
      if (f < O) O = f;
      const y = (o.radius || 15) + F;
      const u = n._vxMs || 0;
      const d = n._vyMs || 0;
      const h = o._vxMs || 0;
      const x = o._vyMs || 0;
      const m = h - u;
      const g = x - d;
      const v = -(i * m + a * g) / (f || 1);
      let p = Infinity;
      if (v > 0.01) {
        p = (f - y) / v;
      }
      if (i > -20 && f < 140) {
        R += x;
        W++;
      }
      if (i > 10 && i < 170 && Math.abs(a) < y * 1.5) {
        j += a;
        G++;
      }
      let M = 0;
      if (f < y) M = Math.max(M, 0.85);
      if (p < 300) M = Math.max(M, 1 - p / 300);
      if (M > H) H = M;
      const w = n.x + u * e;
      const b = n.y + d * e;
      const E = o.x + h * e;
      const _ = o.y + x * e;
      const S = E - w;
      const T = _ - b;
      if (S * S + T * T <= y * y) {
        if (u * i + d * a > 0 && h * i + x * a >= 0) {
          k = true;
        }
      }
      L.push({ x: o.x, y: o.y, vx: h, vy: x, combinedRadius: y });
    }
    p = H;
    let J = 0;
    let V = 0;
    let K = 0;
    let Q = 0;
    let U = 0;
    const Z = [];
    const tt = T.length;
    for (let t = 0; t < tt; t++) {
      const e = T[t];
      const s = X(e, n, L, w, N);
      if (s.collisions === 0 && s.borderTrap === 0 && !s.isAbsoluteDeadEnd) {
        J++;
        const t = e.mag > 0 ? (e.x * B.x + e.y * B.y) / e.mag : 0;
        const n = e.mag > 0 ? Math.abs(e.x * -B.y + e.y * B.x) / e.mag : 0;
        if (t > 0) V++;
        if (t < -0.2 || n > 0.6) K++;
      }
      let o = false;
      if (Math.abs(e.mag - 1) < 0.01) {
        const t = e.mag > 0 ? (e.x * B.x + e.y * B.y) / e.mag : 0;
        if (t > 0.2) o = true;
      }
      if (o) {
        Q++;
        if (s.collisions > 0 || s.isAbsoluteDeadEnd || s.borderTrap > 0) {
          U++;
        }
      }
      Z.push({ vec: e, metrics: s });
    }
    if (k) {
      m = !m;
      E.x = 0;
      E.y = 0;
      C(n, a, n.x, n.y + (m ? 0.01 : 0));
      return;
    }
    let et = r;
    if (S) {
      const t = Math.max(F + 5, Math.min(r, P));
      et = t + (r - t) * H;
    } else {
      et = 70 + (r - 70) * H;
    }
    const nt = et / r;
    N = Math.max(0.15, N * nt);
    const st = X(B, n, L, w, N);
    const ot = Q > 0 && U === Q;
    const it = ot && K > 0;
    const at = (J > 0 && V === 0) || ot || it;
    let ct = false;
    if (w) {
      if (B.x > 0.2 && w.x + w.width - n.x < c) ct = true;
      if (B.x < -0.2 && n.x - w.x < c) ct = true;
      if (B.y > 0.2 && w.y + w.height - n.y < c) ct = true;
      if (B.y < -0.2 && n.y - w.y < c) ct = true;
    }
    const lt = st.collisions > 0 || st.proximity > 2.5;
    for (let t = 0; t < tt; t++) {
      const e = Z[t].vec;
      const s = Z[t].metrics;
      if (s.isAbsoluteDeadEnd) {
        A[t].score = -Infinity;
        A[t].vec = e;
        continue;
      }
      let i = 0;
      let a = 0;
      if (w) {
        const t = n.y - w.y;
        const e = w.y + w.height - n.y;
        if (t < o * 4) {
          i = (1 - t / (o * 4)) * 8500;
        }
        if (e < o * 4) {
          a = (1 - e / (o * 4)) * 8500;
        }
      }
      const c = -12e5 * u;
      const l = -400 * u;
      const r = e.mag > 0 ? (e.x * B.x + e.y * B.y) / e.mag : 0;
      const f = e.mag > 0 ? Math.abs(e.x * -B.y + e.y * B.x) / e.mag : 0;
      let y = 0;
      if (!at) {
        y = r > 0 ? r * 8e3 : r * 2e3;
      } else {
        if (it) {
          let t = 0;
          if (r < -0.1) t += 25e3 * Math.abs(r);
          t += f * 3e4;
          y = t;
        } else {
          y = (e.x * B.x + e.y * B.y) * 3500;
        }
      }
      let d = y;
      if (s.collisions === 0 && !at) {
        let t = 0;
        if (ct && r > -0.1 && e.mag > 0) {
          t = f * 1500;
        }
        d += t;
      }
      let h = 0;
      if (W > 0 && e.mag > 0 && s.collisions > 0) {
        const t = R / W;
        if (Math.abs(t) > 0.04) {
          if (t > 0 && e.y < 0) h += 2500 * (Math.abs(e.y) / e.mag);
          if (t < 0 && e.y > 0) h += 2500 * (e.y / e.mag);
        }
      }
      let x = 0;
      if (i > 0 && e.y < 0) x -= i * (Math.abs(e.y) / e.mag);
      if (a > 0 && e.y > 0) x -= a * (e.y / e.mag);
      let m = ct ? 0 : 1500;
      let p = (e.x * B.x + e.y * B.y) * m;
      const M = (e.x * g.x + e.y * g.y) * v;
      const b = e.mag * 800;
      let E = s.collisions * c + s.proximity * l + d + p + M + b + h + x;
      A[t].score = E;
      A[t].vec = e;
    }
    let rt = A[0];
    for (let t = 1; t < tt; t++) {
      if (A[t].score > rt.score) rt = A[t];
    }
    let ft = 0.18 + 0.82 * Math.pow(H, 1.5);
    E.x += (rt.vec.x - E.x) * ft;
    E.y += (rt.vec.y - E.y) * ft;
    l += (et - l) * Math.max(0.2, ft);
    g.x = rt.vec.x;
    g.y = rt.vec.y;
    C(n, a, n.x + E.x * l, n.y + E.y * l);
  }
  function N() {
    if (!b || !w) return;
    b.clearRect(0, 0, w.width, w.height);
    if (t && M.active) {
      const t = M.canvasX,
        e = M.canvasY;
      b.save();
      b.shadowColor = "rgba(0, 0, 0, 0.28)";
      b.shadowBlur = 4;
      b.shadowOffsetX = 1.5;
      b.shadowOffsetY = 1.5;
      b.beginPath();
      b.moveTo(t, e);
      b.lineTo(t, e + 17);
      b.lineTo(t + 4.5, e + 13.5);
      b.lineTo(t + 8.5, e + 21);
      b.lineTo(t + 11.5, e + 19.5);
      b.lineTo(t + 7.5, e + 12);
      b.lineTo(t + 12.5, e + 12);
      b.closePath();
      b.fillStyle = "#FFFFFF";
      b.fill();
      b.shadowColor = "transparent";
      b.strokeStyle = "#1E1E1E";
      b.lineWidth = 1.5;
      b.lineJoin = "miter";
      b.miterLimit = 2;
      b.stroke();
      b.restore();
    }
  }
  function O() {
    if (!t) {
      N();
      return;
    }
    const e = F();
    if (!e || !e.gameState?.entities) return;
    const n = performance.now();
    const s = e.player || e.gameState.areaInfo?.self?.entity;
    if (!s) return;
    q(s, n);
    let o = [];
    if (e.area?.zones) {
      o =
        typeof e.area.zones.list === "function"
          ? e.area.zones.list()
          : Array.isArray(e.area.zones)
            ? e.area.zones
            : [];
    }
    const i = [];
    for (const [t, o] of Object.entries(e.gameState.entities)) {
      if (Number(t) < 0 || !o.isEnemy) continue;
      q(o, n);
      if (Math.abs(o.x - s.x) <= 300 && Math.abs(o.y - s.y) <= 300) i.push(o);
    }
    Y(s, i, o, e.camera);
    N();
  }
  const k = () => {
    O();
    requestAnimationFrame(k);
  };
  requestAnimationFrame(k);
})();

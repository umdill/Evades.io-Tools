// ==UserScript==
// @name         Evades
// @namespace    https://evades.io/
// @version      alpha-1-csp
// @description  TAS
// @author       kya <discord: @yeahdill>
// @match        https://evades.io
// @match        https://eu.evades.io
// @match        https://evades.online
// @match        http://51.222.244.149
// @icon         https://i.imgur.com/1HDWzex.png
// @run-at       document-end
// @grant        none
// ==/UserScript==

const ms=40; // your average ping (cannot be calculated due to spikes, so just put it in yourself !)
const csp=false; // stands for client sided prediction: overrides ms, pretty good and shows actual pred
// off by default 
const pathfinding=true; // IF on, game may lag in levels with 50+ balls
(() => {
  "use strict"; // do not change anything below if you don't know what you are doing.
  let t = false;
  const e = 1e3 / 60;
  const s = 4;
  const o = 6;
  const i = 25;
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
  const v = 5200;
  let p = 0;
  let M = { a: 0, b: 0, c: false };
  let w = null;
  let b = null;
  let E = { x: 0, y: 0 };
  let gg = null;
  let gh=0;
  function rr(t) {
    return csp && Number.isFinite(t?.predictedX) && Number.isFinite(t?.predictedY)
      ? { x: t.predictedX, y: t.predictedY }
      : { x: t?.x || 0, y: t?.y || 0 };
  }
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
        M.c = false;
      }
    }
  });
  const L = [];
  const T = [];
  const A = [];
  const I = [1, 0.88, 0.72, 0.56, 0.4, 0.24, 0];
  for (let t = 0; t < I.length; t++) {
    const e = I[t];
    if (e === 0) {
      T.push({ x: 0, y: 0, mag: 0 });
    } else {
      for (let t = 0; t < 20; t++) {
        const n = (t / 20) * Math.PI * 2;
        T.push({ x: Math.cos(n) * e, y: Math.sin(n) * e, mag: e });
      }
    }
  }
  for (let t = 0; t < T.length; t++) {
    A.push({ be: T[t], bd: 0 });
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
  function q(t, n, r) {
    const z = rr(t);
    if (!t._a) {
      t._a = { x: z.x, y: z.y };
      t._b = n;
      t._c = 0;
      t._d = 0;
      t._e = 0;
      t._f = 0;
      t._g = 1;
      t._h = -Infinity;
      return;
    }
    if (z.x === t._a.x && z.y === t._a.y) return;
    const j = Math.max(1, n - t._b);
    const dt = Math.max(e, Math.round(j / e) * e);
    const dx = z.x - t._a.x;
    const dy = z.y - t._a.y;
    const k = Math.hypot(dx, dy);
    if (k > 85 + Math.hypot(t._c || 0, t._d || 0) * Math.min(j, 80) * 1.8 || j > 180) {
      t._c = 0;
      t._d = 0;
      t._e = 0;
      t._f = 0;
      t._g = 0.15;
      t._h = n;
    } else {
      const aa = dx / dt;
      const ab = dy / dt;
      const ac = t._c || 0;
      const ad = t._d || 0;
      const ae = csp
        ? .72
        : Math.min(0.58, .72);
      const af = ac + (aa - ac) * ae;
      const ag = ad + (ab - ad) * ae;
      const ah = 0.0025;
      const ai = Math.max(-ah, Math.min(ah, (af - ac) / dt));
      const aj = Math.max(-ah, Math.min(ah, (ag - ad) / dt));
      const ak = t._e || 0;
      const al = t._f || 0;
      const am = 0.00055;
      const an = ak + Math.max(-am, Math.min(am, ai - ak));
      const ao = al + Math.max(-am, Math.min(am, aj - al));
      t._e = ak * 0.42 + an * 0.58;
      t._f = al * 0.42 + ao * 0.58;
      t._c = af;
      t._d = ag;
      const ap = n - (t._h || -Infinity);
      t._g = Math.min(
        1,
        ap < 180
          ? 0.15 + (ap / 180) * 0.85
          : (t._g || 0.5) + 0.18,
      );
    }
    if (csp && r > 0 && Number.isFinite(t._pred?.vx) && Number.isFinite(t._pred?.vy)) {
      const z = 1000 / r;
      const A = t._pred.vx / z;
      const B = t._pred.vy / z;
      t._c = (t._c || 0) * 0.18 + A * 0.82;
      t._d = (t._d || 0) * 0.18 + B * 0.82;
    }
    t._a.x = z.x;
    t._a.y = z.y;
    t._b = n;
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
      M.a = t.left + r;
      M.b = t.top + f;
      M.c = true;
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
    ) {
      return s;
    }
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
    let j0=Infinity,j1=0;
    let x = s ? s.x + f : -Infinity;
    let m = Infinity;
    let g = s ? s.y + f : -Infinity;
    let v = s ? s.y + s.height - f : Infinity;
    const p = e._c || 0;
    const M = e._d || 0;
    const w = t.x * c * 0.7 + p * 0.3;
    const b = t.y * c * 0.7 + M * 0.3;
    const E = n.length;
    const au = Math.max(4, Math.floor(Math.max(csp?80:100,Math.min(900,300+(csp?0:ms))) / i));
    for (let t = 0; t < au; t++) {
      const e = t * i;
      let a = l + w * e;
      let c = r + b * e;
      if (s) {
        if (c < g || c > v) {
          return {
            ba: 9999,
            ay: 9999,
            bb: 9999,
            az: 9999,
            ax: true,
            aw: t,
            bj:e,
            bk:1,
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
        const aq = s.aq ?? 1;
        let ar = 0;
        let as = 0;
        if (csp && true && aq > 0.35) {
          const at = 18 + 26 * aq;
          ar = Math.max(-at, Math.min(at, 0.5 * (s.ax || 0) * e * e));
          as = Math.max(-at, Math.min(at, 0.5 * (s.ay || 0) * e * e));
        }
        const o = s.x + s.vx * e * aq + ar;
        const i = s.y + s.vy * e * aq + as;
        const l = o - a;
        if (l > 180 || l < -180) continue;
        const r = i - c;
        if (r > 180 || r < -180) continue;
        const f = l * l + r * r;
        const u = s.av;
        const h = u * u;
        if (f <= h) {
          y++;
          if(e<j0)j0=e;
          if(e<110)j1++;
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
      ba: y,
      ay: u,
      bb: d,
      az: h,
      ax: false,
      aw: 99,
      bj:j0,
      bk:j1,
    };
  }



  function Y(n, s, i, a) {
    if (!t || !n || document.hidden) return;
    if (!d) d = document.querySelector("canvas");
    const z0 = rr(n);
    n = Object.assign(Object.create(n), { x: z0.x, y: z0.y });
    const M = performance.now();
    let w = z(n.x, n.y, i);
    let zc=w?{x:w.x+w.width*.5,y:w.y+w.height*.5}:null;
    let zd=zc?Math.hypot(n.x-zc.x,n.y-zc.y):0;
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
    const q = Math.hypot(n._c || 0, n._d || 0);
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
        const t = (n._c || 0) / q;
        const e = (n._d || 0) / q;
        const s = t * E.x + e * E.y;
        u = s < -0.2 ? 1.4 : 1;
      } else {
        u = 1;
      }
    }
    const $ = s.length;
    for (let t = 0; t < $; t++) {
      const o = s[t];
      const z1 = rr(o);
      const i = z1.x - n.x;
      const a = z1.y - n.y;
      const l = i * i + a * a;
      const r = c * c;
      if (l > r) continue;
      const f = Math.sqrt(l);
      if (f < O) O = f;
      const y = (o.radius || 15) + F;
      const u = n._c || 0;
      const d = n._d || 0;
      const h = o._c || 0;
      const x = o._d || 0;
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
      L.push({
        x: z1.x,
        y: z1.y,
        vx: h,
        vy: x,
        ax: o._e || 0,
        ay: o._f || 0,
        aq: o._g ?? 1,
        av: y,
      });
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
      if (s.ba === 0 && s.az === 0 && !s.ax) {
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
        if (s.ba > 0 || s.ax || s.az > 0) {
          U++;
        }
      }
      Z.push({ be: e, bc: s });
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
    const lt = st.ba > 0 || st.bb > 2.5;
    for (let t = 0; t < tt; t++) {
      const e = Z[t].be;
      const s = Z[t].bc;
      if (s.ax) {
        A[t].bd = -Infinity;
        A[t].be = e;
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
      if (s.ba === 0 && !at) {
        let t = 0;
        if (ct && r > -0.1 && e.mag > 0) {
          t = f * 1500;
        }
        d += t;
      }
      let h = 0;
      if (W > 0 && e.mag > 0 && s.ba > 0) {
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
      const j2=Math.hypot(n._c||0,n._d||0);
      let j3=0;
      if(Number.isFinite(s.bj)){
        if(s.bj<85)j3-=3.8e6*(1-s.bj/85);
        else if(s.bj<160)j3-=7e5*(1-s.bj/160);
      }
      if(s.bk>0)j3-=2.5e6*s.bk;
      if(j2>.42&&s.bb>1.2)j3-=Math.min(9e5,j2*3.5e5*s.bb);
      let zf=0;
      if(zc&&e.mag>0){
        const zg=Math.hypot(zc.x-n.x,zc.y-n.y)||1;
        const zh=(e.x*(zc.x-n.x)+e.y*(zc.y-n.y))/(e.mag*zg);
        const zi=Math.min(1,zd/Math.max(180,Math.min(w.width,w.height)*.42));
        const zj=Math.max(0,1-H*1.35);
        zf=zh*(900+5200*zi)*zj;
        if(zd<90)zf*=.18;
      }
      let E = s.ba * c + s.bb * l + d + p + M + b + h + x + j3 + zf;
      A[t].bd = E;
      A[t].be = e;
    }
    let rt = A[0];
    for (let t = 1; t < tt; t++) {
      if (A[t].bd > rt.bd) rt = A[t];
    }
    if(pathfinding&&rt&&Number.isFinite(rt.bd)){
      let z6=rt,z7=Math.max(1200,Math.abs(rt.bd)*.035);
      for(let z8=0;z8<tt;z8++){
        const z9=A[z8],za=Z[z8]?.bc;
        if(!z9||!za||za.ax||za.ba>0||z9.bd<rt.bd-z7||!z9.be)continue;
        const zb=z9.be.mag||1,zc=(z9.be.x*g.x+z9.be.y*g.y)/zb;
        const zd=z6.be?.mag||1,ze=(z6.be.x*g.x+z6.be.y*g.y)/zd;
        if(zc>ze+.08)z6=z9;
      }
      rt=z6;
    }
    let j4=null,j5=-1e30;
    const j6=Math.hypot(n._c||0,n._d||0);
    if(j6>.34||H>.48){
      for(let j7=0;j7<tt;j7++){
        const j8=A[j7],j9=Z[j7]?.bc;
        if(!j8||!j9||!j8.be||j9.ax||j9.ba>0||j9.bk>0)continue;
        let ja=j8.bd;
        if(Number.isFinite(j9.bj)&&j9.bj<120)ja-=2e6;
        const jb=j8.be.mag||1;
        const jc=(j8.be.x*B.x+j8.be.y*B.y)/jb;
        ja+=jc*1400;
        if(ja>j5){j5=ja;j4=j8}
      }
      if(j4){
        const jd=Z[A.indexOf(rt)]?.bc;
        if(!jd||jd.bk>0||(Number.isFinite(jd.bj)&&jd.bj<95))rt=j4;
      }
    }
    let pp=null;
    if(pathfinding&&S&&rt&&rt.be){
      const zf=Math.max(.18,N),zg=82+H*24;
      const zh=n.x+rt.be.x*zf*zg,zi=n.y+rt.be.y*zf*zg;
      const zj=b-zh,zk=_-zi,zl=Math.hypot(zj,zk)||1;
      const zm=Math.min(72,Math.max(34,P*.18));
      const zn=zh+zj/zl*zm,zo=zi+zk/zl*zm;
      pp=[
        {x:n.x,y:n.y},
        {x:n.x+(zh-n.x)*.46,y:n.y+(zi-n.y)*.46},
        {x:zh,y:zi},
        {x:zn,y:zo}
      ];
    }
    if (gg){gg.f=pp;gg.g=H;gg.h=O;gg.i=q;gg.j=j6;gg.k=rt?Z[A.indexOf(rt)]?.bc:null;gg.l=zc;gg.m=zd;}
    let ft = 0.18 + 0.82 * Math.pow(H, 1.5);
    if (pathfinding && pp) ft=Math.max(ft,.48);
    const je=gg?.k;
    if(je&&(je.bk>0||(Number.isFinite(je.bj)&&je.bj<110)))ft=Math.max(ft,.82);
    E.x += (rt.be.x - E.x) * ft;
    E.y += (rt.be.y - E.y) * ft;
    l += (et - l) * Math.max(0.2, ft);
    g.x = rt.be.x;
    g.y = rt.be.y;
    C(n, a, n.x + E.x * l, n.y + E.y * l);
  }
  function N() {
    if(!b||!w)return;
    b.clearRect(0,0,w.width,w.height);
    if(t&&gg&&d){
      const q=d.getBoundingClientRect(),a=gg.e;
      if(a?.getX&&a?.getY){
        const cv=(x,y)=>({
          x:q.left+a.getX(x)*q.width/d.width,
          y:q.top+a.getY(y)*q.height/d.height
        });
        const s0=cv(gg.a,gg.b),p0=cv(gg.c,gg.d);
        if([s0.x,s0.y,p0.x,p0.y].every(Number.isFinite)){
          const dx=p0.x-s0.x,dy=p0.y-s0.y,ds=Math.hypot(dx,dy);
          const th=gg.k,ttc=th&&Number.isFinite(th.bj)?th.bj:Infinity;
          const danger=ttc<95?2:ttc<160?1:0;
          b.save();
          // actual pos (if csp enabled)
          b.strokeStyle="rgba(255,255,255,.46)";
          b.lineWidth=1;
          const r=5,g=2;
          b.beginPath();
          b.moveTo(s0.x-r,s0.y-g);b.lineTo(s0.x-r,s0.y-r);b.lineTo(s0.x-g,s0.y-r);
          b.moveTo(s0.x+g,s0.y-r);b.lineTo(s0.x+r,s0.y-r);b.lineTo(s0.x+r,s0.y-g);
          b.moveTo(s0.x+r,s0.y+g);b.lineTo(s0.x+r,s0.y+r);b.lineTo(s0.x+g,s0.y+r);
          b.moveTo(s0.x-g,s0.y+r);b.lineTo(s0.x-r,s0.y+r);b.lineTo(s0.x-r,s0.y+g);
          b.stroke();

          // csp pred
          b.strokeStyle=danger===2?"rgba(255,105,105,.95)":danger===1?"rgba(245,190,100,.95)":"rgba(150,215,240,.92)";
          b.lineWidth=1.35;
          b.beginPath();b.arc(p0.x,p0.y,4.5,0,Math.PI*2);b.stroke();

          if(ds>2){
            b.strokeStyle="rgba(160,205,225,.22)";
            b.setLineDash([2,4]);
            b.lineWidth=1;
            b.beginPath();b.moveTo(s0.x,s0.y);b.lineTo(p0.x,p0.y);b.stroke();
            b.setLineDash([]);

            const an=Math.atan2(dy,dx);
            b.strokeStyle="rgba(165,220,240,.66)";
            b.beginPath();
            b.moveTo(p0.x+Math.cos(an)*6,p0.y+Math.sin(an)*6);
            b.lineTo(p0.x+Math.cos(an)*11,p0.y+Math.sin(an)*11);
            b.stroke();
          }

          if(danger){
            b.strokeStyle=danger===2?"rgba(255,100,100,.62)":"rgba(245,185,95,.48)";
            b.lineWidth=1;
            b.beginPath();b.arc(p0.x,p0.y,danger===2?9:8,0,Math.PI*2);b.stroke();
          }

          b.restore();
        }
        // goes to area center (can change if u want, this is just so it doesn't run into borders)
        if(gg.l&&gg.m>70){
          const c0=cv(gg.l.x,gg.l.y);
          if(Number.isFinite(c0.x)&&Number.isFinite(c0.y)){
            b.save();
            b.strokeStyle="rgba(255,255,255,.22)";
            b.lineWidth=1;
            b.beginPath();
            b.moveTo(c0.x-7,c0.y);b.lineTo(c0.x-3,c0.y);
            b.moveTo(c0.x+3,c0.y);b.lineTo(c0.x+7,c0.y);
            b.moveTo(c0.x,c0.y-7);b.lineTo(c0.x,c0.y-3);
            b.moveTo(c0.x,c0.y+3);b.lineTo(c0.x,c0.y+7);
            b.stroke();
            b.restore();
          }
        }
        // path selection
        if(pathfinding&&gg.f?.length>1){
          const pts=gg.f.map(v=>cv(v.x,v.y));
          if(pts.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y))){
            b.save();
            b.lineCap="round";
            b.lineJoin="round";

            b.strokeStyle="rgba(0,0,0,.38)";
            b.lineWidth=3;
            b.beginPath();b.moveTo(pts[0].x,pts[0].y);
            for(let i=1;i<pts.length;i++)b.lineTo(pts[i].x,pts[i].y);
            b.stroke();

            b.strokeStyle="rgba(238,244,247,.78)";
            b.lineWidth=1.35;
            b.beginPath();b.moveTo(pts[0].x,pts[0].y);
            for(let i=1;i<pts.length;i++)b.lineTo(pts[i].x,pts[i].y);
            b.stroke();

            const e=pts[pts.length-1],pr=pts[pts.length-2];
            const an=Math.atan2(e.y-pr.y,e.x-pr.x);
            b.fillStyle="rgba(238,244,247,.84)";
            b.beginPath();
            b.moveTo(e.x,e.y);
            b.lineTo(e.x-Math.cos(an-.48)*5.5,e.y-Math.sin(an-.48)*5.5);
            b.lineTo(e.x-Math.cos(an+.48)*5.5,e.y-Math.sin(an+.48)*5.5);
            b.closePath();b.fill();

            b.restore();
          }
        }
      }
    }

    if(t&&M.c){
      const x=M.a,y=M.b;
      b.save();
      b.beginPath();
      b.moveTo(x,y);b.lineTo(x,y+15);b.lineTo(x+4,y+12);b.lineTo(x+7.5,y+19);
      b.lineTo(x+10,y+17.7);b.lineTo(x+6.5,y+11);b.lineTo(x+11.5,y+11);
      b.closePath();
      b.fillStyle="rgba(255,255,255,.96)";b.fill();
      b.strokeStyle="rgba(18,18,22,.9)";b.lineWidth=1.05;b.stroke();
      b.restore();
    }
  }
  function O() {
    if (!t) {
      gg = null;
      N();
      return;
    }
    const e = F();
    if (!e || !e.gameState?.entities) return;
    const n = performance.now();
    const s = e.player || e.gameState.areaInfo?.self?.entity;
    if (!s) return;
    q(s, n, e.gameState.serverTickRate || 60);
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
    const z3=rr(s),es=e.gameState.entities;
    for(const t in es){
      if(+t<0)continue;
      const o=es[t];
      if(!o||!o.isEnemy)continue;
      const z2=rr(o);
      if(Math.abs(z2.x-z3.x)>280||Math.abs(z2.y-z3.y)>280)continue;
      q(o,n,e.gameState.serverTickRate||60);
      i.push(o);
    }
    const z4 = e.gameState.latestServerSelfEntity || s;
    const z5 = rr(s);
    gg = { a: z4.x, b: z4.y, c: z5.x, d: z5.y, e: e.camera, f: [] };
    Y(s, i, o, e.camera);
    N();
  }
  const k=()=>{
    const a=performance.now();
    if(a-gh>=33){gh=a;O();}else if(t)N();
    requestAnimationFrame(k);
  };
  requestAnimationFrame(k);
})();

// ==UserScript==
// @name         Evades
// @namespace    https://evades.io/
// @version      :
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

const ms=40; //ms (auto override if csp is on)
const csp=true; //if client sided prediction is on turn this on
const pathfinding=true; //may lag game
// do not change anything below if you do not know what you are doing


(() => {
  "use strict";
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
  let lastSafe={x:1,y:0,time:0};
  let gg = null;
  let gh=0;

  const vis={labels:true,trajectories:true,star:true,sparking:true,growing:true,crystalWall:true,danger:true,playerRing:false,routeTrail:true};
  const tasCfg={
    safety:+localStorage.getItem("_q1")||7,
    horizon:+localStorage.getItem("_q2")||460,
    reaction:+localStorage.getItem("_q3")||125,
    wall:+localStorage.getItem("_q4")||10,
    response:+localStorage.getItem("_q5")||1,
    stability:+localStorage.getItem("_q6")||1
  };
  const saveTasCfg=()=>{
    localStorage.setItem("_q1",tasCfg.safety);
    localStorage.setItem("_q2",tasCfg.horizon);
    localStorage.setItem("_q3",tasCfg.reaction);
    localStorage.setItem("_q4",tasCfg.wall);
    localStorage.setItem("_q5",tasCfg.response);
    localStorage.setItem("_q6",tasCfg.stability);
  };
  let settingsUI=null;
  let gameController=null;
  let activeTab="tas";
  let uiUnloaded=false;
  const COSMETIC_FRAMES={"gold-crown":[1011,607,200,200],"silver-crown":[1011,1011,200,200],"bronze-crown":[809,1269,200,200],"santa-hat":[729,1731,50,50],"gold-wreath":[521,1731,50,50],"spring-wreath":[781,1731,50,50],"autumn-wreath":[1717,1197,50,50],"winter-wreath":[1769,885,50,50],"summer-wreath":[1457,1717,50,50],"summer-olympics-wreath":[1405,1717,50,50],"summer-olympics-wreath-2":[1353,1717,50,50],"winter-olympics-wreath":[1769,833,50,50],"winter-olympics-wreath-2":[1769,729,50,50],"winter-olympics-wreath-3":[1769,781,50,50],"halo":[1041,1731,50,50],"blue-santa-hat":[1717,1457,50,50],"flames":[209,1733,50,50],"blue-flames":[1717,1249,50,50],"stars":[885,1731,50,50],"witch-hat":[1769,989,50,50],"sunglasses":[1509,1717,50,50],"flower-headband":[417,1733,50,50],"fedora":[1621,409,100,100],"pirate-hat":[625,1731,50,50],"fruit-bowl":[469,1733,50,50],"leaf-headband":[573,1731,50,50],"night-sky":[1011,809,200,200],"commemorative-lily":[1621,307,100,100],"rose-wreath":[677,1731,50,50],"gold-jewels":[1769,1195,48,48],"silver-jewels":[1769,1245,48,48],"bronze-jewels":[1769,1145,48,48],"sticky-coat":[1093,1717,50,50],"toxic-coat":[1775,625,50,50],"orbit-ring":[1621,511,100,100],"clouds":[105,1733,50,50],"storm-clouds":[1145,1717,50,50],"tuxedo":[1775,677,50,50],"doughnut":[157,1733,50,50],"stardust":[833,1731,50,50],"broomstick":[1717,1509,50,50],"snowglobe":[925,1083,64,64],"cat-onesie":[1029,203,200,200],"stick":[1717,1717,50,50],"void-grasp":[1621,613,100,100],"crystal-form":[1029,405,200,200]};
  const COSMETIC_HATS=["none","gold-crown","silver-crown","bronze-crown","santa-hat","gold-wreath","spring-wreath","autumn-wreath","winter-wreath","summer-wreath","summer-olympics-wreath","summer-olympics-wreath-2","winter-olympics-wreath","winter-olympics-wreath-2","winter-olympics-wreath-3","halo","blue-santa-hat","flames","blue-flames","stars","witch-hat","sunglasses","flower-headband","fedora","pirate-hat","fruit-bowl","leaf-headband","night-sky","commemorative-lily","rose-wreath","gold-jewels","silver-jewels","bronze-jewels"];
  const COSMETIC_BODIES=["none","sticky-coat","toxic-coat","orbit-ring","clouds","storm-clouds","tuxedo","doughnut","stardust","broomstick","snowglobe","cat-onesie","stick","void-grasp","crystal-form"];
  const cosmeticState={
    hat:localStorage.getItem("evadesTasHat")||"none",
    body:localStorage.getItem("evadesTasBody")||"none",
    hatScale:+localStorage.getItem("evadesTasHatScale")||1,
    bodyScale:+localStorage.getItem("evadesTasBodyScale")||1,
    hatY:+localStorage.getItem("evadesTasHatY")||0,
    bodyY:+localStorage.getItem("evadesTasBodyY")||0
  };
  let cosmeticAtlas=null;
  let cosmeticAtlasState="idle";
  let cosmeticAtlasUrlUsed="";

  function cosmeticAtlasCandidates(){
    const script=[...document.scripts].map(x=>x.src).find(x=>/index\.[\w-]+\.js(?:\?|$)/.test(x));
    const out=[];
    if(script){
      try{out.push(new URL("packed-texture-0.19954814.webp",script).href)}catch(_){}
      try{out.push(new URL("./packed-texture-0.19954814.webp",script).href)}catch(_){}
    }
    out.push(new URL("/packed-texture-0.19954814.webp",location.origin).href);
    out.push(new URL("packed-texture-0.19954814.webp",location.href).href);
    return [...new Set(out)];
  }

  function cosmeticAtlasUrl(){
    return cosmeticAtlasUrlUsed||cosmeticAtlasCandidates()[0];
  }

  function ensureCosmeticAtlas(){ // unused.
    if(cosmeticAtlas&&cosmeticAtlasState==="ready")return cosmeticAtlas;
    if(cosmeticAtlas&&cosmeticAtlasState==="loading")return cosmeticAtlas;

    const urls=cosmeticAtlasCandidates();
    cosmeticAtlasState="loading";
    let idx=0;

    const tryNext=()=>{
      if(idx>=urls.length){
        cosmeticAtlasState="failed";
        return;
      }
      const url=urls[idx++];
      const img=new Image();
      img.decoding="async";
      img.onload=()=>{
        cosmeticAtlas=img;
        cosmeticAtlasUrlUsed=url;
        cosmeticAtlasState="ready";
      };
      img.onerror=()=>{
        console.warn("[tas] failed cosmetics:",url);
        tryNext();
      };
      cosmeticAtlas=img;
      cosmeticAtlasUrlUsed=url;
      img.src=url;
    };

    tryNext();
    return cosmeticAtlas;
  }

  function saveCosmeticState(){
    localStorage.setItem("evadesTasHat",cosmeticState.hat);
    localStorage.setItem("evadesTasBody",cosmeticState.body);
    localStorage.setItem("evadesTasHatScale",cosmeticState.hatScale);
    localStorage.setItem("evadesTasBodyScale",cosmeticState.bodyScale);
    localStorage.setItem("evadesTasHatY",cosmeticState.hatY);
    localStorage.setItem("evadesTasBodyY",cosmeticState.bodyY);
  }
  function cosmeticsActive(){
    return cosmeticState.hat!=="none"||cosmeticState.body!=="none";
  }

  function getCosmeticLiveState(){
    let state=null;
    try{state=F()}catch(_){}

    const ctrl=gameController;
    const ent=
      state?.player||
      ctrl?.gameState?.areaInfo?.self?.entity||
      null;

    const camera=
      state?.camera||
      ctrl?.renderer?.camera||
      gg?.e||
      null;

    if(!ent||!camera)return null;

    let x,y;
    if(csp&&Number.isFinite(ent.predictedX)&&Number.isFinite(ent.predictedY)){
      x=ent.predictedX;
      y=ent.predictedY;
    }else{
      const pairs=[
        ["renderX","renderY"],
        ["displayX","displayY"],
        ["interpolatedX","interpolatedY"],
        ["x","y"]
      ];
      for(const [kx,ky] of pairs){
        if(Number.isFinite(+ent[kx])&&Number.isFinite(+ent[ky])){
          x=+ent[kx];
          y=+ent[ky];
          break;
        }
      }
    }

    if(!Number.isFinite(x)||!Number.isFinite(y))return null;
    return {x,y,camera,ent};
  }

  function cosmeticName(id){
    if(id==="none")return "None";
    return id.split("-").map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(" ");
  }

  function ensureRubik(){
    if(document.getElementById("tas-rubik-font"))return;
    const l=document.createElement("link");
    l.id="tas-rubik-font";
    l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Rubik:wght@400&display=swap";
    document.head.appendChild(l);
  }

  const tabImage=name=>{
    const images={
      tas:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="#a6adb7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M3 12h4l2-5 4 10 2-5h6"/></svg>`,
      cosmetic:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="#a6adb7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="m12 3 1.35 4.25L17.5 8.6l-4.15 1.35L12 14.2l-1.35-4.25L6.5 8.6l4.15-1.35L12 3Zm6.2 11.2.7 2.15 2.1.7-2.1.7-.7 2.15-.7-2.15-2.1-.7 2.1-.7.7-2.15Z"/></svg>`,
      performance:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="#a6adb7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 18a8 8 0 1 1 16 0M12 14l4-4"/><circle cx="12" cy="18" r="1" fill="#a6adb7"/></svg>`
    };
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(images[name]||images.tas)}`;
  };

  const SETTING_ALIASES={
    profanityFiltering:["profanityFiltering","profanity_filtering"],
    enableMouseMovement:["enableMouseMovement","enable_mouse_movement"],
    toggleMouseMovement:["toggleMouseMovement","toggle_mouse_movement"],
    enemyOutlines:["enemyOutlines","enemy_outlines"],
    displayChat:["displayChat","display_chat"],
    displayLeaderboard:["displayLeaderboard","display_leaderboard"],
    displayLeaderboardHeroes:["displayLeaderboardHeroes","display_leaderboard_heroes"],
    displayTimer:["displayTimer","display_timer"],
    tileMode:["tileMode","tile_mode"],
    reconnection:["reconnection"],
    confetti:["confetti"],
    abilityParticles:["abilityParticles","ability_particles"],
    cosmeticEffects:["cosmeticEffects","cosmetic_effects"],
    joystickDeadzone:["joystickDeadzone","joystick_deadzone"],
    legacySpeedUnits:["legacySpeedUnits","legacy_speed_units"],
    fadingEffects:["fadingEffects","fading_effects"],
    pelletTransparency:["pelletTransparency","pellet_transparency"],
    backgroundObjects:["backgroundObjects","background_objects"],
    displayEnergyBars:["displayEnergyBars","display_energy_bars"],
    enemyProjectileOutlines:["enemyProjectileOutlines","enemy_projectile_outlines"],
    effectBlending:["effectBlending","effect_blending"],
    lightingMode:["lightingMode","lighting_mode"],
    minimapEntityScale:["minimapEntityScale","minimap_entity_scale"],
    interfaceScale:["interfaceScale","interface_scale"],
    detailedHeroCardStats:["detailedHeroCardStats","detailed_hero_card_stats"],
    displayPerformanceStats:["displayPerformanceStats","display_performance_stats"],
    displayGameplayHints:["displayGameplayHints","display_gameplay_hints"],
    enemiesOnMinimap:["enemiesOnMinimap","enemies_on_minimap"],
    autoPrepareAbilities:["autoPrepareAbilities","auto_prepare_abilities"],
    quickReset:["quickReset","quick_reset"],
    clientPrediction:["clientPrediction","client_prediction"],
    unlockFps:["unlockFps","unlock_fps"]
  };

  function clientSettings(){
    return gameController?.state?.newSettings||
           gameController?.state?.settings||
           gameController?.gameState?.settingsInput||
           gameController?.gameState?.settings||
           null;
  }

  function resolveSettingKey(name){
    const st=clientSettings();
    const aliases=SETTING_ALIASES[name]||[name];
    if(st){
      for(const k of aliases)if(Object.prototype.hasOwnProperty.call(st,k))return k;
    }
    return aliases[0];
  }

  function getClientSetting(name,fallback=null){
    const st=clientSettings();
    if(!st)return fallback;
    const aliases=SETTING_ALIASES[name]||[name];
    for(const k of aliases){
      if(Object.prototype.hasOwnProperty.call(st,k))return st[k];
    }
    return fallback;
  }

  function hasClientSetting(name){
    const st=clientSettings();
    if(!st)return false;
    const aliases=SETTING_ALIASES[name]||[name];
    return aliases.some(k=>Object.prototype.hasOwnProperty.call(st,k));
  }

  function setClientSetting(name,value){
    const c=gameController;
    if(!c)return false;
    const key=resolveSettingKey(name);
    try{
      if(typeof c.updateSetting==="function"){
        c.updateSetting(key,value);
        return true;
      }
      const st=clientSettings();
      if(!st)return false;
      const next={...st,[key]:value};
      c.updateSettings?.(next);
      c.setState?.({newSettings:next});
      if(c.gameState)c.gameState.settingsInput=next;
      return true;
    }catch(_){
      return false;
    }
  }

  function setPerfPreset(v){
    if(v==="low"){
      PERF.visualInterval=75;PERF.maxLabels=24;PERF.maxTrajectories=10;PERF.maxDangerGhosts=5;PERF.maxSpecials=10;PERF.nearRange=320;PERF.farRange=410;
    }else if(v==="high"){
      PERF.visualInterval=34;PERF.maxLabels=52;PERF.maxTrajectories=24;PERF.maxDangerGhosts=10;PERF.maxSpecials=24;PERF.nearRange=400;PERF.farRange=520;
    }else{
      PERF.visualInterval=50;PERF.maxLabels=40;PERF.maxTrajectories=18;PERF.maxDangerGhosts=8;PERF.maxSpecials=18;PERF.nearRange=360;PERF.farRange=470;
    }
  }
  const entityNames=new Map([[23,"CRYSTAL_WALL_ENEMY"],[69,"GROWING_ENEMY"],[200,"SPARKING_ENEMY"],[201,"SPARKING_ENEMY_PROJECTILE"]]);
  const labelCache=new Map();
  let perfFrame=0;
  let lastVisualBuild=0;
  let lastVisualState=null;

  const PERF={
    visualInterval:50,
    maxLabels:40,
    maxTrajectories:18,
    maxDangerGhosts:8,
    maxSpecials:18,
    nearRange:360,
    farRange:470,
  };

  const niceType=n=>String(n||"ENEMY")
    .replace(/_ENEMY_PROJECTILE$/," PROJECTILE")
    .replace(/_PROJECTILE$/," PROJECTILE")
    .replace(/_ENEMY$/,"")
    .replaceAll("_"," ")
    .toLowerCase()
    .replace(/\b\w/g,c=>c.toUpperCase());

  function enemyLabel(en){
    const id=et(en);
    if(labelCache.has(id))return labelCache.get(id);

    let n=entityNames.get(id);
    if(!n){
      const raw=en?.enemyTypeName||en?.typeName||en?.entityName||en?.enemyType||en?.constructor?.name;
      if(typeof raw==="string"&&raw&&!/^Object$/i.test(raw))n=raw;
    }
    if(!n&&id>=0)n=`ENEMY_${id}`;

    const label=niceType(n||"Enemy");
    labelCache.set(id,label);
    return label;
  }

  async function loadEntityNames(){
    try{
      const html=await fetch(location.href,{cache:"no-store"}).then(r=>r.text());
      const found=[...html.matchAll(/(?:src|href)=["']([^"']*(?:index|app)\.[a-z0-9]+\.js[^"']*)["']/gi)];
      if(!found.length)return;
      const js=new URL(found[0][1],location.href).href;
      const code=await fetch(js,{cache:"no-store"}).then(r=>r.text());
      const m=code.match(/EntityType:\{([^}]{1000,30000})\}/);
      if(!m)return;
      for(const x of m[1].matchAll(/([A-Z][A-Z0-9_]+):(\d+)/g))entityNames.set(+x[2],x[1]);
    }catch(_){}
  }

  function makeSettings(force=false){
    ensureRubik();
    if(uiUnloaded)return null;

    if(force&&settingsUI){
      try{settingsUI._shade?.remove()}catch(_){ }
      try{settingsUI.remove()}catch(_){ }
      settingsUI=null;
    }
    if(settingsUI)return settingsUI;

    const backdrop=document.createElement("div");
    Object.assign(backdrop.style,{
      position:"fixed",inset:"0",zIndex:"10000000",display:"none",opacity:"0",
      background:"rgba(4,5,7,.42)",backdropFilter:"blur(2px)",transition:"opacity .16s ease"
    });

    const panel=document.createElement("div");
    panel.id="_x7q2";
    Object.assign(panel.style,{
      position:"fixed",left:"50%",top:"50%",transform:"translate(-50%,-50%) scale(.985)",
      zIndex:"10000001",width:"560px",height:"390px",display:"none",overflow:"hidden",opacity:"0",
      background:"rgba(16,18,21,.985)",border:"1px solid rgba(255,255,255,.08)",
      borderRadius:"16px",color:"#eceef1",
      fontFamily:"Rubik,Arial,sans-serif",fontWeight:"400",
      boxShadow:"0 26px 80px rgba(0,0,0,.50)",userSelect:"none",
      transition:"opacity .16s ease, transform .16s cubic-bezier(.2,.8,.2,1)"
    });

    const toggleRow=(k,title)=>`
      <label class="_r">
        <span>${title}</span>
        <input data-local="${k}" type="checkbox" ${vis[k]?"checked":""}>
      </label>`;

    const tasSlider=(k,title,min,max,step,suffix="")=>`
      <label class="_sr">
        <div class="_sl"><span>${title}</span><output>${tasCfg[k]}${suffix}</output></div>
        <input data-tas="${k}" data-suffix="${suffix}" type="range" min="${min}" max="${max}" step="${step}" value="${tasCfg[k]}">
      </label>`;

    const tabs=[
      ["tas","TAS"],
      ["cosmetic","Cosmetics"],
      ["performance","Performance"]
    ];


    const makeCosmeticGrid=(kind,items)=>{
      const atlas=cosmeticAtlasCandidates()[0];
      return `<div class="_cg">${items.map(id=>{
        if(id==="none")return `<button class="_ci ${cosmeticState[kind]===id?"_sel":""}" data-cosmetic-kind="${kind}" data-cosmetic-id="none" title="None"><span class="_none">×</span></button>`;
        const frame=COSMETIC_FRAMES[id];
        if(!frame)return "";
        const [frameX,frameY,frameWidth,frameHeight]=frame;
        const previewScale=Math.min(42/frameWidth,42/frameHeight);
        return `<button class="_ci ${cosmeticState[kind]===id?"_sel":""}" data-cosmetic-kind="${kind}" data-cosmetic-id="${id}" title="${cosmeticName(id)}">
          <span class="_cs" style="background-image:url('${atlas}');background-position:-${frameX*previewScale}px -${frameY*previewScale}px;background-size:${1826*previewScale}px ${1784*previewScale}px;width:${frameWidth*previewScale}px;height:${frameHeight*previewScale}px"></span>
          <small>${cosmeticName(id)}</small>
        </button>`;
      }).join("")}</div>`;
    };

    panel.innerHTML=`
      <style>
        #_x7q2 *{box-sizing:border-box;font-family:Rubik,Arial,sans-serif;font-weight:400}
        #_x7q2 button,#_x7q2 input{font:inherit}
        #_x7q2._o{opacity:1!important;transform:translate(-50%,-50%) scale(1)!important}
        #_x7q2 ._s{height:100%;display:flex;background:#101215}
        #_x7q2 ._n{width:50px;padding:10px 7px;background:#0b0d0f;border-right:1px solid #20242a;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
        #_x7q2 ._t{width:34px;height:34px;border:0;border-radius:8px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:2px 0;padding:0;transition:background .12s ease,transform .12s ease}
        #_x7q2 ._t:hover{background:#191d22;transform:translateY(-1px)}
        #_x7q2 ._t._a{background:#242a31}
        #_x7q2 ._t img{width:18px;height:18px;display:block;opacity:.62;object-fit:contain;transition:opacity .12s ease,filter .12s ease,transform .12s ease}
        #_x7q2 ._t:hover img{opacity:.9;transform:scale(1.04)}
        #_x7q2 ._t._a img{opacity:1;filter:brightness(1.3)}
        #_x7q2 ._m{flex:1;min-width:0;display:flex;flex-direction:column}
        #_x7q2 ._h{height:47px;display:flex;align-items:center;padding:0 13px;border-bottom:1px solid #20242a}
        #_x7q2 ._ttl{font-size:12px;color:#eef1f4}
        #_x7q2 ._ha{margin-left:auto;display:flex;gap:5px}
        #_x7q2 ._hb{width:27px;height:27px;border-radius:7px;border:1px solid #292e35;background:#15191d;color:#9ca3ad;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;line-height:1;transition:background .12s ease,color .12s ease,border-color .12s ease}
        #_x7q2 ._hb:hover{background:#20252b;color:#fff}
        #_x7q2 ._hb._x:hover{background:#281b1e;border-color:#513136}
        #_x7q2 ._p{display:none;overflow:auto;flex:1;padding:13px;scrollbar-width:none;-ms-overflow-style:none;animation:_pg .14s ease}
        #_x7q2 ._p._a{display:block}
        #_x7q2 ._p::-webkit-scrollbar{display:none;width:0;height:0}
        #_x7q2 ._g{display:grid;grid-template-columns:1fr 1fr;gap:6px}
        #_x7q2 ._r{height:43px;border:1px solid #252a31;border-radius:8px;background:#15191d;display:flex;align-items:center;padding:0 10px;transition:background .12s ease,border-color .12s ease}
        #_x7q2 ._r:hover{background:#191d22;border-color:#30363e}
        #_x7q2 ._r span{font-size:10px;color:#e2e5e9}
        #_x7q2 ._r input{margin-left:auto}
        #_x7q2 input[type=checkbox]{appearance:none;width:30px;height:16px;border-radius:8px;border:1px solid #363b43;background:#20242a;position:relative;cursor:pointer;transition:.12s;flex:0 0 auto}
        #_x7q2 input[type=checkbox]:after{content:"";position:absolute;width:10px;height:10px;border-radius:50%;left:2px;top:2px;background:#737a83;transition:.12s}
        #_x7q2 input[type=checkbox]:checked{background:#d9dee5;border-color:#d9dee5}
        #_x7q2 input[type=checkbox]:checked:after{left:16px;background:#15181b}
        #_x7q2 ._sep{height:1px;background:#20242a;margin:12px 0}
        #_x7q2 ._sg{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        #_x7q2 ._sr{min-height:58px;border:1px solid #252a31;border-radius:8px;background:#15191d;padding:9px 10px;display:block}
        #_x7q2 ._sl{display:flex;align-items:center;gap:8px;margin-bottom:8px}
        #_x7q2 ._sl span{font-size:9px;color:#dfe3e7}
        #_x7q2 ._sl output{margin-left:auto;font-size:8px;color:#8d949d}
        #_x7q2 input[type=range]{appearance:none;width:100%;height:3px;border-radius:3px;background:#2a3037;outline:none}
        #_x7q2 input[type=range]::-webkit-slider-thumb{appearance:none;width:12px;height:12px;border-radius:50%;background:#d9dee5;cursor:pointer}
        #_x7q2 input[type=range]::-moz-range-thumb{width:12px;height:12px;border:0;border-radius:50%;background:#d9dee5;cursor:pointer}
        #_x7q2 ._perf{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
        #_x7q2 ._pb{height:35px;border-radius:8px;background:#15191d;border:1px solid #272c33;color:#747b84;cursor:pointer;font-size:9px;transition:background .12s ease,color .12s ease,border-color .12s ease}
        #_x7q2 ._pb:hover,#_x7q2 ._pb._a{background:#242a31;color:#fff;border-color:#3a414a}
        #_x7q2 ._cb{margin-bottom:14px}
        #_x7q2 ._sh{font-size:9px;color:#858c95;margin:0 0 7px 1px}
        #_x7q2 ._cg{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}
        #_x7q2 ._ci{height:76px;border-radius:8px;border:1px solid #242a30;background:#15191d;color:#a3a9b1;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;overflow:hidden;padding:6px 4px;transition:background .12s ease,color .12s ease,border-color .12s ease,transform .12s ease}
        #_x7q2 ._ci:hover{background:#1b2025;color:#f2f4f6;border-color:#343b44;transform:translateY(-1px)}
        #_x7q2 ._ci._sel{background:#252b32;color:#fff;border-color:#515a65}
        #_x7q2 ._ci small{font-size:8px;line-height:1.15;margin:0;width:100%;max-height:19px;white-space:normal;text-align:center;overflow:hidden;color:inherit}
        #_x7q2 ._cs{display:block;background-repeat:no-repeat;flex:0 0 auto}
        #_x7q2 ._none{font-size:20px;color:#747b84;line-height:26px}
        @keyframes _pg{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
      </style>

      <div class="_s">
        <aside class="_n">
          ${tabs.map(([tabId,label])=>`<button class="_t ${tabId===activeTab?"_a":""}" data-tab="${tabId}" title="${label}"><img src="${tabImage(tabId)}" alt=""></button>`).join("")}
        </aside>

        <main class="_m">
          <header class="_h">
            <div class="_ttl">TAS</div>
            <div class="_ha">
              <button class="_hb" data-ui-action="minimize" title="Minimize">−</button>
              <button class="_hb _x" data-ui-action="unload" title="Unload">×</button>
            </div>
          </header>

          <section class="_p ${activeTab==="tas"?"_a":""}" data-page="tas">
            <div class="_g">
              ${toggleRow("labels","Enemy labels")}
              ${toggleRow("trajectories","Paths")}
              ${toggleRow("danger","Danger")}
              ${toggleRow("routeTrail","Route trail")}
              ${toggleRow("star","Teleport")}
              ${toggleRow("growing","Growing")}
              ${toggleRow("sparking","Sparking")}
              ${toggleRow("crystalWall","Crystal wall")}
            </div>
            <div class="_sep"></div>
            <div class="_sg">
              ${tasSlider("safety","Safety margin",0,24,1,"px")}
              ${tasSlider("wall","Wall margin",2,30,1,"px")}
              ${tasSlider("horizon","Lookahead",180,800,20,"ms")}
              ${tasSlider("reaction","Reaction",70,220,5,"ms")}
              ${tasSlider("response","Steering",.45,1.35,.05,"x")}
              ${tasSlider("stability","Stability",0,2,.1,"x")}
            </div>
          </section>

          <section class="_p ${activeTab==="cosmetic"?"_a":""}" data-page="cosmetic">
            <div class="_cb">
              <div class="_sh">Hat</div>
              ${makeCosmeticGrid("hat",COSMETIC_HATS)}
            </div>
            <div class="_cb">
              <div class="_sh">Body</div>
              ${makeCosmeticGrid("body",COSMETIC_BODIES)}
            </div>
          </section>

          <section class="_p ${activeTab==="performance"?"_a":""}" data-page="performance">
            <div class="_perf">
              <button class="_pb" data-perf="low">Low</button>
              <button class="_pb _a" data-perf="balanced">Balanced</button>
              <button class="_pb" data-perf="high">High</button>
            </div>
          </section>
        </main>
      </div>`;

    const tabTitles={tas:"TAS",cosmetic:"Cosmetics",performance:"Performance"};

    const setTab=id=>{
      activeTab=id;
      panel.querySelectorAll("._t").forEach(x=>x.classList.toggle("_a",x.dataset.tab===id));
      panel.querySelectorAll("._p").forEach(x=>x.classList.toggle("_a",x.dataset.page===id));
      panel.querySelector("._ttl").textContent=tabTitles[id]||"TAS";
    };

    const isMenuOpen=()=>panel.style.display!=="none"&&panel.classList.contains("_o");

    const openMenu=(tab=null)=>{
      if(tab)setTab(tab);
      backdrop.style.display="block";
      panel.style.display="block";
      requestAnimationFrame(()=>{
        backdrop.style.opacity="1";
        panel.classList.add("_o");
      });
    };

    const closeMenu=()=>{
      panel.classList.remove("_o");
      backdrop.style.opacity="0";
      setTimeout(()=>{
        if(!panel.classList.contains("_o")){
          panel.style.display="none";
          backdrop.style.display="none";
        }
        },170);
    };

    const unloadMenu=()=>{
      uiUnloaded=true;
      closeMenu();
      setTimeout(()=>{
        try{backdrop.remove()}catch(_){ }
        try{panel.remove()}catch(_){ }
        if(settingsUI===panel)settingsUI=null;
      },175);
    };

    panel.querySelectorAll("[data-tab]").forEach(tabButton=>tabButton.onclick=()=>setTab(tabButton.dataset.tab));
    panel.querySelector('[data-ui-action="minimize"]').onclick=closeMenu;
    panel.querySelector('[data-ui-action="unload"]').onclick=unloadMenu;

    panel.addEventListener("change",event=>{
      const target=event.target;
      if(target.dataset.local){vis[target.dataset.local]=!!target.checked;return}
      if(target.dataset.game){setClientSetting(target.dataset.game,!!target.checked);return}
      if(target.dataset.gameEnum){setClientSetting(target.dataset.gameEnum,+target.value);return}
      if(target.dataset.gameFloat){
        const value=+target.value;
        setClientSetting(target.dataset.gameFloat,value);
        const output=target.parentElement?.querySelector("output");
        if(output)output.value=value.toFixed(2);
      }
    });

    panel.addEventListener("input",event=>{
      const target=event.target;
      if(target.dataset.tas){
        const key=target.dataset.tas;
        tasCfg[key]=+target.value;
        saveTasCfg();
        const output=target.parentElement?.querySelector("output");
        if(output)output.value=target.value+(target.dataset.suffix||"");
        return;
      }
      if(target.dataset.gameFloat){
        const output=target.parentElement?.querySelector("output");
        if(output)output.value=(+target.value).toFixed(2);
      }
    });

    panel.querySelectorAll("[data-perf]").forEach(button=>button.onclick=()=>{
      setPerfPreset(button.dataset.perf);
      panel.querySelectorAll("[data-perf]").forEach(option=>option.classList.toggle("active",option===button));
    });

    ensureCosmeticAtlas();

    panel.querySelectorAll("[data-cosmetic-kind]").forEach(button=>button.onclick=()=>{
      const category=button.dataset.cosmeticKind;
      const cosmeticId=button.dataset.cosmeticId;
      cosmeticState[category]=cosmeticId;
      saveCosmeticState();
      panel.querySelectorAll(`[data-cosmetic-kind="${category}"]`).forEach(option=>option.classList.toggle("selected",option===button));
      ensureCosmeticAtlas();
    });

    backdrop.addEventListener("mousedown",closeMenu);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    settingsUI=panel;
    settingsUI._shade=backdrop;
    settingsUI._close=closeMenu;
    settingsUI._open=openMenu;
    settingsUI._unload=unloadMenu;
    settingsUI._showTab=setTab;
    settingsUI._isOpen=isMenuOpen;
    setTab(activeTab);
    return panel;
  }

  loadEntityNames();
  function rr(t) {
    return csp && Number.isFinite(t?.predictedX) && Number.isFinite(t?.predictedY)
      ? { x: t.predictedX, y: t.predictedY }
      : { x: t?.x || 0, y: t?.y || 0 };
  }
  const SPARKING_ENEMY=200,SPARKING_PROJECTILE=201;
  const GROWING_ENEMY=69,CRYSTAL_WALL_ENEMY=23;
  const STAR_ENEMY=210,TELEPORTING_ENEMY=218;
  const CHARGING_ENEMY=10,DASHER_ENEMY=29,LUNGING_ENEMY=99;
  const SPIRAL_ENEMY=206,TURNING_ENEMY=225,WAVY_ENEMY=241,ZIGZAG_ENEMY=247;
  const PREDICTIVE_TYPES=new Set([
    STAR_ENEMY,TELEPORTING_ENEMY,CHARGING_ENEMY,DASHER_ENEMY,LUNGING_ENEMY,
    SPIRAL_ENEMY,TURNING_ENEMY,WAVY_ENEMY,ZIGZAG_ENEMY
  ]);

  function isProjectile(en){
    const n=entityNames.get(et(en))||"";
    return n.includes("PROJECTILE");
  }

  function linearPreview(en,horizon=360,step=120){
    const p=rr(en);
    let x=p.x,y=p.y,vx=en._c||0,vy=en._d||0;
    const ax=en._e||0,ay=en._f||0;
    const pts=[{x,y,t:0}];

    for(let tm=step;tm<=horizon;tm+=step){
      x+=vx*step+.5*ax*step*step;
      y+=vy*step+.5*ay*step*step;
      vx+=ax*step;
      vy+=ay*step;
      pts.push({x,y,t:tm});
    }
    return pts;
  }

  function teleportPreview(en,horizon=850){
    const p=rr(en);
    let vx=en._c||0,vy=en._d||0;
    let vm=Math.hypot(vx,vy);
    if(vm<1e-5){
      const rvx=+en.velocityX||0,rvy=+en.velocityY||0;
      vm=Math.hypot(rvx,rvy);
      if(vm>1e-5){vx=rvx;vy=rvy;}
    }
    if(vm<1e-5)return [];
    vx/=vm;vy/=vm;

    const star=et(en)===STAR_ENEMY;
    if(star){vx=-vx;vy=-vy;}

    const dist=Math.max(0,+en.teleportDistance||vm||0);
    let wait=Math.max(0,+en.pauseTime||0);
    const interval=Math.max(1,+en.pauseInterval||wait||1);
    if(!dist||!Number.isFinite(wait))return [];

    let x=p.x,y=p.y,t=0;
    const pts=[{x,y,t:0,teleport:false}];
    let loops=0;

    while(wait<=horizon&&loops<8){
      t=wait;
      x+=vx*dist;y+=vy*dist;
      pts.push({x,y,t,teleport:true});
      if(star){vx=-vx;vy=-vy;}
      wait+=interval;
      loops++;
    }
    return pts;
  }
  const spModels=new Map();
  const growModels=new Map();

  function isGrowing(t){ return et(t)===GROWING_ENEMY; }
  function isCrystalWall(t){ return et(t)===CRYSTAL_WALL_ENEMY; }

  function crystalWallGeometry(cw,advance=0){
    const raw=cw?.crystalWallNodes;
    if(!raw||!raw.length)return [];

    const total=Math.max(0,+cw.crystalWallGrowthTotal||0);
    const left=Math.max(0,+cw.crystalWallGrowthLeft||0);
    const duration=Math.max(1,+cw.crystalWallGrowthDuration||1);
    const harmfulDelay=Math.max(0,+cw.crystalWallHarmfulDelay||0);
    const progress=(total-left)+advance;

    const available=Math.floor(raw.length/5);
    const count=Math.max(0,Math.min(+cw.crystalWallCount||available,available,20));
    const nodes=[];

    for(let ni=0;ni<count;ni++){
      const j=ni*5;
      const x=+raw[j],y=+raw[j+1],r=+raw[j+2],start=+raw[j+3],parent=+raw[j+4];
      if(![x,y,r,start,parent].every(Number.isFinite))break;
      nodes.push({x,y,r,start,parent});
    }

    const offsets=[],radii=[],result=[];
    for(let ni=0;ni<nodes.length;ni++){
      const node=nodes[ni];
      const elapsed=progress-node.start;
      const frac=elapsed>0?Math.min(elapsed/duration,1):0;
      const radius=Math.max(0,node.r*frac);

      let ox=0,oy=0;
      if(ni!==0&&node.parent!==-1&&nodes[node.parent]){
        const par=nodes[node.parent];
        const po=offsets[node.parent]||{x:0,y:0};
        const pr=par.r;
        const currentParentRadius=radii[node.parent]||0;
        let dx=node.x-par.x,dy=node.y-par.y;
        const dist=Math.hypot(dx,dy);
        if(dist>0){dx/=dist;dy/=dist;}

        const overlap=pr+node.r-dist;
        const push=Math.max(0,currentParentRadius+radius-overlap);
        ox=po.x+dx*push;
        oy=po.y+dy*push;
      }

      offsets[ni]={x:ox,y:oy};
      radii[ni]=radius;

      const harmfulIn=Math.max(0,node.start+duration+harmfulDelay-progress);
      result.push({
        x:(+cw.x||0)+ox,
        y:(+cw.y||0)+oy,
        r:radius,
        targetR:node.r,
        frac,
        harmfulIn,
        parent:node.parent,
        index:ni
      });
    }
    return result;
  }

  function numProp(t,names){
    for(const k of names){
      const v=+t?.[k];
      if(Number.isFinite(v)&&v>0)return v;
    }
    return 0;
  }

  function growInfo(t,playerR=15,dist=Infinity){
    const key=eid(t),r=Math.max(3,+t?.radius||15);
    const m=growModels.get(key)||{min:r,max:r,last:0};
    m.min=Math.min(m.min||r,r);
    m.max=Math.max(m.max||r,r);

    const explicitMax=numProp(t,[
      "maxRadius","maximumRadius","grownRadius","largeRadius",
      "max_radius","grown_radius","maximum_radius"
    ]);
    if(explicitMax)m.max=Math.max(m.max,explicitMax);

    const base=Math.max(3,numProp(t,["baseRadius","minRadius","smallRadius"])||m.min||r);
    const max=Math.max(base,m.max||r,base*4.25);

    const outer=Math.max(
      max+playerR+8,
      numProp(t,["activationRadius","triggerRadius","growRange","range","activation_range"])||145
    );
    const inner=Math.min(
      outer-8,
      numProp(t,["fullGrowDistance","maxGrowDistance","innerRadius","full_size_distance"])||52
    );

    let q=(outer-dist)/Math.max(1,outer-inner);
    q=Math.max(0,Math.min(1,q));
    q=q*q*(3-2*q);
    const predicted=base+(max-base)*q;

    m.last=performance.now();
    growModels.set(key,m);
    return {base,max,outer,inner,predicted,q};
  }

  function et(t){
    const v=[t?.entityType,t?.entity_type,t?.type,t?.typeId,t?.entityTypeId,t?.kind,t?.entityType?.id];
    for(const x of v){
      if(Number.isFinite(+x))return +x;
      const q=String(x||"").toUpperCase();
      if(q==="SPARKING_ENEMY")return SPARKING_ENEMY;
      if(q==="SPARKING_ENEMY_PROJECTILE")return SPARKING_PROJECTILE;
    }
    return -1;
  }

  function eid(t){
    return String(
      t?.id??t?.entityId??t?.entity_id??t?.uuid??t?.netId??t?.networkId??
      `${et(t)}:${Math.round((t?.x||0)/8)}:${Math.round((t?.y||0)/8)}`
    );
  }

  function sp(t){
    if(!t)return false;
    if(et(t)===SPARKING_ENEMY)return true;
    const n=String(t.constructor?.name||t.name||t.enemyType||"").toLowerCase();
    return n.includes("sparking")&&!n.includes("projectile");
  }

  function spProj(t){
    if(!t)return false;
    if(et(t)===SPARKING_PROJECTILE)return true;
    const n=String(t.constructor?.name||t.name||t.enemyType||"").toLowerCase();
    return n.includes("sparking")&&n.includes("projectile");
  }

  function angDiff(a,b){
    let d=Math.abs(a-b)%(Math.PI*2);
    return d>Math.PI?Math.PI*2-d:d;
  }

  function exposedSpawnCount(t){
    const vals=[
      t?.projectileCount,t?.projectile_count,t?.sparkCount,t?.spark_count,
      t?.spawnCount,t?.spawn_count,t?.balls,t?.ballCount
    ];
    for(const v of vals){
      if(Number.isFinite(+v)&&+v>0&&+v<64)return +v;
    }
    for(const v of [t?.projectiles,t?.sparks,t?.children]){
      if(Array.isArray(v)&&v.length)return v.length;
    }
    return 0;
  }
  function spInfo(t,pr){
    const r=Math.max(1,+t.radius||15);
    t._spMinR=Math.min(t._spMinR??r,r);
    t._spMaxR=Math.max(t._spMaxR??r,r);
    const base=t._spMinR;
    const explicitGrow=[t.maxRadius,t.max_radius,t.grownRadius,t.grown_radius,t.enlargedRadius,t.enlarged_radius,t.targetRadius,t.target_radius]
      .map(Number).find(v=>Number.isFinite(v)&&v>base*1.15);
    const grown=Math.max(t._spMaxR,explicitGrow||base*2.35);
    const explicitTrigger=[t.activationRadius,t.activation_radius,t.triggerRadius,t.trigger_radius,t.detectionRadius,t.detection_radius,t.range,t.proximityRadius,t.proximity_radius]
      .map(Number).find(v=>Number.isFinite(v)&&v>base);
    const trigger=explicitTrigger||Math.max(92,grown+pr+28);
    return {base,grown,trigger};
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
    makeSettings();
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
    if(e.code==="Backquote"||e.key==="`"){
      const tag=(e.target?.tagName||"").toLowerCase();
      if(tag!=="input"&&tag!=="textarea"&&!e.target?.isContentEditable){
        e.preventDefault();
        if(uiUnloaded)return;
        const ui=makeSettings();
        if(!ui)return;
        if(ui._isOpen?.())ui._close?.();
        else ui._open?.();
      }
      return;
    }
    if (e.key === "Escape") {
      t = !t;
      if (!t) M.c = false;
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
      for (let t = 0; t < 24; t++) {
        const n = (t / 24) * Math.PI * 2;
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
      if(gameController?.gameState?.areaInfo?.self?.entity){
        return {
          player:gameController.gameState.areaInfo.self.entity,
          camera:gameController.renderer?.camera,
          area:gameController.gameState.area,
          gameState:gameController.gameState,
          inputEngine:gameController.gameState.input||gameController.inputEngine||gameController
        };
      }
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
          gameController=e;
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
    const au = Math.max(4, Math.floor(Math.max(120,Math.min(900,tasCfg.horizon+(csp?0:ms))) / i));
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
        const dist=Math.sqrt(f);
        let u=s.av+tasCfg.safety;
        if(s.cw&&e<(s.cd||0))u=0;
        if(s.sp&&dist<=s.st)u=s.sg;
        if(s.gr){
          let gq=(s.go-dist)/Math.max(1,s.go-s.gi);
          gq=Math.max(0,Math.min(1,gq));
          gq=gq*gq*(3-2*gq);
          u=s.gb+(s.gm-s.gb)*gq;
        }
        const h = u * u;
        if (f <= h) {
          y++;
          if(e<j0)j0=e;
          if(e<tasCfg.reaction)j1++;
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

  function segPointDist(ax,ay,bx,by,px,py){
    const vx=bx-ax,vy=by-ay;
    const den=vx*vx+vy*vy;
    let t0=den>1e-9?((px-ax)*vx+(py-ay)*vy)/den:0;
    t0=Math.max(0,Math.min(1,t0));
    const qx=ax+vx*t0,qy=ay+vy*t0;
    return {d:Math.hypot(px-qx,py-qy),t:t0,qx,qy};
  }

  function crystalCorridor(dir,player,wallNodes,mouseDist,playerR){
    const mag=dir?.mag||Math.hypot(dir?.x||0,dir?.y||0);
    if(mag<.05||!wallNodes?.length)return {blocked:false,penalty:0,min:Infinity,side:0};

    const ux=dir.x/mag,uy=dir.y/mag;
    const len=Math.max(170,Math.min(430,Number.isFinite(mouseDist)&&mouseDist>0?mouseDist:300));
    const ax=player.x,ay=player.y,bx=ax+ux*len,by=ay+uy*len;
    let penalty=0,min=Infinity,side=0,blocked=false;

    for(const w0 of wallNodes){
      if(!w0||w0.r<=.5)continue;
      const along=(w0.x-ax)*ux+(w0.y-ay)*uy;
      if(along<-(w0.r+playerR+10)||along>len+(w0.r+playerR+20))continue;

      const reachMs=Math.max(0,along)/Math.max(.18,Math.hypot(player._c||0,player._d||0))*1.0;
      if((w0.delay||0)>Math.max(260,reachMs+120))continue;

      const sd=segPointDist(ax,ay,bx,by,w0.x,w0.y);
      const safe=w0.r+playerR+tasCfg.wall;
      const clearance=sd.d-safe;
      if(clearance<min)min=clearance;

      const cross=ux*(w0.y-ay)-uy*(w0.x-ax);
      if(Math.abs(cross)>1)side+=Math.sign(cross)*Math.max(0,1-Math.max(0,clearance)/90);

      if(clearance<=0){
        blocked=true;
        const depth=Math.min(1.8,1+(-clearance)/Math.max(8,safe));
        penalty-=6.5e6*depth*(1.15-.65*sd.t);
      }else if(clearance<70){
        penalty-=1.2e6*(1-clearance/70)*(1.05-.45*sd.t);
      }
    }
    return {blocked,penalty,min,side};
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
      const spi=sp(o)?spInfo(o,F):null;
      const gri=isGrowing(o)?growInfo(o,F,f):null;
      L.push({
        x: z1.x,
        y: z1.y,
        vx: h,
        vy: x,
        ax: o._e || 0,
        ay: o._f || 0,
        aq: o._g ?? 1,
        av: y,
        sp:!!spi,
        st:spi?.trigger||0,
        sg:spi?spi.grown+F:y,
        gr:!!gri,
        gb:gri?gri.base+F:y,
        gm:gri?gri.max+F:y,
        go:gri?.outer||0,
        gi:gri?.inner||0,
        cw:!!o._cwNode,
        cd:Math.max(0,+o.crystalHarmfulIn||0),
      });
    }
    const wallNodes=L.filter(v=>v.cw&&v.av>0).map(v=>({
      x:v.x,y:v.y,r:Math.max(0,v.av-F),delay:v.cd||0
    }));

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
      const wc=crystalCorridor(e,n,wallNodes,P,F);
      Z.push({ be: e, bc: s, wc });
    }
    const requestedWall=crystalCorridor(B,n,wallNodes,P,F);

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
      const M = (e.x * g.x + e.y * g.y) * v * tasCfg.stability;
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
      j3=Math.max(j3,-4.4e6);
      const wc=Z[t]?.wc;
      let wallPenalty=wc?.penalty||0;

      if(wallNodes.length&&e.mag>0){
        if(requestedWall?.blocked){
          const lateral=Math.abs(e.x*-B.y+e.y*B.x)/(e.mag||1);
          if(!wc?.blocked)wallPenalty+=22000+18000*lateral;
          else wallPenalty-=45000*(1-lateral);
        }
      }

      let E = s.ba * c + s.bb * l + d + p + M + b + h + x + j3 + zf + wallPenalty;
      A[t].bd = E;
      A[t].be = e;
    }
    let rt=null;
    for(let wi=0;wi<tt;wi++){
      const cand=A[wi];
      if(!cand?.be||!Number.isFinite(cand.bd))continue;

      if(S&&P>8&&(cand.be.mag||0)<.05)continue;

      if(!rt||cand.bd>rt.bd)rt=cand;
    }
    if(!rt)rt=A.find(v=>v?.be&&Number.isFinite(v.bd))||A[0];
    if(pathfinding&&rt&&Number.isFinite(rt.bd)){
      let z6=rt,z7=Math.max(1200,Math.abs(rt.bd)*.035);
      for(let z8=0;z8<tt;z8++){
        const z9=A[z8],za=Z[z8]?.bc;
        const zw=Z[z8]?.wc;
        if(!z9||!za||za.ax||za.ba>0||zw?.blocked||z9.bd<rt.bd-z7||!z9.be)continue;
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
        const jw=Z[j7]?.wc;
        if(!j8||!j9||!j8.be||j9.ax||j9.ba>0||j9.bk>0||jw?.blocked)continue;
        let ja=j8.bd;
        if(Number.isFinite(j9.bj)&&j9.bj<tasCfg.reaction+10)ja-=2e6;
        const jb=j8.be.mag||1;
        const jc=(j8.be.x*B.x+j8.be.y*B.y)/jb;
        ja+=jc*1400;
        if(ja>j5){j5=ja;j4=j8}
      }
      if(j4){
        const jd=Z[A.indexOf(rt)]?.bc;
        if(!jd||jd.bk>0||(Number.isFinite(jd.bj)&&jd.bj<tasCfg.reaction*.78))rt=j4;
      }
    }
    if(S&&P>8&&rt?.be){
      const rmag=rt.be.mag||0;
      const rdot=rmag>0?(rt.be.x*B.x+rt.be.y*B.y)/rmag:0;

      if(rdot<-.12){
        let forward=null,forwardScore=-Infinity;

        for(let ar0=0;ar0<tt;ar0++){
          const cand=A[ar0],sim=Z[ar0]?.bc,wc=Z[ar0]?.wc;
          if(!cand?.be||!sim||sim.ax||wc?.blocked)continue;

          const cmag=cand.be.mag||0;
          if(cmag<=0)continue;

          const dot=(cand.be.x*B.x+cand.be.y*B.y)/cmag;

          if(dot<-.08)continue;

          if(sim.ba>0||sim.bk>0)continue;
          if(Number.isFinite(sim.bj)&&sim.bj<tasCfg.reaction*.66)continue;

          let score=cand.bd+Math.max(0,dot)*5200;

          if(g.x||g.y){
            const gm=Math.hypot(g.x,g.y)||1;
            const same=(cand.be.x*g.x+cand.be.y*g.y)/(cmag*gm);
            score+=Math.max(0,same)*900;
          }

          if(score>forwardScore){
            forwardScore=score;
            forward=cand;
          }
        }

        if(forward)rt=forward;
      }
    }

    if(S&&P>8){
      const rb=rt?.be;
      const rm=rb?rb.mag||Math.hypot(rb.x||0,rb.y||0):0;
      const rs=rt&&Number.isFinite(rt.bd)?rt.bd:-Infinity;

      if(!rb||rm<.05||!Number.isFinite(rs)){
        let best=null,bestKey=null;

        for(let fi=0;fi<tt;fi++){
          const cand=A[fi],sim=Z[fi]?.bc;
          if(!cand?.be||!Number.isFinite(cand.bd)||!sim||sim.ax)continue;
          const cm=cand.be.mag||0;
          if(cm<.08)continue;

          const dot=(cand.be.x*B.x+cand.be.y*B.y)/cm;
          const wc=Z[fi]?.wc;
          const hits=sim.ba||0;
          const immediate=sim.bk||0;
          const ttc=Number.isFinite(sim.bj)?sim.bj:9999;
          const near=sim.bb||0;

          const key=[
            wc?.blocked?1:0,
            immediate,
            hits,
            -ttc,
            near,
            -dot,
            -cand.bd
          ];

          if(!bestKey){
            best=cand;bestKey=key;
          }else{
            let better=false;
            for(let ki=0;ki<key.length;ki++){
              if(key[ki]<bestKey[ki]){better=true;break;}
              if(key[ki]>bestKey[ki])break;
            }
            if(better){best=cand;bestKey=key;}
          }
        }

        if(best){
          rt=best;
          rt._emergency=true;
        }else if(M-lastSafe.time<700&&Math.hypot(lastSafe.x,lastSafe.y)>.1){
          rt={
            be:{x:lastSafe.x,y:lastSafe.y,mag:1},
            bd:-1e20,
            _fallback:true
          };
        }else{
          const bx=-B.y,by=B.x;
          const bm=Math.hypot(bx,by)||1;
          rt={
            be:{x:bx/bm,y:by/bm,mag:1},
            bd:-1e20,
            _fallback:true
          };
        }
      }
    }

    if(rt?.be&&(rt.be.mag||0)>.08&&!rt._fallback){
      const ri=A.indexOf(rt);
      const sim=ri>=0?Z[ri]?.bc:null;
      if(sim&&!sim.ax&&sim.ba===0&&sim.bk===0&&
         (!Number.isFinite(sim.bj)||sim.bj>=tasCfg.reaction*.78)){
        const rm=rt.be.mag||1;
        lastSafe.x=rt.be.x/rm;
        lastSafe.y=rt.be.y/rm;
        lastSafe.time=M;
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
    let ft = (0.18 + 0.82 * Math.pow(H, 1.5))*tasCfg.response;
    if (pathfinding && pp) ft=Math.max(ft,.48*tasCfg.response);
    ft=Math.max(.08,Math.min(1,ft));
    const je=gg?.k;
    if(je&&(je.bk>0||(Number.isFinite(je.bj)&&je.bj<tasCfg.reaction)))ft=Math.max(ft,.82);
    E.x += (rt.be.x - E.x) * ft;
    E.y += (rt.be.y - E.y) * ft;

    if(S&&P>8){
      const em=Math.hypot(E.x,E.y);
      if(em<.12){
        const useLast=lastSafe.time&&M-lastSafe.time<700;
        const bx=useLast?lastSafe.x:(rt?.be?.x||-B.y||1);
        const by=useLast?lastSafe.y:(rt?.be?.y|| B.x||0);
        const bm=Math.hypot(bx,by)||1;
        E.x=bx/bm*.22;
        E.y=by/bm*.22;
      }
    }

    l += (et - l) * Math.max(0.2, ft);
    g.x = rt.be.x;
    g.y = rt.be.y;

    let tx=n.x+E.x*l,ty=n.y+E.y*l;
    if(S&&P>8&&Math.hypot(tx-n.x,ty-n.y)<12){
      const useLast=lastSafe.time&&M-lastSafe.time<700;
      const bx=useLast?lastSafe.x:(rt?.be?.x||-B.y||1);
      const by=useLast?lastSafe.y:(rt?.be?.y|| B.x||0);
      const bm=Math.hypot(bx,by)||1;
      tx=n.x+bx/bm*Math.max(24,l*.45);
      ty=n.y+by/bm*Math.max(24,l*.45);
    }

    C(n,a,tx,ty);
  }

  function drawPlayerCosmetics(ctx,screenX,screenY,pixelRadius=15){
    const anySelected=cosmeticState.hat!=="none"||cosmeticState.body!=="none";
    if(!anySelected)return;

    const atlas=ensureCosmeticAtlas();
    if(!atlas||cosmeticAtlasState!=="ready"||!atlas.naturalWidth)return;

    const drawExactAccessory=(id)=>{
      if(!id||id==="none")return;
      const f=COSMETIC_FRAMES[id];
      if(!f)return;
      const [sx,sy,sw,sh]=f;
      if(sx<0||sy<0||sw<=0||sh<=0||sx+sw>atlas.naturalWidth||sy+sh>atlas.naturalHeight)return;

      const size=(10*pixelRadius)/3;
      const x=screenX-size/2;
      const y=screenY-size/2;
      ctx.drawImage(atlas,sx,sy,sw,sh,x,y,size,size);
    };

    ctx.save();
    ctx.imageSmoothingEnabled=true;

    drawExactAccessory(cosmeticState.body);
    drawExactAccessory(cosmeticState.hat);

    ctx.restore();
  }

  function N() {
    if(!b||!w)return;
    b.clearRect(0,0,w.width,w.height);

    if(d&&cosmeticsActive()){
      const live=getCosmeticLiveState();
      if(live?.camera?.getX&&live?.camera?.getY){
        const qr=d.getBoundingClientRect();
        const sx=qr.left+live.camera.getX(live.x)*qr.width/d.width;
        const sy=qr.top+live.camera.getY(live.y)*qr.height/d.height;
        if(Number.isFinite(sx)&&Number.isFinite(sy)){
          let pixelRadius=15;
          try{
            if(typeof live.camera.toScale==="function"){
              pixelRadius=live.camera.toScale(+live.ent.radius||15)*(qr.width/d.width);
            }else{
              const wx=live.x+(+live.ent.radius||15);
              const edgeX=qr.left+live.camera.getX(wx)*qr.width/d.width;
              pixelRadius=Math.abs(edgeX-sx)||15;
            }
          }catch(_){}
          if(!Number.isFinite(pixelRadius)||pixelRadius<=0)pixelRadius=15;
          drawPlayerCosmetics(b,sx,sy,pixelRadius);
        }
      }
    }

    if(t&&gg&&d){
      const q=d.getBoundingClientRect(),a=gg.e;
      if(a?.getX&&a?.getY){
        const cv=(x,y)=>({
          x:q.left+a.getX(x)*q.width/d.width,
          y:q.top+a.getY(y)*q.height/d.height
        });

        const s0=cv(gg.a,gg.b),p0=cv(gg.c,gg.d);
        if(vis.playerRing&&Number.isFinite(p0.x)&&Number.isFinite(p0.y)){
          b.save();b.strokeStyle="rgba(235,238,242,.42)";b.lineWidth=1;b.setLineDash([4,4]);
          b.beginPath();b.arc(p0.x,p0.y,20,0,Math.PI*2);b.stroke();b.restore();
        }
        if([s0.x,s0.y,p0.x,p0.y].every(Number.isFinite)){
          const dx=p0.x-s0.x,dy=p0.y-s0.y,ds=Math.hypot(dx,dy);
          const th=gg.k,ttc=th&&Number.isFinite(th.bj)?th.bj:Infinity;
          const danger=ttc<95?2:ttc<160?1:0;

          b.save();

          b.strokeStyle="rgba(255,255,255,.46)";
          b.lineWidth=1;
          const r=5,g=2;
          b.beginPath();
          b.moveTo(s0.x-r,s0.y-g);b.lineTo(s0.x-r,s0.y-r);b.lineTo(s0.x-g,s0.y-r);
          b.moveTo(s0.x+g,s0.y-r);b.lineTo(s0.x+r,s0.y-r);b.lineTo(s0.x+r,s0.y-g);
          b.moveTo(s0.x+r,s0.y+g);b.lineTo(s0.x+r,s0.y+r);b.lineTo(s0.x+g,s0.y+r);
          b.moveTo(s0.x-g,s0.y+r);b.lineTo(s0.x-r,s0.y+r);b.lineTo(s0.x-r,s0.y+g);
          b.stroke();

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

        if(vis.labels&&gg.n?.length){
          b.save();
          b.font="400 10px Rubik,Arial,sans-serif";
          b.textAlign="center";
          b.textBaseline="bottom";
          const sc=(a.originalGameScale||a.scale||1)*(q.width/d.width);
          for(const en of gg.n){
            const ep=cv(en.x,en.y);
            if(!Number.isFinite(ep.x)||!Number.isFinite(ep.y))continue;
            const er=Math.max(8,(en.r||15)*sc);
            const text=en.label;
            const tw=b.measureText(text).width;
            const lx=Math.max(tw/2+5,Math.min(w.width-tw/2-5,ep.x));
            const ly=Math.max(14,Math.min(w.height-5,ep.y-er-5));

            b.fillStyle="rgba(7,9,12,.76)";
            b.fillRect(lx-tw/2-4,ly-11,tw+8,13);
            b.fillStyle=en.spark?"rgba(255,220,135,.98)":"rgba(240,244,248,.96)";
            b.fillText(text,lx,ly);
          }
          b.restore();
        }

        if(vis.trajectories&&gg.pv?.length){
          const sc=(a.originalGameScale||a.scale||1)*(q.width/d.width);
          for(const tr of gg.pv){
            if(!tr.pts?.length)continue;
            b.save();

            const special=tr.star;
            b.lineWidth=special?1.35:1;
            b.strokeStyle=special
              ?"rgba(255,235,145,.78)"
              :"rgba(230,235,242,.28)";
            b.setLineDash(special?[5,4]:[3,4]);

            b.beginPath();
            let started=false;
            for(const pt of tr.pts){
              const p0=cv(pt.x,pt.y);
              if(!Number.isFinite(p0.x)||!Number.isFinite(p0.y))continue;
              if(!started){b.moveTo(p0.x,p0.y);started=true;}
              else b.lineTo(p0.x,p0.y);
            }
            if(started)b.stroke();
            b.setLineDash([]);

            for(let pi=1;pi<tr.pts.length;pi++){
              if(pi>3)break;
              const pt=tr.pts[pi],p0=cv(pt.x,pt.y);
              if(!Number.isFinite(p0.x)||!Number.isFinite(p0.y))continue;
              const rr0=Math.max(3,(tr.r||10)*sc*(pt.teleport?1:.7));
              b.strokeStyle=pt.teleport
                ?"rgba(255,232,135,.86)"
                :"rgba(230,235,242,.22)";
              b.lineWidth=pt.teleport?1.25:1;
              b.beginPath();b.arc(p0.x,p0.y,rr0,0,Math.PI*2);b.stroke();

              if(pt.teleport&&vis.star){
                b.font="400 9px Rubik,Arial,sans-serif";
                b.textAlign="center";b.textBaseline="bottom";
                b.fillStyle="rgba(255,237,160,.92)";
                b.fillText(`${pt.t}ms`,p0.x,p0.y-rr0-3);
              }
            }
            b.restore();
          }
        }

        if(vis.danger&&gg.dg?.length){
          const sc=(a.originalGameScale||a.scale||1)*(q.width/d.width);
          b.save();
          for(const gh0 of gg.dg){
            const p0=cv(gh0.x,gh0.y);
            if(!Number.isFinite(p0.x)||!Number.isFinite(p0.y))continue;
            const rr0=Math.max(3,gh0.r*sc);
            b.setLineDash([2,4]);
            b.strokeStyle="rgba(255,120,120,.52)";
            b.lineWidth=1;
            b.beginPath();b.arc(p0.x,p0.y,rr0,0,Math.PI*2);b.stroke();
          }
          b.restore();
        }

        if(vis.growing&&gg.gr?.length){
          const sc=(a.originalGameScale||a.scale||1)*(q.width/d.width);
          for(const g0 of gg.gr){
            const ep=cv(g0.x,g0.y);
            if(!Number.isFinite(ep.x)||!Number.isFinite(ep.y))continue;
            const cur=Math.max(3,g0.r*sc);
            const pre=Math.max(cur,g0.p*sc);

            b.save();

            b.strokeStyle="rgba(255,255,255,.16)";
            b.lineWidth=1;
            b.setLineDash([3,5]);
            b.beginPath();b.arc(ep.x,ep.y,g0.outer*sc,0,Math.PI*2);b.stroke();
            b.setLineDash([]);

            b.fillStyle="rgba(255,187,245,.065)";
            b.strokeStyle="rgba(255,210,249,.72)";
            b.lineWidth=1.25;
            b.beginPath();b.arc(ep.x,ep.y,pre,0,Math.PI*2);b.fill();b.stroke();

            if(Math.abs(pre-cur)>2){
              b.strokeStyle="rgba(255,255,255,.30)";
              b.lineWidth=1;
              b.beginPath();b.arc(ep.x,ep.y,cur,0,Math.PI*2);b.stroke();

              const pct=Math.round(g0.q*100);
              b.font="400 9px Rubik,Arial,sans-serif";
              b.textAlign="center";
              b.textBaseline="top";
              b.fillStyle="rgba(255,231,252,.90)";
              b.fillText(`SIZE ${pct}%`,ep.x,ep.y+pre+4);
            }
            b.restore();
          }
        }

        if(vis.crystalWall&&gg.cw?.length){
          const sc=(a.originalGameScale||a.scale||1)*(q.width/d.width);
          for(const cw of gg.cw){
            b.save();

            let nodeDrawn=0;
            for(const nd of cw.nodes||[]){
              if(nodeDrawn++>=20)break;
              const p=cv(nd.x,nd.y),fp=cv(nd.fx,nd.fy);
              if(![p.x,p.y,fp.x,fp.y].every(Number.isFinite))continue;

              const cr=Math.max(1,nd.r*sc);
              const fr=Math.max(1,nd.fr*sc);

              b.strokeStyle="rgba(205,235,255,.40)";
              b.lineWidth=1;
              b.beginPath();b.arc(p.x,p.y,cr,0,Math.PI*2);b.stroke();

              if(Math.abs(fr-cr)>1||Math.hypot(fp.x-p.x,fp.y-p.y)>1){
                const imminent=nd.harmfulIn<=160;
                b.setLineDash([4,4]);
                b.strokeStyle=imminent
                  ?"rgba(190,235,255,.90)"
                  :"rgba(170,220,245,.42)";
                b.lineWidth=imminent?1.45:1;
                b.beginPath();b.arc(fp.x,fp.y,fr,0,Math.PI*2);b.stroke();
                b.setLineDash([]);

                if(Math.hypot(fp.x-p.x,fp.y-p.y)>2){
                  b.strokeStyle="rgba(180,225,245,.22)";
                  b.beginPath();b.moveTo(p.x,p.y);b.lineTo(fp.x,fp.y);b.stroke();
                }
              }

              if(nd.harmfulIn>0&&nd.harmfulIn<900){
                b.font="400 9px Rubik,Arial,sans-serif";
                b.textAlign="center";b.textBaseline="bottom";
                b.fillStyle=nd.harmfulIn<160
                  ?"rgba(220,246,255,.95)"
                  :"rgba(205,232,245,.65)";
                b.fillText(`${Math.round(nd.harmfulIn)}ms`,fp.x,fp.y-fr-3);
              }
            }

            b.restore();
          }
        }

        if(vis.sparking&&gg.s?.length){
          const sc=(a.originalGameScale||a.scale||1)*(q.width/d.width);
          for(const spx of gg.s){
            const ep=cv(spx.x,spx.y);
            if(!Number.isFinite(ep.x)||!Number.isFinite(ep.y))continue;

            const hot=spx.d<=spx.tr||spx.near;
            const growR=Math.max(4,spx.g*sc);
            const triggerR=Math.max(growR+3,spx.tr*sc);

            b.save();

            b.lineWidth=1;
            b.setLineDash([5,5]);
            b.strokeStyle=hot?"rgba(255,104,88,.72)":"rgba(255,211,92,.38)";
            b.beginPath();b.arc(ep.x,ep.y,triggerR,0,Math.PI*2);b.stroke();
            b.setLineDash([]);

            b.strokeStyle=hot?"rgba(255,82,82,.98)":"rgba(255,198,75,.88)";
            b.lineWidth=1.6;
            b.beginPath();b.arc(ep.x,ep.y,growR,0,Math.PI*2);b.stroke();
            b.fillStyle=hot?"rgba(255,72,72,.10)":"rgba(255,204,80,.06)";
            b.beginPath();b.arc(ep.x,ep.y,growR,0,Math.PI*2);b.fill();

            if(spx.dirs?.length){
              for(const dir of spx.dirs){
                const len=Math.min(86,28+(spx.speed||.18)*210);
                const ex=ep.x+Math.cos(dir)*len;
                const ey=ep.y+Math.sin(dir)*len;

                b.strokeStyle=hot?"rgba(255,132,112,.50)":"rgba(255,214,122,.28)";
                b.setLineDash([2,4]);
                b.beginPath();b.moveTo(ep.x,ep.y);b.lineTo(ex,ey);b.stroke();
                b.setLineDash([]);

                const gr=Math.max(3,(spx.pr||10)*sc);
                b.fillStyle=hot?"rgba(255,130,115,.16)":"rgba(255,215,125,.10)";
                b.strokeStyle=hot?"rgba(255,138,120,.82)":"rgba(255,219,135,.55)";
                b.lineWidth=1;
                b.beginPath();b.arc(ex,ey,gr,0,Math.PI*2);b.fill();b.stroke();
              }
            }

            const status = hot
              ? (spx.dirs?.length ? `SPARK • GROW • +${spx.count||spx.dirs.length}` : "SPARK • GROW")
              : (spx.dirs?.length ? `SPARK • +${spx.count||spx.dirs.length}` : "SPARK");

            b.font="400 10px Rubik,Arial,sans-serif";
            b.textAlign="center";
            b.textBaseline="middle";

            const tw=b.measureText(status).width;
            let lx=Math.max(tw/2+6,Math.min(w.width-tw/2-6,ep.x));
            let ly=Math.max(12,Math.min(w.height-12,ep.y-18));

            b.fillStyle="rgba(10,12,16,.82)";
            b.beginPath();
            b.roundRect(lx-tw/2-5,ly-7,tw+10,14,4);
            b.fill();

            b.lineWidth=3;
            b.strokeStyle="rgba(10,12,16,.95)";
            b.strokeText(status,lx,ly);
            b.lineWidth=1;
            b.fillStyle=hot?"rgba(255,163,148,.98)":"rgba(255,226,150,.96)";
            b.fillText(status,lx,ly);

            if(spx.near&&spx.d>spx.tr){
              const sub="PREDICTED TRIGGER";
              b.font="400 9px Rubik,Arial,sans-serif";
              const sw=b.measureText(sub).width;
              const sy=Math.min(w.height-10,ly+15);
              b.fillStyle="rgba(10,12,16,.72)";
              b.beginPath();
              b.roundRect(lx-sw/2-4,sy-6,sw+8,12,3);
              b.fill();
              b.fillStyle="rgba(255,190,120,.94)";
              b.fillText(sub,lx,sy);
            }

            b.restore();
          }
        }

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
    const all = [];
    const z3=rr(s),es=e.gameState.entities;

    for(const t in es){
      if(+t<0)continue;
      const o=es[t];
      if(!o)continue;

      const hazard=!!o.isEnemy||spProj(o);
      if(!hazard)continue;

      const z2=rr(o);
      const scan=PERF.farRange;
      if(Math.abs(z2.x-z3.x)>scan||Math.abs(z2.y-z3.y)>scan)continue;

      q(o,n,e.gameState.serverTickRate||60);
      all.push(o);

      if((o.isEnemy||spProj(o))&&!isCrystalWall(o))i.push(o);
    }

    const z4 = e.gameState.latestServerSelfEntity || s;
    const z5 = rr(s);
    const spr=[];
    const pr=s.radius||15;
    const sparks=all.filter(sp);
    const sparkProjectiles=all.filter(spProj);
    const labels=[];
    if(vis.labels){
      const labelCandidates=[];
      for(const en of all){
        if(en._sparkGhost||en._wallGhost||en._advGhost)continue;
        if(!en.isEnemy&&!spProj(en))continue;

        const ep=rr(en);
        const dd=(ep.x-z5.x)*(ep.x-z5.x)+(ep.y-z5.y)*(ep.y-z5.y);
        if(dd>PERF.nearRange*PERF.nearRange)continue;

        labelCandidates.push({
          x:ep.x,y:ep.y,
          r:en.radius||15,
          label:enemyLabel(en),
          spark:sp(en)||spProj(en),
          _d:dd
        });
      }
      labelCandidates.sort((a,b)=>a._d-b._d);
      for(let li=0;li<Math.min(PERF.maxLabels,labelCandidates.length);li++){
        labels.push(labelCandidates[li]);
      }
    }

    const grows=[];
    if(vis.growing){
      let growCount=0;
      for(const en of all){
        if(!isGrowing(en))continue;
        const ep=rr(en);
        const dx=ep.x-z5.x,dy=ep.y-z5.y;
        if(dx*dx+dy*dy>PERF.nearRange*PERF.nearRange)continue;
        if(growCount++>=PERF.maxSpecials)break;

        const rvx=(en._c||0)-(s._c||0),rvy=(en._d||0)-(s._d||0);
        const vv=rvx*rvx+rvy*rvy;
        const tt=vv>1e-7?Math.max(0,Math.min(600,-(dx*rvx+dy*rvy)/vv)):0;
        const closest=Math.hypot(dx+rvx*tt,dy+rvy*tt);
        const gi=growInfo(en,pr,closest);

        grows.push({
          x:ep.x,y:ep.y,r:en.radius||gi.base,
          p:gi.predicted,base:gi.base,max:gi.max,
          outer:gi.outer,inner:gi.inner,q:gi.q,closest
        });
      }
    }

    let previews=[];
    let dangerGhosts=[];
    const doVisualBuild=(n-lastVisualBuild)>=PERF.visualInterval;

    if(doVisualBuild){
      lastVisualBuild=n;

      const candidates=[];
      for(const en of all){
        if(en._sparkGhost||en._wallGhost||isCrystalWall(en)||isGrowing(en))continue;

        const p=rr(en);
        const dx=p.x-z5.x,dy=p.y-z5.y;
        const d2=dx*dx+dy*dy;
        const type=et(en);
        const speed=Math.hypot(en._c||0,en._d||0);
        const projectile=isProjectile(en);
        const special=PREDICTIVE_TYPES.has(type);

        if(!projectile&&!special&&speed<.12)continue;
        candidates.push({en,type,speed,projectile,special,d2});
      }

      candidates.sort((a,b)=>{
        const ap=(a.projectile?2:0)+(a.special?2:0)+Math.min(2,a.speed*4);
        const bp=(b.projectile?2:0)+(b.special?2:0)+Math.min(2,b.speed*4);
        return bp-ap || a.d2-b.d2;
      });

      let ghostBudget=PERF.maxDangerGhosts;
      const max=Math.min(PERF.maxTrajectories,candidates.length);

      for(let ci=0;ci<max;ci++){
        const {en,type,speed,projectile,special}=candidates[ci];

        let pts=[];
        if(type===STAR_ENEMY||type===TELEPORTING_ENEMY){
          pts=teleportPreview(en,700);
        }else{
          pts=linearPreview(en,special?360:300,120);
        }

        if(pts.length>1){
          previews.push({
            id:eid(en),type,
            r:en.radius||10,
            star:type===STAR_ENEMY||type===TELEPORTING_ENEMY,
            pts
          });
        }

        if(!vis.danger||ghostBudget<=0)continue;

        if((type===STAR_ENEMY||type===TELEPORTING_ENEMY)&&pts.length>1){
          const first=pts.find(p=>p.teleport);
          if(first&&first.t<=460){
            const gr=Math.max(5,en.radius||15);
            i.push({
              x:first.x,y:first.y,predictedX:first.x,predictedY:first.y,
              radius:gr,isEnemy:true,
              _c:0,_d:0,_e:0,_f:0,_g:.66,
              _advGhost:true
            });
            dangerGhosts.push({x:first.x,y:first.y,r:gr});
            ghostBudget--;
          }
          continue;
        }

        if((projectile||special||speed>.22)&&pts.length>2){
          const fp=pts[2];
          const gr=Math.max(4,(en.radius||10)*.78);
          i.push({
            x:fp.x,y:fp.y,predictedX:fp.x,predictedY:fp.y,
            radius:gr,isEnemy:true,
            _c:en._c||0,_d:en._d||0,_e:en._e||0,_f:en._f||0,_g:.28,
            _advGhost:true
          });
          dangerGhosts.push({x:fp.x,y:fp.y,r:gr});
          ghostBudget--;
        }
      }

      lastVisualState={previews,dangerGhosts};
    }else if(lastVisualState){
      previews=lastVisualState.previews||[];
      dangerGhosts=lastVisualState.dangerGhosts||[];
    }

    const crystalWalls=all.filter(isCrystalWall);
    const wallPred=[];

    for(const cw of crystalWalls){
      const nowNodes=crystalWallGeometry(cw,0);
      if(!nowNodes.length)continue;

      const lookahead=320;
      const futureNodes=crystalWallGeometry(cw,lookahead);
      const visual=[];

      for(let ni=0;ni<nowNodes.length;ni++){
        const cur=nowNodes[ni],fut=futureNodes[ni]||cur;
        const activeR=Math.max(cur.r,fut.r);
        if(activeR<=.5)continue;

        const vx=(fut.x-cur.x)/lookahead;
        const vy=(fut.y-cur.y)/lookahead;

        i.push({
          x:cur.x,y:cur.y,
          predictedX:cur.x,predictedY:cur.y,
          radius:activeR,
          isEnemy:true,
          _c:vx,_d:vy,_e:0,_f:0,_g:1,
          _wallGhost:true,
          _cwNode:true,
          crystalHarmfulIn:cur.harmfulIn
        });

        visual.push({
          x:cur.x,y:cur.y,r:cur.r,
          fx:fut.x,fy:fut.y,fr:fut.r,
          targetR:cur.targetR,
          frac:cur.frac,
          harmfulIn:cur.harmfulIn,
          parent:cur.parent,
          index:cur.index
        });
      }

      wallPred.push({
        x:+cw.x||0,y:+cw.y||0,
        nodes:visual,
        growthDuration:+cw.crystalWallGrowthDuration||1,
        growthLeft:+cw.crystalWallGrowthLeft||0
      });
    }

    for(const pj of sparkProjectiles){
      const pp=rr(pj);
      let best=null,bd=Infinity;
      for(const en of sparks){
        const ep=rr(en),dd=Math.hypot(pp.x-ep.x,pp.y-ep.y);
        if(dd<bd){bd=dd;best=en;}
      }
      if(!best||bd>190)continue;

      const key=eid(best);
      const model=spModels.get(key)||{dirs:[],speed:0,r:0,count:0,last:n};
      const vx=pj._c||0,vy=pj._d||0,spd=Math.hypot(vx,vy);

      if(spd>.008){
        const a=Math.atan2(vy,vx);
        if(!model.dirs.some(x=>angDiff(x,a)<.18))model.dirs.push(a);
        if(model.dirs.length>24)model.dirs=model.dirs.slice(-24);
        model.speed=model.speed?model.speed*.72+spd*.28:spd;
      }

      model.r=Math.max(model.r||0,pj.radius||0);
      model.count=Math.max(model.count||0,model.dirs.length);
      model.last=n;
      spModels.set(key,model);
    }

    for(const en of sparks){
      const ep=rr(en),si=spInfo(en,pr);
      const dx=ep.x-z5.x,dy=ep.y-z5.y,dist=Math.hypot(dx,dy);
      const rvx=(en._c||0)-(s._c||0),rvy=(en._d||0)-(s._d||0);
      const vv=rvx*rvx+rvy*rvy;
      const tt=vv>1e-7?Math.max(0,Math.min(650,-(dx*rvx+dy*rvy)/vv)):0;
      const cd=Math.hypot(dx+rvx*tt,dy+rvy*tt);
      const near=cd<=si.trigger;

      const key=eid(en);
      const model=spModels.get(key)||{dirs:[],speed:0,r:0,count:0,last:n};
      const exposed=exposedSpawnCount(en);
      if(exposed)model.count=Math.max(model.count||0,exposed);
      model.last=n;
      spModels.set(key,model);

      if(near&&model.dirs.length&&model.speed>.008){
        const rr0=Math.max(6,model.r||Math.min(13,(en.radius||si.base)*.45));
        for(const dir of model.dirs){
          const lead=120;
          const ox=Math.cos(dir)*(si.base+rr0+2);
          const oy=Math.sin(dir)*(si.base+rr0+2);
          const ghost={
            x:ep.x+ox,
            y:ep.y+oy,
            predictedX:ep.x+ox,
            predictedY:ep.y+oy,
            radius:rr0,
            isEnemy:true,
            _c:Math.cos(dir)*model.speed,
            _d:Math.sin(dir)*model.speed,
            _e:0,_f:0,_g:.9,
            _sparkGhost:true
          };
          i.push(ghost);
        }
      }

      spr.push({
        x:ep.x,y:ep.y,
        r:en.radius||si.base,
        g:si.grown,
        tr:si.trigger,
        d:dist,
        near,
        tt,
        dirs:model.dirs.slice(),
        speed:model.speed||0,
        pr:model.r||0,
        count:model.count||model.dirs.length||0
      });
    }

    for(const [k,m] of spModels){
      if(n-(m.last||0)>30000)spModels.delete(k);
    }
    for(const [k,m] of growModels){
      if(n-(m.last||0)>30000)growModels.delete(k);
    }
    gg = { a: z4.x, b: z4.y, c: z5.x, d: z5.y, e: e.camera, f: [], s:spr, n:labels, gr:grows, cw:wallPred, pv:previews, dg:dangerGhosts };
    Y(s, i, o, e.camera);
    N();
  }
  const k=()=>{
    const a=performance.now();

    if(a-gh>=33){
      gh=a;
      O();
    }

    if(t||cosmeticsActive())N();

    requestAnimationFrame(k);
  };
  requestAnimationFrame(k);
})();

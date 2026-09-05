const boom = document.createElement("iframe");
Object.assign(boom.style, {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  border: 0
});
document.body.appendChild(boom);
const w = boom.contentWindow;
const d = boom.contentDocument; // BELOW will be changed on update and rebuild. will be fixed tho.
d.write(`
  <link rel="stylesheet" href="/moderatorTools.05ce238e.css"> 
  <div id="app"></div>
`);
const f = w.fetch.bind(w);
w.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  const path = new URL(url, location.origin).pathname;
  if (path === "/api/auth/check") {
    return new w.Response(JSON.stringify({
      isStaff: true // isDev doesn't work ??
    }), { status: 200 });
  }

  return f(input, init);
};
const script = d.createElement("script");
script.type = "module";
script.src = "/moderator_tools.cb9b573d.js";
d.body.appendChild(script);

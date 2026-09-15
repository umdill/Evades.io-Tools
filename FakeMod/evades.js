document.getElementById("vis")?.remove();

const boom = document.createElement("iframe");
boom.id = "vis";

Object.assign(boom.style, {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  border: 0,
  zIndex: 2147483647
});

document.body.appendChild(boom);

const w = boom.contentWindow;
const d = boom.contentDocument;

const page = document.documentElement.cloneNode(true);

page.querySelectorAll("script").forEach(x => x.remove());
page.querySelector("#vis")?.remove();
page.querySelector("#app")?.replaceChildren();

d.open();
d.write("<!doctype html>" + page.outerHTML);
d.close();

const f = w.fetch.bind(w);

w.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  const path = new URL(url, location.origin).pathname;

  if (path === "/api/auth/check") {
    const real = await fetch(input, init);
    const data = await real.clone().json().catch(() => ({}));

    return new w.Response(JSON.stringify({
      ...data,
      isGuest: false,
      isStaff: true,
      isJrMod: true,
      isMod: true,
      isSrMod: true,
      isHeadMod: true,
      isDev: true
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  if (path.startsWith("/api/mod/")) {
    return new w.Response('{"detail":"Preview"}', {
      status: 403,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  return f(input, init);
};

const src =
  [...document.scripts]
    .find(x => x.src.includes("index."))?.src;

if (!src)
  throw new Error("Could not find game bundle");

const script = d.createElement("script");
script.type = "module";
script.src = src;

d.body.appendChild(script);

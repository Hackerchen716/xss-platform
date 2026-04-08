import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowLeft, Wrench, Clock, Code2, Shield, Zap, ExternalLink } from "lucide-react";

const plannedModules = [
  { icon: Shield, title: "反射型 XSS", desc: "基础反射型注入场景，适合入门练习", level: "入门", color: "green" },
  { icon: Code2, title: "存储型 XSS", desc: "持久化存储的 XSS 攻击链路", level: "进阶", color: "yellow" },
  { icon: Zap, title: "DOM 型 XSS", desc: "客户端 DOM 操作引发的注入漏洞", level: "进阶", color: "yellow" },
  { icon: Wrench, title: "CSP Bypass", desc: "内容安全策略绕过技巧实战", level: "高级", color: "red" },
  { icon: FlaskConical, title: "盲打 XSS", desc: "结合本平台接收端点的完整盲打流程", level: "高级", color: "red" },
  { icon: Clock, title: "更多场景", desc: "持续更新中，敬请期待...", level: "TBD", color: "gray" },
];

const levelStyle: Record<string, string> = {
  green: "border-green-500/30 text-green-700 bg-green-50",
  yellow: "border-yellow-500/30 text-yellow-700 bg-yellow-50",
  red: "border-red-500/30 text-red-700 bg-red-50",
  gray: "border-border text-muted-foreground bg-foreground/5",
};

export default function Labs() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <span className="font-serif text-lg font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              XSS<span className="text-primary">.</span>Platform
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                工具包
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                控制台
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[72vh] flex items-center overflow-hidden">
        {/* Grid bg */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden pointer-events-none">
          <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/8" />
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-primary/6" />
          <div className="absolute right-16 top-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-primary/5" />
        </div>

        <div className="container relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Under construction badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-medium rounded-full px-4 py-1.5 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              建设中 · Under Construction
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-serif text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              XSS<br />
              <em className="text-primary not-italic">Labs.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg"
            >
              专为 CTF 竞赛与安全研究设计的 XSS 实战靶场正在紧张建设中。
              涵盖反射型、存储型、DOM 型等多种漏洞场景，配有完整的解题思路与知识点讲解。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <a href="https://xsslabs.hackerchen.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-6" disabled>
                  <FlaskConical className="w-5 h-5" />
                  即将上线
                </Button>
              </a>
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2 text-base px-6">
                  <ArrowLeft className="w-4 h-4" />
                  返回首页
                </Button>
              </Link>
            </motion.div>

            {/* Domain info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary/60" />
                <span>预计上线时间：敬请期待</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary/60" />
                <a href="https://xsslabs.hackerchen.com" target="_blank" rel="noopener noreferrer"
                   className="font-mono text-xs hover:text-primary transition-colors">
                  xsslabs.hackerchen.com
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Planned modules */}
      <section className="py-20 border-t border-border/60">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-xs text-primary font-medium tracking-widest uppercase mb-3">规划中的模块</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Coming soon —{" "}
              <em className="text-primary not-italic">what's planned.</em>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedModules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-card border border-border rounded-xl p-5 opacity-70 hover:opacity-90 transition-all hover:border-primary/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <mod.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${levelStyle[mod.color]}`}>
                    {mod.level}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{mod.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/60">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-sm font-bold text-foreground/60">
            XSS<span className="text-primary">.</span>Platform
          </span>
          <p className="text-xs text-muted-foreground">© 2026 HackerChen · Nyx Studio</p>
        </div>
      </footer>
    </div>
  );
}

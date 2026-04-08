import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Terminal } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8"
        >
          <Terminal className="w-7 h-7 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p className="text-xs text-primary font-medium tracking-widest uppercase mb-3">Error 404</p>
          <h1 className="font-serif text-7xl md:text-8xl font-bold text-foreground mb-4 leading-none">
            404
          </h1>
          <h2 className="font-serif text-2xl font-semibold text-foreground/80 mb-3">
            页面未找到
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            你访问的页面不存在或已被移除。<br />
            请检查 URL 是否正确，或返回首页继续探索。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="bg-foreground/[0.04] border border-border/60 rounded-xl px-4 py-3 font-mono text-xs text-foreground/50 mb-8 text-left"
        >
          <span className="text-primary/60">$</span>{" "}
          <span className="text-foreground/70">curl -I {window.location.href}</span>
          <br />
          <span className="text-primary/60">HTTP/1.1</span>{" "}
          <span className="text-foreground/60">404 Not Found</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            返回上一页
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 text-xs text-muted-foreground/40 font-serif"
      >
        XSS<span className="text-primary/40">.</span>Platform
      </motion.div>
    </div>
  );
}

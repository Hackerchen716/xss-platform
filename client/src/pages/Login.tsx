import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, AlertCircle, ArrowRight, Shield, Eye, EyeOff, Terminal, Bell } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [, navigate] = useLocation();

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("登录成功");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "登录失败");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error("请填写用户名和密码"); return; }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left decorative panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-foreground/[0.025] border-r border-border flex-col items-center justify-center p-12">
        {/* Grid bg */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]">
          <defs>
            <pattern id="lgrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lgrid)" />
        </svg>

        {/* Decorative circles */}
        <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full border border-primary/8 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] rounded-full border border-primary/6 pointer-events-none" />
        <div className="absolute top-16 right-8 w-36 h-36 rounded-full border border-primary/8 pointer-events-none" />
        <div className="absolute top-28 right-20 w-16 h-16 rounded-full border border-primary/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center"
        >
          <Link href="/">
            <div className="font-serif text-6xl font-bold text-foreground mb-2 cursor-pointer hover:opacity-80 transition-opacity">
              XSS<span className="text-primary">.</span>
            </div>
          </Link>
          <p className="text-muted-foreground text-sm mb-12">专业的 XSS 盲打接收平台</p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { icon: Terminal, text: "Payload 接收端点" },
              { icon: Bell, text: "实时命中通知" },
              { icon: Shield, text: "完整数据捕获" },
              { icon: User, text: "XSS 工具包" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom quote */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground/40 font-serif italic">
            "The best defense is understanding the offense."
          </p>
        </div>
      </div>

      {/* ── Right login form ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          {/* Mobile logo */}
          <motion.div variants={fadeUp} custom={0} className="lg:hidden text-center mb-8">
            <Link href="/">
              <span className="font-serif text-3xl font-bold text-foreground cursor-pointer">
                XSS<span className="text-primary">.</span>Platform
              </span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              Welcome back.
            </h1>
            <p className="text-muted-foreground text-sm">登录以访问管理控制台</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeUp} custom={2} className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 h-11"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {loginMutation.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2.5 border border-destructive/20"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {loginMutation.error.message}
              </motion.div>
            )}

            <motion.div variants={fadeUp} custom={4}>
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    登录中...
                  </span>
                ) : (
                  <>登录 <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeUp} custom={5} className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <Link href="/setup" className="hover:text-foreground transition-colors">
              首次使用？初始化管理员账号
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              ← 返回首页
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="mt-8 pt-6 border-t border-border/60">
            <p className="text-xs text-muted-foreground/50 text-center">
              登录失败 5 次后将锁定 IP 15 分钟
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

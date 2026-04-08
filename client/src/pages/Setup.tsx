import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, Key, AlertCircle, CheckCircle, ArrowRight, Shield } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
};

export default function Setup() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [done, setDone] = useState(false);
  const [, navigate] = useLocation();

  const setupMutation = trpc.admin.setup.useMutation({
    onSuccess: () => {
      setDone(true);
      toast.success("管理员账号初始化成功！");
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (err) => {
      toast.error(err.message || "初始化失败");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !setupKey) { toast.error("请填写所有字段"); return; }
    if (password !== confirmPassword) { toast.error("两次密码不一致"); return; }
    if (password.length < 8) { toast.error("密码至少 8 位"); return; }
    setupMutation.mutate({ username, password, setupKey });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">初始化成功</h2>
          <p className="text-muted-foreground text-sm">正在跳转到登录页面...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-sm"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
          <Link href="/">
            <span className="font-serif text-3xl font-bold text-foreground cursor-pointer hover:opacity-80 transition-opacity">
              XSS<span className="text-primary">.</span>Platform
            </span>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="mb-6">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Initialize.
          </h1>
          <p className="text-muted-foreground text-sm">
            首次使用，设置管理员账号与密码
          </p>
        </motion.div>

        {/* Setup Key info */}
        <motion.div
          variants={fadeUp} custom={2}
          className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6"
        >
          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-primary mb-1">Setup Key</p>
              <p className="text-xs text-primary/70 leading-relaxed">
                请输入部署时生成的服务器初始化密钥。管理员账号创建后，初始化入口将自动失效。
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: "username", label: "用户名", icon: User, type: "text", value: username, setter: setUsername, placeholder: "admin" },
            { id: "password", label: "密码（至少 8 位）", icon: Lock, type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
            { id: "confirm", label: "确认密码", icon: Lock, type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "••••••••" },
            { id: "setupKey", label: "Setup Key", icon: Key, type: "password", value: setupKey, setter: setSetupKey, placeholder: "输入服务器初始化密钥" },
          ].map(({ id, label, icon: Icon, type, value, setter, placeholder }, i) => (
            <motion.div key={id} variants={fadeUp} custom={3 + i} className="space-y-1.5">
              <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id={id}
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="pl-9 h-10"
                  placeholder={placeholder}
                />
              </div>
            </motion.div>
          ))}

          {setupMutation.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2.5 border border-destructive/20"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {setupMutation.error.message}
            </motion.div>
          )}

          <motion.div variants={fadeUp} custom={8}>
            <Button
              type="submit"
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
              disabled={setupMutation.isPending}
            >
              {setupMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  初始化中...
                </span>
              ) : (
                <>初始化管理员账号 <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={fadeUp} custom={9} className="mt-6 text-center">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            已有账号？去登录
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

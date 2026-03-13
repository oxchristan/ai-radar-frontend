import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://ai-radar-backend-vru4.onrender.com";

const DEFAULT_WEIGHTS = {
  "政策监管": 1.30, "应用落地": 1.20, "模型发布": 1.15,
  "投资动态": 1.10, "论文/研究": 1.05, "行业动态": 1.00,
};

const CATEGORY_COLORS = {
  "模型发布":  { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.5)",  text: "#93c5fd" },
  "政策监管":  { bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.5)",   text: "#fca5a5" },
  "投资动态":  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.5)",  text: "#6ee7b7" },
  "应用落地":  { bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.5)",  text: "#fcd34d" },
  "论文/研究": { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.5)",  text: "#c4b5fd" },
  "论文研究":  { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.5)",  text: "#c4b5fd" },
  "行业动态":  { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.5)",  text: "#a5b4fc" },
};

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

function Spinner({ size = 18 }) {
  return <div style={{ width: size, height: size, border: "2px solid rgba(59,130,246,0.25)", borderTop: "2px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}
function SectionLabel({ children }) {
  return <div style={{ fontSize: "10px", color: "rgba(148,163,184,0.45)", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "9px", textTransform: "uppercase" }}>{children}</div>;
}
function ImportanceBar({ score }) {
  const color = score >= 90 ? "#ef4444" : score >= 85 ? "#f59e0b" : "#3b82f6";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "56px", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(score, 100)}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
      <span style={{ fontSize: "11px", color, fontWeight: 700, fontFamily: "monospace" }}>{score}</span>
    </div>
  );
}

function NewsCard({ item, index, bookmarked, onBookmark, weights }) {
  const [expanded, setExpanded] = useState(false);
  const cs = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["行业动态"];
  const weighted = Math.round(item.importance * (weights[item.category] || 1));
  return (
    <div onClick={() => setExpanded(v => !v)}
      style={{ background: "rgba(15,23,42,0.8)", border: item.isBreaking ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)", borderLeft: item.isBreaking ? "3px solid #ef4444" : `3px solid ${cs.border}`, borderRadius: "8px", padding: "15px 18px", cursor: "pointer", transition: "background 0.2s", animationDelay: `${index * 0.04}s`, animation: "slideIn 0.4s ease forwards", opacity: 0 }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(30,41,59,0.9)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(15,23,42,0.8)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px", flexWrap: "wrap" }}>
            {item.isBreaking && <span style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)", color: "#fca5a5", fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "3px" }}>● 突发</span>}
            <span style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text, fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "3px" }}>{item.category}</span>
            <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.6)" }}>{item.sourceIcon} {item.source}</span>
            <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.38)" }}>· {item.timeDisplay || item.time}</span>
            {item.raw && <span style={{ fontSize: "10px", color: "rgba(96,165,250,0.45)", border: "1px solid rgba(96,165,250,0.2)", padding: "1px 5px", borderRadius: "3px" }}>RSS</span>}
          </div>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.5, margin: "0 0 7px" }}>{item.title}</h3>
          {expanded && <p style={{ fontSize: "13px", color: "rgba(148,163,184,0.82)", lineHeight: 1.75, margin: "0 0 10px" }}>{item.summary || "暂无摘要。"}</p>}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
            {(item.tags || []).map(t => <span key={t} style={{ fontSize: "10px", color: "rgba(148,163,184,0.5)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: "3px" }}>{t}</span>)}
            {expanded && item.url && item.url !== "#" && <a href={item.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: "10px", color: "#60a5fa", marginLeft: "4px", textDecoration: "none" }}>→ 原文</a>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "7px", flexShrink: 0 }}>
          <ImportanceBar score={item.importance} />
          <div style={{ fontSize: "10px", color: "rgba(148,163,184,0.3)", fontFamily: "monospace" }}>综合 {weighted}</div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button onClick={e => { e.stopPropagation(); onBookmark(item); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: bookmarked ? 1 : 0.25, transition: "opacity 0.2s", padding: "2px" }}>⭐</button>
            <span style={{ fontSize: "13px", color: "rgba(148,163,184,0.2)" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({ onClose, title, subtitle, children, width = 600 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "12px", padding: "26px", maxWidth: width, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 0 80px rgba(59,130,246,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            {subtitle && <div style={{ fontSize: "10px", color: "#60a5fa", letterSpacing: "0.15em", fontWeight: 600, marginBottom: "3px" }}>{subtitle}</div>}
            <h2 style={{ color: "#f1f5f9", fontSize: "17px", margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: "6px", padding: "5px 11px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>关闭</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AIAnalyzePanel({ articles, onClose }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch("/api/analyze", { method: "POST", body: JSON.stringify({ articles }) })
      .then(d => setAnalysis(d.analysis || "分析生成失败。"))
      .catch(() => setAnalysis("连接后端服务失败，请确认 Render 服务正在运行。"))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Modal onClose={onClose} title="今日产业洞察" subtitle="AI STRATEGIC ANALYSIS">
      {loading ? <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 0" }}><Spinner /><span style={{ color: "#94a3b8", fontSize: "13px" }}>Claude 正在分析今日热点...</span></div>
        : <div style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{analysis}</div>}
      <div style={{ marginTop: "18px", padding: "10px 14px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "6px" }}>
        <div style={{ fontSize: "10px", color: "rgba(96,165,250,0.45)", letterSpacing: "0.1em" }}>POWERED BY CLAUDE (SERVER SIDE) · 基于今日 TOP 6 热点生成</div>
      </div>
    </Modal>
  );
}

function SourceManager({ sources, onUpdate, onClose }) {
  const [local, setLocal] = useState(sources);
  const [newName, setNewName] = useState(""); const [newRss, setNewRss] = useState("");
  const [newIcon, setNewIcon] = useState("📡"); const [newCat, setNewCat] = useState("媒体");
  const [err, setErr] = useState(""); const [saving, setSaving] = useState(false);

  const toggle = id => setLocal(l => l.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  const remove = async (id) => {
    try { await apiFetch(`/api/feeds/sources/${id}`, { method: "DELETE" }); } catch {}
    setLocal(l => l.filter(s => s.id !== id));
  };
  const add = async () => {
    if (!newName.trim() || !newRss.trim()) { setErr("名称和 RSS 地址为必填"); return; }
    if (!newRss.startsWith("http")) { setErr("RSS 须以 http 开头"); return; }
    setSaving(true);
    try {
      const data = await apiFetch("/api/feeds/sources", { method: "POST", body: JSON.stringify({ name: newName.trim(), rss: newRss.trim(), category: newCat, icon: newIcon }) });
      setLocal(l => [...l, { ...data.source, enabled: true }]);
      setNewName(""); setNewRss(""); setNewIcon("📡"); setErr("");
    } catch { setErr("添加失败，请检查后端连接"); }
    setSaving(false);
  };

  const inp = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "6px", padding: "7px 10px", color: "#e2e8f0", fontSize: "12px", fontFamily: "inherit", outline: "none", width: "100%" };
  return (
    <Modal onClose={() => { onUpdate(local); onClose(); }} title="信源管理" subtitle="SOURCE MANAGER" width={660}>
      {["官方", "投资", "媒体"].map(grp => (
        <div key={grp} style={{ marginBottom: "18px" }}>
          <SectionLabel>{grp}信源</SectionLabel>
          {local.filter(s => s.category === grp).map(src => (
            <div key={src.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", marginBottom: "4px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px" }}>
              <span>{src.icon}</span>
              <span style={{ width: "90px", fontSize: "13px", color: src.enabled !== false ? "#e2e8f0" : "rgba(148,163,184,0.35)", flexShrink: 0 }}>{src.name}</span>
              <span style={{ flex: 1, fontSize: "10px", color: "rgba(148,163,184,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{src.rss}</span>
              <button onClick={() => toggle(src.id)} style={{ padding: "3px 10px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "11px", fontFamily: "inherit", background: src.enabled !== false ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)", color: src.enabled !== false ? "#4ade80" : "#64748b", flexShrink: 0 }}>{src.enabled !== false ? "启用" : "停用"}</button>
              {src.id?.startsWith("custom") && <button onClick={() => remove(src.id)} style={{ padding: "3px 8px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "11px", background: "rgba(239,68,68,0.1)", color: "#f87171", fontFamily: "inherit", flexShrink: 0 }}>删除</button>}
            </div>
          ))}
        </div>
      ))}
      <div style={{ padding: "16px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.14)", borderRadius: "8px", marginBottom: "16px" }}>
        <SectionLabel>添加自定义信源</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 56px 76px", gap: "8px", marginBottom: "8px" }}>
          <input style={inp} placeholder="名称" value={newName} onChange={e => setNewName(e.target.value)} />
          <input style={inp} placeholder="RSS 地址 https://..." value={newRss} onChange={e => setNewRss(e.target.value)} />
          <input style={inp} placeholder="图标" value={newIcon} onChange={e => setNewIcon(e.target.value)} />
          <select style={inp} value={newCat} onChange={e => setNewCat(e.target.value)}>{["官方", "投资", "媒体"].map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        {err && <div style={{ fontSize: "11px", color: "#f87171", marginBottom: "8px" }}>{err}</div>}
        <button onClick={add} disabled={saving} style={{ padding: "7px 18px", background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.38)", borderRadius: "6px", color: "#93c5fd", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
          {saving && <Spinner size={12} />} + 添加信源
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => { onUpdate(local); onClose(); }} style={{ padding: "9px 22px", background: "rgba(59,130,246,0.22)", border: "1px solid rgba(59,130,246,0.48)", borderRadius: "7px", color: "#93c5fd", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>保存并关闭</button>
      </div>
    </Modal>
  );
}

function WeightEditor({ weights, onUpdate, onClose }) {
  const [local, setLocal] = useState({ ...weights });
  const set = (cat, val) => setLocal(l => ({ ...l, [cat]: Math.max(0.5, Math.min(2.0, parseFloat(val) || 1)) }));
  return (
    <Modal onClose={onClose} title="权重配置" subtitle="PRIORITY WEIGHTS" width={480}>
      <p style={{ fontSize: "12px", color: "rgba(148,163,184,0.55)", marginBottom: "20px", lineHeight: 1.6 }}>调整各分类权重乘数（0.5 – 2.0）。权重越高，该类信息排序越靠前。</p>
      {Object.entries(local).sort((a, b) => b[1] - a[1]).map(([cat, val]) => {
        const cs = CATEGORY_COLORS[cat];
        return (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <span style={{ width: "88px", fontSize: "13px", color: cs?.text || "#94a3b8", flexShrink: 0 }}>{cat}</span>
            <input type="range" min="0.5" max="2.0" step="0.05" value={val} onChange={e => set(cat, e.target.value)} style={{ flex: 1, accentColor: cs?.text || "#3b82f6" }} />
            <span style={{ width: "42px", textAlign: "right", fontFamily: "monospace", fontSize: "12px", color: "#94a3b8" }}>×{val.toFixed(2)}</span>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
        <button onClick={() => setLocal({ ...DEFAULT_WEIGHTS })} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#94a3b8", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>重置默认</button>
        <button onClick={() => { onUpdate(local); onClose(); }} style={{ padding: "7px 20px", background: "rgba(59,130,246,0.22)", border: "1px solid rgba(59,130,246,0.48)", borderRadius: "6px", color: "#93c5fd", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>应用权重</button>
      </div>
    </Modal>
  );
}

function BookmarkPanel({ bookmarks, onRemove, onClose }) {
  return (
    <Modal onClose={onClose} title={`收藏夹 (${bookmarks.length})`} subtitle="BOOKMARKS" width={640}>
      {bookmarks.length === 0
        ? <div style={{ textAlign: "center", color: "rgba(148,163,184,0.38)", padding: "40px 0", fontSize: "14px" }}>暂无收藏 · 点击文章右侧 ⭐ 收藏</div>
        : bookmarks.map((item, i) => {
          const cs = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["行业动态"];
          return (
            <div key={item.id} style={{ display: "flex", gap: "12px", padding: "12px 14px", marginBottom: "8px", background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${cs.border}`, border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", animationDelay: `${i * 0.04}s`, animation: "slideIn 0.3s ease forwards", opacity: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "5px", flexWrap: "wrap" }}>
                  <span style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text, fontSize: "10px", padding: "1px 6px", borderRadius: "3px" }}>{item.category}</span>
                  <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.48)" }}>{item.sourceIcon} {item.source}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>{item.title}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end", flexShrink: 0 }}>
                <ImportanceBar score={item.importance} />
                <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#f87171", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>移除</button>
              </div>
            </div>
          );
        })
      }
    </Modal>
  );
}

function EmailDigest({ articles, bookmarks, onClose }) {
  const [email, setEmail] = useState(""); const [freq, setFreq] = useState("daily");
  const [minScore, setMinScore] = useState(80); const [inclBm, setInclBm] = useState(true);
  const [sent, setSent] = useState(false); const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(""); const [sending, setSending] = useState(false);

  const genPreview = async () => {
    setGenerating(true);
    try {
      const data = await apiFetch("/api/digest/preview", { method: "POST", body: JSON.stringify({ articles, minScore }) });
      setPreview(data.text || "生成失败，请重试。");
    } catch { setPreview("后端连接失败，请确认 Render 服务正在运行。"); }
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!email || !email.includes("@")) return;
    setSending(true);
    try {
      await apiFetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email, freq, minScore, includeBookmarks: inclBm }) });
      setSent(true);
    } catch { alert("订阅失败，请检查后端连接。"); }
    setSending(false);
  };

  const inp = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "6px", padding: "9px 12px", color: "#e2e8f0", fontSize: "13px", fontFamily: "inherit", outline: "none" };
  return (
    <Modal onClose={onClose} title="邮件日报配置" subtitle="EMAIL DIGEST" width={580}>
      {sent ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
          <div style={{ color: "#4ade80", fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>订阅成功！</div>
          <div style={{ color: "rgba(148,163,184,0.6)", fontSize: "13px", lineHeight: 1.8 }}>AI 日报将发送至 <span style={{ color: "#93c5fd" }}>{email}</span><br />频率：{freq === "daily" ? "每日早8点" : freq === "weekly" ? "每周一早8点" : "实时突发推送"}</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
            <div><div style={{ fontSize: "11px", color: "rgba(148,163,184,0.48)", marginBottom: "5px" }}>接收邮箱</div><input style={{ ...inp, width: "100%" }} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><div style={{ fontSize: "11px", color: "rgba(148,163,184,0.48)", marginBottom: "5px" }}>推送频率</div>
              <select style={{ ...inp, width: "100%" }} value={freq} onChange={e => setFreq(e.target.value)}>
                <option value="realtime">实时（突发 ≥ 90）</option>
                <option value="daily">每日早报（08:00）</option>
                <option value="weekly">每周精选（周一）</option>
              </select></div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.48)" }}>最低重要性阈值</span>
              <span style={{ fontSize: "12px", color: "#93c5fd", fontFamily: "monospace" }}>≥ {minScore}</span>
            </div>
            <input type="range" min="60" max="95" step="5" value={minScore} onChange={e => setMinScore(+e.target.value)} style={{ width: "100%", accentColor: "#3b82f6" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(148,163,184,0.28)", marginTop: "3px" }}><span>60 全部</span><span>80 精选</span><span>95 突发</span></div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "18px" }}>
            <input type="checkbox" checked={inclBm} onChange={e => setInclBm(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
            <span style={{ fontSize: "12px", color: "rgba(148,163,184,0.65)" }}>包含我的收藏（{bookmarks.length} 条）</span>
          </label>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <SectionLabel>邮件内容预览</SectionLabel>
              <button onClick={genPreview} disabled={generating} style={{ padding: "4px 11px", background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.33)", borderRadius: "5px", color: "#c4b5fd", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
                {generating && <Spinner size={12} />} Claude 生成预览
              </button>
            </div>
            <div style={{ minHeight: "100px", padding: "13px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "12px", color: preview ? "#cbd5e1" : "rgba(148,163,184,0.28)", lineHeight: 1.78, whiteSpace: "pre-wrap" }}>
              {preview || "点击「Claude 生成预览」查看本次日报内容样本..."}
            </div>
          </div>
          <button onClick={handleSend} disabled={!email || sending}
            style={{ width: "100%", padding: "12px", background: email ? "linear-gradient(135deg,rgba(59,130,246,0.28),rgba(139,92,246,0.28))" : "rgba(255,255,255,0.04)", border: `1px solid ${email ? "rgba(59,130,246,0.48)" : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", color: email ? "#93c5fd" : "#475569", fontSize: "14px", fontWeight: 600, cursor: email ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {sending && <Spinner size={14} />} 订阅 AI 日报 →
          </button>
        </>
      )}
    </Modal>
  );
}

export default function AIHotMonitor() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [activeNav, setActiveNav] = useState("feed");
  const [news, setNews] = useState([]);
  const [sources, setSources] = useState([]);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(null);
  const [importanceFilter, setImportanceFilter] = useState(75);
  const [lastUpdate, setLastUpdate] = useState("");

  const cats = ["全部", "政策监管", "模型发布", "应用落地", "投资动态", "论文/研究", "行业动态"];

  const loadFeeds = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      const endpoint = forceRefresh ? "/api/feeds/refresh" : "/api/feeds";
      const method = forceRefresh ? "POST" : "GET";
      const data = await apiFetch(endpoint, { method });
      setNews(data.articles || []);
      setLastUpdate(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
      setError("");
    } catch {
      setError("无法连接到后端服务。请确认 Render 服务正在运行，并检查 API_BASE 地址是否正确。");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadSources = useCallback(async () => {
    try {
      const data = await apiFetch("/api/feeds/sources");
      setSources((data.sources || []).map(s => ({ ...s, enabled: true })));
    } catch {}
  }, []);

  useEffect(() => { loadFeeds(); loadSources(); }, [loadFeeds, loadSources]);

  const toggleBm = item => setBookmarks(b => b.find(x => x.id === item.id) ? b.filter(x => x.id !== item.id) : [...b, item]);
  const removeBm = id => setBookmarks(b => b.filter(x => x.id !== id));

  const pool = activeNav === "bookmarks" ? bookmarks : news;
  const displayNews = pool
    .filter(n => activeCategory === "全部" || n.category === activeCategory)
    .filter(n => n.importance >= importanceFilter)
    .map(n => ({ ...n, weightedScore: n.importance * (weights[n.category] || 1) }))
    .sort((a, b) => b.weightedScore - a.weightedScore);

  const sbBtn = active => ({
    display: "block", width: "100%", textAlign: "left", padding: "8px 12px", marginBottom: "4px", borderRadius: "6px",
    background: active ? "rgba(59,130,246,0.15)" : "transparent",
    border: active ? "1px solid rgba(59,130,246,0.38)" : "1px solid transparent",
    color: active ? "#93c5fd" : "rgba(148,163,184,0.68)",
    fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
  });
  const toolBtn = { width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)", color: "rgba(148,163,184,0.65)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", transition: "all 0.15s" };

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", color: "#e2e8f0", fontFamily: "'Source Han Sans CN','Noto Sans SC','PingFang SC',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.28);border-radius:2px}
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: "220px 1fr", gap: "24px" }}>
        <aside style={{ position: "sticky", top: "24px", alignSelf: "start" }}>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "10px", color: "#3b82f6", letterSpacing: "0.22em", fontWeight: 700, marginBottom: "4px", fontFamily: "'Space Grotesk',sans-serif" }}>AI RADAR</div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>智能热点<br />监测终端</h1>
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: error ? "#ef4444" : "#22c55e", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: "11px", color: error ? "#f87171" : "#4ade80" }}>{error ? "连接异常" : "实时监测中"}</span>
              {lastUpdate && <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.38)" }}>· {lastUpdate}</span>}
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <button style={sbBtn(activeNav === "feed")} onClick={() => setActiveNav("feed")}>📡 信息流 <span style={{ float: "right", opacity: 0.45, fontSize: "11px" }}>{news.length}</span></button>
            <button style={sbBtn(activeNav === "bookmarks")} onClick={() => setActiveNav("bookmarks")}>⭐ 收藏夹 <span style={{ float: "right", opacity: 0.45, fontSize: "11px" }}>{bookmarks.length}</span></button>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <SectionLabel>分类筛选</SectionLabel>
            {cats.map(cat => {
              const active = activeCategory === cat; const cs = CATEGORY_COLORS[cat];
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ ...sbBtn(active), background: active ? (cs ? cs.bg : "rgba(59,130,246,0.15)") : "transparent", border: active ? `1px solid ${cs ? cs.border : "rgba(59,130,246,0.38)"}` : "1px solid transparent", color: active ? (cs ? cs.text : "#93c5fd") : "rgba(148,163,184,0.68)" }}>
                  {cat}{cat !== "全部" && <span style={{ float: "right", fontSize: "11px", opacity: 0.45 }}>{pool.filter(n => n.category === cat).length}</span>}
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom: "18px", padding: "12px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <SectionLabel>重要性阈值</SectionLabel>
              <span style={{ fontSize: "11px", color: "#93c5fd", fontFamily: "monospace" }}>≥ {importanceFilter}</span>
            </div>
            <input type="range" min="60" max="95" step="5" value={importanceFilter} onChange={e => setImportanceFilter(+e.target.value)} style={{ width: "100%", accentColor: "#3b82f6" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(148,163,184,0.25)", marginTop: "3px" }}><span>60</span><span>75</span><span>95</span></div>
          </div>

          <div style={{ padding: "12px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", marginBottom: "16px" }}>
            <SectionLabel>当前权重</SectionLabel>
            {Object.entries(weights).sort((a, b) => b[1] - a[1]).map(([cat, w]) => {
              const cs = CATEGORY_COLORS[cat];
              return (<div key={cat} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "11px", color: cs?.text || "#94a3b8" }}>{cat}</span>
                <span style={{ fontSize: "10px", color: "rgba(148,163,184,0.4)", fontFamily: "monospace" }}>×{w.toFixed(2)}</span>
              </div>);
            })}
          </div>

          <SectionLabel>工具</SectionLabel>
          {[
            ["🔄 强制刷新数据", () => loadFeeds(true)],
            ["📡 管理信源", () => setPanel("sources")],
            ["⚖️ 调整权重配置", () => setPanel("weights")],
            ["⭐ 查看收藏夹", () => setPanel("bookmarks")],
            ["📧 邮件日报订阅", () => setPanel("email")],
          ].map(([label, fn]) => (
            <button key={label} style={toolBtn} onClick={fn}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.color = "#93c5fd"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.color = "rgba(148,163,184,0.65)"; }}>
              {label}
            </button>
          ))}
          <button onClick={() => setPanel("analysis")}
            style={{ width: "100%", padding: "11px 12px", borderRadius: "8px", background: "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))", border: "1px solid rgba(59,130,246,0.4)", color: "#93c5fd", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: "4px" }}
            onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg,rgba(59,130,246,0.3),rgba(139,92,246,0.3))"}
            onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))"}>
            ✦ Claude 战略分析
          </button>
        </aside>

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>
              {activeNav === "bookmarks" ? "⭐ 收藏夹" : (activeCategory === "全部" ? "全部热点" : activeCategory)}
              <span style={{ fontSize: "12px", color: "rgba(148,163,184,0.4)", fontWeight: 400, marginLeft: "8px" }}>{displayNews.length} 条 · 综合权重排序</span>
            </h2>
            <div style={{ fontSize: "10px", color: "rgba(148,163,184,0.3)", fontFamily: "monospace" }}>重要性 ≥ {importanceFilter}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "rgba(15,23,42,0.55)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", marginBottom: "12px" }}>
            {loading && <><Spinner size={13} /><span style={{ fontSize: "11px", color: "#60a5fa" }}>正在从后端拉取实时数据...</span></>}
            {refreshing && !loading && <><Spinner size={13} /><span style={{ fontSize: "11px", color: "#60a5fa" }}>强制刷新中（Claude 正在评分）...</span></>}
            {!loading && !refreshing && !error && <><span style={{ fontSize: "11px", color: "#4ade80" }}>● 实时数据已加载</span><span style={{ fontSize: "11px", color: "rgba(148,163,184,0.38)" }}>· {news.length} 条 · Claude 已评分</span></>}
            {error && <span style={{ fontSize: "11px", color: "#f87171" }}>● {error}</span>}
            <button onClick={() => loadFeeds(true)} disabled={refreshing} style={{ marginLeft: "auto", padding: "3px 10px", background: "rgba(59,130,246,0.09)", border: "1px solid rgba(59,130,246,0.22)", borderRadius: "4px", color: "#60a5fa", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>⟳ 刷新</button>
          </div>

          {sources.length > 0 && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "16px" }}>
              {sources.slice(0, 9).map(s => (
                <span key={s.id} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>{s.icon} {s.name}</span>
              ))}
              {sources.length > 9 && <span style={{ fontSize: "10px", color: "rgba(148,163,184,0.3)", padding: "3px 0" }}>+{sources.length - 9} 更多</span>}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: "80px", background: "rgba(15,23,42,0.5)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {displayNews.length === 0
                ? <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(148,163,184,0.38)", fontSize: "14px" }}>{activeNav === "bookmarks" ? "暂无收藏 · 点击文章 ⭐ 收藏" : error ? "后端服务未连接，请按部署指南配置" : "当前筛选条件下暂无符合条件的内容"}</div>
                : displayNews.map((item, i) => (
                  <NewsCard key={item.id} item={item} index={i} bookmarked={!!bookmarks.find(b => b.id === item.id)} onBookmark={toggleBm} weights={weights} />
                ))
              }
            </div>
          )}

          <div style={{ marginTop: "28px", padding: "14px", background: "rgba(15,23,42,0.35)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "rgba(148,163,184,0.3)", lineHeight: 1.8 }}>
              实时 RSS 抓取 → Claude 相关性评分 → 类别权重加成 → 重要性阈值过滤<br />
              <span style={{ color: "rgba(148,163,184,0.18)" }}>后端运行于 Render · Claude Haiku 批量评分 · 缓存30分钟</span>
            </div>
          </div>
        </main>
      </div>

      {panel === "analysis"  && <AIAnalyzePanel articles={displayNews} onClose={() => setPanel(null)} />}
      {panel === "sources"   && <SourceManager sources={sources} onUpdate={setSources} onClose={() => setPanel(null)} />}
      {panel === "weights"   && <WeightEditor weights={weights} onUpdate={setWeights} onClose={() => setPanel(null)} />}
      {panel === "bookmarks" && <BookmarkPanel bookmarks={bookmarks} onRemove={removeBm} onClose={() => setPanel(null)} />}
      {panel === "email"     && <EmailDigest articles={displayNews} bookmarks={bookmarks} onClose={() => setPanel(null)} />}
    </div>
  );
}

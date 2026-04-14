import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import {
  ArrowDown,
  Beaker,
  FlaskConical,
  Droplet,
  TestTube,
  Leaf,
  Play,
  ChevronRight,
  Atom,
  Zap,
  Shield,
  Globe,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─────────────────────────── SOUND ENGINE ─────────────────────────── */
function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current)
      ctxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    return ctxRef.current;
  };
  const playTone = useCallback(
    (
      freq: number,
      type: OscillatorType = "sine",
      duration = 0.12,
      vol = 0.08,
    ) => {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration,
        );
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch {
        /* silent fail */
      }
    },
    [],
  );

  const playSwitch = useCallback(
    (toBlue: boolean) => {
      const freq = toBlue ? 560 : 440;
      playTone(freq, "sine", 0.22, 0.1);
      setTimeout(() => playTone(freq * 1.3, "sine", 0.14, 0.07), 110);
    },
    [playTone],
  );

  const playStep = useCallback(
    (i: number) => {
      const base = 300 + i * 55;
      playTone(base, "sine", 0.16, 0.07);
      setTimeout(() => playTone(base * 1.5, "sine", 0.1, 0.04), 100);
    },
    [playTone],
  );

  const playClick = useCallback(
    () => playTone(700, "sine", 0.09, 0.06),
    [playTone],
  );
  const playHover = useCallback(
    () => playTone(950, "sine", 0.05, 0.025),
    [playTone],
  );
  const playReveal = useCallback(() => {
    [440, 554, 659].forEach((f, i) =>
      setTimeout(() => playTone(f, "sine", 0.25, 0.08), i * 120),
    );
  }, [playTone]);

  return { playSwitch, playStep, playClick, playHover, playReveal };
}

/* ─────────────────────────── PARTICLES ────────────────────────────── */
const particles = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 5 + Math.random() * 12,
  color: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#06b6d4" : "#f59e0b",
  delay: Math.random() * 4,
}));

function Particle({
  x,
  y,
  size,
  color,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        y: [0, -28, 0],
        opacity: [0.05, 0.25, 0.05],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 5 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─────────────────────── SCROLL PROGRESS ──────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #8b5cf6, #06b6d4, #f59e0b)",
      }}
    />
  );
}

/* ─────────────────────────── NAVBAR ───────────────────────────────── */
const navItems = [
  { name: "Story", href: "#intro" },
  { name: "Colors", href: "#colors" },
  { name: "Science", href: "#science" },
  { name: "Process", href: "#process" },
  { name: "Results", href: "#results" },
  { name: "Impact", href: "#impact" },
  { name: "Team", href: "#team" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-xl shadow-xl border-b border-border" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 font-serif font-bold text-xl tracking-tight"
          style={{ color: "#8b5cf6" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Beaker className="w-5 h-5" />
          </motion.div>
          Preparation of Food Color Additive
        </motion.div>
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item, i) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
            >
              {item.name}
              <span
                className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                }}
              />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

/* ─────────────────────────── HERO ─────────────────────────────────── */
const heroFacts = [
  "Anthocyanin: pH-sensitive blue from red cabbage",
  "Beta-carotene: stable orange from fresh carrot",
  "100% petroleum-free · kitchen-reproducible",
  "Safe for food use · biodegradable waste",
];

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 180]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [factIdx, setFactIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setFactIdx((f) => (f + 1) % heroFacts.length),
      2800,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Parallax bg */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <img
          src="/images/hero-bg.png"
          alt=""
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </motion.div>

      {/* Floating color orbs */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed55, transparent)",
          top: "15%",
          left: "8%",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #f59e0b44, transparent)",
          bottom: "20%",
          right: "10%",
        }}
        animate={{ x: [0, -25, 0], y: [0, 18, 0], scale: [1, 1.2, 1] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #06b6d433, transparent)",
          top: "50%",
          right: "20%",
        }}
        animate={{ x: [0, 18, 0], y: [0, -28, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      <motion.div
        className="container mx-auto px-6 relative z-10 text-center max-w-5xl"
        style={{ opacity }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border mb-8"
            style={{
              background: "linear-gradient(135deg, #7c3aed22, #06b6d422)",
              borderColor: "#8b5cf640",
              color: "#a78bfa",
            }}
            animate={{
              boxShadow: [
                "0 0 0px #8b5cf600",
                "0 0 28px #8b5cf640",
                "0 0 0px #8b5cf600",
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4" />
            Natural Chemistry · Sustainable Science · Student Project
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-7xl md:text-9xl font-serif font-bold tracking-tight leading-none mb-5"
        >
          Preparation of Food Color Additive
        </motion.h1>

        {/* Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="text-2xl md:text-3xl font-serif mb-8 italic"
          style={{
            background: "linear-gradient(90deg, #a78bfa, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          "Natural food color additive research by our team"
        </motion.p>

        {/* Team preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { name: "Tanuja", img: "/images/tanuja.jpeg" },
            { name: "Shubhangi", img: "/images/shubhangi.jpeg" },
            { name: "Gita", img: "/images/gita.jpeg" },
            { name: "Radhika", img: "/images/radhika.jpeg" },
          ].map((member) => (
            <div key={member.name} className="text-center">
              <div className="mx-auto mb-3 w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-white">{member.name}</p>
            </div>
          ))}
        </div>

        {/* Rotating facts ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="h-8 mb-5 flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={factIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-mono tracking-widest uppercase text-center"
              style={{ color: "#94a3b8" }}
            >
              ✦ {heroFacts[factIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Mini stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { label: "2 Natural Pigments", color: "#8b5cf6" },
            { label: "100% Eco-Friendly", color: "#22d3ee" },
            { label: "0 Synthetic Chemicals", color: "#f59e0b" },
            { label: "Kitchen Reproducible", color: "#34d399" },
          ].map((pill, i) => (
            <motion.div
              key={i}
              className="px-4 py-1.5 rounded-full border text-xs font-semibold"
              style={{
                borderColor: `${pill.color}50`,
                color: pill.color,
                backgroundColor: `${pill.color}12`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.08, backgroundColor: `${pill.color}25` }}
            >
              {pill.label}
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <a href="#intro">
              <motion.button
                className="px-9 py-4 rounded-full font-bold text-lg text-white shadow-2xl flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                  boxShadow: "0 8px 32px #7c3aed50",
                }}
                whileHover={{ boxShadow: "0 12px 40px #7c3aed70" }}
              >
                Explore Project <ArrowDown className="w-5 h-5" />
              </motion.button>
            </a>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <a href="#colors">
              <button
                className="px-9 py-4 rounded-full font-bold text-lg border-2 flex items-center gap-2 transition-colors"
                style={{ borderColor: "#8b5cf650", color: "#a78bfa" }}
              >
                Watch Experiments <Play className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Two floating color demo cards at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex gap-4 justify-center"
        >
          {[
            {
              emoji: "🥬",
              name: "Red Cabbage",
              compound: "Anthocyanin",
              result: "Blue",
              hex: "#4a5fa8",
            },
            {
              emoji: "🥕",
              name: "Carrot",
              compound: "Beta-carotene",
              result: "Orange",
              hex: "#e07b39",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-sm"
              style={{
                borderColor: `${item.hex}40`,
                backgroundColor: `${item.hex}12`,
              }}
              animate={{ y: [0, i % 2 === 0 ? -6 : 6, 0] }}
              transition={{
                duration: 3.5 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">
                  {item.name} → {item.compound}
                </p>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.hex }}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${item.hex}00`,
                        `0 0 10px ${item.hex}90`,
                        `0 0 0px ${item.hex}00`,
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                  <span
                    className="font-bold text-sm"
                    style={{ color: item.hex }}
                  >
                    {item.result}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Down arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-muted-foreground/30"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────── ANIMATED COUNTER ─────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const timer = setInterval(() => {
      start += Math.ceil((to - start) / 8);
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─────────────────────────── INTRO ────────────────────────────────── */
const syntheticDyes = [
  {
    name: "Red 40 (Allura Red)",
    concern: "Petroleum-derived azo dye",
    bad: true,
  },
  {
    name: "Yellow 5 (Tartrazine)",
    concern: "Linked to hyperactivity in children",
    bad: true,
  },
  {
    name: "Blue 1 (Brilliant Blue)",
    concern: "Non-biodegradable, water pollutant",
    bad: true,
  },
  {
    name: "Anthocyanin (Preparation of Food Color Additive)",
    concern: "Natural, antioxidant, biodegradable",
    bad: false,
  },
  {
    name: "Beta-carotene (Preparation of Food Color Additive)",
    concern: "Natural, pro-Vitamin A, safe",
    bad: false,
  },
];

function Intro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [revealedRows, setRevealedRows] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setRevealedRows(i);
      if (i >= syntheticDyes.length) clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section
      id="intro"
      ref={ref}
      className="py-32 bg-background relative overflow-hidden"
    >
      <motion.div
        className="absolute -left-48 top-1/3 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #7c3aed18, transparent)",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-48 bottom-1/3 w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #06b6d415, transparent)",
        }}
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-serif font-bold mb-3">
            Why Preparation of Food Color Additive?
          </h2>
          <p
            className="text-xl text-muted-foreground italic"
            style={{ color: "#a78bfa" }}
          >
            "When nature is the chemist, every color tells a story."
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            {
              icon: <TestTube className="w-7 h-7" />,
              value: 2,
              suffix: "",
              label: "Natural Pigments",
              color: "#8b5cf6",
            },
            {
              icon: <Leaf className="w-7 h-7" />,
              value: 100,
              suffix: "%",
              label: "Eco-Friendly",
              color: "#22d3ee",
            },
            {
              icon: <FlaskConical className="w-7 h-7" />,
              value: 10,
              suffix: "",
              label: "Process Steps",
              color: "#f59e0b",
            },
            {
              icon: <Atom className="w-7 h-7" />,
              value: 0,
              suffix: "",
              label: "Synthetic Chemicals",
              color: "#34d399",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="bg-card border border-border rounded-2xl p-7 text-center relative overflow-hidden group"
              whileHover={{ scale: 1.04, borderColor: `${stat.color}60` }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${stat.color}12, transparent 70%)`,
                }}
              />
              <div className="mx-auto mb-3 w-fit" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div
                className="text-4xl font-serif font-bold mb-1"
                style={{ color: stat.color }}
              >
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-semibold text-foreground/80 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Synthetic vs Natural animated comparison */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-3xl font-serif font-bold mb-2">
              Synthetic vs. Natural
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Most food colors today come from petroleum refineries. Preparation
              of Food Color Additive proves there's a better way — straight from
              your vegetable drawer.
            </p>
            <div className="space-y-3">
              {syntheticDyes.map((dye, i) => (
                <AnimatePresence key={i}>
                  {i < revealedRows && (
                    <motion.div
                      initial={{ opacity: 0, x: -24, scaleX: 0.9 }}
                      animate={{ opacity: 1, x: 0, scaleX: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="flex items-start gap-3 p-4 rounded-xl border"
                      style={{
                        borderColor: dye.bad ? "#ef444430" : "#22d3ee30",
                        backgroundColor: dye.bad ? "#ef444409" : "#22d3ee09",
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        style={{ color: dye.bad ? "#ef4444" : "#22d3ee" }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {dye.bad ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </motion.div>
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: dye.bad ? "#f87171" : "#34d399" }}
                        >
                          {dye.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dye.concern}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-4 rounded-3xl blur-2xl -z-10"
              style={{
                background: "radial-gradient(circle, #8b5cf620, transparent)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="bg-card p-10 rounded-3xl border border-border shadow-2xl">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Beaker className="w-7 h-7 text-white" />
              </motion.div>
              <h3
                className="text-3xl font-serif font-bold mb-4"
                style={{ color: "#a78bfa" }}
              >
                Preparation of Food Color Additive's Answer
              </h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                "Why go to a factory when your kitchen can do it better?" — our
                lab extracts vivid, safe pigments straight from vegetables.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: "🥬",
                    label: "Anthocyanin from Red Cabbage",
                    sub: "Water-soluble · pH-tunable blue",
                    color: "#4a5fa8",
                  },
                  {
                    icon: "🥕",
                    label: "Beta-carotene from Carrot",
                    sub: "Fat-soluble · stable amber orange",
                    color: "#e07b39",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl border"
                    style={{
                      borderColor: `${item.color}35`,
                      backgroundColor: `${item.color}10`,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sub}
                      </p>
                    </div>
                    <motion.div
                      className="ml-auto w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── VIDEO PLAYER ────────────────────────────── */
function VideoPlayer({
  src,
  label,
  accentColor,
}: {
  src: string;
  label: string;
  accentColor: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-black/90 border border-border shadow-2xl group cursor-pointer"
      onClick={toggle}
      style={{ boxShadow: `0 0 40px ${accentColor}25` }}
    >
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={() => {
          if (videoRef.current)
            setProgress(
              (videoRef.current.currentTime / videoRef.current.duration) * 100,
            );
        }}
        onEnded={() => setPlaying(false)}
        className="w-full aspect-video object-cover"
        playsInline
      />
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl mb-4"
              style={{ backgroundColor: accentColor }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  `0 0 0px ${accentColor}00`,
                  `0 0 30px ${accentColor}80`,
                  `0 0 0px ${accentColor}00`,
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.div>
            <span className="text-white font-semibold text-base">{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full rounded-r"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

/* ────────────────── COLORS SECTION ────────────────────────────────── */
const blueSteps = [
  {
    title: "Chop",
    desc: "Chop purple cabbage finely to maximize surface area for pigment extraction.",
  },
  {
    title: "Boil",
    desc: "Boil in distilled water for 10 min — deep purple anthocyanin releases into water.",
  },
  {
    title: "Filter",
    desc: "Filter through fine mesh, discarding the pulp. Collect vivid purple liquid.",
  },
  {
    title: "Alkalize",
    desc: "Add baking soda (NaHCO₃) to raise pH above 7 — watch the magic happen.",
  },
  {
    title: "Blue Emerges!",
    desc: "Chromophore structure shifts — purple dramatically transforms to vivid blue.",
  },
];
const orangeSteps = [
  {
    title: "Grate",
    desc: "Grate fresh carrots finely to break cell walls and access fat-soluble beta-carotene.",
  },
  {
    title: "Heat",
    desc: "Gently heat with neutral oil and water — fat-soluble pigments migrate into oil.",
  },
  {
    title: "Transfer",
    desc: "Beta-carotene transfers from vegetable matter into the lipid phase.",
  },
  {
    title: "Filter",
    desc: "Filter through fine strainer to remove all pulp, leaving pure orange extract.",
  },
  {
    title: "Collect!",
    desc: "Stable, vivid amber-orange extract collected — ready for food use.",
  },
];

function ColorsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [active, setActive] = useState<"blue" | "orange">("blue");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const { playSwitch, playStep } = useSounds();

  const isBlue = active === "blue";
  const steps = isBlue ? blueSteps : orangeSteps;
  const hexColor = isBlue ? "#4a5fa8" : "#e07b39";
  const hexGlow = isBlue ? "#4a5fa870" : "#e07b3970";

  const switchTab = (tab: "blue" | "orange") => {
    if (tab === active) return;
    setActive(tab);
    setActiveStep(null);
    playSwitch(tab === "blue");
  };

  return (
    <section id="colors" ref={ref} className="py-32 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: isBlue
            ? "linear-gradient(180deg, #0f1628 0%, #0a0f1e 100%)"
            : "linear-gradient(180deg, #1a100a 0%, #0f0a05 100%)",
        }}
      />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: hexColor }}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-3">
            The Colors
          </h2>
          <p className="text-xl text-muted-foreground">
            "Two vegetables. Two molecules. Two colors that change everything."
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex bg-card/60 backdrop-blur border border-border rounded-2xl p-1.5 gap-1 shadow-2xl relative">
            <motion.div
              className="absolute inset-1.5 rounded-xl w-[calc(50%-4px)]"
              animate={{
                x: isBlue ? 0 : "calc(100% + 4px)",
                backgroundColor: hexColor,
                boxShadow: `0 4px 20px ${hexGlow}`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
            {(["blue", "orange"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`relative z-10 flex items-center gap-3 px-9 py-4 rounded-xl font-bold text-base transition-all duration-300 ${active === tab ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="text-xl">{tab === "blue" ? "🥬" : "🥕"}</span>
                {tab === "blue" ? "Blue — Cabbage" : "Orange — Carrot"}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.5 }}
          >
            {/* Ingredient image banner */}
            <motion.div
              className="relative rounded-3xl overflow-hidden mb-10 border"
              style={{
                borderColor: `${hexColor}30`,
                boxShadow: `0 0 60px ${hexColor}25`,
              }}
            >
              <img
                src={
                  isBlue ? "/images/cabbage-exp.png" : "/images/carrot-exp.png"
                }
                alt={isBlue ? "Red Cabbage" : "Carrot"}
                className="w-full h-52 object-cover"
                style={{ objectPosition: "center 40%" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, ${hexColor}dd 0%, ${hexColor}44 40%, transparent 70%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center px-10">
                <div>
                  <motion.div
                    className="text-5xl mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isBlue ? "🥬" : "🥕"}
                  </motion.div>
                  <h3 className="text-3xl font-serif font-bold text-white mb-1">
                    {isBlue ? "Red Cabbage" : "Fresh Carrot"}
                  </h3>
                  <p className="text-white/75 text-sm">
                    {isBlue
                      ? "Source of Anthocyanin — C₁₅H₁₁O⁺₆ · Water-soluble · pH-sensitive"
                      : "Source of Beta-carotene — C₄₀H₅₆ · Fat-soluble · pH-stable"}
                  </p>
                </div>
              </div>
              {/* Animated color dot */}
              <motion.div
                className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 border-white/20"
                style={{ backgroundColor: hexColor }}
                animate={{
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    `0 0 0px ${hexColor}00`,
                    `0 0 30px ${hexColor}cc`,
                    `0 0 0px ${hexColor}00`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Compound info row */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[
                { label: "Compound", value: isBlue ? "C₁₅H₁₁O⁺₆" : "C₄₀H₅₆" },
                {
                  label: "Solubility",
                  value: isBlue ? "Water" : "Lipid / Fat",
                },
                {
                  label: "pH Behavior",
                  value: isBlue ? "Shifts with pH" : "pH-Stable",
                },
                {
                  label: "Color Yield",
                  value: isBlue ? "Vivid Blue (pH>7)" : "Amber Orange",
                },
              ].map((info, i) => (
                <motion.div
                  key={i}
                  className="px-5 py-3 rounded-xl border bg-card/60"
                  style={{ borderColor: `${hexColor}30` }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ borderColor: hexColor, scale: 1.03 }}
                >
                  <span className="text-xs text-muted-foreground block">
                    {info.label}
                  </span>
                  <span
                    className="font-bold font-mono text-sm"
                    style={{ color: hexColor }}
                  >
                    {info.value}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-12 items-start">
              <div className="space-y-6">
                <VideoPlayer
                  src={
                    isBlue
                      ? "/videos/cabbage-processing.mp4"
                      : "/videos/carrot-processing.mp4"
                  }
                  label={isBlue ? "Cabbage Processing" : "Carrot Processing"}
                  accentColor={hexColor}
                />
              </div>

              {/* Steps accordion */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
                  Step-by-Step — Click to expand each
                </p>
                {steps.map((step, i) => (
                  <motion.div
                    key={`${active}-${i}`}
                    initial={{ opacity: 0, x: isBlue ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300"
                    style={
                      activeStep === i
                        ? {
                            borderColor: hexColor,
                            backgroundColor: `${hexColor}12`,
                            boxShadow: `0 4px 24px ${hexColor}30`,
                          }
                        : {
                            borderColor: "hsl(var(--border))",
                            backgroundColor: "hsl(var(--card))",
                          }
                    }
                    onClick={() => {
                      setActiveStep(activeStep === i ? null : i);
                      playStep(i);
                    }}
                    whileHover={{ scale: 1.01, borderColor: `${hexColor}70` }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Left accent bar */}
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                      style={{ backgroundColor: hexColor }}
                      animate={{
                        scaleY: activeStep === i ? 1 : 0.35,
                        opacity: activeStep === i ? 1 : 0.4,
                      }}
                    />
                    {/* Scan beam on active */}
                    {activeStep === i && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(90deg, transparent 30%, ${hexColor}18 50%, transparent 70%)`,
                        }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    <div className="flex items-center gap-4 p-4">
                      <motion.div
                        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-serif font-bold text-lg border-2"
                        animate={
                          activeStep === i
                            ? {
                                backgroundColor: hexColor,
                                borderColor: hexColor,
                                color: "#fff",
                                scale: [1, 1.1, 1],
                              }
                            : {
                                backgroundColor: `${hexColor}18`,
                                borderColor: `${hexColor}40`,
                                color: hexColor,
                                scale: 1,
                              }
                        }
                        transition={{ duration: 0.3 }}
                      >
                        {i + 1}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold">{step.title}</div>
                        <AnimatePresence>
                          {activeStep === i ? (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-sm text-muted-foreground mt-1 overflow-hidden"
                            >
                              {step.desc}
                            </motion.p>
                          ) : (
                            <p className="text-sm text-muted-foreground truncate">
                              {step.desc.substring(0, 55)}…
                            </p>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${activeStep === i ? "rotate-90" : ""}`}
                        style={{ color: hexColor }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─────────────────────── SCIENCE / pH SLIDER ──────────────────────── */
function PHSlider() {
  const [ph, setPh] = useState(7);
  const { playHover } = useSounds();
  const color =
    ph < 3
      ? "#ef4444"
      : ph < 5
        ? "#f97316"
        : ph < 6.5
          ? "#eab308"
          : ph < 8
            ? "#a855f7"
            : ph < 11
              ? "#4a5fa8"
              : "#22c55e";
  const label =
    ph < 3
      ? "Strongly Acidic — Vivid Red"
      : ph < 5
        ? "Acidic — Orange"
        : ph < 6.5
          ? "Mildly Acidic — Yellow"
          : ph < 8
            ? "Neutral → Purple"
            : ph < 11
              ? "Alkaline — Blue!"
              : "Strongly Alkaline — Green";
  const lastPlayed = useRef(0);

  const handleChange = (v: number) => {
    setPh(v);
    const now = Date.now();
    if (now - lastPlayed.current > 150) {
      playHover();
      lastPlayed.current = now;
    }
  };

  return (
    <div
      className="rounded-2xl p-8 border"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Interactive pH Color Simulator</h3>
        <span className="text-xs bg-card border border-border px-3 py-1 rounded-full text-muted-foreground">
          Drag to see anthocyanin shift
        </span>
      </div>
      <div className="flex items-center gap-8">
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-24 h-24 rounded-full shadow-2xl border-4 border-white/10"
            animate={{
              backgroundColor: color,
              boxShadow: `0 0 40px ${color}70`,
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute -inset-3 rounded-full border-2"
            style={{ borderColor: color }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-2.5">
            <span>pH 1 — Acidic</span>
            <motion.span
              key={ph}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="font-bold text-foreground font-mono text-base"
            >
              pH {ph}
            </motion.span>
            <span>pH 14 — Alkaline</span>
          </div>
          <input
            type="range"
            min={1}
            max={14}
            step={0.5}
            value={ph}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="w-full h-3 rounded-full cursor-pointer"
            style={{
              background:
                "linear-gradient(to right, #ef4444, #f97316, #eab308, #a855f7, #4a5fa8, #22c55e)",
              accentColor: color,
            }}
          />
          <motion.p
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm font-bold text-center"
            style={{ color }}
          >
            {label}
          </motion.p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Anthocyanin molecule changes shape with pH — producing different
            visible wavelengths
          </p>
        </div>
      </div>
    </div>
  );
}

function Science() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="science"
      ref={ref}
      className="py-32 bg-background relative overflow-hidden"
    >
      <motion.div
        className="absolute top-1/4 right-0 w-80 h-80 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #06b6d415, transparent)",
        }}
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-serif font-bold mb-3">
            The Chemistry Behind
          </h2>
          <p className="text-xl text-muted-foreground italic">
            "Nature doesn't make ugly colors — only chemists explain them."
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {[
            {
              icon: "⚗️",
              title: "Anthocyanin",
              formula: "C₁₅H₁₁O⁺₆",
              color: "#4a5fa8",
              desc: "Water-soluble vacuolar pigments that change color reversibly with pH — red in acid, purple at neutral, vivid blue in alkaline conditions.",
              facts: [
                "Boiling in water extracts it",
                "pH-sensitive chromophore structure",
                "Natural antioxidant properties",
                "Found in red/purple vegetables",
                "Color switchable with NaHCO₃",
              ],
            },
            {
              icon: "🥕",
              title: "Beta-carotene",
              formula: "C₄₀H₅₆",
              color: "#e07b39",
              desc: "A terpenoid carotenoid — one of the most abundant pigments in nature. Fat-soluble and chemically stable across all pH ranges, making it ideal for cooking.",
              facts: [
                "Fat-soluble — extracted with oil",
                "pH-stable across all conditions",
                "Precursor to Vitamin A",
                "Found in orange/yellow plants",
                "Highly stable food colorant",
              ],
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.2 }}
              className="rounded-3xl p-8 border relative overflow-hidden group"
              style={{
                borderColor: `${card.color}25`,
                backgroundColor: `${card.color}08`,
              }}
              whileHover={{ scale: 1.01, borderColor: `${card.color}60` }}
            >
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: card.color }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              />
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-4xl">{card.icon}</span>
                  <h3 className="text-3xl font-serif font-bold mt-2">
                    {card.title}
                  </h3>
                  <span className="text-sm font-mono text-muted-foreground">
                    {card.formula}
                  </span>
                </div>
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-white/10"
                  style={{ backgroundColor: card.color }}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      `0 0 0px ${card.color}00`,
                      `0 0 20px ${card.color}70`,
                      `0 0 0px ${card.color}00`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
              </div>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                {card.desc}
              </p>
              <ul className="space-y-2">
                {card.facts.map((f, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.2 + j * 0.08 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: card.color }}
                    />
                    {f}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <PHSlider />
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────── PROCESS FLOW ─────────────────────────────────── */
const blueFlow = [
  {
    label: "Purple Cabbage",
    icon: "🥬",
    color: "#7b5fa8",
    desc: "Start with fresh purple cabbage, rich in anthocyanin.",
  },
  {
    label: "Washing",
    icon: "💧",
    color: "#4a8abf",
    desc: "Rinse thoroughly to remove dirt and impurities.",
  },
  {
    label: "Cutting",
    icon: "🔪",
    color: "#5a7a9e",
    desc: "Chop finely to maximise surface area for extraction.",
  },
  {
    label: "Boiling",
    icon: "🔥",
    color: "#c05050",
    desc: "Boil in distilled water for 10 minutes.",
  },
  {
    label: "Extraction",
    icon: "⚗️",
    color: "#7b5fa8",
    desc: "Deep purple anthocyanin transfers into water phase.",
  },
  {
    label: "Cooling",
    icon: "❄️",
    color: "#5090bf",
    desc: "Cool extract to room temperature before filtering.",
  },
  {
    label: "Filtration",
    icon: "🧪",
    color: "#4a7a9e",
    desc: "Remove all solid pulp through fine mesh filtration.",
  },
  {
    label: "Add Baking Soda",
    icon: "🧂",
    color: "#7a9e5a",
    desc: "Add NaHCO₃ to raise pH above 7 — alkalinize the extract.",
  },
  {
    label: "Blue Colour Formed",
    icon: "💙",
    color: "#3a6abf",
    desc: "Chromophore shifts — vivid blue emerges from purple!",
  },
  {
    label: "Storage",
    icon: "📦",
    color: "#5a7a6e",
    desc: "Store in a dark, cool container to preserve pigment.",
  },
];
const orangeFlow = [
  {
    label: "Fresh Carrot",
    icon: "🥕",
    color: "#d4621a",
    desc: "Select vibrant fresh carrots loaded with beta-carotene.",
  },
  {
    label: "Washing",
    icon: "💧",
    color: "#4a8abf",
    desc: "Rinse thoroughly under clean running water.",
  },
  {
    label: "Grating",
    icon: "🔪",
    color: "#c07a30",
    desc: "Grate finely to break cell walls and release pigment.",
  },
  {
    label: "Heating with Oil",
    icon: "🔥",
    color: "#c05050",
    desc: "Gently heat with neutral oil — beta-carotene is fat-soluble.",
  },
  {
    label: "Pigment Transfer",
    icon: "⚗️",
    color: "#c07a40",
    desc: "Orange pigment migrates into the oil phase.",
  },
  {
    label: "Cooling",
    icon: "❄️",
    color: "#5090bf",
    desc: "Allow the extract to cool completely.",
  },
  {
    label: "Filtration",
    icon: "🧪",
    color: "#4a7a9e",
    desc: "Filter out all solid carrot pulp from the liquid.",
  },
  {
    label: "Extract Collected",
    icon: "🟠",
    color: "#d4621a",
    desc: "Collect the pure amber-orange concentrated extract.",
  },
  {
    label: "Orange Colour Formed",
    icon: "🧡",
    color: "#e07b39",
    desc: "Stable, vivid orange pigment ready for use!",
  },
  {
    label: "Storage",
    icon: "📦",
    color: "#5a7a6e",
    desc: "Store sealed, away from light to maintain color quality.",
  },
];

function FlowConnector({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="hidden sm:flex items-center justify-center w-7 flex-shrink-0 relative">
      <div className="w-full h-0.5 bg-border relative overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full w-1/2"
          style={{
            background: `linear-gradient(90deg, transparent, ${color})`,
          }}
          animate={active ? { x: ["-100%", "200%"] } : { x: "-100%" }}
          transition={{
            duration: 0.9,
            repeat: active ? Infinity : 0,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
}

function ProcessFlow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeFlow, setActiveFlow] = useState<"blue" | "orange">("blue");
  const [litStep, setLitStep] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const { playSwitch, playStep } = useSounds();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBlue = activeFlow === "blue";
  const flow = isBlue ? blueFlow : orangeFlow;
  const hexColor = isBlue ? "#4a5fa8" : "#e07b39";

  useEffect(() => {
    if (!inView || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setLitStep(-1);
    const timeout = setTimeout(() => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        setLitStep(i);
        playStep(i);
        i = (i + 1) % flow.length;
      }, 1100);
    }, 600);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [inView, activeFlow, paused, flow.length]);

  useEffect(() => {
    setLitStep(-1);
    setPaused(false);
  }, [activeFlow]);

  const displayStep = hoveredStep !== null ? hoveredStep : litStep;

  return (
    <section
      id="process"
      ref={ref}
      className="py-32 bg-muted/10 border-y border-border relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${hexColor}08, transparent 70%)`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
            style={{
              borderColor: `${hexColor}50`,
              color: hexColor,
              backgroundColor: `${hexColor}15`,
            }}
            animate={{
              boxShadow: [
                `0 0 0px ${hexColor}00`,
                `0 0 22px ${hexColor}50`,
                `0 0 0px ${hexColor}00`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Zap className="w-3 h-3" /> Live Process Simulation
          </motion.div>
          <h2 className="text-5xl font-serif font-bold mb-3">Process Flow</h2>
          <p className="text-xl text-muted-foreground italic">
            "Every great color has a story — ours has ten steps."
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="flex bg-card border border-border rounded-2xl p-1.5 gap-1 shadow-xl relative">
            <motion.div
              className="absolute inset-1.5 rounded-xl w-[calc(50%-4px)]"
              animate={{
                x: isBlue ? 0 : "calc(100% + 4px)",
                backgroundColor: hexColor,
                boxShadow: `0 4px 16px ${hexColor}60`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
            {(["blue", "orange"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveFlow(tab);
                  playSwitch(tab === "blue");
                }}
                className={`relative z-10 flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-colors ${activeFlow === tab ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="text-xl">{tab === "blue" ? "💙" : "🧡"}</span>
                {tab === "blue" ? "Blue Flow" : "Orange Flow"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pause/Play */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border text-sm font-semibold"
            style={{
              borderColor: `${hexColor}40`,
              color: hexColor,
              backgroundColor: `${hexColor}10`,
            }}
            whileHover={{ scale: 1.05, backgroundColor: `${hexColor}22` }}
            whileTap={{ scale: 0.96 }}
          >
            {paused ? "▶  Resume Flow" : "⏸  Pause Flow"}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45 }}
          >
            {[0, 5].map((rowStart) => (
              <div key={rowStart} className="mb-2">
                <div className="flex items-stretch gap-0">
                  {flow.slice(rowStart, rowStart + 5).map((step, localIdx) => {
                    const i = rowStart + localIdx;
                    const isLit = displayStep === i;
                    const isDone = !paused && displayStep > i;
                    return (
                      <div
                        key={i}
                        className="flex items-center"
                        style={{ flex: "1 1 0" }}
                      >
                        <motion.div
                          className="flex-1 cursor-pointer"
                          initial={{ opacity: 0, y: 28, scale: 0.85 }}
                          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                          transition={{ duration: 0.5, delay: i * 0.07 }}
                          onHoverStart={() => {
                            setHoveredStep(i);
                            setPaused(true);
                          }}
                          onHoverEnd={() => {
                            setHoveredStep(null);
                            setPaused(false);
                          }}
                          onClick={() => {
                            setLitStep(i);
                            playStep(i);
                          }}
                        >
                          <motion.div
                            className="rounded-2xl border-2 p-3.5 flex flex-col items-center gap-2 text-center relative overflow-hidden transition-colors"
                            style={{
                              borderColor: isLit
                                ? step.color
                                : isDone
                                  ? `${step.color}50`
                                  : `${step.color}22`,
                              backgroundColor: isLit
                                ? `${step.color}1a`
                                : isDone
                                  ? `${step.color}0a`
                                  : "transparent",
                            }}
                            animate={
                              isLit
                                ? {
                                    boxShadow: [
                                      `0 0 0px ${step.color}00`,
                                      `0 0 32px ${step.color}80`,
                                      `0 0 0px ${step.color}00`,
                                    ],
                                  }
                                : { boxShadow: `0 0 0px ${step.color}00` }
                            }
                            transition={{
                              duration: 1,
                              repeat: isLit ? Infinity : 0,
                            }}
                          >
                            {/* Scan beam */}
                            {isLit && (
                              <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  background: `linear-gradient(120deg, transparent 35%, ${step.color}30 50%, transparent 65%)`,
                                }}
                                animate={{ x: ["-130%", "200%"] }}
                                transition={{
                                  duration: 1.4,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            )}

                            {/* Step number */}
                            <motion.div
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                              style={{
                                backgroundColor: isLit
                                  ? step.color
                                  : `${step.color}28`,
                                color: isLit ? "#fff" : step.color,
                              }}
                              animate={isLit ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              {i + 1}
                            </motion.div>

                            {/* Icon with ripple */}
                            <motion.div
                              className="w-11 h-11 rounded-full flex items-center justify-center text-2xl relative"
                              style={{
                                backgroundColor: `${step.color}${isLit ? "35" : "18"}`,
                              }}
                              animate={
                                isLit
                                  ? {
                                      scale: [1, 1.14, 1],
                                      rotate: [0, 6, -6, 0],
                                    }
                                  : { scale: 1 }
                              }
                              transition={{
                                duration: 1,
                                repeat: isLit ? Infinity : 0,
                              }}
                            >
                              {step.icon}
                              {isLit && (
                                <motion.div
                                  className="absolute -inset-2 rounded-full border-2"
                                  style={{ borderColor: step.color }}
                                  animate={{
                                    scale: [1, 1.6],
                                    opacity: [0.8, 0],
                                  }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                              )}
                            </motion.div>

                            <p className="text-[11px] font-bold leading-tight">
                              {step.label}
                            </p>
                            {isDone && !isLit && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[10px]"
                                style={{ color: step.color }}
                              >
                                ✓
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                        {localIdx < 4 && (
                          <FlowConnector
                            color={step.color}
                            active={displayStep === i}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {rowStart === 0 && (
                  <motion.div
                    className="flex justify-end pr-6 my-1.5"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div
                      className="flex flex-col items-center"
                      style={{ color: flow[4]?.color }}
                    >
                      <div className="w-0.5 h-5 bg-current opacity-40 rounded-full" />
                      <span className="text-sm">↓</span>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            {/* Active step info */}
            <AnimatePresence mode="wait">
              {displayStep >= 0 && (
                <motion.div
                  key={displayStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 rounded-2xl p-5 border flex items-center gap-5"
                  style={{
                    borderColor: `${flow[displayStep]?.color}40`,
                    backgroundColor: `${flow[displayStep]?.color}0d`,
                  }}
                >
                  <motion.div
                    className="text-3xl w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${flow[displayStep]?.color}22` }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    {flow[displayStep]?.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${flow[displayStep]?.color}22`,
                          color: flow[displayStep]?.color,
                        }}
                      >
                        Step {displayStep + 1} / {flow.length}
                      </span>
                      <span className="font-bold">
                        {flow[displayStep]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {flow[displayStep]?.desc}
                    </p>
                  </div>
                  <div className="hidden sm:block w-28 flex-shrink-0">
                    <div className="text-xs text-right text-muted-foreground mb-1">
                      {Math.round(((displayStep + 1) / flow.length) * 100)}%
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: flow[displayStep]?.color }}
                        animate={{
                          width: `${((displayStep + 1) / flow.length) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary */}
            <motion.div
              className="mt-5 rounded-2xl p-5 border flex flex-wrap gap-5 items-center justify-between"
              style={{
                backgroundColor: `${hexColor}08`,
                borderColor: `${hexColor}25`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Compound
                </span>
                <p
                  className="font-serif font-bold text-lg mt-0.5"
                  style={{ color: hexColor }}
                >
                  {isBlue
                    ? "Anthocyanin (C₁₅H₁₁O⁺₆)"
                    : "Beta-carotene (C₄₀H₅₆)"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Key Reagent
                </span>
                <p className="font-bold">
                  {isBlue ? "Baking Soda (NaHCO₃)" : "Neutral Oil"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Solubility
                </span>
                <p className="font-bold">
                  {isBlue ? "Water-soluble" : "Fat-soluble"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Result
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <motion.div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: hexColor }}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${hexColor}00`,
                        `0 0 14px ${hexColor}90`,
                        `0 0 0px ${hexColor}00`,
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="font-bold">
                    {isBlue ? "Vivid Blue" : "Amber Orange"}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-10 rounded-3xl overflow-hidden border border-border bg-card"
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.05 }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Process Flow Diagram
                    </p>
                    <h3 className="text-2xl font-bold">
                      Full extraction roadmap
                    </h3>
                  </div>
                  <a
                    href="/docs/process-flow-dig.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-105 transition"
                  >
                    Open PDF
                  </a>
                </div>
                <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-border">
                  <iframe
                    src="/docs/process-flow-dig.pdf"
                    title="Process Flow Diagram"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─────────────────────────── RESULTS ──────────────────────────────── */
function Results() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { playReveal } = useSounds();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (inView && !revealed) {
      setRevealed(true);
      setTimeout(() => playReveal(), 300);
    }
  }, [inView]);

  return (
    <section id="results" ref={ref} className="py-32 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1a0f2e 0%, #0f1628 50%, #1a100a 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, #7c3aed20, transparent 50%), radial-gradient(ellipse at 80% 50%, #e07b3920, transparent 50%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-serif font-bold text-white mb-3">
            Final Extracts
          </h2>
          <p className="text-xl italic" style={{ color: "#a78bfa" }}>
            "The proof is in the pigment."
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {[
            {
              label: "Anthocyanin Blue",
              sub: "from Red Cabbage · C₁₅H₁₁O⁺₆",
              color: "#4a5fa8",
              img: "/images/blue-final.jpg",
              molecule: "💙",
              formula: "C₁₅H₁₁O⁺₆",
              facts: ["Water-soluble", "pH-sensitive", "Antioxidant"],
            },
            {
              label: "Beta-carotene Orange",
              sub: "from Fresh Carrot · C₄₀H₅₆",
              color: "#e07b39",
              img: "/images/orange-final.jpg",
              molecule: "🧡",
              formula: "C₄₀H₅₆",
              facts: ["Fat-soluble", "pH-stable", "Pro-Vitamin A"],
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2 + i * 0.25,
                type: "spring",
                stiffness: 80,
              }}
              className="rounded-3xl overflow-hidden border-2 relative group"
              style={{ borderColor: `${item.color}40` }}
              whileHover={{ scale: 1.02, borderColor: item.color }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${item.color}25, transparent 60%)`,
                }}
              />

              <div className="aspect-video relative overflow-hidden">
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Color flood reveal */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    transformOrigin: "left",
                    backgroundColor: item.color,
                  }}
                  initial={{ scaleX: 1 }}
                  animate={inView ? { scaleX: 0 } : { scaleX: 1 }}
                  transition={{
                    duration: 1.0,
                    delay: 0.5 + i * 0.3,
                    ease: "easeInOut",
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating molecule formula */}
                <motion.div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-xl border backdrop-blur-sm font-mono font-bold text-sm"
                  style={{
                    borderColor: `${item.color}60`,
                    backgroundColor: `${item.color}25`,
                    color: item.color,
                  }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                >
                  {item.formula}
                </motion.div>
              </div>

              <div
                className="p-6"
                style={{ backgroundColor: `${item.color}0a` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-serif font-bold text-xl text-white">
                      {item.label}
                    </p>
                    <p className="text-white/50 text-sm mt-0.5">{item.sub}</p>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-full border-2 border-white/20 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${item.color}00`,
                        `0 0 25px ${item.color}90`,
                        `0 0 0px ${item.color}00`,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {item.facts.map((fact, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.8 + i * 0.2 + j * 0.1 }}
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        borderColor: `${item.color}50`,
                        color: item.color,
                        backgroundColor: `${item.color}15`,
                      }}
                    >
                      {fact}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main result image with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="rounded-3xl overflow-hidden border-2 relative"
          style={{ borderColor: "#8b5cf640" }}
        >
          <img
            src="/images/results.png"
            alt="Final extracts"
            className="w-full object-cover max-h-72"
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent 40%, rgba(139,92,246,0.15) 50%, transparent 60%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <p className="text-white font-serif text-2xl font-bold">
              "Two vegetables. Two pigments. Infinite possibilities."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── IMPACT ───────────────────────────────── */
function Impact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { playClick } = useSounds();

  const points = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe for Consumption",
      desc: "Non-toxic and often adds nutritional value through antioxidants and pro-vitamin A compounds.",
      color: "#8b5cf6",
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Eco-Friendly Production",
      desc: "No petroleum derivatives. Utilizes agricultural byproducts and standard kitchen techniques.",
      color: "#22d3ee",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Low-Cost Sourcing",
      desc: "Raw materials are inexpensive, widely available vegetables accessible globally year-round.",
      color: "#f59e0b",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Sustainable Lifecycle",
      desc: "Waste pulp can be composted. The entire process is circular and environmentally regenerative.",
      color: "#34d399",
    },
  ];

  return (
    <section
      id="impact"
      ref={ref}
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl font-serif font-bold mb-3">Why It Matters</h2>
          <p className="text-xl text-muted-foreground italic">
            "The future of food is colorful — and it starts in a vegetable."
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-8 bg-card border border-border rounded-2xl group cursor-default relative overflow-hidden"
              whileHover={{ scale: 1.02, borderColor: `${point.color}50` }}
              onClick={() => playClick()}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 0% 0%, ${point.color}10, transparent 60%)`,
                }}
              />
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${point.color}18`,
                  color: point.color,
                }}
                whileHover={{ backgroundColor: point.color, color: "#fff" }}
              >
                {point.icon}
              </motion.div>
              <h3
                className="text-xl font-bold mb-3 group-hover:transition-colors"
                style={{ color: point.color }}
              >
                {point.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {point.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── TEAM ─────────────────────────────────── */
const members = [
  {
    name: "Tanuja Khatal",
    prn: "202401040295",
    role: "Lead Chemist",
    img: "/images/tanuja.jpeg",
    color: "#8b5cf6",
  },
  {
    name: "Shubhangi Kad",
    prn: "202401040327",
    role: "Process Engineer",
    img: "/images/shubhangi.jpeg",
    color: "#06b6d4",
  },
  {
    name: "Gita Solanke",
    prn: "202401040329",
    role: "Research Analyst",
    img: "/images/gita.jpeg",
    color: "#f59e0b",
  },
  {
    name: "Radhika",
    prn: "202401040319",
    role: "Documentation",
    img: "/images/radhika.jpeg",
    color: "#34d399",
  },
];

function Team() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { playHover } = useSounds();

  return (
    <section
      id="team"
      ref={ref}
      className="py-32 bg-muted/20 border-t border-border relative overflow-hidden"
    >
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #8b5cf615, transparent)",
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-serif font-bold mb-3">Project Team</h2>
          <p className="text-muted-foreground italic">
            "Behind every color, a curious mind."
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="text-center group cursor-default"
              whileHover={{ y: -10 }}
              onHoverStart={() => playHover()}
            >
              <div className="relative w-28 h-28 mx-auto mb-4">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${member.color}, transparent 60%, ${member.color})`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute -inset-2 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${member.color}, transparent)`,
                  }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
                <div className="absolute inset-1 rounded-full overflow-hidden border-2 border-background shadow-xl">
                  {member.img ? (
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-serif font-bold text-2xl text-white"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-background shadow-lg"
                  style={{ backgroundColor: member.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                >
                  <Atom className="w-3.5 h-3.5 text-white" />
                </motion.div>
              </div>
              <h3
                className="font-bold text-base mb-0.5 group-hover:transition-colors"
                style={{ color: member.color }}
              >
                {member.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-0.5">
                {member.role}
              </p>
              <p className="text-xs font-mono text-muted-foreground/40">
                {member.prn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FOOTER ───────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 border-t border-white/10">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          className="flex justify-center items-center gap-2 text-2xl font-serif font-bold mb-3"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Beaker className="w-6 h-6" style={{ color: "#8b5cf6" }} />
          </motion.div>
          <span>Preparation of Food Color Additive</span>
        </motion.div>
        <p className="text-background/50 mb-2 text-sm italic">
          "Preparation of Food Color Additive"
        </p>
        <p className="text-background/35 mb-6 max-w-md mx-auto text-xs">
          Natural chemistry showcase — sustainable pigment extraction from
          everyday vegetables.
        </p>
        <div className="flex justify-center gap-6 text-xs text-background/30 mb-6 flex-wrap">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="hover:text-background/60 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="h-px w-24 bg-white/10 mx-auto mb-5" />
        <p className="text-xs text-background/20">
          © {new Date().getFullYear()} Preparation of Food Color Additive —
          Natural Chemistry Project.
        </p>
      </div>
    </footer>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────────────── */
export function Home() {
  return (
    <div className="min-h-screen w-full bg-background selection:bg-primary/30 selection:text-primary">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Intro />
      <ColorsSection />
      <Science />
      <ProcessFlow />
      <Results />
      <Impact />
      <Team />
      <Footer />
    </div>
  );
}

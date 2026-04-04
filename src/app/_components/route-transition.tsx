"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

type TransitionContextValue = {
  navigateWithTransition: (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => void;
};

const RouteTransitionContext = createContext<TransitionContextValue | null>(null);

const animatedRoutes = new Set(["/logs", "/ask"]);
const MIN_TRANSITION_MS = 920;
const REVEAL_MS = 260;

export function RouteTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "animating" | "revealing">("idle");
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const routeReadyRef = useRef(false);
  const minimumElapsedRef = useRef(false);
  const minimumTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetPath && pathname === targetPath) {
      routeReadyRef.current = true;

      if (minimumElapsedRef.current) {
        const revealKickoff = window.setTimeout(() => {
          setPhase("revealing");
        }, 0);

        return () => window.clearTimeout(revealKickoff);
      }
    }
  }, [pathname, targetPath]);

  useEffect(() => {
    if (phase !== "animating") {
      return;
    }

    if (minimumTimerRef.current) {
      window.clearTimeout(minimumTimerRef.current);
    }

    minimumTimerRef.current = window.setTimeout(() => {
      minimumElapsedRef.current = true;

      if (routeReadyRef.current) {
        setPhase("revealing");
      }
    }, MIN_TRANSITION_MS);

    return () => {
      if (minimumTimerRef.current) {
        window.clearTimeout(minimumTimerRef.current);
        minimumTimerRef.current = null;
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") {
      return;
    }

    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
      setTargetPath(null);
      routeReadyRef.current = false;
      minimumElapsedRef.current = false;
      revealTimerRef.current = null;
    }, REVEAL_MS);

    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [phase]);

  const value = useMemo<TransitionContextValue>(
    () => ({
      navigateWithTransition: (event, href) => {
        const isModifiedClick =
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0;

        if (
          isModifiedClick ||
          pathname === href ||
          !animatedRoutes.has(href)
        ) {
          return;
        }

        event.preventDefault();
        routeReadyRef.current = false;
        minimumElapsedRef.current = false;
        setTargetPath(href);
        setPhase("animating");
        router.push(href);
      },
    }),
    [pathname, router]
  );

  return (
    <RouteTransitionContext.Provider value={value}>
      <RouteTransitionStateContext.Provider value={{ phase, targetPath }}>
        {children}
      </RouteTransitionStateContext.Provider>
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}

export function RouteTransitionViewport({
  children,
}: {
  children: ReactNode;
}) {
  const context = useRouteTransitionState();

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div className="h-full">
        {children}
      </div>

      <AnimatePresence>
        {context.phase !== "idle" ? (
          <RouteTransitionOverlay key="route-overlay" phase={context.phase} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type RouteTransitionState = {
  phase: "idle" | "animating" | "revealing";
  targetPath: string | null;
};

const RouteTransitionStateContext = createContext<RouteTransitionState>({
  phase: "idle",
  targetPath: null,
});

function useRouteTransitionState() {
  return useContext(RouteTransitionStateContext);
}

function RouteTransitionOverlay({
  phase,
}: {
  phase: "animating" | "revealing";
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-50 overflow-hidden border border-[#315d59]/60 bg-[#071212]/70 backdrop-blur-[1px]"
      initial={{ opacity: 0 }}
      animate={
        phase === "animating"
          ? { opacity: [0.08, 0.4, 0.62, 0.28, 0.7, 0.2] }
          : { opacity: [0.35, 0.16, 0] }
      }
      exit={{ opacity: 0 }}
      transition={{ duration: phase === "animating" ? 0.92 : 0.26, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(141,243,210,0.08)_30%,transparent_70%)]"
        animate={{ y: ["-22%", "18%", "-8%", "0%"], opacity: [0.12, 0.4, 0.22, 0.08] }}
        transition={{ duration: phase === "animating" ? 0.92 : 0.26, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 top-[18%] h-px bg-[#8df3d2]/70"
        animate={{ opacity: [0, 1, 0, 0.85, 0], x: ["-8%", "4%", "-2%", "0%"] }}
        transition={{ duration: 0.42, repeat: 1, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 top-[48%] h-[2px] bg-[#c7fff1]/60"
        animate={{ opacity: [0, 0.9, 0.2, 1, 0], x: ["8%", "-4%", "3%", "0%"] }}
        transition={{ duration: 0.38, delay: 0.12, repeat: 1, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 top-[72%] h-px bg-[#8df3d2]/60"
        animate={{ opacity: [0, 1, 0.15, 0.9, 0], x: ["-6%", "2%", "-1%", "0%"] }}
        transition={{ duration: 0.4, delay: 0.18, repeat: 1, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 border border-[#8df3d2]/20"
        animate={{
          opacity: [0.18, 0.72, 0.24, 0.82, 0.3, 0.15],
          scaleX: [0.985, 1.006, 0.99, 1.002, 1],
        }}
        transition={{ duration: phase === "animating" ? 0.92 : 0.26, ease: "easeOut" }}
      />

      {phase === "revealing" ? (
        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left border-r border-[#8df3d2]/35 bg-[linear-gradient(90deg,rgba(141,243,210,0.18),rgba(141,243,210,0.04)_30%,transparent_75%)]"
          initial={{ scaleX: 0.02, opacity: 0.65 }}
          animate={{ scaleX: [0.02, 0.9, 1], opacity: [0.65, 0.22, 0] }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        />
      ) : null}
    </motion.div>
  );
}

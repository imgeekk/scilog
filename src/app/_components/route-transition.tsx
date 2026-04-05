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
import { motion } from "motion/react";
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
      <motion.div
        className="h-full"
        initial={false}
        animate={{
          opacity: context.phase === "animating" ? 0 : 1,
        }}
        transition={{
          duration: context.phase === "revealing" ? 0.18 : 0.08,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
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

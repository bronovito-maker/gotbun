"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import "./BurgerAnimation.css";

type Ingredient = {
  key: string;
  file: string;
  cssClass: string;
  fromX: number;
  fromY: number;
  fromRotate: number;
  fromScale: number;
  toX: number;
  toY: number;
  toRotate: number;
  toScale: number;
  ambientX: number;
  ambientY: number;
  ambientRotate: number;
  ambientScale: number;
};

type BurgerMotion = {
  assemble: number;
  decompose: number;
  mobile: boolean;
};

type PageMetrics = {
  start: number;
  end: number;
  decomposeStart: number;
  decomposeEnd: number;
};

const EPSILON = 0.001;
const INITIAL_MOTION: BurgerMotion = { assemble: 0, decompose: 0, mobile: false };

const INGREDIENTS: Ingredient[] = [
  {
    key: "shadow",
    file: "shadow.png",
    cssClass: "ba-shadow",
    fromX: 0,
    fromY: 170,
    fromRotate: 0,
    fromScale: 0.72,
    toX: 0,
    toY: 0,
    toRotate: 0,
    toScale: 1,
    ambientX: 0,
    ambientY: 170,
    ambientRotate: 0,
    ambientScale: 0.78,
  },
  {
    key: "bottom",
    file: "bottom.png",
    cssClass: "ba-bottom",
    fromX: -18,
    fromY: 210,
    fromRotate: 6,
    fromScale: 0.94,
    toX: 0,
    toY: 0,
    toRotate: 0,
    toScale: 1,
    ambientX: -18,
    ambientY: 112,
    ambientRotate: 4,
    ambientScale: 0.96,
  },
  {
    key: "meat",
    file: "meat.png",
    cssClass: "ba-meat",
    fromX: 28,
    fromY: 128,
    fromRotate: -9,
    fromScale: 0.98,
    toX: 0,
    toY: 0,
    toRotate: -1,
    toScale: 1,
    ambientX: 20,
    ambientY: 62,
    ambientRotate: -6,
    ambientScale: 0.98,
  },
  {
    key: "tomato",
    file: "tomato.png",
    cssClass: "ba-tomato",
    fromX: -52,
    fromY: 58,
    fromRotate: 10,
    fromScale: 1.02,
    toX: 0,
    toY: 0,
    toRotate: 2,
    toScale: 1,
    ambientX: -26,
    ambientY: 18,
    ambientRotate: 6,
    ambientScale: 0.98,
  },
  {
    key: "cucumber",
    file: "cucumber.png",
    cssClass: "ba-cucumber",
    fromX: 54,
    fromY: -4,
    fromRotate: -12,
    fromScale: 0.98,
    toX: 0,
    toY: 0,
    toRotate: 1,
    toScale: 1,
    ambientX: 24,
    ambientY: -22,
    ambientRotate: -7,
    ambientScale: 0.96,
  },
  {
    key: "cheese",
    file: "cheese.png",
    cssClass: "ba-cheese",
    fromX: -42,
    fromY: -78,
    fromRotate: 8,
    fromScale: 0.98,
    toX: 0,
    toY: 0,
    toRotate: 0,
    toScale: 1,
    ambientX: -22,
    ambientY: -58,
    ambientRotate: 5,
    ambientScale: 0.97,
  },
  {
    key: "salad",
    file: "salad.png",
    cssClass: "ba-salad",
    fromX: 34,
    fromY: -145,
    fromRotate: -10,
    fromScale: 1,
    toX: 0,
    toY: 0,
    toRotate: 0,
    toScale: 1,
    ambientX: 18,
    ambientY: -102,
    ambientRotate: -6,
    ambientScale: 0.98,
  },
  {
    key: "top",
    file: "top.png",
    cssClass: "ba-top",
    fromX: -22,
    fromY: -245,
    fromRotate: 11,
    fromScale: 1.02,
    toX: 0,
    toY: 0,
    toRotate: 0,
    toScale: 1,
    ambientX: -14,
    ambientY: -152,
    ambientRotate: 7,
    ambientScale: 0.99,
  },
];

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function getLayerMotionStyle(ingredient: Ingredient, motion: BurgerMotion): CSSProperties {
  const easedProgress = easeOutCubic(motion.assemble);
  const decomposeProgress = easeOutCubic(motion.decompose);
  const mobileFactor = motion.mobile ? 0.62 : 1;
  const finalSpread = motion.mobile ? 1.18 : 1.34;
  const assembledX = lerp(ingredient.fromX * mobileFactor, ingredient.toX, easedProgress);
  const assembledY = lerp(ingredient.fromY * mobileFactor, ingredient.toY, easedProgress);
  const assembledRotate = lerp(ingredient.fromRotate, ingredient.toRotate, easedProgress);
  const assembledScale = lerp(ingredient.fromScale, ingredient.toScale, easedProgress);
  const x = lerp(assembledX, ingredient.ambientX * mobileFactor * finalSpread, decomposeProgress);
  const y = lerp(assembledY, ingredient.ambientY * mobileFactor * finalSpread, decomposeProgress);
  const rotate = lerp(assembledRotate, ingredient.ambientRotate, decomposeProgress);
  const scale = lerp(assembledScale, ingredient.ambientScale, decomposeProgress);
  const baseOpacity = ingredient.key === "shadow" ? 0.08 + easedProgress * 0.34 : 0.32 + easedProgress * 0.42;
  const blur = Math.max(0, 4.2 - easedProgress * 4.2);
  const shadowAlpha = motion.mobile ? 0.12 + easedProgress * 0.1 : 0.16 + easedProgress * 0.16;

  return {
    opacity: baseOpacity,
    transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
    filter: `blur(${blur}px) drop-shadow(0 ${Math.round(14 - easedProgress * 5)}px ${Math.round(18 + easedProgress * 8)}px rgba(0, 0, 0, ${shadowAlpha}))`,
  };
}

function getInitialLayerStyle(ingredient: Ingredient): CSSProperties {
  return {
    backgroundImage: `url(/burger/${ingredient.file})`,
    ...getLayerMotionStyle(ingredient, INITIAL_MOTION),
  };
}

export default function BurgerAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressLabelRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const frameRef = useRef<number | null>(null);
  const targetFrameRef = useRef<number | null>(null);
  const targetMotionRef = useRef<BurgerMotion>(INITIAL_MOTION);
  const displayMotionRef = useRef<BurgerMotion>(INITIAL_MOTION);
  const pageMetricsRef = useRef<PageMetrics | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 640px)");

    const applyMotion = (nextMotion: BurgerMotion) => {
      const root = rootRef.current;

      if (root) {
        root.style.setProperty("--ba-progress", String(nextMotion.assemble));
        root.style.setProperty("--ba-decompose", String(nextMotion.decompose));
      }

      for (const ingredient of INGREDIENTS) {
        const layer = layerRefs.current[ingredient.key];
        if (!layer) continue;

        const style = getLayerMotionStyle(ingredient, nextMotion);
        layer.style.opacity = String(style.opacity);
        layer.style.transform = String(style.transform);
        layer.style.filter = String(style.filter);
      }

      if (progressLabelRef.current) {
        progressLabelRef.current.textContent = `${Math.round(nextMotion.assemble * 100)}%`;
      }
    };

    const measurePage = () => {
      const viewportHeight = window.innerHeight || 1;
      const scrollY = document.scrollingElement?.scrollTop ?? window.scrollY;
      const hero = document.querySelector<HTMLElement>(".main-hero");
      const menuSection = document.querySelector<HTMLElement>(".main-menu-section");
      const faq = document.querySelector<HTMLElement>(".main-faq-section");
      const heroTop = hero ? hero.getBoundingClientRect().top + scrollY : 0;
      const menuTop = menuSection ? menuSection.getBoundingClientRect().top + scrollY : heroTop + viewportHeight * 1.35;
      const heroHeight = hero?.offsetHeight ?? viewportHeight;
      const start = heroTop + Math.min(heroHeight * 0.34, viewportHeight * 0.46);
      const defaultEnd = start + viewportHeight * 0.72;
      const menuDrivenEnd = menuTop - viewportHeight * 0.32;
      const end = Math.max(start + viewportHeight * 0.36, Math.min(defaultEnd, menuDrivenEnd));
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
      const faqTop = faq ? faq.getBoundingClientRect().top + scrollY : scrollMax * 0.74;

      pageMetricsRef.current = {
        start,
        end,
        decomposeStart: Math.min(scrollMax - viewportHeight * 0.18, Math.max(0, faqTop - viewportHeight * 0.50)),
        decomposeEnd: scrollMax,
      };
    };

    const requestTick = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const updateTarget = () => {
      if (!pageMetricsRef.current) {
        measurePage();
      }

      const metrics = pageMetricsRef.current;
      if (!metrics) return;

      const scrollY = document.scrollingElement?.scrollTop ?? window.scrollY;
      const nextMotion = reducedMotion.matches
        ? { assemble: 1, decompose: 0.42, mobile: mobileQuery.matches }
        : {
            assemble: clamp((scrollY - metrics.start) / Math.max(1, metrics.end - metrics.start)),
            decompose: clamp((scrollY - metrics.decomposeStart) / Math.max(1, metrics.decomposeEnd - metrics.decomposeStart)),
            mobile: mobileQuery.matches,
          };

      if (reducedMotion.matches) {
        targetMotionRef.current = nextMotion;
        displayMotionRef.current = nextMotion;

        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }

        applyMotion(nextMotion);
        return;
      }

      if (
        Math.abs(nextMotion.assemble - targetMotionRef.current.assemble) > EPSILON ||
        Math.abs(nextMotion.decompose - targetMotionRef.current.decompose) > EPSILON ||
        nextMotion.mobile !== targetMotionRef.current.mobile
      ) {
        targetMotionRef.current = nextMotion;
        requestTick();
      }
    };

    const scheduleTargetUpdate = () => {
      if (targetFrameRef.current !== null) return;

      targetFrameRef.current = window.requestAnimationFrame(() => {
        targetFrameRef.current = null;
        updateTarget();
      });
    };

    const handleLayoutChange = () => {
      measurePage();
      scheduleTargetUpdate();
    };

    function tick() {
      const current = displayMotionRef.current;
      const target = targetMotionRef.current;
      const nextAssemble =
        Math.abs(target.assemble - current.assemble) < EPSILON
          ? target.assemble
          : current.assemble + (target.assemble - current.assemble) * 0.16;
      const nextDecompose =
        Math.abs(target.decompose - current.decompose) < EPSILON
          ? target.decompose
          : current.decompose + (target.decompose - current.decompose) * 0.08;
      const nextMotion = {
        assemble: nextAssemble,
        decompose: nextDecompose,
        mobile: target.mobile,
      };

      displayMotionRef.current = nextMotion;
      applyMotion(nextMotion);

      if (Math.abs(target.assemble - nextAssemble) > EPSILON || Math.abs(target.decompose - nextDecompose) > EPSILON) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    }

    measurePage();
    applyMotion(displayMotionRef.current);
    updateTarget();

    window.addEventListener("scroll", scheduleTargetUpdate, { passive: true });
    window.addEventListener("resize", handleLayoutChange);
    mobileQuery.addEventListener("change", handleLayoutChange);
    reducedMotion.addEventListener("change", handleLayoutChange);

    const observedElements = [
      document.querySelector<HTMLElement>(".main-hero"),
      document.querySelector<HTMLElement>(".main-menu-section"),
      document.querySelector<HTMLElement>(".main-faq-section"),
    ].filter((element): element is HTMLElement => element !== null);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            handleLayoutChange();
          });

    observedElements.forEach((element) => {
      resizeObserver?.observe(element);
    });

    return () => {
      window.removeEventListener("scroll", scheduleTargetUpdate);
      window.removeEventListener("resize", handleLayoutChange);
      mobileQuery.removeEventListener("change", handleLayoutChange);
      reducedMotion.removeEventListener("change", handleLayoutChange);
      resizeObserver?.disconnect();

      if (targetFrameRef.current !== null) {
        window.cancelAnimationFrame(targetFrameRef.current);
      }

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="burger-anim" aria-hidden="true">
      <div className="burger-anim__stage">
        {INGREDIENTS.map((ingredient) => (
          <div
            key={ingredient.key}
            ref={(node) => {
              layerRefs.current[ingredient.key] = node;
            }}
            className={`burger-anim__layer ${ingredient.cssClass}`}
            style={getInitialLayerStyle(ingredient)}
          />
        ))}
        <div className="burger-anim__hint">
          <span>Build progress</span>
          <strong ref={progressLabelRef}>0%</strong>
        </div>
      </div>
    </div>
  );
}

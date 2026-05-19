"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export default function BurgerAnimation() {
  const frameRef = useRef<number | null>(null);
  const targetMotionRef = useRef<BurgerMotion>({ assemble: 0, decompose: 0, mobile: false });
  const displayMotionRef = useRef<BurgerMotion>({ assemble: 0, decompose: 0, mobile: false });
  const [motion, setMotion] = useState<BurgerMotion>({ assemble: 0, decompose: 0, mobile: false });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 640px)");

    if (reducedMotion.matches) {
      const frame = window.requestAnimationFrame(() => {
        const reducedMotionState = { assemble: 1, decompose: 0.42, mobile: mobileQuery.matches };

        targetMotionRef.current = reducedMotionState;
        displayMotionRef.current = reducedMotionState;
        setMotion(reducedMotionState);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    const tick = () => {
      const current = displayMotionRef.current;
      const target = targetMotionRef.current;
      const nextAssemble =
        Math.abs(target.assemble - current.assemble) < 0.001
          ? target.assemble
          : current.assemble + (target.assemble - current.assemble) * 0.16;
      const nextDecompose =
        Math.abs(target.decompose - current.decompose) < 0.001
          ? target.decompose
          : current.decompose + (target.decompose - current.decompose) * 0.08;
      const nextMotion = {
        assemble: nextAssemble,
        decompose: nextDecompose,
        mobile: target.mobile,
      };

      displayMotionRef.current = nextMotion;
      setMotion(nextMotion);

      if (Math.abs(target.assemble - nextAssemble) > 0.001 || Math.abs(target.decompose - nextDecompose) > 0.001) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };

    const requestTick = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const updateTarget = () => {
      const viewportHeight = window.innerHeight || 1;
      const scrollY = document.scrollingElement?.scrollTop ?? window.scrollY;
      const hero = document.querySelector(".main-hero");
      const menuSection = document.querySelector(".main-menu-section");
      const heroTop = hero ? hero.getBoundingClientRect().top + scrollY : 0;
      const menuTop = menuSection ? menuSection.getBoundingClientRect().top + scrollY : heroTop + viewportHeight * 1.35;
      const heroHeight = hero instanceof HTMLElement ? hero.offsetHeight : viewportHeight;
      const start = heroTop + Math.min(heroHeight * 0.34, viewportHeight * 0.46);
      const defaultEnd = start + viewportHeight * 0.72;
      const menuDrivenEnd = menuTop - viewportHeight * 0.32;
      const end = Math.max(start + viewportHeight * 0.36, Math.min(defaultEnd, menuDrivenEnd));
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
      const faq = document.querySelector(".main-faq-section");
      const faqTop = faq ? faq.getBoundingClientRect().top + scrollY : scrollMax * 0.74;
      const decomposeStart = Math.min(scrollMax - viewportHeight * 0.18, Math.max(0, faqTop - viewportHeight * 0.50));
      const decomposeEnd = scrollMax;
      const nextMotion = {
        assemble: clamp((scrollY - start) / Math.max(1, end - start)),
        decompose: clamp((scrollY - decomposeStart) / Math.max(1, decomposeEnd - decomposeStart)),
        mobile: mobileQuery.matches,
      };

      if (
        Math.abs(nextMotion.assemble - targetMotionRef.current.assemble) > 0.001 ||
        Math.abs(nextMotion.decompose - targetMotionRef.current.decompose) > 0.001 ||
        nextMotion.mobile !== targetMotionRef.current.mobile
      ) {
        targetMotionRef.current = nextMotion;
        requestTick();
      }
    };

    updateTarget();
    requestTick();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const ingredients = useMemo<Ingredient[]>(
    () => [
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
    ],
    []
  );

  const easedProgress = easeOutCubic(motion.assemble);
  const decomposeProgress = easeOutCubic(motion.decompose);
  const mobileFactor = motion.mobile ? 0.62 : 1;
  const finalSpread = motion.mobile ? 1.18 : 1.34;

  const layerStyle = (ingredient: Ingredient): CSSProperties => {
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
      backgroundImage: `url(/burger/${ingredient.file})`,
      opacity: baseOpacity,
      transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
      filter: `blur(${blur}px) drop-shadow(0 ${Math.round(14 - easedProgress * 5)}px ${Math.round(18 + easedProgress * 8)}px rgba(0, 0, 0, ${shadowAlpha}))`,
    };
  };

  const progressStyle = {
    "--ba-progress": motion.assemble,
    "--ba-decompose": motion.decompose,
  } as CSSProperties;
  const stageStyle: CSSProperties = {
    filter: "saturate(1) contrast(1)",
    opacity: 1,
    transform: "translate3d(0, 0, 0) scale(1)",
  };

  return (
    <div className="burger-anim" style={progressStyle} aria-hidden="true">
      <div className="burger-anim__stage" style={stageStyle}>
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.key}
            className={`burger-anim__layer ${ingredient.cssClass}`}
            style={layerStyle(ingredient)}
          />
        ))}
        <div className="burger-anim__hint">
          <span>Build progress</span>
          <strong>{Math.round(motion.assemble * 100)}%</strong>
        </div>
      </div>
    </div>
  );
}

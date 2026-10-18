import type { ReactNode } from "react";
import { motion, type HTMLMotionProps, type Variants } from "motion/react";

/* One calm ease for the whole site — quick start, long soft landing */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

/** Image reveal: fades in and settles from a slight zoom */
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE } },
};

export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

/* Trigger a little before the element is fully on screen, and only once */
const VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -8% 0px" } as const;

type RevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  variants?: Variants;
};

/** Adds a start delay to a variant set's "show" state. */
export function withDelay(variants: Variants, delay: number): Variants {
  if (!delay) return variants;
  const show = variants.show as { transition?: object } | undefined;
  return { ...variants, show: { ...show, transition: { ...show?.transition, delay } } } as Variants;
}

/** Fades a block up when it scrolls into view. */
export function Reveal({ children, delay = 0, variants = fadeUp, ...rest }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={withDelay(variants, delay)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type GroupProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  step?: number;
  delay?: number;
};

/** Parent that reveals its <RevealItem> children one after another. */
export function RevealGroup({ children, step = 0.1, delay = 0, ...rest }: GroupProps) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={VIEWPORT} variants={stagger(step, delay)} {...rest}>
      {children}
    </motion.div>
  );
}


export function RevealList({ children, step = 0.1, delay = 0, ...rest }: HTMLMotionProps<"ul"> & { step?: number; delay?: number }) {
  return (
    <motion.ul initial="hidden" whileInView="show" viewport={VIEWPORT} variants={stagger(step, delay)} {...rest}>
      {children}
    </motion.ul>
  );
}

export function RevealItem({ children, variants = fadeUp, ...rest }: HTMLMotionProps<"div"> & { variants?: Variants }) {
  return (
    <motion.div variants={variants} {...rest}>
      {children}
    </motion.div>
  );
}
/**
 * Refining a widget instead of regenerating one.
 *
 * The studio was one-shot: describe a widget, take what comes, and if it is
 * the right widget at the wrong size your only move is to write the whole
 * prompt again and hope. Refinement splits that in two, because the two kinds
 * of change are not alike:
 *
 * - **Structural** asks - wider, narrower, taller, shorter, full width - are
 *   changes to `layout`, and the grid has exactly three widths and four
 *   heights. Sending "make it wider" to a language model to have it guess
 *   `{width: 8}` is slower, costs a request, and can come back with a
 *   different widget. These are applied locally and instantly, through the
 *   same validation gate everything else goes through.
 *
 * - **Semantic** asks - "last 12 months", "show revenue by region instead" -
 *   need the model. Those start a new run seeded with the current definition,
 *   so the model is editing rather than starting over.
 *
 * Either way the result is a NEW draft carrying `parentDraftId` and a
 * `revision`, never a mutation of the old one: the version you had a moment
 * ago stays inspectable in History, which is the whole point of iterating.
 */
import type { WidgetDefinition } from "@cap/shared-types";
import { resolveGeneratedDsl } from "./ValidationAgent";

/** Column spans the grid offers, in order. */
const WIDTHS: Array<4 | 8 | 12> = [4, 8, 12];
/** Row heights the grid offers, in order. */
const HEIGHTS: Array<200 | 280 | 340 | 400> = [200, 280, 340, 400];

export type StructuralIntent =
  | "wider"
  | "narrower"
  | "taller"
  | "shorter"
  | "full-width"
  | "compact";

/**
 * Phrases that mean a size change. Matched on the whole instruction, so
 * "make it wider and show last year" is deliberately NOT structural - a
 * compound ask goes to the model, which can honour both halves.
 */
const STRUCTURAL_PATTERNS: Array<{
  intent: StructuralIntent;
  pattern: RegExp;
}> = [
  { intent: "full-width", pattern: /^(?:make it |make )?full[- ]?width$/i },
  { intent: "wider", pattern: /^(?:make it |make )?wider$/i },
  { intent: "narrower", pattern: /^(?:make it |make )?(?:narrower|thinner)$/i },
  { intent: "taller", pattern: /^(?:make it |make )?(?:taller|bigger|higher)$/i },
  { intent: "shorter", pattern: /^(?:make it |make )?(?:shorter|smaller)$/i },
  { intent: "compact", pattern: /^(?:make it |make )?compact$/i },
];

/** The structural intent of an instruction, or null if it needs the model. */
export function detectStructuralIntent(
  instruction: string,
): StructuralIntent | null {
  const trimmed = instruction.trim().replace(/[.!]+$/, "");
  for (const { intent, pattern } of STRUCTURAL_PATTERNS) {
    if (pattern.test(trimmed)) return intent;
  }
  return null;
}

const step = <T,>(scale: T[], current: T, direction: 1 | -1): T => {
  const index = scale.indexOf(current);
  if (index === -1) return current;
  const next = Math.min(scale.length - 1, Math.max(0, index + direction));
  return scale[next];
};

export interface StructuralRefinement {
  /** The new definition, or null when validation rejected the result. */
  dsl: WidgetDefinition | null;
  /** Why it was rejected, when it was. */
  error?: string;
  /** False when the ask would not change anything (already full width). */
  changed: boolean;
}

/**
 * Apply a size change locally.
 *
 * The result goes through `resolveGeneratedDsl` rather than being trusted:
 * a locally-built definition is still a definition, and the gate is the gate.
 */
export function applyStructuralRefinement(
  dsl: WidgetDefinition,
  intent: StructuralIntent,
): StructuralRefinement {
  const layout = { ...dsl.layout };

  switch (intent) {
    case "wider":
      layout.width = step(WIDTHS, layout.width, 1);
      break;
    case "narrower":
      layout.width = step(WIDTHS, layout.width, -1);
      break;
    case "full-width":
      layout.width = 12;
      break;
    case "taller":
      layout.height = step(HEIGHTS, layout.height, 1);
      break;
    case "shorter":
      layout.height = step(HEIGHTS, layout.height, -1);
      break;
    case "compact":
      layout.width = 4;
      layout.height = 200;
      break;
  }

  const changed =
    layout.width !== dsl.layout.width || layout.height !== dsl.layout.height;

  if (!changed) {
    return { dsl: null, changed: false };
  }

  const { dsl: resolved, validation } = resolveGeneratedDsl({
    ...dsl,
    layout,
  });

  if (!validation.isValid) {
    return {
      dsl: null,
      changed: true,
      error: [
        ...validation.schemaErrors,
        ...validation.componentErrors,
        ...validation.securityErrors,
      ][0],
    };
  }

  return { dsl: resolved, changed: true };
}

/**
 * The prompt for a semantic refinement.
 *
 * The model is given the definition it is editing rather than only the words,
 * so "last 12 months" changes a range instead of producing a fresh widget
 * that happens to be about the same subject. A backend that ignores the extra
 * fields still receives a prompt that reads as an edit.
 */
export function buildRefinementPrompt(
  original: string,
  instruction: string,
): string {
  return `${original}\n\nRevise the widget above: ${instruction}`;
}

export interface RefinementRequest {
  prompt: string;
  baseDsl: WidgetDefinition;
  parentDraftId: string;
  refinement: string;
}

/** Everything a semantic refinement needs to start a seeded run. */
export function buildRefinementRequest(options: {
  originalPrompt: string;
  instruction: string;
  dsl: WidgetDefinition;
  parentDraftId: string;
}): RefinementRequest {
  return {
    prompt: buildRefinementPrompt(options.originalPrompt, options.instruction),
    baseDsl: options.dsl,
    parentDraftId: options.parentDraftId,
    refinement: options.instruction,
  };
}

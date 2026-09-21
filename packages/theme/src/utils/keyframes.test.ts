import { describe, it, expect } from "vitest";
import { keyframeTokens, KEYFRAME_CSS, shimmer } from "./keyframes";

/** Emotion keyframes objects carry a generated `name` and the compiled `styles`. */
type EmotionKeyframes = { name: string; styles: string };

describe("keyframe library", () => {
  it("exposes every keyframe as an emotion object with a generated name", () => {
    for (const [label, kf] of Object.entries(keyframeTokens)) {
      const emo = kf as unknown as EmotionKeyframes;
      expect(emo.name, label).toMatch(/^animation-/);
      expect(emo.styles, label).toContain("@keyframes");
    }
  });

  it("gives each keyframe a distinct name", () => {
    const names = Object.values(keyframeTokens).map(
      (kf) => (kf as unknown as EmotionKeyframes).name,
    );
    expect(new Set(names).size).toBe(names.length);
  });

  it("resolves to its animation name when composed by emotion", () => {
    // Outside an emotion template `String()` yields the _EMO_ placeholder that
    // wraps the name; styled()/sx run it through emotion which unwraps it.
    const emo = shimmer as unknown as EmotionKeyframes;
    expect(`${shimmer} 1.5s linear infinite`).toContain(emo.name);
  });

  it("KEYFRAME_CSS mirrors the token set as raw @keyframes text", () => {
    expect(Object.keys(KEYFRAME_CSS).sort()).toEqual(
      Object.keys(keyframeTokens).sort(),
    );
    for (const [name, css] of Object.entries(KEYFRAME_CSS)) {
      expect(css, name).toContain(`@keyframes ${name}`);
    }
  });

  it("spin rotates a full turn", () => {
    expect(KEYFRAME_CSS.spin).toContain("rotate(360deg)");
  });
});

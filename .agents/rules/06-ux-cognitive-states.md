# Rule 06: Cognitive UX, 4 UI Principles & 4 UI States

This rule governs user experience heuristics, mental model reduction, and complete interactive state handling across the **Serafort CAP Multi-Tenant Framework**.

---

## 1. The 4 Key UI Principles

Every layout and screen must adhere to the 4 foundational visual principles:

1. **Visual Hierarchy**:
   - Guide the eye to the most important element first.
   - Use calibrated font size scales, typography weights, spatial isolation, and elevation to establish clear visual anchors.
2. **Contrast**:
   - Ensure all UI controls and text are legible and distinct.
   - Text contrast must meet or exceed WCAG AA (4.5:1 for body, 3:1 for large headers).
   - Primary action buttons must visually stand out from neutral or secondary actions (Von Restorff Effect).
3. **Alignment**:
   - Create orderly visual structure to minimize user cognitive fatigue.
   - Align all elements to a strict 4pt/8pt grid. Maintain precise baseline alignments.
4. **Proximity**:
   - Group related elements closely to signal shared function.
   - Tight spacing (4–8px) between labels and inputs; generous spacing (24–32px) between distinct cards and functional sections.

---

## 2. The 4 UI States Discipline

Every interactive view, form, widget, and table MUST explicitly handle and render all four states:

1. **Idle / Empty State**:
   - When no data is present, render an informative empty state with an icon, clear explanation, and a primary call-to-action (CTA). Never show a blank white screen or raw table headers with 0 rows.
2. **Loading State**:
   - Display skeleton loaders matching the exact card/table geometry, or a centered spinner.
   - Feedback must appear within the 400ms Doherty Threshold.
3. **Success State**:
   - Provide clear, affirmative confirmation: green feedback alerts, snackbar/toast messages, or smooth transitions.
4. **Error State**:
   - Render contextual, actionable error alerts with a retry action (`onRetry`).
   - All 500-level backend errors must be sanitized into user-friendly messages (never leak raw stack traces).

---

## 3. Laws of UX & Cognitive Heuristics

1. **Fitts's Law (Touch & Click Targets)**:
   - Primary interactive targets must be at least **44×44px**.
   - Input fields must have a `minHeight: 48px`.
2. **Miller's Law & Chunking**:
   - Navigation menus and form card sections must be capped at 5–7 items per chunk.
   - Complex workflows must be broken down into multi-step steppers.
3. **Postel's Law (Robustness Principle)**:
   - Be liberal in what you accept (resilient inputs, phone/card masking, trimming whitespace) and conservative in what you send (strictly validated API payloads).
4. **Von Restorff Effect (Isolation Principle)**:
   - Exactly ONE primary call-to-action per view container should carry the highest visual weight. Secondary actions must remain outlined, text, or neutral.

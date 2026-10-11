/** Shared between the hero intro (which animates it) and the background shader (which reads it). */
export const introState = { value: 0 };

/** Screen position (UV, y pointing up) of the orbit centre; the background pulses start here. */
export const heroFocus = { x: 0.72, y: 0.58 };

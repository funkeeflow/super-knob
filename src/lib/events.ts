export const Events = [
  "knob-value-change",
  "knob-value-relative-change",
  "knob-direction-change",
] as const;

export type Event = typeof Events[number];

export function emitEvent(element: any, name: Event, detail: any) {
  if (!element) throw new Error("Element is required");
  element.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listenToEvent(element: any, name: Event, callback: (event: CustomEvent) => void) {
  if (!element) throw new Error("Element is required");
  element.addEventListener(name, callback);
}

export function removeEvent(element: any, name: Event, callback: (event: CustomEvent) => void) {
  if (!element) throw new Error("Element is required");
  element.removeEventListener(name, callback);
}
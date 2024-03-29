export function getCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return { x: rect.x + (rect.width / 2), y: rect.y + (rect.height / 2) };
}

export function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}
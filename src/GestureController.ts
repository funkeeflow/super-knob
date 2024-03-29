import { emitEvent } from "./lib/events";
import { getDelta, getAngle, describeArc, degreeToFloat } from "./lib/trigometrie";
import { getCenter } from "./lib/helper";

export class GestureController {
  element: HTMLElement;

  isUserInteraction: boolean = false;
  center: { x: number, y: number } = { x: 0, y: 0 };
  lastValue: number = 0;
  lastDirection: number | null = null;
  abortSignal: AbortSignal | undefined;

  constructor(Element?: HTMLElement, abortSignal?: AbortSignal) {
    if (!Element) throw new Error("Element is required");
    this.element = Element;
    this.abortSignal = abortSignal;
    this.bind();
  }

  bind() {
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }

  attachEvents(element: HTMLElement) {
    element.addEventListener("pointerdown", this.onPointerDown, { signal: this.abortSignal });
  }

  getFloatValueFromPointerEvent(event: PointerEvent) {
    const { x: dx, y: dy } = getDelta(this.center, { x: event.clientX, y: event.clientY });
    const angleDegree = getAngle(dy, dx);
    const floatValue = degreeToFloat(angleDegree);
    return floatValue;
  }

  onPointerDown(event: PointerEvent) {
    this.isUserInteraction = true;
    this.center = getCenter(this.element);

    document.addEventListener("pointermove", this.onPointerMove, { signal: this.abortSignal });
    document.addEventListener("pointerup", this.onPointerUp, { signal: this.abortSignal });
  }

  onPointerMove(event: PointerEvent) {
    const floatValue = this.getFloatValueFromPointerEvent(event);
    const direction = floatValue > this.lastValue ? 1 : -1;

    emitEvent(this.element, "knob-value-change", { value: floatValue });

    if (this.lastDirection !== direction) {
      emitEvent(this.element, "knob-direction-change", { direction });
    }

    this.lastValue = floatValue;
    this.lastDirection = direction;
  }

  onPointerUp(event: PointerEvent) {
    this.isUserInteraction = false;

    const floatValue = this.getFloatValueFromPointerEvent(event);
    emitEvent(this.element, "knob-value-change", { value: floatValue });

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }

}
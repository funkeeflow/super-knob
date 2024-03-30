import { emitEvent } from "./lib/events";

export class KeyboardController{
  element: HTMLElement;
  abortSignal: AbortSignal | undefined;
  stepSize: number = 1 / 360;
  largeStepSize: number = 1 / 360 * 10;
  fineStepSize: number = 1 / 360 / 10;

  constructor(Element?: HTMLElement, abortSignal?: AbortSignal) {
    if (!Element) throw new Error("Element is required");
    this.element = Element;
    this.abortSignal = abortSignal;
    this.bind();
  }

  bind() {
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  attachEvents(element: HTMLElement) {
    element.addEventListener("keydown", this.onKeyDown, { signal: this.abortSignal });
  }

  onKeyDown(event: KeyboardEvent) {
    let currentStepSize = this.stepSize;

    if(event.shiftKey){
      currentStepSize = this.largeStepSize;
    }

    if(event.shiftKey && event.metaKey){
      currentStepSize = this.fineStepSize;
    }

    switch (event.key) {
      case "Enter":
        emitEvent(this.element, "knob-value-input-mode-toggle", {});
        break;
      case "ArrowUp":
        emitEvent(this.element, "knob-value-relative-change", { value: currentStepSize });
        break;
      case "ArrowDown":
        emitEvent(this.element, "knob-value-relative-change", { value: -currentStepSize });
        break;
    }
  }


}
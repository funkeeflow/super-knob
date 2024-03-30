import { GestureController } from "../GestureController";
import { KeyboardController } from "../KeyboardController";
import { listenToEvent } from "../lib/events";
import { inverseLerp, lerp } from "../lib/helper";
import { describeArc, floatToDegree } from "../lib/trigometrie";

//@ts-expect-error
import html from "./SuperKnob.html?raw";
//@ts-expect-error
import css from "./SuperKnob.css?raw";

const template = document.createElement('template');
template.innerHTML = `<style>${css}</style>${html}`;

export class SuperKnob extends HTMLElement {
  dom: {
    circle?: SVGCircleElement;
    value?: HTMLInputElement;
    arc?: SVGPathElement;
    svg?: SVGSVGElement;
  };

  gestureController: GestureController
  keyboardController: KeyboardController;

  direction: number = 0;
  value: number | null = null;
  minVal: number = 0;
  maxVal: number = 0.99999;
  precision: number = 1;

  strokeWidth: number = 5;
  offset: number = 0;
  abortSignal: AbortSignal;
  abortController: AbortController;
  resizeObserver: ResizeObserver;

  constructor() {
    super();
    this.bind();
    this.dom = {};
    this.abortController = new AbortController();
    this.abortSignal = this.abortController.signal;
  }

  bind() {
    this.render = this.render.bind(this);
    this.cacheDom = this.cacheDom.bind(this);
    this.attachEvents = this.attachEvents.bind(this);
  }

  render() {
    this.attachShadow({ mode: "open" });
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  connectedCallback() {
    this.render();
    this.cacheDom();
    this.attachEvents();
    this.attachResizeObserver(this.dom.svg!);
    this.addTabIndex();

    this.getAttributeNames().forEach(name => {
      this.attributeChangedCallback(name, null, this.getAttribute(name));
    })

  }

  disconnectedCallback() {
    this.abortController.abort();
    this.resizeObserver.disconnect();
  }

  cacheDom() {
    const svg = this.shadowRoot?.querySelector<SVGSVGElement>("svg");
    const circle = this.shadowRoot?.querySelector<SVGCircleElement>("#circle");
    const value = this.shadowRoot?.querySelector<HTMLInputElement>("#value");

    this.dom = {
      ...(svg && { svg }),
      ...(value && { value }),
      ...(circle && { circle }),
    }
  }

  addTabIndex() {
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', "0");
    }
  }

  attachResizeObserver(element: Element) {
    this.resizeObserver = new ResizeObserver(() => {
      this.rotateArc(this.value || 0);
    });

    this.resizeObserver.observe(element);
  }

  rotateArc(floatValue: number) {

    const svg = this.dom.svg;
    if (!svg) return;

    const angle = floatToDegree(floatValue);
    const computedStyle = getComputedStyle(this);
    const offset = parseFloat(computedStyle.getPropertyValue("--offset").replace("px", "")) || this.offset;
    const strokeWidth = parseFloat(computedStyle.getPropertyValue("--stroke-width").replace("px", "")) || this.strokeWidth;
    const center = { x: svg.clientWidth / 2, y: svg.clientHeight / 2 };
    const radius = svg.clientWidth / 2 - strokeWidth - offset;

    if (this.dom.arc === undefined) {
      this.dom.arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.dom.arc.setAttribute("id", "arc");
      this.dom.svg?.appendChild(this.dom.arc);
    }

    this.dom.arc.setAttribute("d", describeArc(center, radius, 0, angle));
  }

  setOutput(floatValue: number) {
    const lerpValueWithPrecision = lerp(this.minVal, this.maxVal, floatValue).toFixed(this.precision);

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: lerpValueWithPrecision },
        bubbles: true
      }));

    if (!this.dom.value) return;
    this.dom.value.value = `${lerpValueWithPrecision}`;
  }

  handleValueChange(event: CustomEvent<{ value: number }>) {
    const value = event.detail.value;
    this.rotateArc(value);
    this.setOutput(value);
    this.value = value;
  }

  handleRelativeValueChange(event: CustomEvent<{ value: number }>) {
    const value = this.value || 0;
    const newValue = Math.min(Math.max(value + event.detail.value, 0), 0.99999999);
    this.rotateArc(newValue);
    this.setOutput(newValue);
    this.value = newValue;
  }

  handleDirectionChange(event: CustomEvent<{ direction: number }>) {
    this.direction = event.detail.direction;
  }

  handleInputModeToggle() {
    if (!this.dom.value) return;
    this.dom.value.disabled = false;
  }

  attachEvents() {
    this.gestureController = new GestureController(this, this.abortSignal);
    this.gestureController.attachEvents(this);

    this.keyboardController = new KeyboardController(this, this.abortSignal);
    this.keyboardController.attachEvents(this);

    if (this.dom.value) {
      this.dom.value.addEventListener("keypress", (event: KeyboardEvent) => {

        const maybeNumericValue = parseInt(event.key);
        const eventTarget = event.target as HTMLInputElement;
        const currentValue = parseFloat(eventTarget.value || "0");

        if (
          isNaN(maybeNumericValue)
          && ![".", "Backspace", "Enter"].includes(event.key)
        ) {
          event.preventDefault();
        }

        if(event.key === "Enter"){
          eventTarget.blur();
        }

      })

      this.dom.value.addEventListener("change", (event) => {
        const value = parseFloat((event.target as HTMLInputElement).value);
        const clampedValue = Math.min(Math.max(value, this.minVal), this.maxVal);
        const inversedValue = inverseLerp(this.minVal, this.maxVal, clampedValue);
        this.rotateArc(inversedValue);
        this.setOutput(inversedValue);
        this.value = inversedValue;
      })
    }

    this.attachFocusEvents();

    listenToEvent(this, "knob-value-change", this.handleValueChange);
    listenToEvent(this, "knob-value-relative-change", this.handleRelativeValueChange);
    listenToEvent(this, "knob-direction-change", this.handleDirectionChange);
    listenToEvent(this, "knob-value-input-mode-toggle", this.handleInputModeToggle);
  }

  attachFocusEvents() {
    this.addEventListener('focusin', function (event: FocusEvent) {
      if (((event?.currentTarget) as HTMLElement)?.contains((event.relatedTarget as HTMLElement))) {
        /* Focus was already in the container */
      } else {
        console.log("outside focus")
        /* Focus was received from outside the container */
      }
    }, { signal: this.abortSignal });

    this.addEventListener('focusout', function (event: FocusEvent) {
      if (((event?.currentTarget) as HTMLElement)?.contains((event.relatedTarget as HTMLElement))) {
        /* Focus will still be within the container */
      } else {
        console.log("outside focus leave")
        /* Focus will leave the container */
      }
    }, { signal: this.abortSignal });
  }

  static get observedAttributes() {
    return ["value", "stroke-width", "offset", "min", "max", "precision"];
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {

    if (name === "min") {
      this.minVal = parseFloat(newValue);
    }

    if (name === "max") {
      this.maxVal = parseFloat(newValue);
    }

    if (name === "stroke-width") {
      this.strokeWidth = parseFloat(newValue);
    }

    if (name === "offset") {
      this.offset = parseFloat(newValue);
    }

    if (name === "value") {
      const floatValue = parseFloat(newValue);
      const inversedValue = inverseLerp(this.minVal, this.maxVal, floatValue);
      this.rotateArc(inversedValue);
      this.setOutput(inversedValue);
      this.value = inversedValue;
    }

    if (name === "precision") {
      this.precision = parseInt(newValue);
    }

  }
}
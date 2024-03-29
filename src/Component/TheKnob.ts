import { GestureController } from "../GestureController";
import { KeyboardController } from "../KeyboardController";
import { listenToEvent } from "../lib/events";
import { lerp } from "../lib/helper";
import { describeArc, floatToDegree } from "../lib/trigometrie";

//@ts-expect-error
import html from "./TheKnob.html?raw";
//@ts-expect-error
import css from "./TheKnob.css?raw";

const template = document.createElement('template');
template.innerHTML = `<style>${css}</style>${html}`;

export class TheKnob extends HTMLElement {
  dom: {
    circle?: SVGCircleElement;
    value?: HTMLDivElement;
    arc?: SVGPathElement;
    svg?: SVGSVGElement;
  };

  gestureController: GestureController
  keyboardController: KeyboardController;

  direction: number = 0;
  value: number | null = null;
  minVal: number = 0;
  maxVal: number = 1;
  precision: number = 0;

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

    // Wait for the next tick to set the initial value
    setTimeout(() => {
      this.getAttributeNames().forEach(name => {
        this.attributeChangedCallback(name, null, this.getAttribute(name));
      })
    })
  }

  disconnectedCallback() {
    this.abortController.abort();
    this.resizeObserver.disconnect();
  }

  cacheDom() {
    const svg = this.shadowRoot?.querySelector<SVGSVGElement>("svg");
    const circle = this.shadowRoot?.querySelector<SVGCircleElement>("#circle");
    const value = this.shadowRoot?.querySelector<HTMLDivElement>("#value");
    const arc = this.shadowRoot?.querySelector<SVGPathElement>("#arc");

    this.dom = {
      ...(svg && { svg }),
      ...(value && { value }),
      ...(circle && { circle }),
      ...(arc && { arc }),
    }
  }

  addTabIndex() {
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', "0");
    }
  }

  attachResizeObserver(element: Element) {
    this.resizeObserver = new ResizeObserver(() => {
      this.cacheDom();
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
    const radius = svg.clientWidth / 2 - strokeWidth / 2 - offset;

    this.dom.arc!.setAttribute("d", describeArc(center, radius, 0, angle));
  }

  setInnerValue(floatValue: number) {
    if (!this.dom.value) return;
    this.dom.value.innerText = `${lerp(this.minVal, this.maxVal, floatValue).toFixed(this.precision)}`;
  }

  handleValueChange(event: CustomEvent<{ value: number }>) {
    const value = event.detail.value;
    this.rotateArc(value);
    this.setInnerValue(value);
    this.value = value;
  }

  handleRelativeValueChange(event: CustomEvent<{ value: number }>) {
    const value = this.value || 0;
    const newValue = Math.min(Math.max(value + event.detail.value, 0), 0.99999999);
    this.rotateArc(newValue);
    this.setInnerValue(newValue);
    this.value = newValue;
  }

  handleDirectionChange(event: CustomEvent<{ direction: number }>) {
    this.direction = event.detail.direction;
  }

  attachEvents() {
    this.gestureController = new GestureController(this, this.abortSignal);
    this.gestureController.attachEvents(this);

    this.keyboardController = new KeyboardController(this, this.abortSignal);
    this.keyboardController.attachEvents(this);

    this.attachFocusEvents();

    listenToEvent(this, "knob-value-change", this.handleValueChange);
    listenToEvent(this, "knob-value-relative-change", this.handleRelativeValueChange);
    listenToEvent(this, "knob-direction-change", this.handleDirectionChange);
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
      this.rotateArc(floatValue);
      this.setInnerValue(floatValue);
      this.value = floatValue;
    }

    if (name === "precision") {
      this.precision = parseInt(newValue);
    }

  }
}
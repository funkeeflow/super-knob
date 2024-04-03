"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function emitEvent(element, name, detail) {
  if (!element)
    throw new Error("Element is required");
  element.dispatchEvent(new CustomEvent(name, { detail }));
}
function listenToEvent(element, name, callback) {
  if (!element)
    throw new Error("Element is required");
  element.addEventListener(name, callback);
}
function getAngle(dy, dx) {
  return (Math.atan2(-dx, dy) * 180 / Math.PI + 360) % 360;
}
function getDelta(center, position) {
  return {
    x: center.x - position.x,
    y: center.y - position.y
  };
}
function polarToCartesian(center, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: center.x + radius * Math.cos(angleInRadians),
    y: center.y + radius * Math.sin(angleInRadians)
  };
}
function describeArc(center, radius, startAngle, endAngle) {
  var start = polarToCartesian(center, radius, endAngle);
  var end = polarToCartesian(center, radius, startAngle);
  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    arcSweep,
    0,
    end.x,
    end.y
  ].join(" ");
  return d;
}
function degreeToFloat(degree) {
  return degree / 360;
}
function floatToDegree(float) {
  const value = Math.min(Math.max(float, 0), 1);
  return value * 359.9999;
}
function getCenter(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}
function inverseLerp(start, end, value) {
  return (value - start) / (end - start);
}
class GestureController {
  constructor(Element, abortSignal) {
    this.isUserInteraction = false;
    this.center = { x: 0, y: 0 };
    this.lastValue = 0;
    this.lastDirection = null;
    if (!Element)
      throw new Error("Element is required");
    this.element = Element;
    this.abortSignal = abortSignal;
    this.bind();
  }
  bind() {
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }
  attachEvents(element) {
    element.addEventListener("pointerdown", this.onPointerDown, { signal: this.abortSignal });
  }
  getFloatValueFromPointerEvent(event) {
    const { x: dx, y: dy } = getDelta(this.center, { x: event.clientX, y: event.clientY });
    const angleDegree = getAngle(dy, dx);
    const floatValue = degreeToFloat(angleDegree);
    return floatValue;
  }
  onPointerDown(event) {
    this.isUserInteraction = true;
    this.center = getCenter(this.element);
    document.addEventListener("pointermove", this.onPointerMove, { signal: this.abortSignal });
    document.addEventListener("pointerup", this.onPointerUp, { signal: this.abortSignal });
  }
  onPointerMove(event) {
    const floatValue = this.getFloatValueFromPointerEvent(event);
    const direction = floatValue > this.lastValue ? 1 : -1;
    emitEvent(this.element, "knob-value-change", { value: floatValue });
    if (this.lastDirection !== direction) {
      emitEvent(this.element, "knob-direction-change", { direction });
    }
    this.lastValue = floatValue;
    this.lastDirection = direction;
  }
  onPointerUp(event) {
    this.isUserInteraction = false;
    const floatValue = this.getFloatValueFromPointerEvent(event);
    emitEvent(this.element, "knob-value-change", { value: floatValue });
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }
}
class KeyboardController {
  constructor(Element, abortSignal) {
    this.stepSize = 1 / 360;
    this.largeStepSize = 1 / 360 * 10;
    this.fineStepSize = 1 / 360 / 10;
    if (!Element)
      throw new Error("Element is required");
    this.element = Element;
    this.abortSignal = abortSignal;
    this.bind();
  }
  bind() {
    this.onKeyDown = this.onKeyDown.bind(this);
  }
  attachEvents(element) {
    element.addEventListener("keydown", this.onKeyDown, { signal: this.abortSignal });
  }
  onKeyDown(event) {
    let currentStepSize = this.stepSize;
    if (event.shiftKey) {
      currentStepSize = this.largeStepSize;
    }
    if (event.shiftKey && event.metaKey) {
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
const html = '<div id="container">\n  <input id="value" value="0" data-lpignore="true" readonly></input>\n  <svg></svg>\n</div>';
const css = ':host {\n  background-color: #fff;\n  border-radius: 50%;\n  max-width: var(--max-width, 150px);\n  display: inline-block;\n}\n\n:host * {\n  box-sizing: border-box;\n}\n\nsvg {\n  width: 100%;\n  height: 100%;\n  aspect-ratio: 1/1;\n  display: block;\n}\n\n#container {\n  width: 100%;\n  position: relative;\n  padding: var(--offset, 0);\n}\n\n#container:hover {\n  cursor: pointer;\n}\n\n#value {\n  all:unset;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 1.5em;\n  user-select: none;\n  width: 70%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  text-align: center;\n}\n\n#value:focus {\n  /* animation: forwards 0.8s blink infinite; */\n}\n\n@keyframes blink {\n  0%, 100% {\n    opacity: 1;\n  }\n  80% {\n    opacity: 0;\n  }\n}\n\n#value::after {\n  content: var(--unit-char, "");\n}\n\n#arc {\n  stroke-width: var(--stroke-width, 10px);\n  stroke-linecap: round;\n  stroke: var(--stroke-color, #000);\n  fill: none;\n}\n';
const template = document.createElement("template");
template.innerHTML = `<style>${css}</style>${html}`;
class SuperKnob extends HTMLElement {
  constructor() {
    super();
    this.direction = 0;
    this.value = null;
    this.minVal = 0;
    this.maxVal = 0.99999;
    this.precision = 1;
    this.strokeWidth = 5;
    this.offset = 0;
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
    this.attachResizeObserver(this.dom.svg);
    this.addTabIndex();
    this.getAttributeNames().forEach((name) => {
      this.attributeChangedCallback(name, null, this.getAttribute(name));
    });
  }
  disconnectedCallback() {
    this.abortController.abort();
    this.resizeObserver.disconnect();
  }
  cacheDom() {
    var _a, _b, _c;
    const svg = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector("svg");
    const circle = (_b = this.shadowRoot) == null ? void 0 : _b.querySelector("#circle");
    const value = (_c = this.shadowRoot) == null ? void 0 : _c.querySelector("#value");
    this.dom = {
      ...svg && { svg },
      ...value && { value },
      ...circle && { circle }
    };
  }
  addTabIndex() {
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
  }
  attachResizeObserver(element) {
    this.resizeObserver = new ResizeObserver(() => {
      this.rotateArc(this.value || 0);
    });
    this.resizeObserver.observe(element);
  }
  rotateArc(floatValue) {
    var _a;
    const svg = this.dom.svg;
    if (!svg)
      return;
    const angle = floatToDegree(floatValue);
    const computedStyle = getComputedStyle(this);
    const offset = parseFloat(computedStyle.getPropertyValue("--offset").replace("px", "")) || this.offset;
    const strokeWidth = parseFloat(computedStyle.getPropertyValue("--stroke-width").replace("px", "")) || this.strokeWidth;
    const center = { x: svg.clientWidth / 2, y: svg.clientHeight / 2 };
    console.log(center, svg.clientWidth, svg.clientHeight, offset, strokeWidth);
    const radius = svg.clientWidth / 2 - strokeWidth - offset;
    if (this.dom.arc === void 0) {
      this.dom.arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.dom.arc.setAttribute("id", "arc");
      (_a = this.dom.svg) == null ? void 0 : _a.appendChild(this.dom.arc);
    }
    this.dom.arc.setAttribute("d", describeArc(center, radius, 0, angle));
  }
  setOutput(floatValue) {
    const lerpValueWithPrecision = lerp(this.minVal, this.maxVal, floatValue).toFixed(this.precision);
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: lerpValueWithPrecision },
        bubbles: true
      })
    );
    if (!this.dom.value)
      return;
    this.dom.value.value = `${lerpValueWithPrecision}`;
  }
  handleValueChange(event) {
    const value = event.detail.value;
    this.rotateArc(value);
    this.setOutput(value);
    this.value = value;
  }
  handleRelativeValueChange(event) {
    const value = this.value || 0;
    const newValue = Math.min(Math.max(value + event.detail.value, 0), 0.99999999);
    this.rotateArc(newValue);
    this.setOutput(newValue);
    this.value = newValue;
  }
  handleDirectionChange(event) {
    this.direction = event.detail.direction;
  }
  handleInputModeToggle() {
    if (!this.dom.value)
      return;
    this.dom.value.disabled = false;
    this.dom.value.readOnly = false;
  }
  attachEvents() {
    this.gestureController = new GestureController(this, this.abortSignal);
    this.gestureController.attachEvents(this);
    this.keyboardController = new KeyboardController(this, this.abortSignal);
    this.keyboardController.attachEvents(this);
    if (this.dom.value) {
      this.dom.value.addEventListener("keypress", (event) => {
        const maybeNumericValue = parseInt(event.key);
        const eventTarget = event.target;
        parseFloat(eventTarget.value || "0");
        if (isNaN(maybeNumericValue) && ![".", "Backspace", "Enter"].includes(event.key)) {
          event.preventDefault();
        }
        if (event.key === "Enter") {
          eventTarget.blur();
        }
      });
      this.dom.value.addEventListener("change", (event) => {
        const value = parseFloat(event.target.value);
        const clampedValue = Math.min(Math.max(value, this.minVal), this.maxVal);
        const inversedValue = inverseLerp(this.minVal, this.maxVal, clampedValue);
        this.rotateArc(inversedValue);
        this.setOutput(inversedValue);
        this.value = inversedValue;
      });
    }
    this.attachFocusEvents();
    listenToEvent(this, "knob-value-change", this.handleValueChange);
    listenToEvent(this, "knob-value-relative-change", this.handleRelativeValueChange);
    listenToEvent(this, "knob-direction-change", this.handleDirectionChange);
    listenToEvent(this, "knob-value-input-mode-toggle", this.handleInputModeToggle);
  }
  attachFocusEvents() {
    this.addEventListener("focusin", function(event) {
      var _a;
      if ((_a = event == null ? void 0 : event.currentTarget) == null ? void 0 : _a.contains(event.relatedTarget))
        ;
      else {
        console.log("outside focus");
      }
    }, { signal: this.abortSignal });
    this.addEventListener("focusout", function(event) {
      var _a;
      if ((_a = event == null ? void 0 : event.currentTarget) == null ? void 0 : _a.contains(event.relatedTarget))
        ;
      else {
        console.log("outside focus leave");
      }
    }, { signal: this.abortSignal });
  }
  static get observedAttributes() {
    return ["value", "stroke-width", "offset", "min", "max", "precision"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
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
console.log(`init viewer: Version ${"0.1.4"}`);
customElements.define("super-knob", SuperKnob);
exports.SuperKnob = SuperKnob;

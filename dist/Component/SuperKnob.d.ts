import { GestureController } from "../GestureController";
import { KeyboardController } from "../KeyboardController";
export declare class SuperKnob extends HTMLElement {
    dom: {
        circle?: SVGCircleElement;
        value?: HTMLInputElement;
        arc?: SVGPathElement;
        svg?: SVGSVGElement;
    };
    gestureController: GestureController;
    keyboardController: KeyboardController;
    direction: number;
    value: number | null;
    minVal: number;
    maxVal: number;
    precision: number;
    strokeWidth: number;
    offset: number;
    abortSignal: AbortSignal;
    abortController: AbortController;
    resizeObserver: ResizeObserver;
    constructor();
    bind(): void;
    render(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    cacheDom(): void;
    addTabIndex(): void;
    attachResizeObserver(element: Element): void;
    rotateArc(floatValue: number): void;
    setOutput(floatValue: number): void;
    handleValueChange(event: CustomEvent<{
        value: number;
    }>): void;
    handleRelativeValueChange(event: CustomEvent<{
        value: number;
    }>): void;
    handleDirectionChange(event: CustomEvent<{
        direction: number;
    }>): void;
    handleInputModeToggle(): void;
    attachEvents(): void;
    attachFocusEvents(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: any, newValue: any): void;
}

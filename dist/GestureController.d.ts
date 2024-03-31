export declare class GestureController {
    element: HTMLElement;
    isUserInteraction: boolean;
    center: {
        x: number;
        y: number;
    };
    lastValue: number;
    lastDirection: number | null;
    abortSignal: AbortSignal | undefined;
    constructor(Element?: HTMLElement, abortSignal?: AbortSignal);
    bind(): void;
    attachEvents(element: HTMLElement): void;
    getFloatValueFromPointerEvent(event: PointerEvent): number;
    onPointerDown(event: PointerEvent): void;
    onPointerMove(event: PointerEvent): void;
    onPointerUp(event: PointerEvent): void;
}

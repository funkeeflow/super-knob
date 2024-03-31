export declare class KeyboardController {
    element: HTMLElement;
    abortSignal: AbortSignal | undefined;
    stepSize: number;
    largeStepSize: number;
    fineStepSize: number;
    constructor(Element?: HTMLElement, abortSignal?: AbortSignal);
    bind(): void;
    attachEvents(element: HTMLElement): void;
    onKeyDown(event: KeyboardEvent): void;
}

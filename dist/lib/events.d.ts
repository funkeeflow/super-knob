export declare const Events: readonly ["knob-value-change", "knob-value-relative-change", "knob-direction-change", "knob-value-input-mode-toggle"];
export type Event = typeof Events[number];
export declare function emitEvent(element: any, name: Event, detail: any): void;
export declare function listenToEvent(element: any, name: Event, callback: (event: CustomEvent) => void): void;
export declare function removeEvent(element: any, name: Event, callback: (event: CustomEvent) => void): void;

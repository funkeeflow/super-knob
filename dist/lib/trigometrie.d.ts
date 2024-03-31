export declare function getAngle(dy: number, dx: number): number;
export declare function getDelta(center: {
    x: number;
    y: number;
}, position: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
};
export declare function polarToCartesian(center: {
    x: number;
    y: number;
}, radius: number, angleInDegrees: number): {
    x: number;
    y: number;
};
export declare function describeArc(center: {
    x: number;
    y: number;
}, radius: number, startAngle: number, endAngle: number): string;
export declare function degreeToFloat(degree: number): number;
export declare function floatToDegree(float: number): number;

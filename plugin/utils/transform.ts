export const transformToRotation = (transform: Transform) => {
    const a = transform[0][0];
    const b = transform[1][0];

    const angleRad = Math.atan2(b, a);
    const angleDeg = angleRad * (180 / Math.PI);
    // Adjust for CSS's `linear-gradient` angle system (0deg is 'to top')
    // A standard top-to-bottom Figma gradient is 180deg in CSS.
    let cssAngle = -(angleDeg - 180) % 360;

    cssAngle = Math.round(cssAngle);

    return cssAngle;
}


export const decomposeFigmaTransform = (transform: Transform) => {
    const a = transform[0][0];
    const b = transform[1][0];
    const c = transform[0][1];
    const d = transform[1][1];
    const e = transform[0][2];
    const f = transform[1][2];

    // Translation
    const translateX = e.toFixed(2);
    const translateY = f.toFixed(2);

    // Scale
    // Assumes no skew.
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);

    // Rotation
    // The angle is calculated from atan2(b, a).
    const rotation = -(Math.round(Math.atan2(b, a) * (180 / Math.PI)));

    return { translateX, translateY, rotation, scaleX, scaleY };
}

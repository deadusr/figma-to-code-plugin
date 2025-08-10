export const RGBAToHexA = (color: RGB | RGBA) => {

    if ('a' in color && color.a !== 1) {
        const colors = [
            Math.round(color.r * 255).toString(16),
            Math.round(color.g * 255).toString(16),
            Math.round(color.b * 255).toString(16),
            Math.round(color.a * 255).toString(16)
        ].map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1

        return `#${colors.join("")}`
    }

    const colors = [
        Math.round(color.r * 255).toString(16),
        Math.round(color.g * 255).toString(16),
        Math.round(color.b * 255).toString(16)
    ].map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1

    return `#${colors.join("")}`
}

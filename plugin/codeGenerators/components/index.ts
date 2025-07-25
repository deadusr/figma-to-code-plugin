const booleans = ["true", "false"];


export const generateProps = (variantProperties: {
    [property: string]: string;
}) => {

    const props = Object.keys(variantProperties).map(key => {
        const value = variantProperties[key];

        if (booleans.includes(value.toLowerCase())) {
            const boolVal = value === "true";
            return boolVal ? {
                name: key,
                value: true
            } : null;
        }

        return { name: key, value: `"${value}"` };
    })

    return props.filter(el => el !== null);
}
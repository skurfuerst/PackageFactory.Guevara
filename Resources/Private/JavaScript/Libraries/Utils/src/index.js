//
// Helper function for ad-hoc prop type validation
//
export const validateAs = (propType, name) => object => {
    const validationResult = propType({object}, 'object', name);
    if (validationResult instanceof Error) {
        console.error(validationResult);
        throw new Error(`Received malformed ${name}`);
    }

    return object;
}

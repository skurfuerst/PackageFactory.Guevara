//
// This is a simplified component decorator implementation, much of which is borrowed from the
// core logic of @reduct/component, but optimized for use cases in which just simple
// data handling is needed
//
export default propTypes => CustomComponent => {
	const componentName = CustomComponent.name;

	return function Wrapper(unvalidatedProps) {
        unvalidatedProps = typeof unvalidatedProps === 'object' && !Array.isArray(unvalidatedProps) ?
            unvalidatedProps : {};
        const instance = new CustomComponent();
    	const propNames = Object.keys(propTypes);
    	const props = {};
        const next = nextProps => new Wrapper(Object.assign({}, props, nextProps));

        //
    	// After the aggregation is done, we validate the generated props object with the propTypes.
    	// If the user passed an object containing a `isOptional` function as the propType, we map the propType to the `isOptional` function.
    	// This reduces the overal code needed to defined propTypes and increases similarity with React's syntax.
    	//
    	propNames.forEach(propName => {
    		const propTypeTarget = propTypes[propName];
    		const propType = typeof propTypeTarget === 'object' && typeof propTypeTarget.isOptional === 'function' ?
                propTypeTarget.isOptional : propTypeTarget;
    		const isPropTypeInvalid = typeof propType !== 'function';

    		if (isPropTypeInvalid) {
    			console.error(
                    `Invalid propType "${propName}" specified in Component "${componentName}".`
                    + ' Please specify a function as the propType validator.'
                );
    		}

    		const propTypeResult = propType(unvalidatedProps, propName, componentName);

    		if (propTypeResult instanceof Error) {
    			console.error(
                    `The propType for "${propName}" specified in Component "${componentName}"`
                    + ` returned an Error with the message: "${propTypeResult.message}".`
                );
    		}

    		//
    		// If no error was thrown, and the propType has returned a transformed value,
    		// which is not `null` or `undefined`, overwrite the aggregated value.
    		//
    		if (propTypeResult !== undefined) {
    			props[propName] = unvalidatedProps[propName];
    		}
    	});

		instance.props = Object.freeze(props);
        if (instance.next) {
            instance.next = nextProps => instance.next(next, nextProps);
        }
        instance.next = next;

		return instance;
	};
};

import React, {Component, PropTypes} from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import {connect} from 'react-redux';
import mergeClassNames from 'classnames';
import {$get, $transform} from 'plow-js';

import style from './style.css';

import registry from 'Host/Extensibility/Registry/index';
import {selectors} from 'Host/Redux/index';

// a component is top-level if it does not contain slashes in the name.
const isTopLevelToolbarComponent = componentDefinition =>
    componentDefinition.id.indexOf('/') === -1;


export const hideDisallowedToolbarComponents = (activeFormattingRules) => componentDefinition => {
    return activeFormattingRules.indexOf(componentDefinition.formatting) !== -1 || !componentDefinition.formatting;
};
/**
 * Render sub components for the toolbar, implementing the API as described in registry.ckEditor.toolbar.
 */
const renderToolbarComponents = (context, toolbarComponents, activeFormattingRules, formattingUnderCursor) => {
    return toolbarComponents
        .filter(isTopLevelToolbarComponent)
        .filter(hideDisallowedToolbarComponents(activeFormattingRules))
        .map((componentDefinition, index) => {
            const {component, formatting, callbackPropName, ...props} = componentDefinition;
            const isActive = formatting && $get(formatting, formattingUnderCursor);

            props[callbackPropName] = () => {
                // !!!! TODO: next line is extremely dirty!
                context.NeosCKEditorApi.toggleFormat(formatting);
            };

            const Component = component;

            return <Component key={index} isActive={isActive} {...props}/>;
        });
};

@connect($transform({
    formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor,
    activeFormattingRules: selectors.UI.ContentCanvas.activeFormattingRules,

    context: $get('guest.context')
}))
export default class Toolbar extends Component {
    static propTypes = {
        formattingUnderCursor: PropTypes.objectOf(React.PropTypes.bool),
        activeFormattingRules: PropTypes.arrayOf(PropTypes.string),

        // The current guest frames window object.
        context: PropTypes.object
    };

    shouldComponentUpdate(...args) {
        return shallowCompare(this, ...args);
    }

    render() {
        const classNames = mergeClassNames({
            [style.toolBar]: true
        });

        const renderedToolbarComponents = renderToolbarComponents(
            this.props.context,
            registry.ckEditor.toolbar.getAllAsList(),
            this.props.activeFormattingRules,
            this.props.formattingUnderCursor
        );

        return (
            <div className={classNames}>
                <div className={style.toolBar__btnGroup}>
                    {renderedToolbarComponents}
                </div>
            </div>
        );
    }
}

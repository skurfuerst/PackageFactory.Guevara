import debounce from 'lodash.debounce';

import {actions} from 'Guest/Redux/index';
import {registerToolbar} from 'Guest/Containers/EditorToolbar/index';

import style from './style.css';

export default editorFactory => (nodeContext, dom, ui, connection, dispatch) => {
    let editor = null;

    const editorApi = {
        commit: debounce(value => ui.addChange({
            type: 'PackageFactory.Guevara:Property',
            subject: nodeContext.contextPath,
            payload: {
                propertyName: nodeContext.propertyName,
                value
            }
        }), 200),

        setToolbarPosition: (x, y) => dispatch(actions.EditorToolbar.setPosition(x, y)),
        showToolbar: editorName => dispatch(actions.EditorToolbar.show(editorName)),
        hideToolbar: () => dispatch(actions.EditorToolbar.hide()),

        registerToolbar: configuration => registerToolbar({dispatch}, configuration)
    };

    dom.setAttribute('contentEditable', true);
    dom.classList.add(style.editor);

    connection.observe('nodes.byContextPath', nodeContext.contextPath).react(node => {
        if (node) {
            if (editor) {
                editor.onNodeChange(node);
            } else {
                const handlers = editorFactory(
                    //
                    // Get the node
                    //
                    node,

                    //
                    // Get the property
                    //
                    nodeContext.propertyName,

                    //
                    // Pass the API object to the editor
                    //
                    editorApi,

                    //
                    // Pass the dom element
                    //
                    dom
                );

                editor = Object.assign({
                    onNodeChange: () => {}
                }, handlers);
            }
        }
    });
};

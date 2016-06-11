import {createAction} from 'redux-actions';
import {Map} from 'immutable';
import {$all, $set} from 'plow-js';

import {handleActions} from 'Shared/Utilities/index';
import {actionTypes as system} from 'Host/Redux/System/index';

const OPEN = '@packagefactory/guevara/UI/AddNodeModal/OPEN';
const CLOSE = '@packagefactory/guevara/UI/AddNodeModal/CLOSE';

/**
 * Opens the add node modal.
 */
const open = createAction(OPEN, (contextPath, mode) => ({contextPath, mode}));

/**
 * Closes the add node modal.
 */
const close = createAction(CLOSE);

//
// Export the actions
//
export const actions = {
    open,
    close
};

//
// Export error messages for testing
//
export const errorMessages = {
    ERROR_INVALID_CONTEXTPATH: 'contextPath of reference node must be of type string.',
    ERROR_INVALID_MODE: 'Provided mode is not within allowed modes list in AddNodeModal.'
};

//
// Export the reducer
//
export const reducer = handleActions({
    [system.INIT]: () => $set(
        'ui.addNodeModal',
        new Map({
            referenceNode: '',
            mode: 'insert'
        })
    ),
    [OPEN]: ({contextPath, mode}) => {
        if (typeof contextPath !== 'string') {
            throw new Error(errorMessages.ERROR_INVALID_CONTEXTPATH);
        }
        const allowedModes = ['insert', 'append', 'prepend'];
        if (allowedModes.indexOf(mode) === -1) {
            throw new Error(errorMessages.ERROR_INVALID_MODE);
        }
        return $all(
            $set('ui.addNodeModal.referenceNode', contextPath),
            $set('ui.addNodeModal.mode', mode)
        );
    },
    [CLOSE]: () => $set('ui.addNodeModal.referenceNode', '')
});

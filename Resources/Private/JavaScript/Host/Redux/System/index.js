import {createAction} from 'redux-actions';

import {handleActions} from 'Shared/Utilities/index';

const BOOT = '@packagefactory/guevara/System/BOOT';
const INIT = '@packagefactory/guevara/System/INIT';
const READY = '@packagefactory/guevara/System/READY';

//
// Export the action types
//
export const actionTypes = {
    BOOT,
    INIT,
    READY
};

const boot = createAction(BOOT);
const init = createAction(INIT, state => state);
const ready = createAction(READY);

//
// Export the actions
//
export const actions = {
    boot,
    init,
    ready
};

//
// Export the reducer
//
export const reducer = handleActions({
});

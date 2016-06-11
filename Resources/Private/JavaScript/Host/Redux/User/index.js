import {map, keys} from 'ramda';
import {handleActions} from 'Shared/Utilities/index';

import * as Settings from './Settings/index';
import * as Name from './Name/index';

const all = {Settings, Name};

//
// Export the actionTypes
//
export const actionTypes = map(a => a.actionTypes, all);

//
// Export the actions
//
export const actions = map(a => a.actions, all);

//
// Export the reducer
//
export const reducer = handleActions(map(k => all[k].reducer, keys(all)));

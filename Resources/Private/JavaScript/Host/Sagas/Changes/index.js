import {takeEvery} from 'redux-saga';
import {put, call} from 'redux-saga/effects';

import {actionTypes, actions} from 'Host/Redux/index';
import {change} from 'API/Endpoints/index';

export function* watchPersist() {
    yield* takeEvery(actionTypes.Changes.PERSIST, function* persistChanges(action) {
        const changes = [action.payload.change];

        yield put(actions.UI.Remote.startSaving());
        try {
            yield call(change, changes);
            yield put(actions.UI.Remote.finishSaving());
        } catch (error) {
            console.error('Failed to persist changes', error);
        }
    });
}

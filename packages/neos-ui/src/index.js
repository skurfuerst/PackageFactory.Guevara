import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {put, select} from 'redux-saga/effects';
import {Map} from 'immutable';
import merge from 'lodash.merge';
import {$get} from 'plow-js';

import {actions} from '@neos-project/neos-ui-redux-store';
import {createConsumerApi} from '@neos-project/neos-ui-extensibility';
import fetchWithErrorHandling from '@neos-project/neos-ui-backend-connector/src/FetchWithErrorHandling';
import {SynchronousMetaRegistry} from '@neos-project/neos-ui-extensibility/src/registry';
import {delay} from '@neos-project/utils-helpers';
import backend from '@neos-project/neos-ui-backend-connector';
import {handleActions} from '@neos-project/utils-redux';

import * as system from './System';
import localStorageMiddleware from './localStorageMiddleware';
import Root from './Containers/Root';
import apiExposureMap from './apiExposureMap';
import DelegatingReducer from './DelegatingReducer';

import Icon from '@neos-project/react-ui-components/src/Icon/';

const devToolsArePresent = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined';
const devToolsStoreEnhancer = () => devToolsArePresent ? window.devToolsExtension() : f => f;
const sagaMiddleWare = createSagaMiddleware();

const delegatingReducer = new DelegatingReducer();
const store = createStore(delegatingReducer.reducer(), new Map(), compose(
    applyMiddleware(sagaMiddleWare, localStorageMiddleware),
    devToolsStoreEnhancer()
));

const manifests = [];
const globalRegistry = new SynchronousMetaRegistry(`The global registry`);

//
// Create the host plugin api and load local manifests
//
createConsumerApi(manifests, apiExposureMap);
require('./manifest');
require('@neos-project/neos-ui-contentrepository');
require('@neos-project/neos-ui-editors');
require('@neos-project/neos-ui-views');
require('@neos-project/neos-ui-guest-frame');
require('@neos-project/neos-ui-ckeditor-bindings');
require('@neos-project/neos-ui-validators');
require('@neos-project/neos-ui-i18n/src/manifest');

//
// The main application
//
function * application() {
    const appContainer = yield system.getAppContainer;

    //
    // We'll show just some loading screen,
    // until we're good to go
    //
    console.time("init");
    ReactDOM.render(
        <div style={{width: '100vw', height: '100vh', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px'}}>
            <Icon icon="circle-o-notch" label="Loading..." spin={true} size="big"/>
        </div>,
        appContainer
    );

    //
    // Initialize Neos JS API
    //
    yield system.getNeos;

    //
    // Load frontend configuration very early, as we want to make it available in manifests
    //
    const frontendConfiguration = yield system.getFrontendConfiguration;
    console.timeEnd("init");
    console.time("mf");

    //
    // Initialize extensions
    //
    manifests
        .map(manifest => manifest[Object.keys(manifest)[0]])
        .forEach(({bootstrap}) => bootstrap(globalRegistry, {store, frontendConfiguration}));

    const reducers = globalRegistry.get('reducers').getAllAsList().map(element => element.reducer);
    delegatingReducer.setReducer(handleActions(reducers));
    console.timeEnd("mf");

    console.time("cfg");
    const configuration = yield system.getConfiguration;

    const routes = yield system.getRoutes;
    console.timeEnd("cfg");
    console.time("cfg2");

    //
    // Bootstrap the saga middleware with initial sagas
    //
    globalRegistry.get('sagas').getAllAsList().forEach(element => sagaMiddleWare.run(element.saga, {store, globalRegistry, configuration}));

    //
    // Tell everybody, that we're booting now
    //
    store.dispatch(actions.System.boot());
    console.timeEnd("cfg2");
    console.time("cfg3");

    const {getJsonResource} = backend.get().endpoints;

    const groupsAndRoles = yield system.getNodeTypes;
    console.timeEnd("cfg3");
    console.time("cfg4a");

    //
    // Load json resources
    //
    const nodeTypesSchemaPromise = getJsonResource(configuration.endpoints.nodeTypeSchema);
    const translationsPromise = getJsonResource(configuration.endpoints.translations);
    console.timeEnd("cfg4a");
    console.time("cfg4b");

    // Fire multiple async requests in parallel
    const [nodeTypesSchema, translations] = yield [nodeTypesSchemaPromise, translationsPromise];
    console.timeEnd("cfg4b");
    console.time("cfg5");
    const nodeTypesRegistry = globalRegistry.get('@neos-project/neos-ui-contentrepository');
    Object.keys(nodeTypesSchema.nodeTypes).forEach(nodeTypeName => {
        nodeTypesRegistry.set(nodeTypeName, {
            ...nodeTypesSchema.nodeTypes[nodeTypeName],
            name: nodeTypeName
        });
    });
    nodeTypesRegistry.setConstraints(nodeTypesSchema.constraints);
    nodeTypesRegistry.setInheritanceMap(nodeTypesSchema.inheritanceMap);
    nodeTypesRegistry.setGroups(groupsAndRoles.groups);
    nodeTypesRegistry.setRoles(groupsAndRoles.roles);

    //
    // Load translations
    //
    const i18nRegistry = globalRegistry.get('i18n');
    i18nRegistry.setTranslations(translations);

    const frontendConfigurationRegistry = globalRegistry.get('frontendConfiguration');

    Object.keys(frontendConfiguration).forEach(key => {
        frontendConfigurationRegistry.set(key, {
            ...frontendConfiguration[key]
        });
    });

    //
    // Hydrate server state
    // Deep merges state fetched from server with the state saved in the local storage
    //
    const serverState = yield system.getServerState;
    const persistedState = localStorage.getItem('persistedState') ? JSON.parse(localStorage.getItem('persistedState')) : {};
    const mergedState = merge({}, serverState, persistedState);
    yield put(actions.System.init(mergedState));
    console.timeEnd("cfg5");
    console.time("cfg5");

    //
    // Just make sure that everybody does their initialization homework
    //
    yield delay(0);

    //
    // Inform everybody, that we're ready now
    //
    yield put(actions.System.ready());

    fetchWithErrorHandling.registerAuthenticationErrorHandler(() => {
        store.dispatch(actions.System.authenticationTimeout());
    });

    fetchWithErrorHandling.registerGeneralErrorHandler((message = 'unknown error') => {
        store.dispatch(actions.UI.FlashMessages.add('fetch error', message, 'error'));
    });

    const menu = yield system.getMenu;
    console.timeEnd("cfg5");
    console.time("cfg6");

    //
    // After everything was initilalized correctly, render the application itself.
    //
    ReactDOM.render(
        <Root
            globalRegistry={globalRegistry}
            menu={menu}
            configuration={configuration}
            routes={routes}
            store={store}
            />,
        appContainer
    );

    const siteNodeContextPath = yield select($get('cr.nodes.siteNode'));
    const documentNodeContextPath = yield select($get('ui.contentCanvas.contextPath'));
    yield put(actions.CR.Nodes.reloadState({
        siteNodeContextPath,
        documentNodeContextPath,
        merge: true
    }));

    console.timeEnd("cfg6");
}

sagaMiddleWare.run(application);

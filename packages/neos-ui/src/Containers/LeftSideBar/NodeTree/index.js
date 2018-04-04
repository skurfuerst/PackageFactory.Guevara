import React, {PureComponent, unstable_AsyncMode as AsyncMode} from 'react';

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {$get} from 'plow-js';
import mergeClassNames from 'classnames';

import Tree from '@neos-project/react-ui-components/src/Tree/';

import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import {dndTypes} from '@neos-project/neos-ui-constants';

import {PageTreeNode, ContentTreeNode} from './Node/index';

import style from './style.css';

export default class NodeTree extends PureComponent {
    static propTypes = {
        ChildRenderer: PropTypes.func,
        rootNode: PropTypes.object,
        nodeTypeRole: PropTypes.string,
        toggle: PropTypes.func,
        focus: PropTypes.func,
        requestScrollIntoView: PropTypes.func,
        setActiveContentCanvasSrc: PropTypes.func,
        setActiveContentCanvasContextPath: PropTypes.func,
        moveNode: PropTypes.func
    };

    state = {
        currentlyDraggedNode: null
    };

    handleToggle = contextPath => {
        const {toggle} = this.props;

        toggle(contextPath);
    }

    handleFocus = contextPath => {
        const {focus} = this.props;
        focus(contextPath);
    }

    handleClick = (src, contextPath) => {
        const {setActiveContentCanvasSrc, setActiveContentCanvasContextPath, requestScrollIntoView} = this.props;
        // Set a flag that will imperatively tell ContentCanvas to scroll to focused node
        if (requestScrollIntoView) {
            requestScrollIntoView(true);
        }
        if (setActiveContentCanvasSrc) {
            setActiveContentCanvasSrc(src);
        }
        if (setActiveContentCanvasContextPath) {
            setActiveContentCanvasContextPath(contextPath);
        }
    }

    handleDrag = node => {
        this.setState({
            currentlyDraggedNode: node
        });
    }

    handleDrop = (targetNode, position) => {
        const {currentlyDraggedNode} = this.state;
        const {moveNode} = this.props;
        moveNode($get('contextPath', currentlyDraggedNode), $get('contextPath', targetNode), position);

        this.setState({
            currentlyDraggedNode: null
        });
    }

    render() {
        const {rootNode, ChildRenderer} = this.props;
        if (!rootNode) {
            return (<div>...</div>);
        }

        const classNames = mergeClassNames({
            [style.pageTree]: true
        });

        return (
            <AsyncMode>
                <Tree className={classNames}>
                    <ChildRenderer
                        ChildRenderer={ChildRenderer}
                        nodeDndType={dndTypes.NODE}
                        node={rootNode}
                        level={1}
                        onNodeToggle={this.handleToggle}
                        onNodeClick={this.handleClick}
                        onNodeFocus={this.handleFocus}
                        onNodeDrag={this.handleDrag}
                        onNodeDrop={this.handleDrop}
                        currentlyDraggedNode={this.state.currentlyDraggedNode}
                        />
                </Tree>
            </AsyncMode>
        );
    }
}

export const PageTree = connect(state => ({
    rootNode: selectors.CR.Nodes.siteNodeSelector(state),
    ChildRenderer: PageTreeNode
}), {
    toggle: actions.UI.PageTree.toggle,
    focus: actions.UI.PageTree.focus,
    setActiveContentCanvasSrc: actions.UI.ContentCanvas.setSrc,
    setActiveContentCanvasContextPath: actions.UI.ContentCanvas.setContextPath,
    moveNode: actions.CR.Nodes.move,
    requestScrollIntoView: null
})(NodeTree);

export const ContentTree = connect(state => ({
    rootNode: selectors.UI.ContentCanvas.documentNodeSelector(state),
    ChildRenderer: ContentTreeNode
}), {
    toggle: actions.UI.ContentTree.toggle,
    focus: actions.CR.Nodes.focus,
    moveNode: actions.CR.Nodes.move,
    requestScrollIntoView: actions.UI.ContentCanvas.requestScrollIntoView
})(NodeTree);

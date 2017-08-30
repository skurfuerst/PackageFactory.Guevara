import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'classnames';
import debounce from 'lodash.debounce';
import animate from 'amator';

import {getGuestFrameBody, findNodeInGuestFrame} from '@neos-project/neos-ui-guest-frame/src/dom';

import {
    AddNode,
    CopySelectedNode,
    CutSelectedNode,
    DeleteSelectedNode,
    HideSelectedNode,
    PasteClipBoardNode
} from './Buttons/index';
import style from './style.css';

export const position = nodeElement => {
    if (nodeElement && nodeElement.getBoundingClientRect) {
        const bodyBounds = getGuestFrameBody().getBoundingClientRect();
        const domBounds = nodeElement.getBoundingClientRect();

        return {
            top: domBounds.top - bodyBounds.top,
            right: bodyBounds.right - domBounds.right
        };
    }

    return {top: 0, right: 0};
};

export default class NodeToolbar extends PureComponent {
    static propTypes = {
        contextPath: PropTypes.string,
        fusionPath: PropTypes.string
    };

    constructor() {
        super();
        this.iframeWindow = document.getElementsByName('neos-content-main')[0].contentWindow;
    }

    componentDidMount() {
        this.iframeWindow.addEventListener('resize', debounce(() => this.forceUpdate(), 20));
    }

    componentDidUpdate() {
        this.scrollIntoView();
    }

    scrollIntoView() {
        const iframeDocument = this.iframeWindow.document;
        // See: https://gist.github.com/dperini/ac3d921d6a08f10fd10e
        const scrollingElement = iframeDocument.compatMode.indexOf('CSS1') === 0 && iframeDocument.documentElement.scrollHeight > iframeDocument.body.scrollHeight ? iframeDocument.documentElement : iframeDocument.body;
        if (this.toolbarElement) {
            const position = this.toolbarElement.getBoundingClientRect();
            const offset = 100;
            const elementIsNotInView = position.top < offset || position.bottom + offset > this.iframeWindow.innerHeight;
            if (elementIsNotInView) {
                const scrollTop = position.top + this.iframeWindow.pageYOffset - offset;
                animate(scrollingElement, {scrollTop});
            }
        }
    }

    render() {
        const {contextPath, fusionPath} = this.props;

        if (!contextPath) {
            return null;
        }

        const props = {
            contextPath,
            fusionPath,
            className: style.toolBar__btnGroup__btn
        };

        const nodeElement = findNodeInGuestFrame(contextPath, fusionPath);
        const {top, right} = position(nodeElement);

        const classNames = mergeClassNames({
            [style.toolBar]: true
        });

        const refHandler = div => {
            this.toolbarElement = div;
        };

        return (
            <div className={classNames} style={{top: top - 50, right}} ref={refHandler}>
                <div className={style.toolBar__btnGroup}>
                    <AddNode {...props}/>
                    <HideSelectedNode {...props}/>
                    <CopySelectedNode {...props}/>
                    <CutSelectedNode {...props}/>
                    <PasteClipBoardNode {...props}/>
                    <DeleteSelectedNode {...props}/>
                </div>
            </div>
        );
    }
}

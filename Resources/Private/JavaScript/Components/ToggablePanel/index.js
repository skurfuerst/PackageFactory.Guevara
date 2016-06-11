import React, {Component, PropTypes} from 'react';
import Collapse from 'react-collapse';
import mergeClassNames from 'classnames';
import Headline from 'Components/Headline/index';
import IconButton from 'Components/IconButton/index';
import style from './style.css';

class ToggablePanel extends Component {
    static propTypes = {
        isOpened: PropTypes.bool,
        className: PropTypes.string,
        children: PropTypes.node.isRequired
    };

    static defaultProps = {
        isOpened: true
    };

    static childContextTypes = {
        isOpened: PropTypes.bool.isRequired,
        togglePanel: PropTypes.func.isRequired,
        closePanel: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            isOpened: props.isOpened
        };
    }

    getChildContext() {
        return {
            isOpened: this.state.isOpened,
            togglePanel: () => this.toggle(),
            closePanel: () => this.close()
        };
    }

    componentWillReceiveProps(newProps) {
        const {isOpened} = newProps;

        if (isOpened !== this.state.isOpened) {
            this.setState({isOpened});
        }
    }

    render() {
        const {children, className} = this.props;
        const classNames = mergeClassNames({
            [className]: className && className.length,
            [style.panel]: true,
            [style['panel--isOpen']]: this.state.isOpened
        });

        return (
            <section className={classNames}>
                {children}
            </section>
        );
    }

    close() {
        this.setState({isOpened: false});
    }

    toggle() {
        this.setState({isOpened: !this.state.isOpened});
    }
}

class Header extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node.isRequired
    };

    static contextTypes = {
        isOpened: PropTypes.bool.isRequired,
        togglePanel: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {
            children,
            className
        } = this.props;
        const {isOpened, togglePanel} = this.context;
        const toggleIcon = isOpened ? 'chevron-up' : 'chevron-down';
        const classNames = mergeClassNames({
            [className]: className && className.length
        });

        return (
            <div className={classNames} aria-expanded={isOpened ? 'true' : 'false'}>
                <Headline
                    className={style.panel__headline}
                    type="h1"
                    style="h4"
                    >
                    {children}
                </Headline>
                <IconButton
                    className={style.panel__toggleBtn}
                    icon={toggleIcon}
                    onClick={() => togglePanel()}
                    />
            </div>
        );
    }
}

class Contents extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node.isRequired
    };

    static contextTypes = {
        isOpened: PropTypes.bool.isRequired
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {
            children,
            className
        } = this.props;
        const {isOpened} = this.context;
        const classNames = mergeClassNames({
            [style.panel__contents]: true,
            [className]: className && className.length
        });

        return (
            <div>
                <Collapse isOpened={isOpened}>
                    <div className={classNames} key="panelContents" aria-hidden={isOpened ? 'false' : 'true'}>
                        {children}
                    </div>
                </Collapse>
            </div>
        );
    }
}

//
// Assign the Child Component to the parent,
// to replicate the structure of a `DropDown` Component.
//
ToggablePanel.Header = Header;
ToggablePanel.Contents = Contents;

export default ToggablePanel;

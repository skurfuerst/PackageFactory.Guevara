import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import Icon from '@neos-project/react-ui-components/src/Icon/';
import Button from '@neos-project/react-ui-components/src/Button/';

import I18n from '@neos-project/neos-ui-i18n';

import style from '../style.css';

export default class MenuItem extends PureComponent {
    static propTypes = {
        icon: PropTypes.string,
        label: PropTypes.string.isRequired,
        uri: PropTypes.string,
        target: PropTypes.string,
        isActive: PropTypes.bool.isRequired,
        skipI18n: PropTypes.bool,

        onClick: PropTypes.func.isRequired
    };

    handleClick = () => {
        const {uri, target, onClick} = this.props;

        onClick(target, uri);
    }

    render() {
        const {skipI18n, label, icon, uri, target} = this.props;

        const innerButton = (
            <Button
                className={style.drawer__menuItemBtn}
                onClick={this.handleClick}
                style="transparent"
                hoverStyle="clean"
                disabled={!uri}
                >
                {icon && <Icon icon={icon} size="medium" padded="right"/>}
                {skipI18n ? label : <I18n id={label} fallback={label}/>}
            </Button>
        );
        return (target === 'Window' ? <a href={uri}>{innerButton}</a> : innerButton);
    }
}

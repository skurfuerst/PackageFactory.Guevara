import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import DateInput from '@neos-project/react-ui-components/src/DateInput/';
import moment from 'moment';
import {neos} from '@neos-project/neos-ui-decorators';

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
class DateTime extends PureComponent {

    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        commit: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        i18nRegistry: PropTypes.object
    }

    render() {
        const {
          value,
          commit,
          placeholder,
          i18nRegistry
        } = this.props;
        const mappedValue = (typeof value === 'string' && value.length) ? moment(value).toDate() : (value || undefined);

        const onChange = date => {
            commit(date ? moment(date).format('YYYY-MM-DDTHH:MM:SSZ') : '');
        };

        return (
            <DateInput
                value={mappedValue}
                onChange={onChange}
                placeholder={placeholder || i18nRegistry.translate('content.inspector.editors.dateTimeEditor.noDateSet', '', {}, 'Neos.Neos', 'Main')}
                />
        );
    }
}

export default DateTime;

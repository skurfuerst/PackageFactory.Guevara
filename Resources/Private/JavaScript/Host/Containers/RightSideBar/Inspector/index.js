import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {$transform, $get} from 'plow-js';
import {Maybe} from 'monet';

import {actions} from 'Host/Redux/index';
import {Tabs, Bar, Button} from 'Components/index';

import TabPanel from './TabPanel/index';
import style from './style.css';

@connect($get('ui.inspector.viewConfiguration'), {
    apply: actions.UI.Inspector.apply,
    discard: actions.UI.Inspector.discard
})
export default class Inspector extends Component {
    static propTypes = {
        tabs: PropTypes.array,
        apply: PropTypes.func.isRequired,
        discard: PropTypes.func.isRequired
    };

    render() {
        const {tabs, apply, discard} = this.props;
        const inspector = tabs => (
            <div className={style.inspector}>
                <Tabs>
                    {tabs
                        //
                        // Only display tabs, that have groups
                        //
                        .filter(t => t.groups)

                        //
                        // Render each tab as a TabPanel
                        //
                        .map(tab => <TabPanel key={tab.id} icon={tab.icon} groups={tab.groups} />)
                    }
                </Tabs>
                <Bar position="bottom">
                    <Button onClick={() => apply()}>
                        Apply
                    </Button>
                    <Button onClick={() => discard()}>
                        Discard
                    </Button>
                </Bar>
            </div>
        );
        const fallback = () => (<div>...</div>);

        return Maybe.fromNull(tabs).map(inspector).orSome(fallback());
    }
}

import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

@component({
    csrfToken: PropTypes.string.isRequired
})
export default class Client {
    get(uri) {
        return fetch(uri, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    post(uri, body) {
        return fetch(uri, {
            body,
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-Flow-Csrftoken': this.props.csrfToken,
                'Content-Type': 'application/json'
            }
        });
    }
}

Client.shape = {
    get: PropTypes.func.isRequired,
    post: PropTypes.func.isRequired
};

Client.fromJSON = ({csrfToken}) => new Client({csrfToken});

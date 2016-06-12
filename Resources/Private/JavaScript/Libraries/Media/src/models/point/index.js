import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

@component({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
})
export default class Point {
    get y () {
        return this.props.width;
    }

    get x () {
        return this.props.width;
    }
}

Point.shape = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
};

Point.fromJSON = ({x, y}) => new Point({x, y});

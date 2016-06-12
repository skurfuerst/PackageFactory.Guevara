import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

import Point from 'Libraries/Media/src/models/point/index';
import Dimensions from 'Libraries/Media/src/models/dimensions/index';

@component(Object.assign({}, {
    position: PropTypes.shape(Point.shape),
    dimensions: PropTypes.shape(Dimensions.shape)
}))
export default class CropAdjustment {
    get x () {
        return this.props.position.x;
    }

    get y () {
        return this.props.position.y;
    }

    get json () {
        return {
            x: this.x,
            y: this.y,
            width: this.props.dimensions.width,
            height: this.props.dimensions.height
        };
    }

    adjust(dimensions) {
        return dimensions.next(this.props.dimensions);
    }
}

CropAdjustment.shape = Object.assign({
    adjust: PropTypes.func.isRequired,
    json: PropTypes.object.isRequired
}, Point.shape);

CropAdjustment.fromJSON = ({x, y, width, height}) => new CropAdjustment({
    position: Point.fromJSON({x, y}),
    dimensions: Dimensions.fromJSON({width, height})
});

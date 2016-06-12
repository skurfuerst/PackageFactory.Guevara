import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';

import {
    ORIENTATION_LANDSCAPE,
    ORIENTATION_PORTRAIT,
    ORIENTATION_SQUARE
} from 'Libraries/Media/src/constants/index';

const getGreatestCommonDivisor = (a, b) => b ? getGreatestCommonDivisor(b, a%b) : a;

@component({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
})
export default class Dimensions {
    get width () {
        return this.props.width;
    }

    get height () {
        return this.props.height;
    }

    get aspectRatio () {
        return this.props.width / this.props.height;
    }

    get reduced () {
        const greatestCommonDivisor = getGreatestCommonDivisor(this.width, this.height);

        return {
            width: this.width/greatestCommonDivisor,
            height: this.height/greatestCommonDivisor
        };
    }

    get orientation () {
        if (this.width > this.height) {
            return ORIENTATION_LANDSCAPE;
        }

        if (this.width < this.height) {
            return ORIENTATION_PORTRAIT;
        }

        return ORIENTATION_SQUARE;
    }

    get isOrientationSquare () {
        return this.width === this.height;
    }

    get isOrientationLandscape () {
        return this.width > this.height;
    }

    get isOrientationPortrait () {
        return this.width < this.height;
    }
}

Dimensions.shape = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    reduced: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired,
    aspectRatio: PropTypes.number.isRequired,
    orientation: PropTypes.oneOf([
        ORIENTATION_SQUARE,
        ORIENTATION_LANDSCAPE,
        ORIENTATION_PORTRAIT
    ]).isRequired,
    isOrientationSquare: PropTypes.bool.isRequired,
    isOrientationLandscape: PropTypes.bool.isRequired,
    isOrientationPortrait: PropTypes.bool.isRequired
};

Dimensions.fromJSON = ({width, height}) => new Dimensions({width, height});

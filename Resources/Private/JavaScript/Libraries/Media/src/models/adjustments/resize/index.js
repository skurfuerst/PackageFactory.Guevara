import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';
import {Maybe} from 'monet';

@component({
    width: PropTypes.number,
    height: PropTypes.number,
    maximumWidth: PropTypes.number,
    maximumHeight: PropTypes.number,
    minimumWidth: PropTypes.number,
    minimumHeight: PropTypes.number,
    allowUpScaling: PropTypes.bool.isRequired
})
export default class ResizeAdjustment {
    get json () {
        return {...this.props};
    }

    adjust(dimensions) {
        const width = Maybe.fromNull(this.props.width).orSome(dimensions.width);
        const height = Maybe.fromNull(this.props.height).orSome(dimensions.height);
        const adjustedWidth = Maybe.fromNull(this.props.minimumWidth)
            .bind(minWidth => Maybe.fromNull(this.props.maximumWidth)
                .map(maxWidth => Math.min(minWidth, Math.max(maxWidth, width))));
        const adjustedHeight = Maybe.fromNull(this.props.minimumHeight)
            .bind(minHeight => Maybe.fromNull(this.props.maximumHeight)
                .map(maxHeight => Math.min(minHeight, Math.max(maxHeight, height))));

        return dimensions.next({
            width: adjustedWidth,
            height: adjustedHeight
        });
    }
}

ResizeAdjustment.shape = {
    json: PropTypes.object.isRequired,
    adjust: PropTypes.func.isRequired
};

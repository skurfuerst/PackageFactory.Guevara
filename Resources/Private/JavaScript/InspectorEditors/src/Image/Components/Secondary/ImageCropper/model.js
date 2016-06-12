import {component} from '@neos/libs-utils/decorators';
import PropTypes from 'proptypes';
import {filter, map, values, merge, memoize} from 'ramda';
import {Maybe} from 'monet';

import Dimensions from 'Libraries/Media/src/models/dimensions/index';
import ImageVariant from 'Libraries/Media/src/models/imagevariant/index';

const ASPECT_RATIO_STRATEGY_SHAPE = {
    dimensions: PropTypes.shape(Dimensions.shape).isRequired,
    label: PropTypes.string.isRequired,
    matches: PropTypes.func.isRequired
};

@component({
    dimensions: PropTypes.shape(Dimensions.shape).isRequired,
    label: PropTypes.string.isRequired
})
export class ConfiguredAspectRatioStrategy {
    static shape = ASPECT_RATIO_STRATEGY_SHAPE;

    get label () {
        return this.props.label;
    }

    get dimensions () {
        return this.props.dimensions;
    }

    next(next, {width, height}) {
        return new CustomAspectRatioStrategy(
            Dimensions.fromJSON({width, height})
        );
    }

    matches(dimensions) {
        return dimensions.aspectRatio.toFixed(2) === this.dimensions.aspectRatio.toFixed(2);
    }
}

@component({
    dimensions: PropTypes.shape(Dimensions.shape).isRequired
})
export class CustomAspectRatioStrategy {
    static shape = ASPECT_RATIO_STRATEGY_SHAPE;

    get label () {
        return 'Custom';
    }

    get dimensions () {
        return this.props.dimensions;
    }

    matches() {
        return false;
    }
}

@component({
    image: PropTypes.shape(ImageVariant.shape).isRequired
})
export class OriginalAspectRatioStrategy {
    static shape = ASPECT_RATIO_STRATEGY_SHAPE;

    get label () {
        return 'Original';
    }

    get dimensions () {
        return this.props.image.processed.original.dimensions;
    }

    next(next, {width, height}) {
        return new CustomAspectRatioStrategy(
            Dimensions.fromJSON({width, height})
        );
    }

    matches(dimensions) {
        return dimensions.aspectRatio.toFixed(2) === this.dimensions.aspectRatio.toFixed(2);
    }
}

const when = condition => o => condition ? Maybe.Some(o) : Maybe.None();

@component({
    image: PropTypes.shape(ImageVariant.shape).isRequired,
    features: PropTypes.shape({
        allowOriginal: PropTypes.bool,
        allowCustom: PropTypes.bool
    }).isRequired,
    aspectRatioOptions: PropTypes.arrayOf(
        PropTypes.shape({
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
            label: PropTypes.string
        })
    ).isRequired,
    chosenAspectRatioStrategy: PropTypes.shape(ASPECT_RATIO_STRATEGY_SHAPE),
    isFreeAspectRatioMode: PropTypes.bool
})
export default class CropConfiguration {
    static shape = {
        aspectRatioOptions: PropTypes.arrayOf(
            PropTypes.shape(ASPECT_RATIO_STRATEGY_SHAPE)
        ).isRequired,
        maybeAspectRatioStrategy: PropTypes.object.isRequired,
        aspectRatioReducedLabel: PropTypes.string.isRequired
    };

    get aspectRatioOptions () {
        const {image} = this.props;
        const {dimensions} = image.processed.original;

        return []
            .concat(this.props.features.allowCustom ? [new CustomAspectRatioStrategy({dimensions})] : [])
            .concat(this.props.features.allowOriginal ? [new OriginalAspectRatioStrategy({image})] : [])
            .concat(this.props.aspectRatioOptions.map(option => new ConfiguredAspectRatioStrategy({
                dimensions: Dimensions.fromJSON(option),
                label: option.label || `${option.width}:${option.height}`
            })));
    }

    get maybeAspectRatioStrategy () {
        const {isFreeAspectRatioMode} = this.props;
        const {dimensions} = this.props.image.processed.original;

        if (isFreeAspectRatioMode) {
            return Maybe.None();
        }

        return Maybe.fromNull(this.props.chosenAspectRatioStrategy)
            .orElse(
                Maybe.fromNull(
                    this.aspectRatioOptions.filter(option => option.matches(dimensions))[0]
                )
            );
    }

    get aspectRatioReducedLabel () {
        const {width, height} = this.maybeAspectRatioStrategy
            .map(aspectRatioStrategy => aspectRatioStrategy.dimensions.reduced)
            .orSome(this.props.image.processed.original.dimensions.reduced);

        return `${width}:${height}`;
    }

    get maybeCropInformation () {
        return this.props.image.maybeCropAdjustment
            .map(c => ({
                x: c.x / this.props.image.original.dimensions.width * 100,
                y: c.y / this.props.image.original.dimensions.height * 100,
                width: c.width / this.props.image.original.dimensions.width * 100,
                height: c.height / this.props.image.original.dimensions.height * 100
            }))
            .map(
                merge(
                    this.maybeAspectRatioStrategy
                        .map(dimensions => ({aspect: dimensions.aspectRatio}))
                        .orSome({})
                )
            );
    }

    selectAspectRatioOption(option) {
        return this.next({
            chosenAspectRatioStrategy: option,
            isFreeAspectRatioMode: false
        });
    }

    updateAspectRatioDimensions(width, height) {
        const nextAspectRatioStrategyFactory = Maybe.fromNull(
            this.aspectRatioOptions.filter(option => option.matches(Dimensions.fromJSON({width, height})))[0]
        )
        .map(aspectRatioStrategy => () => aspectRatioStrategy)
        .orSome(() => new CustomAspectRatioStrategy(
            Dimensions.fromJSON({width, height})
        ));

        return this.selectAspectRatioOption(nextAspectRatioStrategyFactory());
    }

    flipAspectRatio() {
        const {width, height} = this.maybeAspectRatioStrategy
            .map(aspectRatioStrategy => aspectRatioStrategy.dimensions.reduced)
            .orSome(this.props.image.processed.original.dimensions.reduced);

        return this.updateAspectRatioDimensions(height, width);
    }

    clearAspectRatio() {
        return this.next({
            chosenAspectRatioStrategy: null,
            isFreeAspectRatioMode: true
        });
    }
}

CropConfiguration.fromNeosConfiguration = (image, neosConfiguration) => new CropConfiguration({
    image,
    features: {
        allowCustom: neosConfiguration.allowCustom,
        allowOriginal: neosConfiguration.allowOriginal
    },
    aspectRatioOptions: console.log(values(neosConfiguration.options)) || values(neosConfiguration.options)
});

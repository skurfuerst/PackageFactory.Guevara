import React, {Component, PropTypes} from 'react';
import {Components, SecondaryInspector, api} from '@host';
import ReactCrop from 'react-image-crop';
import {prop} from 'ramda';
import {Maybe} from 'monet';

import style from './style.css';
import CropConfiguration, {NullAspectRatioStrategy} from './model.js';
import AspectRatioDropDown from './AspectRatioDropDown/index';

const {Icon, IconButton, SelectBox, TextInput} = Components;

export default class ImageCropper extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onComplete: PropTypes.func.isRequired,
        sourceImage: PropTypes.object.isRequired,
        options: PropTypes.object
    };

    state = {
        cropConfiguration: CropConfiguration.fromNeosConfiguration(
            this.props.sourceImage,
            this.props.options.crop.aspectRatio
        )
    };

    componentWillReceiveProps(nextProps) {
        const {cropConfiguration} = this.state;

        this.setState({
            cropConfiguration: cropConfiguration.updateImage(nextProps.sourceImage)
        });
    }

    setAspectRatio(aspectRatioOption) {
        const {cropConfiguration} = this.state;

        this.setState({
            cropConfiguration: cropConfiguration.selectAspectRatioOption(aspectRatioOption)
        });
    }

    setCustomAspectRatioDimensions(width, height) {
        const {cropConfiguration} = this.state;

        this.setState({
            cropConfiguration: cropConfiguration.updateAspectRatioDimensions(width || 1, height || 1)
        });
    }

    flipAspectRatio() {
        const {cropConfiguration} = this.state;

        this.setState({
            cropConfiguration: cropConfiguration.flipAspectRatio()
        });
    }

    clearAspectRatio() {
        const {cropConfiguration} = this.state;

        this.setState({
            cropConfiguration: cropConfiguration.clearAspectRatio()
        });
    }

    render() {
        const {cropConfiguration} = this.state;
        const aspectRatioLocked = false;
        const aspectRatioLockIcon = (aspectRatioLocked ? <Icon icon="lock" /> : null);
        const {sourceImage, onClose, onComplete} = this.props;
        const src = sourceImage.preview.uri;

        return (
            <SecondaryInspector onClose={() => onClose()}>
                <div style={{textAlign: 'center'}}>
                    <div className={style.tools}>
                        <div className={style.aspectRatioIndicator}>
                            <Icon icon="crop" />
                            <span title={cropConfiguration.aspectRatioReducedLabel}>
                                {cropConfiguration.aspectRatioReducedLabel}
                            </span>
                            <span>{aspectRatioLockIcon}</span>
                        </div>

                        <AspectRatioDropDown
                            placeholder="Aspect Ratio"
                            current={cropConfiguration.maybeAspectRatioStrategy}
                            options={cropConfiguration.aspectRatioOptions}
                            onSelect={::this.setAspectRatio}
                            onClear={::this.clearAspectRatio}
                            />

                        <div className={style.dimensions}>
                            {cropConfiguration.maybeAspectRatioStrategy
                                .map(prop('dimensions'))
                                .map(({width, height}) => [
                                <TextInput
                                    className={style.dimensionInput}
                                    type="number"
                                    value={width}
                                    onChange={width => this.setCustomAspectRatioDimensions(width, height)}
                                    />,
                                <IconButton
                                    icon="exchange"
                                    onClick={::this.flipAspectRatio}
                                    />,
                                <TextInput
                                    className={style.dimensionInput}
                                    type="number"
                                    value={height}
                                    onChange={height => this.setCustomAspectRatioDimensions(width, height)}
                                        />
                            ]).orSome('')}
                        </div>
                    </div>

                    <ReactCrop
                        src={src}
                        crop={cropConfiguration.maybeCropInformation.orSome({})}
                        onComplete={cropArea => onComplete(cropArea)}
                        />
                </div>
            </SecondaryInspector>
        );
    }
}

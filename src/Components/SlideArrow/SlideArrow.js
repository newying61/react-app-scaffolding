import * as React from 'react';
import * as cx from 'classnames';
import SVGPathIcon from '../SVGPathIcon/SVGPathIcon';

import './SlideArrow.css';

export default class SlideArrow extends React.Component {
	static defaultProps = {
		visible: false
	};

	static VIEW_BOX = { width: 32, height: 32 };
	static SVG_DATA = {
		left: 'M13.808,20l10.96,10.96l0.353,0.354l-0.353,0.353l-2.829,2.829l-0.353,0.353l-0.354,-0.353l-14.142,-14.142l-0.353,-0.354l0.353,-0.354l14.142,-14.142l0.354,-0.353l0.353,0.353l2.829,2.829l0.353,0.353l-0.353,0.354l-10.96,10.96z',
		right: 'M18.192 20l-10.96 10.96-.353.354.353.353 2.829 2.829.353.353.354-.353 14.142-14.142.353-.354-.353-.354-14.142-14.142-.354-.353-.353.353-2.829 2.829-.353.353.353.354L18.192 20z'
	};

	onClick = (e) => {
		if (this.props.onClick) {
			this.props.onClick(this.props.direction);
		}
	};

	render() {
		const { direction, className, introAnimation, visible } = this.props;
		const classes = cx(`arrow arrow--${direction}`,
			{ [`arrow--animate-${direction}`]: introAnimation, 'arrow--visible': visible },
			className);
		const icon = SlideArrow.SVG_DATA[direction];

		return (
			<button type="button" className={classes} onClick={this.onClick}>
				<SVGPathIcon className="svg-icon arrow__icon" data={icon} width={32} height={44} />
			</button>
		);
	}
}

import * as React from 'react';

export default class SVGPathIcon extends React.PureComponent {
	static defaultProps = {
		fill: 'currentColor',
		stroke: 'currentStroke',
		width: '100%',
		height: '100%'
	};

	render() {
		const { data, className, fill, stroke, size, viewBox } = this.props;
		let { width, height } = this.props;
		if (size) width = height = size;
		const vb = viewBox ? `${viewBox.minX || '0'} ${viewBox.minY || '0'} ${viewBox.width} ${viewBox.height}` : undefined;

		return (
			<svg className={className} width={width} height={height} viewBox={vb}>
				<path fill={fill} stroke={stroke} d={data} />
			</svg>
		);
	}
}

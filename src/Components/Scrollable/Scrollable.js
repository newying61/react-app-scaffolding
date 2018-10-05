import * as React from 'react';
import * as cx from 'classnames';

import SlideArrow from '../SlideArrow/SlideArrow';

import './Scrollable.css';

const TOUCH_MOVE_MIN_THRESHOLD = 50;
/**
 * Make a list of children scrollable (drag to change page in touch devices)
 *
 * Displays a list of item with support for horizontally scrolling a single row
 *
 */
export default class Scrollable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			transformPosition: 0,
			currentIndex: 0,
			noScrollTransition: false,
			showRightArrow: true,
			showArrows: false
		};

		this.scrollArea = null;
		this.startX = 0;
		this.startY = 0;
		this.currentX = 0;
		this.currentPosition = 0;
		this.startHorizontalScrolling = false;
		this.startVerticalScrollingFlg = false;
	}

	componentDidMount() {
		this.restoreScrollPosition();
		window.addEventListener('resize', this.onResize, false);
	}

	componentDidUpdate(prevProps, prevState) {
		const transformPosition = this.state.transformPosition;
		if (this.props.onScroll && prevState.transformPosition !== transformPosition && this.scrollArea) {
			// Save scroll position - we are using transform, so have to change it to a pixel position
			this.props.onScroll(transformPosition * this.scrollArea.offsetWidth);
		}

		if (this.props.length !== prevProps.length) {
			this.restoreScrollPosition();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
	}

	changeScrollToTransformPosition(scrollX, fullWidth, width, length) {
		let transformPosition = 0;

		let showRightArrow = fullWidth > width;
		const lastPagePosition = fullWidth - width;
		if (lastPagePosition < scrollX) {
			// Saved position is no longer accurate. Restore to end of list
			transformPosition = lastPagePosition / width;
			showRightArrow = false;
		} else {
			transformPosition = scrollX / width;
		}

		return {
			transformPosition,
			currentIndex: Math.round((scrollX / fullWidth) * length),
			showRightArrow,
			noScrollTransition: true
		};
	};

	recalculateTransformPosition(currentPosition, next, fullWidth, width, length) {
		let nextPosition = currentPosition + next;

		let showRightArrow = fullWidth > width;

		if (nextPosition <= 0) {
			nextPosition = 0;
		} else {
			const nextOffset = (nextPosition + 1) * width;
			if (nextOffset >= fullWidth) {
				// Next page is greater than the scroll area full width, reset it to the full width.
				if (nextOffset > fullWidth) {
					nextPosition = (fullWidth - width) / width;
				}
				showRightArrow = false;
			}
		}

		let newState = {
			transformPosition: nextPosition,
			showRightArrow,
			noScrollTransition: false
		};

		if (Math.floor(next) !== 0) {
			newState.currentIndex = Math.round(((nextPosition * width) / fullWidth) * length);
		}

		return newState;
	}

	restoreScrollPosition = () => {
		const { length, scrollX } = this.props;
		const scrollArea = this.scrollArea;

		if (length && scrollArea) {
			// Change scroll position to transform position and by default stop transition
			// If scrollX is not stored, pass 0 in to do an intial calculation for arrows flag
			const newState = this.changeScrollToTransformPosition(scrollX || 0, scrollArea.scrollWidth, scrollArea.offsetWidth, length);
			this.setState(newState);
		}
	}

	forward = () => {
		this.moveToNextPosition(1, this.state.transformPosition);
	};

	backward = () => {
		this.moveToNextPosition(-1, this.state.transformPosition);
	};

	moveToNextPosition = (next, transformPosition, stopTransitionFlg = false) => {
		const scrollArea = this.scrollArea;
		const length = this.props.length;
		if (!scrollArea || !length) return;

		const newState = this.recalculateTransformPosition(
							transformPosition,
							next,
							scrollArea.scrollWidth,
							scrollArea.offsetWidth,
							length);

		if (stopTransitionFlg) {
			newState.noScrollTransition = true;
		}

		this.setState(newState);
	};

	// TODO: We should debounce this function, but when using debounce, we can feel the delay
	onResize = () => {
		const scrollArea = this.scrollArea;
		const length = this.props.length;
		if (!scrollArea || !scrollArea.offsetWidth || !length) return;

		window.requestAnimationFrame(() => {
			// Calculate the new transformPosition based on the index
			const transformPosition = (this.state.currentIndex * (scrollArea.scrollWidth / length)) / scrollArea.offsetWidth;
			this.moveToNextPosition(0, transformPosition, true);
		});
	};

	onReference = (ref) => {
		this.scrollArea = ref;
	};

	shouldShowArrows = () => {
		if (this.state.showRightArrow || this.state.transformPosition > 0) {
			return true;
		}
		return false;
	};

	onMouseEnter = () => {
		if (!this.shouldShowArrows()) return;
		this.setState({ showArrows: true });
	};

	onMouseLeave = () => {
		if (!this.shouldShowArrows()) return;
		this.setState({ showArrows: false });
	};

	onTouchStart = (e) => {
		const { clientX, clientY } = e.nativeEvent.changedTouches[0];
		this.startX = clientX;
		this.startY = clientY;
		this.currentX = clientX;
		// Save current transformPosition for future use
		this.currentPosition = this.state.transformPosition;
	};

	onTouchMove = (e) => {
		const { clientX, clientY } = e.nativeEvent.changedTouches[0];

		// Check move direction first
		if (!this.startPacklistScrolling && !this.startVerticalScrollingFlg) {
			const xDiff = Math.abs(clientX - this.startX);
			const yDiff = Math.abs(clientY - this.startY);

			this.startVerticalScrollingFlg = yDiff > xDiff;
			this.startPacklistScrolling = !this.startVerticalScrollingFlg;
		}

		if (this.startVerticalScrollingFlg) {
			return;
		}

		// For horizontal move, need to stop page scrolling and change the current transform position
		e.preventDefault();
		window.requestAnimationFrame(() => {
			const delta = (this.currentX - clientX) / this.scrollArea.offsetWidth;
			this.currentX = clientX;
			this.moveToNextPosition(delta, true);
		});
	};

	onTouchEnd = (e) => {
		const { clientX } = e.nativeEvent.changedTouches[0];

		if (this.startPacklistScrolling) {
			window.requestAnimationFrame(() => {
				if (clientX === this.startX) return;

				let delta = 0;
				// If user moved enough distance
				if (Math.abs(this.startX - clientX) >= TOUCH_MOVE_MIN_THRESHOLD) {
					delta = (clientX > this.startX) ? -1 : 1;
				};
				// Restore original transform position
				this.moveToNextPosition(delta, this.currentPosition);
			});
		}

		this.startVerticalScrollingFlg = false;
		this.startPacklistScrolling = false;
	};

	render() {
		const { transformPosition, noScrollTransition, showRightArrow, showArrows } = this.state;
		const containerClasses = cx('scrollable__container', { 'no-transition': noScrollTransition });
		const transformStyle = transformPosition !== 0 ? { transform: `translateX(-${transformPosition * 100}%)` } : undefined;

		return (
			<div
				className={cx('scrollable', this.props.className)}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<SlideArrow direction="left"
					visible={showArrows && transformPosition > 0}
					onClick={this.backward}
				/>
				<div
					className={containerClasses}
					style={transformStyle}
					ref={this.onReference}
					onTouchStart={this.onTouchStart}
					onTouchMove={this.onTouchMove}
					onTouchEnd={this.onTouchEnd}
				>
					{this.props.children}
				</div>
				<SlideArrow direction="right"
					visible={showArrows && showRightArrow}
					onClick={this.forward}
				/>
			</div>
		);
	}
}

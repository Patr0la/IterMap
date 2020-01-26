import React, { Component } from "react";
import { View } from "react-native";
import { AnimatedSVGPath } from "react-native-svg-animations";

interface Props {
	animating: boolean;

	strokeColor: string;
	fill: string;

	scale: number;
	width: number;
	height: number;
}

export class LoadingElement extends Component<Props> {
	constructor(props) {
		super(props);
	}

	render() {
		let { animating, strokeColor, fill, width, height, scale } = this.props;
		if (!animating) return null;

		return (
			<View style={{ alignItems: "center", width: 32 }}>
				<AnimatedSVGPath
					strokeColor={strokeColor}
					duration={1500}
					scale={scale}
					width={width}
					height={height}
					delay={100}
					strokeWidth={1}
					fill={fill}
					d={"M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"} // "m 36.165193,174.99874 a 1.6701838,1.6701838 0 0 1 -1.670188,-1.67019 1.6701838,1.6701838 0 0 1 1.670188,-1.67019 1.6701838,1.6701838 0 0 1 1.670188,1.67019 1.6701838,1.6701838 0 0 1 -1.670188,1.67019 m 0,-6.34669 a 4.6765146,4.6765146 0 0 0 -4.676506,4.6765 c 0,3.50738 4.676506,8.68495 4.676506,8.68495 0,0 4.676507,-5.17757 4.676507,-8.68495 a 4.6765146,4.6765146 0 0 0 -4.676507,-4.6765 z",
					// "m 63.764873,236.44935 a 1.6701838,1.6701838 0 0 1 -1.670188,-1.67019 1.6701838,1.6701838 0 0 1 1.670188,-1.67019 1.6701838,1.6701838 0 0 1 1.670188,1.67019 1.6701838,1.6701838 0 0 1 -1.670188,1.67019 m 0,-6.34669 a 4.6765145,4.6765145 0 0 0 -4.676506,4.6765 c 0,3.50738 4.676506,8.68495 4.676506,8.68495 0,0 4.676507,-5.17757 4.676507,-8.68495 a 4.6765145,4.6765145 0 0 0 -4.676507,-4.6765 z",
					// "m 108.47913,233.53779 a 1.6701838,1.6701838 0 0 1 -1.67019,-1.67019 1.6701838,1.6701838 0 0 1 1.67019,-1.67019 1.6701838,1.6701838 0 0 1 1.67019,1.67019 1.6701838,1.6701838 0 0 1 -1.67019,1.67019 m 0,-6.34669 a 4.6765146,4.6765146 0 0 0 -4.67651,4.6765 c 0,3.50738 4.67651,8.68495 4.67651,8.68495 0,0 4.67652,-5.17757 4.67652,-8.68495 a 4.6765146,4.6765146 0 0 0 -4.67652,-4.6765 z",
					// "m 22.509175,264.9034 a 1.6701838,1.6701838 0 0 1 -1.67018,-1.67019 1.6701838,1.6701838 0 0 1 1.67018,-1.67019 1.6701838,1.6701838 0 0 1 1.67019,1.67019 1.6701838,1.6701838 0 0 1 -1.67019,1.67019 m 0,-6.34669 a 4.6765146,4.6765146 0 0 0 -4.676507,4.6765 c 0,3.50738 4.676507,8.68495 4.676507,8.68495 0,0 4.676507,-5.17757 4.676507,-8.68495 a 4.6765146,4.6765146 0 0 0 -4.676507,-4.6765 z"]}
					loop={true}
				></AnimatedSVGPath>
			</View>
		);
	}
}

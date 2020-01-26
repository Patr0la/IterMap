import React from "react";
import { Dimensions, Image, ImageProps, View } from "react-native";
import { CachableImage } from "./CachableImage";
import { EditRoute } from "../Screens/EditRoute_old";

const sha = require("../sha");

interface Props extends IProps {
	source: {
		uri: string;
		headers: { [key: string]: string };
	};

	width: number;

	imageProps: ImageProps;

	parent: React.Component;

	cantUpdateCuzOfImageCacheBug?: boolean; // TODO check if fixed https://github.com/facebook/react-native/issues/9195
}

interface State {
	//title: string;
	//votes: string;

	width: number;
	height: number;
	path: string;

	lastPath: string;
}

export class AutoHeightImage extends CachableImage<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	componentDidUpdate() {
		if (this.state.path != this.state.lastPath) {
			Image.getSize(
				`file://${this.state.path}`,
				(width, height) => {
					this.setState({ lastPath:this.state.path, height: (this.props.width / width) * height, width: this.props.width });

					this.image.forceUpdate();
					this.props.parent.setState({key: new Date().toString()})
				},
				(err) => {
					console.log(err);
				},
			);
		}
		//
		// if(this.state.path)
	}

	render() {

		return this.state.path && this.state.height && this.state.width ? (
			<View style={{ backgroundColor: "white", width: "100%" }}>
				<Image
					{...this.props.imageProps}
					resizeMethod="auto"
					resizeMode="contain"
					style={{
						width: this.state.width,
						height: this.state.height,
					}}
					ref={(ref) => (this.image = ref)}
					key={`file://${this.state.path}`}
					onLoad={(e) => {
						console.log("LOADED:  " + e.nativeEvent.source.url);
					}}
					onError={(err) => {}}y
					source={{ uri: `file://${this.state.path}`, cache: "reload" }}
				></Image>
			</View>
		) : null;
	}
}

const d = Dimensions.get("screen");

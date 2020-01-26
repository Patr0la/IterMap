import React from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

const sha = require("../sha");

interface Props extends IProps {
	url: string;

	imageSource: "local" | "web";
	cacheImage?: boolean;

	imageStyle: any;
	parentViewStyle: any;
}

interface State {
	loading: boolean;
	failed: boolean;
}

export class BetterImage extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			loading: true,
			failed: false,
		};
	}

	render() {
		return (
			<View style={this.props.parentViewStyle}>
				{this.state.failed && this.props.children ? (
					this.props.children
				) : (
					<Image
						resizeMode="stretch"
						style={this.props.imageStyle}
						source={{
							uri: this.props.url,
							headers: {
								Cookie: this.props.data?.token,
							},
						}}
						onLoadEnd={() => this.setState({ loading: false })}
						onError={(err) => this.setState({ failed: true })}
					/>
				)}
				{this.state.loading && !this.state.failed && <ActivityIndicator animating={this.state.loading}></ActivityIndicator>}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	activityIndicator: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	},
});

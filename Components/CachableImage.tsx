import React from "react";
import { Image, ImageSourcePropType, ImageProps } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

import { CACHE_DIR, MAX_AGE } from "../Cache";

const sha = require("../sha");

interface Props extends IProps, IRoute {
	source: {
		uri: string;
		headers: { [key: string]: string };
	};

	imageProps: ImageProps;
}

interface State {
	//title: string;
	//votes: string;

	path: string;
}
export class CachableImage extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			path: "",
		};

		const hash = sha.sha512(JSON.stringify(props.source));

		console.log(hash);

		this.props.data.cache.getCachedValue(hash, (err, res) => {
			if (!err && res) {
				console.log("USING CACHED FILE");
				this.setState({ path: `${CACHE_DIR}/${hash}` });
			} else {
				RNFetchBlob.config({
					// response data will be saved to this path if it has access right.
					path: `${CACHE_DIR}/${hash}`,
				})
					.fetch("GET", props.source.uri, this.props.source.headers)
					.then((res) => {
						this.props.data.cache.addToCache(hash, MAX_AGE.week * 2, "image");
					});
			}
		});
	}

	render() {
		return this.state.path ? (
			<Image
				{...this.props.imageProps}
				source={{ uri: `file://${this.state.path}` }}
			></Image>
		) : null;
	}
}

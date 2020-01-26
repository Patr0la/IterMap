import React from "react";
import { Image, ImageProps } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { CACHE_DIR, MAX_AGE } from "../Cache";
import * as config from "../Config.json";

const sha = require("../sha");

interface Props extends IProps {
	source: {
		uri: string;
		headers: { [key: string]: string };
	};

	imageProps: ImageProps;

	cantUpdateCuzOfImageCacheBug?: boolean; // TODO check if fixed
}

interface State {
	//title: string;
	//votes: string;

	path: string;

	key: string;
}
export class CachableImage<a, b> extends React.Component<Props & a, State & b> {
	constructor(props: Props & a) {
		super(props);

		//@ts-ignore
		this.state = {
			path: "",
			key: new Date().getTime().toString(),
		};

		const hash = sha.sha512(JSON.stringify(props.source));

		this.props.data.cache.getCachedValue(hash, (err, res) => {
			if (!err && res) {
				if (this.props.cantUpdateCuzOfImageCacheBug) {
					//@ts-ignore
					this.setState({ path: `${CACHE_DIR}/${hash}?rnd=${new Date().getTime()}` });
				} else {
					//@ts-ignore
					this.setState({ path: `${CACHE_DIR}/${hash}` });
				}

				this.props.data.cache.getLastModified(hash, (lastModified) => {
					fetch(`${config.host}/api/confirmFileUpToDate`, {
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json",
							...this.props.source.headers,
						},
						body: JSON.stringify({
							uri: this.props.source.uri,
							lastModified,
						}),
					})
						.then((res) => res.json())
						.then((res) => {
							if (res.needsUpdate) {
								this.props.data.cache.clearFromCache(hash);

								//@ts-ignore
								this.setState({ path: "" });

								RNFetchBlob.config({
									// response data will be saved to this path if it has access right.
									path: `${CACHE_DIR}/${hash}`,
									overwrite: true,
								})
									.fetch("GET", props.source.uri, this.props.source.headers)
									.then((res) => {
										this.props.data.cache.addToCache(hash, MAX_AGE.week * 2, "image");

										//@ts-ignore
										this.setState({ path: `${CACHE_DIR}/${hash}?rnd=${new Date().getTime()}`, key: new Date().getTime().toString() });

										if (!this.image) {
											console.log("REEEE");
										} else {
											this.image.setNativeProps({ key: new Date().getTime().toString() });
										}
									})
									.catch((err) => {
										console.log(err);
									});
							}
						})
						.catch((err) => {
							console.log(err);
						});
				});
			} else {
				this.props.data.cache.addToCache(hash, MAX_AGE.week * 2, "image");
				RNFetchBlob.config({
					// response data will be saved to this path if it has access right.
					path: `${CACHE_DIR}/${hash}`,
				})
					.fetch("GET", props.source.uri, this.props.source.headers)
					.then((res) => {});
			}
		});
	}

	image: Image;

	render() {
		return (
			<Image
				ref={(ref) => (this.image = ref)}
				{...this.props.imageProps}
				key={`file://${this.state.path}`}
				onError={(err) => {}}
				source={{ uri: `file://${this.state.path}`, cache: "reload" }}
			></Image>
		);
	}
}

import React from "react";
import { Image, ImageSourcePropType } from "react-native";

const sha = require("../sha");

interface Props extends IProps, IRoute {
    source: ImageSourcePropType;
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
            path: true
        }

        const hash = sha.sha512(props.source);

        props.data.

        console.log(this.props.source)
        
    }

	render() {
        return this.state.path ? (
            <Image source={this.props.source} onLoad={(e) => {
                console.log(e.nativeEvent.source)
            }} on>
            </Image>
        ) :  null;
    }
}

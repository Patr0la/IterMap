import React from "react";
import { Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
	traveledBy: Array<travelVehicle>;
}

export class TraveledBy extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		const traveled = this.props.traveledBy.map((v, i) => <Icon key={i} name={travelIcons[v]} size={30} color="white" />);
		if (traveled.length != 0) return <Text>{traveled}</Text>;
		return null;
	}
}

enum travelIcons {
	"Plane" = "airplane",
	"Ship" = "ferry",
	"Bus" = "bus",
	"Car" = "car",
	"Foot" = "walk",
}

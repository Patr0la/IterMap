import React from "react";
import { ActivityIndicator, StyleSheet, View, Dimensions, RefreshControl } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { RoutePost } from "./RoutePost";

interface Props extends IProps {
	routeData: Array<IRoute>;

	onNearToEnd?: () => void;
	onRefresh?: () => void;
}

interface State extends IRoute {
	//title: string;
	//votes: string;
	refreshing: boolean;
	
}
export class RoutesPreview extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			//routeData: this.props.routeData,
			refreshing: false,
		};
	}

	  
	render() {
		console.table(this.props.navigation.getParam("mandatoryRefresh", false));
		if (this.props && this.props.routeData) {
			// TODO Implement image CDmN
			return (
				<FlatList
					renderItem={(route) => {
						if (route == null) return <View style={{ height: 100, width: "100%" }}></View>;
						return <RoutePost {...route.item} navigation={this.props.navigation} data={this.props.data} parent={this} ></RoutePost>;
					}}
					data={this.props.routeData}
					keyExtractor={(a) => a?._id ?? new Date().getTime().toString()}
					style={styles.view}
					ItemSeparatorComponent={() => <View style={{ backgroundColor: "#242424", width: "100%", height: d.height * 0.01 }}></View>}
					ListFooterComponent={() => {
						return <View style={{ height: d.height * 0.5, width: "100%", backgroundColor: "#242424" }}></View>;
					}}
					onEndReached={() => {
						console.log("END REACHED");
						this.props.onNearToEnd?.();
					}}
					onEndReachedThreshold={0.1}
					refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.props?.onRefresh?.()}></RefreshControl>}
				></FlatList>
			);
		} else {
			return (
				<View>
					<ActivityIndicator animating={true}></ActivityIndicator>
				</View>
			);
		}
	}
}

const d = Dimensions.get("screen")

const styles = StyleSheet.create({
	view: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		width: "100%",
		backgroundColor: "#242424",
	},
	title: {
		fontFamily: "DejaVuSerif-Bold",
		fontSize: 24,
		color: "white",
		marginLeft: 10,
	},
	madeBy: {
		fontFamily: "DejaVuSerif",
		color: "#aaaaaa",
		fontSize: 18,
		marginTop: 6,
		flexGrow: 1,
	},
	image: {
		//position: "absolute",
		//left: 0,
		//right: 0,
		//top: 0,
		//bottom: 0,
		width: "100%",
		height: "100%",
	},
	header: {
		display: "flex",
		//position: "absolute",
		justifyContent: "space-between",
		flexDirection: "row",
	},
	info: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
		height: 100,
		backgroundColor: "red",
		width: "100%",
	},
});

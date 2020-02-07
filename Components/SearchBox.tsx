import React from "react";
import { Dimensions, Keyboard, Platform, Text, TextInput, UIManager, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as config from "../Config.json";

if (Platform.OS == "android" && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);

interface Props extends IProps {
	menu?: boolean;

	placeHolder: string;

	requestPrepeareCallback?: () => any;
	onSelectCallback: (selection: {
		name: string;
		value: any;
		types?: any;
		latitude?: number;
		longitude?: number;
		viewport?: {
			latitude: number;
			latitudeDelta: number;
			longitude: number;
			longitudeDelta: number;
		};
	}) => void;

	endpoint: string;
}

interface State {
	active: boolean;
	text: string;
	resoults: Array<{ name: string; value: string; type: string }>;
}

export class SearchBox extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			active: false,
			text: "",
			resoults: [],
		};
	}

	session: string;

	querry(querry: string) {
		if (querry.length < 3) {
			this.session = `${new Date().getTime()}`;
			return;
		}

		if (querry.length % 3 != 0) return;

		fetch(`${config.host}/api/${this.props.endpoint}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ querry, ...(this.props.requestPrepeareCallback ? this.props.requestPrepeareCallback() : {}), session: this.session }),
		})
			.then((res) => res.json())
			.then((resoults) => {
				this.setState({ resoults });
			});
	}

	serchBoxViewHeight: number;
	render() {
		return (
			<View style={{ backgroundColor: "#242424", paddingTop: "2.5%", paddingBottom: "2.5%" }}>
				<View style={{ flexDirection: "row", backgroundColor: "#242424", alignItems: "center", height: d.height * 0.05, paddingLeft: "5%" }}>
					{this.props.menu && !this.state.active && (
						<Icon
							name="menu"
							size={32}
							color="#ad0a4c"
							onPress={() => {
								this.props.navigation.openDrawer();
							}}
						/>
					)}

					{this.state.active && (
						<Icon
							name="keyboard-backspace"
							size={32}
							color="#ad0a4c"
							onPress={() => {
								//this.closeAnimated();
								this.setState({ active: false, text: "", resoults: [] });
								this.session = "";
								Keyboard.dismiss();
							}}
						/>
					)}

					<View style={{ flexDirection: "row", backgroundColor: "#323232", alignItems: "center", height: d.height * 0.05, paddingLeft: "5%", borderRadius: 6, marginLeft: "5%" }}>
						<Icon name="magnify" size={22} color="#aaaaaa" style={{ alignSelf: "center" }} />
						<TextInput
							style={{ width: "80%", color: "white", backgroundColor: "#323232" }}
							value={this.state.text}
							placeholder={this.props.placeHolder}
							placeholderTextColor="#aaaaaa"
							onChangeText={(text) => {
								this.querry(text);
								this.setState({ text });
							}}
							onFocus={() => {
								//LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
								this.setState({ active: true });
								this.session = `${new Date().getTime()}_${this.state.text?.substr(0, 3) || Math.round(Math.random() * 100)}`;
								//this.openAnimated();
							}}
						></TextInput>
					</View>
				</View>
				{this.state.active && (
					<View
						style={{
							marginTop: "2.5%",
							height: d.height,
							width: d.width,
							backgroundColor: "#323232",
							display: this.state.active ? "flex" : "none",
							flexDirection: "column",
							// position: "absolute",
							// zIndex: 10
						}}
					>
						{this.state.resoults.map((r) => (
							<TouchableOpacity
								style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", alignContent: "center", marginLeft: "5%", marginRight: "5%", marginVertical: d.height * 0.025 }}
								onPress={() => {
									console.log(this.props.endpoint);

									if (this.props.endpoint == "findLocation")
										fetch(`${config.host}/api/findLocationGetLocationData`, {
											method: "POST",
											headers: {
												Accept: "application/json",
												Cookie: `session=${this.props.data.token}`,
												"Content-Type": "application/json",
											},
											body: JSON.stringify({ id: r.value, session: this.session }),
										})
											.then((res) => res.json())
											.then((pos: IPos) => {
												console.table(pos);
												this.props.onSelectCallback({ ...r, ...pos });
											});
									else this.props.onSelectCallback(r);

									this.setState({ active: false, text: "", resoults: [] });
									Keyboard.dismiss();
								}}
							>
								<Text style={{ color: "#aaaaaa", flex: 1 }}>{r.name}</Text>
								{r.type && TypeToIcon[r.type] ? (
									<Icon name={TypeToIcon[r.type]} size={22} color="#aaaaaa" style={{ alignSelf: "center" }} />
								) : (
									(() => {
										console.table({ type: r.type, icon: TypeToIcon[r.type] });
										return null;
									})()
								)}
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>
		);
	}
}

export enum TypeToIcon {
	country = "flag",
	city = "city",
	locality = "city",

	airport = "airport",
	accounting = "briefcase",
	aquarium = "fish",
	//art_gallery = "chart-tree",
	atm = "atm",
	bar = "glass-cocktail",
	book_store = "book-open-page-variant",
	//bus_station = "bus-stop",
	cafe = "coffee",
	campground = "tent",
	casino = "cards-club",
	cemetery = "coffin",
	church = "church",
	clothing_store = "tshirt-crew",
	convenience_store = "store",
	florist = "flower-outline",
	funeral_home = "coffin",
	gas_station = "gas-station",
	grocery_or_supermarket = "store",
	hair_care = "content-cut",
	hardware_store = "bolt",
	home_goods_store = "store",
	library = "library-shelves",
	movie_theater = "theater",
	museum = "bank",
	night_club = "glass-cocktail",
	park = "pine-tree",
	parking = "parking",
	food = "silverware",
	restaurant = "silverware",
	shopping_mall = "shopping",
	spa = "spa",
	stadium = "stadium",
	store = "store",
	tourist_attraction = "pillar",
	university = "school",
	zoo = "elephant",
}

const d = Dimensions.get("screen");

/*<View style={{ backgroundColor: "#242424", paddingBottom: "2%", justifyContent: "center", alignItems: "center", alignContent: "center", flexDirection: "column" }} onLayout={l => (this.serchBoxViewHeight = l.nativeEvent.layout.height)}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", alignContent: "center", flex: 1}}>
                        <View style={{marginRight: "3%"}}>
                        {this.props.menu && !this.state.active && <Icon name="menu" size={28} color="#ad0a4c" onPress={() => this.props.navigation.openDrawer()} />}
                        {this.state.active && (
                            <Icon
                                name="keyboard-backspace"
                                size={36}
                                color="#ad0a4c"
                                onPress={() => {
                                    //this.closeAnimated();
                                    this.setState({ active: false, text: "", resoults: [] });
                                    Keyboard.dismiss();
                                }}
                            />
                        )}
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "center", backgroundColor: "#323232", alignItems: "center", alignContent: "center", borderRadius: 8 }}>
                            <Icon name="magnify" size={22} color="#aaaaaa" style={{ alignSelf: "center" }} />
                            <TextInput
                                style={{ width: "80%", color: "white", backgroundColor: "#323232" }}
                                value={this.state.text}
                                placeholder="Search for places"
                                placeholderTextColor="#aaaaaa"
                                onChangeText={text => {
                                    this.querry(text);
                                    this.setState({ text });
                                }}
                                onFocus={() => {
                                    //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                                    this.setState({ active: true });
                                    //this.openAnimated();
                                }}
                            ></TextInput>
                        </View>
                    </View>
                </View>*/

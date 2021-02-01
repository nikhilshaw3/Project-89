import React, { Component } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import { RFValue } from "react-native-responsive-fontsize";
import { SearchBar, ListItem, Input } from "react-native-elements";
import MyHeader from "../components/MyHeader";


export default class BookRequestScreen extends Component {
constructor() {
super();

this.state = {
userId: firebase.auth().currentUser.email,
itemName: "",
reasonToRequest: "",
IsExchangeRequestActive: "",
requestedBookName: "",
itemStatus: "",
requestId: "",
userDocId: "",
docId: "",
showFlatlist: false,
};
}

createUniqueId() {
return Math.random().toString(36).substring(7);
}

addRequest = async (itemName, reasonToRequest) => {
var userId = this.state.userId;
var randomRequestId = this.createUniqueId();

db.collection("requested_books").add({
user_id: userId,
item_name: itemName,
reason_to_request: reasonToRequest,
request_id: randomRequestId,
item_status: "requested",
date: firebase.firestore.FieldValue.serverTimestamp(),
});

await this.getExchangeRequest();

db.collection("users").where("email_id", "==", userId).get().then()
.then((snapshot) => {
snapshot.forEach((doc) => {

db.collection("users").doc(doc.id).update({
IsExchangeRequestActive: true,
});
});
});

this.setState({
itemName: "",
reasonToRequest: "",
requestId: randomRequestId,
});

return Alert.alert("item Requested Successfully");
};

receivedItems = (itemName) => {
var userId = this.state.userId;
var requestId = this.state.requestId;

db.collection("received_items").add({
user_id: userId,
item_name: itemName,
request_id: requestId,
itemStatus: "received",
});
};

getIsExchangeRequestActive() {
db.collection("users").where("email_id", "==", this.state.userId).onSnapshot((querySnapshot) => {
querySnapshot.forEach((doc) => {

this.setState({
IsExchangeRequestActive: doc.data().IsExchangeRequestActive,
userDocId: doc.id,
});
});
});
}

getExchangeRequest = () => {
    // getting the requested book
var exchangeRequest = db.collection("requests").where("user_id", "==", this.state.userId).get()
.then((snapshot) => {
snapshot.forEach((doc) => {
if (doc.data().item_status !== "received") {

this.setState({
requestId: doc.data().request_id,
requestedItemName: doc.data().item_name,
itemStatus: doc.data().item_status,
docId: doc.id,
});
}
});
});
};

sendNotification = () => {
//to get the first name and last name
db.collection("users").where("email_id", "==", this.state.userId).get()
.then((snapshot) => {
snapshot.forEach((doc) => {

var name = doc.data().first_name;
var lastName = doc.data().last_name;

// to get the donor id and book nam
db.collection("all_notifications")
.where("request_id", "==", this.state.requestId)
.get()
.then((snapshot) => {snapshot.forEach((doc) => {

var donorId = doc.data().donor_id;
var itemName = doc.data().book_name;

//targert user id is the donor id to send notification to the user
db.collection("all_notifications").add({
targeted_user_id: donorId,
message: name + " " + lastName + " received the book " + bookName,
notification_status: "unread",
item_name: itemName,
});
});
});
});
});
};

componentDidMount() {
this.getExchangeRequest();
this.getIsExchangeRequestActive();
  }

updateExchangeRequestStatus = () => {
//updating the book status after receiving the book
db.collection("requests").doc(this.state.docId).update({
item_status: "received",
});

//getting the  doc id to update the users doc
db.collection("users").where("email_id", "==", this.state.userId).get().then((snapshot) => {
snapshot.forEach((doc) => {

db.collection("users").doc(doc.id).update({
IsExchangeRequestActive: false,
});
});
});
};

render() {

if (this.state.IsExchangeRequestActive === true) {

return (

<View style={{ flex: 1}}>
<View
style={{flex: 0.1,}}>

<MyHeader title="Item Status" navigation={this.props.navigation} />

</View>

<View style={styles.bookstatus}>

<Text
style={{
fontSize: RFValue(20),
}}
>
Name of the Item
</Text>

<Text
style={styles.requestedbookName}
>
{this.state.requestedItemName}

</Text>

<Text style={styles.status}>
Status
</Text>

<Text
style={styles.bookStatus}
>
{this.state.itemStatus}
</Text>

</View>

<View style={styles.buttonView}>
            
<TouchableOpacity style={styles.button}
onPress={() => {
this.sendNotification();
this.updateExchangeRequestStatus();
this.receivedItems(this.state.requestedItemName);
}}
>

<Text style={styles.buttontxt}>
I received the item  </Text>

</TouchableOpacity>
</View>
</View>
);
}

return (

<View style={{ flex: 1 }}>
<View style={{ flex: 0.1 }}>
<MyHeader title="Request an Item" navigation={this.props.navigation} />
        
</View>

<View style={{ flex: 0.9 }}>

<Input
style={styles.formTextInput}
label={"Item"}
placeholder={"Item name"}
containerStyle={{ marginTop: RFValue(60) }}
value={this.state.bookName}
/>
{this.state.showFlatlist ? (

<FlatList
data={this.state.dataSource}
renderItem={this.renderItem}
enableEmptySections={true}
style={{ marginTop: RFValue(10) }}
keyExtractor={(item, index) => index.toString()}
/>
) : (

<View style={{ alignItems: "center" }}>

<Input
style={styles.formTextInput}
containerStyle={{ marginTop: RFValue(30) }}
multiline
numberOfLines={8}
label={"Description"}
placeholder={"Description"}
onChangeText={(text) => {
this.setState({
reasonToRequest: text,
});
}}
value={this.state.reasonToRequest}
/>
              
<TouchableOpacity
style={[styles.button, { marginTop: RFValue(30) }]}
onPress={() => {
this.addRequest(
this.state.itemName,
this.state.reasonToRequest
);
}}
>

<Text style={styles.requestbuttontxt}>
Add Item

</Text>
</TouchableOpacity>
</View>
)}
</View>
</View>
);
}
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formTextInput: {
    width: "75%",
    height: RFValue(35),
    borderWidth: 1,
    padding: 10,
  },
  ImageView:{
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginTop:20
  },
  imageStyle:{
    height: RFValue(150),
    width: RFValue(150),
    alignSelf: "center",
    borderWidth: 5,
    borderRadius: RFValue(10),
  },
  bookstatus:{
    flex: 0.4,
    alignItems: "center",

  },
  requestedbookName:{
    fontSize: RFValue(30),
    fontWeight: "500",
    padding: RFValue(10),
    fontWeight: "bold",
    alignItems:'center',
    marginLeft:RFValue(60)
  },
  status:{
    fontSize: RFValue(20),
    marginTop: RFValue(30),
  },
  bookStatus:{
    fontSize: RFValue(30),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  buttonView:{
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontxt:{
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#fff",
  },
  touchableopacity:{
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    width: "90%",
  },
  requestbuttontxt:{
    fontSize: RFValue(10),
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    width: "75%",
    height: RFValue(30),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(50),
    backgroundColor: "#32867d",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
});

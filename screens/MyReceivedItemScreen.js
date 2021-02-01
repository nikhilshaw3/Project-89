import React, { Component } from 'react';
import { View, StyleSheet, Text,Image, FlatList,TouchableOpacity } from 'react-native';
import { ListItem } from 'react-native-elements'
import firebase from 'firebase';
import db from '../config'
import MyHeader from '../components/MyHeader';
import { RFValue } from "react-native-responsive-fontsize";

export default class MyReceivedBooksScreen extends Component{

constructor(){
super()

this.state = {
userId  : firebase.auth().currentUser.email,
receiverExchangeList : []
}
this.requestRef= null
}

getReceivedExchangeList =()=>{

this.requestRef = db.collection("requested_books")
.where('user_id','==',this.state.userId)
.where("item_status", '==','received')
.onSnapshot((snapshot)=>{

    var receiverExchangeList = snapshot.docs.map((doc) => doc.data())

this.setState({
receiverExchangeList : receiverExchangeList
});

})
}

componentDidMount(){
this.getReceivedExchangeList()
}

componentWillUnmount(){
this.requestRef();
}

keyExtractor = (item, index) => index.toString()

renderItem = ( {item, i} ) =>{

return (

<ListItem
key={i}
title={item.item_name}
subtitle={item.itemStatus}
titleStyle={styles.titlestyle}
bottomDivider
/>
)
}

render(){
return(

<View style={{flex:1}}>
<MyHeader title="Received Items" navigation ={this.props.navigation}/>

<View style={{flex:1}}>
{
this.state.receiverExchangeList.length === 0
?(

<View style={styles.subContainer}>

<Text style={{ fontSize: 20}}>List Of All Received Items</Text>

</View>
)
:(
<FlatList
keyExtractor={this.keyExtractor}
data={this.state.receiverExchangeList}
renderItem={this.renderItem}
/>
)
}

</View>
</View>
)
}
}

const styles = StyleSheet.create({
  subContainer:{
    flex:1,
    fontSize: 20,
    justifyContent:'center',
    alignItems:'center'
  },
  button:{
    width:100,
    height:30,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     }
  },
  LiImage:{
    height:RFValue(50),
    width:RFValue(50)
  },
  titlestyle:
  {
  color: 'black',
  fontWeight: 'bold'
},

})

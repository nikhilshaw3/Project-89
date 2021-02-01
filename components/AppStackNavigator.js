import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import ExchangeScreen from '../screens/ExchangeScreen';
import RecieverDetailsScreen  from '../screens/RecieverDetailsScreen';

export const AppStackNavigator = createStackNavigator({
  ExchangeList : {
    screen : ExchangeScreen,
    navigationOptions:{
      headerShown : false
    }
  },
  RecieverDetails : {
    screen : RecieverDetailsScreen,
    navigationOptions:{
      headerShown : false
    }
  }
},
  {
    initialRouteName: 'ExchangeList'
  }
);

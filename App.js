
import React, { useState} from 'react'
import { StyleSheet, View } from 'react-native'

import * as Font from 'expo-font'
import { AppLoading } from 'expo'
import ChatView from './screens/chatView';

const fetchFonts = () => {
  return Font.loadAsync({
    'ubuntu-reg': require('./assets/fonts/Ubuntu-Regular.ttf'),
    'ubuntu-bold': require('./assets/fonts/Ubuntu-Medium.ttf'),
    'ubuntu-light': require('./assets/fonts/Ubuntu-Light.ttf')
  })
}

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false)

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontLoaded(true)}
        onError={()=> conaole.log('Fonts not loaded')}
      />
    )
  }
  return (
    <View style={styles.container}>
     <ChatView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

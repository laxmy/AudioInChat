import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text} from 'react-native'

import { IconButton , ProgressBar } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'

//import * as ThumbImage from '../assets/slider.png'

import { Audio } from 'expo-av'
import * as Constants from  '../constants'

const PlaybackBubble = props =>{

 const { fileURI } = props
 const [isPlaying, togglePlay] = useState(false)
 const[playStatus,setPlayStatus] = useState(0)
 const[percentagePlayed, setPercentagePlayed]=useState(0)
 const[sound, setSound] =useState(null)

useEffect(()=> {
    if(sound==null)
    prepareAudio()

    if(isPlaying)
        playAudio()
    else
        pauseAudio()
},[isPlaying])

const playAudio =()=>{
 sound!=null && sound.playAsync()
}

const pauseAudio =()=>{
 sound!=null && sound.pauseAsync()
}

const prepareAudio = async ()=>{
    try {
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        playsInSilentLockedModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: true,
        staysActiveInBackground: true,
        })

    const { sound } = await Audio.Sound.createAsync(     
        { uri: fileURI },
        { shouldPlay: false, position: 0, duration: 1, progressUpdateIntervalMillis: 500 },
        (status)=> {
            if(status.didJustFinish)
            {
                sound.setPositionAsync(0)
                togglePlay(false)
            }
                
            setPlayStatus(status.positionMillis)
            setPercentage(status.positionMillis, status.durationMillis)
        }
        )
        await sound.setVolumeAsync(1.0)
        setSound(sound)
    }

    catch (error) {
    console.log(error)
    }
}

const seek=percentage=>{
   // let position = percentage *
  //console.log(sound)
}

const setPercentage=(status, total)=>{
    console.log(status)
    let percentage =  isNaN(status) || isNaN(total) ? 0: status/total
    setPercentagePlayed(percentage)    
}


 return(
    <View style={styles.controlContainer}>

         <IconButton  style={styles.playPauseButton} icon={()=> 
           <Ionicons name={isPlaying? "ios-pause":"ios-play"} size={24} color="black" />} 
            onPress={()=>togglePlay(!isPlaying)}/> 
         <Text>{displayRecordingDuration(playStatus)}</Text>
         <View style={styles.slider}>
            <Slider minimumTrackTintColor='black' thumbImage={require('../assets/tracker.png')} disabled={false} onValueChange={(percentage) => seek(percentage)} value={percentagePlayed} />
        </View>

    </View>
    )
}

export default PlaybackBubble


const styles = StyleSheet.create({
    controlContainer:{
        flex:1,
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems:'center',
        height: 80,
    },
    playPauseButton:{
        flex: 1,
        height:70,
        width: 70,
    },
    slider: {
        flex: 3,
        height: 3,
        margin: 10,
        marginBottom: 50,
      },
})

const displayRecordingDuration = (millisec) => {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}
import React, {Component} from 'react'
import {View, StyleSheet, Modal , Text} from 'react-native'

import { IconButton } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

import * as Constants from '../constants'


class RecorderModal extends Component {
    recording = null

    state = {
      haveRecordingPermissions: false,
      isLoading: false,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
    }

    recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));

    _askForPermissions = async () => {
        if(this.state.haveRecordingPermissions)
        return
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        this.setState({
          haveRecordingPermissions: response.status === 'granted',
        })
      }

    _updateScreenForRecordingStatus = status => {  
        if (status.canRecord) {
          this.setState({
            isRecording: status.isRecording,
            recordingDuration: status.durationMillis,
          });
        } else if (status.isDoneRecording) {
          this.setState({
            isRecording: false,
            recordingDuration: status.durationMillis,
          });
        
        }
      };

    _stopRecordingAndSave = async (toBeSaved) =>{
        //  this.setState({
        //      isLoading: true
        //  })
          try {
            await this.recording.stopAndUnloadAsync();
            let status = await this.recording.getStatusAsync()
            console.log(status)
          } catch (error) {
            console.log(error)
          }
            // Do nothing -- we are already unloaded.
            if(toBeSaved)
            {
                try{
                    const info = await FileSystem.getInfoAsync(this.recording.getURI());
                   // console.log(`FILE INFO: ${JSON.stringify(info)}`)
                    this.props.onAddNewAudio(info.uri)
                }
                catch(error)
                {
                    console.log(error)
                }
            }     
            // this.setState({
            //     isLoading: false,
            // })     
           
    }

    _beginRecording= async ()=> {

        if (this.recording !== null) {
            this.recording.setOnRecordingStatusUpdate(null);
            this.recording = null;
        }

        try{
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: true,
              })
        }
        catch(err)
        {
            console.log(err)
        }
       
     
    
        const recording = new Audio.Recording();
        try{
            await recording.prepareToRecordAsync(this.recordingSettings);
        }
        catch(err)
        {
            console.log(err)
        }
      
        recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);
        recording.setProgressUpdateInterval(1000)
    
        this.recording = recording;
        try{
            await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
        }
        catch(err){
            console.log(err)
        }
      } 

      _onRecorderClose = async (toBeSaved) => {
          try
          {
              let status = await this.recording.getStatusAsync()
              console.log("status now"+ status.isDoneRecording)
              if(!status.isDoneRecording)
               await this._stopRecordingAndSave(toBeSaved)
          }
          catch(error)
          {
             console.log(error)
          }
          this.props.hideRecorder()
      }

      _onStartRecord = async () =>
      {
          try{
              await this._askForPermissions();
              await this._beginRecording()
            }
            catch(err){
                console.log(err)
            }
      }

render() {
    const{ isVisible } = this.props
    return(
        <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={()=>{}} onShow={this._onStartRecord}>
            <View style={styles.modal}>
                <View style={styles.recorderContainer}>
                    <View style={styles.controlContainer}>
                        <IconButton  style={styles.closeButton} icon={()=> <Ionicons name="md-checkmark" size={24} color="black" />} 
                        onPress={()=>this._onRecorderClose(true)}/>
                        <IconButton  style={styles.closeButton} icon={()=> <Ionicons name="md-close" size={24} color="black" />} 
                        onPress={()=>this._onRecorderClose(false)}/>
                        <View style={styles.recordingStatus}>
                            <Text style={{fontFamily: Constants.lightWtFont, color:'black'}}>RECORDING</Text>
                            <Text style={styles.recordingText}>{displayRecordingDuration(this.state.recordingDuration)}</Text>
                        </View>
                        
                    </View>
                </View>
            </View>
        </Modal>
    )
}
}

export default RecorderModal

const styles = StyleSheet.create({
    recordingText:{
        color: 'black',
    },
    modal:{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    recorderContainer:{
        height: 80,
        position:'absolute',
        bottom: '50%',
        width: '90%',
        marginHorizontal:'5%',
        backgroundColor:Constants.PrimaryColor,
        borderRadius: 80
    },
    controlContainer:{
        flex: 1,
        flexDirection:'row',
        justifyContent: 'space-around',
        alignItems:'center'
    },
    closeButton:{
       height:70,
       width: 70,
    },
    recordingStatus:{
        flex:2,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    }
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
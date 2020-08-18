import React, {Component} from 'react'
import { View,StyleSheet, Alert}   from 'react-native'
import { GiftedChat, MessageText, Bubble ,Send} from 'react-native-gifted-chat'

import { IconButton } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

import * as Constants from  '../constants'

import RecorderModal from './recorderModal'
import PlaybackBubble from './playBackBubble'
import { Colors } from 'react-native/Libraries/NewAppScreen'

const stepsToUpload =[
    {
        id: 1,
        message:'Hi User, Greetings! Please record any audio you would like to send',
        trigger: 'end'
    },
    {
        id: 3,
        message: 'Thanks for trying this'
    }
    
]
const user1 = {
    _id: 2,
    name: 'other end',
  };

const currentUser ={
    _id: 1,
    name: 'current user',
}


class ChatView extends Component {
    state = {
      currStepIndex: 1,
      messages: [{
        _id: 1,
        text: stepsToUpload[0].message,
        extraData: stepsToUpload[0].trigger,
        createdAt: new Date(),
        user: user1
      }],
      isRecorderVisible: false
    }

  
    onSend(messages = []) {
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, messages),
        }));
      }

    onAddNewAudio = (fileURI) =>{
       let msg = {
        _id: this.state.messages.length + 10,
        text: ' ',
        createdAt: new Date(),
        extraData:'voice',
        fileURI: fileURI,
        user: currentUser
      }
      this.setState(previousState =>({
        messages: GiftedChat.append(previousState.messages, [msg]),
      }))
      this.sendBotResponse(3)
    }
      
    sendBotResponse(stepIndex) {
        let nextStep = stepsToUpload.find(step => step.id === stepIndex)
        let msg = {
            _id: this.state.messages.length + 1,
            text: nextStep.message,
            extraData: nextStep.trigger,
            createdAt: new Date(),
            user: user1
        };
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, [msg])
        }));
    }

    onPressOK = args =>{
      Alert.alert('Adding Audio done')
    }

    renderMessageText = props =>{
        const {currentMessage} = props
        if(currentMessage.extraData && currentMessage.extraData==='voice')   
        {   
          return (<PlaybackBubble style={styles.MessageTxt} fileURI = { currentMessage.fileURI }/>)
        }
        return <MessageText customTextStyle={styles.MessageTxt} {...props} />
    }

    showRecorder = props=>{
      this.setState({
        isRecorderVisible:true
     })
    }

    hideRecorder =()=>{
        this.setState({
            isRecorderVisible:false
        })
      
    }
    renderBubble= props => {
      return <Bubble style={styles.MessageTxt} {...props}  wrapperStyle={{
        left: {
          backgroundColor: Constants.PrimaryColor,
          width: '70%',
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 20,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          shadowOffset:{  height: 5, width: 5 },
          shadowColor: Constants.ShadowColor,
          shadowOpacity: 0.6,
        },
        right: {
          backgroundColor: Constants.PrimaryColor,
          width: '70%',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 2,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          shadowOffset:{  height: 5, width: 5 },
          shadowColor: Constants.ShadowColor,
          shadowOpacity: 0.6,
        },
      }}/>;
    }


    renderSend = (props) => {
      let icon = <Ionicons name="md-send" size={26} color={Constants.PrimaryColor}/>
      return (<Send {...props} onPress={this.showRecorder} containerStyle={{
        height: 50,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
      }}>     
        {icon}
      </Send>)
    }

    render() {
      return (
        <View style={styles.screen}>

          <GiftedChat
            messagesContainerStyle ={styles.container}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            renderMessageText={this.renderMessageText}
            renderBubble={this.renderBubble}
            renderSend ={this.renderSend}
            user={currentUser}
            alignTop={true}
            renderAvatar={null}
            textInputStyle={styles.TextInput}
            parsePatterns={(linkStyle) => [
              { pattern: /#(\w+)/,style: {textDecorationLine: 'underline', color: 'black' }, onPress: this.onPressOK },
            ]}
          /> 

         <IconButton style={{...styles.floatingButton, 
            backgroundColor: this.state.isRecorderVisible ? Constants.ShadowColor : Constants.PrimaryColor}} 
            icon={()=> <Ionicons name="ios-mic" size={24} color="black" />} 
         onPress={this.showRecorder}/> 

          <RecorderModal isVisible ={this.state.isRecorderVisible}  hideRecorder={this.hideRecorder} onAddNewAudio={this.onAddNewAudio}/>

        </View>
      );
    }
  }


export default ChatView

const styles = StyleSheet.create({
    screen:{
        flex: 1,
        backgroundColor:Constants.ShadowColor,
        width: '100%'
    },
    floatingButton:{
        alignItems:'center',
        justifyContent:'center',
        width:70,
        position: 'absolute',                                          
        bottom: 80,                                                    
        right: 10,
        height:70,
        borderRadius:100,
    },
    MessageTxt:{
      fontFamily:Constants.regularFont,
      fontSize:14
    },
    TextInput:{
      fontFamily: Constants.regularFont
    }

})

 
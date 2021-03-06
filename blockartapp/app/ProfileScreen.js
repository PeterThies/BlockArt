﻿/*
Dieser Screen beinhaltet hauptsächlich die Funktionalitäten von dem Login-Dienst Okta zum Ausloggen und Bearbeiten des Benutzerkontos.
Dafür wird die Okta API verwendet. (Siehe https://developer.okta.com/code/react/).
Für die Benutzerkontoverwaltung wird ein In-App-Browser geöffnet, in dem der Benutzer auf die Okta-Page weitergeleitet wird.
 */

import React, { Fragment } from 'react';
import {
  SafeAreaView,
  Button,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {
  createConfig,
  authenticate,
  getAccessToken,
  getUserFromIdToken,
  EventEmitter,
  signOut,
} from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import configFile from './../samples.config';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const { width, height } = Dimensions.get('window');


export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'User Profile',
  };

  constructor() {
    super();
    this.state = {
      authenticated: false,
      accessToken: null,
      progress: false,
      idtoken: null,
    };

    var OktaAuth = require('@okta/okta-auth-js');
    var config = {
      url: 'https://dev-665917.okta.com',
    };

    this.authClient = new OktaAuth(config);
  }

  async logout() {
    // this.setState({progress : true});
    // let self = this;
    // console.log("Logout clicked")
    // this.props.navigation.getParam('auth').signOut()
    // .then(function () {
    //   self.setState({ progress: false });

    //     const { navigate } = self.props.navigation;
    //     navigate('Carousel', { transaction: transaction, users: users, owners: owners });
    // })
    // .fail(function (err) {
    //   Alert.alert("Der Logout war nicht erfolgreich!");
    //   console.error(err);
    //   self.setState({ progress: false });
    // });

    this.setState({ authenticated: false });
    this.setState({ progress: false });
    const { navigate } = this.props.navigation;
    navigate('LoginScreen');

  }

  //Listener für die Okta-Ereignisse
  async componentDidMount() {
    let self = this;
    EventEmitter.addListener('signInSuccess', function (e: Event) {
      self.getAccessToken();
    });
    EventEmitter.addListener('onError', function (e: Event) {
      console.warn(e);
      self.setState({ progress: false });
    });
    EventEmitter.addListener('onCancelled', function (e: Event) {
      console.warn(e);
      self.setState({ progress: false });
    });
    EventEmitter.addListener('signOutSuccess', function (e: Event) {
      console.log("SignoutSuccess")
      this.setState({ authenticated: false });
      this.setState({ progress: false });
      const { navigate } = this.props.navigation;
      navigate('LoginScreen');
    });
    await createConfig({
      clientId: configFile.oidc.clientId,
      redirectUri: configFile.oidc.redirectUri,
      endSessionRedirectUri: configFile.oidc.endSessionRedirectUri,
      discoveryUri: configFile.oidc.discoveryUri,
      scopes: configFile.oidc.scopes,
      requireHardwareBackedKeyStore:
        configFile.oidc.requireHardwareBackedKeyStore,
    });

    console.log("Props: ", this.props);
  }

  //Alle Listener müssen unmounted werden
  componentWillUnmount() {
    EventEmitter.removeAllListeners('signInSuccess');
    EventEmitter.removeAllListeners('onError');
    EventEmitter.removeAllListeners('onCancelled');
    EventEmitter.removeAllListeners('signOutSuccess');
  }

  /*Ab hier werden die Okta-Funktionen verwendet.
  Diese werden aus dem File '@okta/okta-react-native' importiert

  */
  async getAccessToken() {
    const promise = await getAccessToken();
    this.setState({ accessToken: promise.access_token });
    this.setState({ authenticated: true });
    this.setState({ progress: false });
    console.log(promise.access_token);
  }

  async getUserIdToken() {
    let user = await getUserFromIdToken();
    this.setState({ idtoken: JSON.stringify(user, null, 2) });
    console.log(JSON.stringify(user, null, 2));
  }

  async exchangeSessionToken({ sessionToken }) {
    this.setState({ progress: true });
    authenticate({ sessionToken });
  }


  async openLink() {
    const { navigation } = this.props;
    const transaction = navigation.getParam('transaction', 'NO-ID');
    this.exchangeSessionToken({
      sessionToken: transaction.sessionToken,
    });



    try {
      const url = 'https://dev-665917.okta.com/'
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: '#453AA4',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'partialCurl',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: false,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: true,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'blockartheader': 'Register for BlockArt Application'
          }
        })
        // Alert.alert(JSON.stringify(result))
      }
      else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
    }
  }


  render() {
    const { navigation } = this.props;
    const transaction = navigation.getParam('transaction', 'NO-ID');
    const userProfile = transaction.data._embedded.user.profile;
    const userId = transaction.data._embedded.user.id;
    /*  let accessTokenArea;
     let idtokenarea;
     if (this.state.authenticated) {
       accessTokenArea = (
         <View style={{ marginTop: 60, height: 140 }}>
           <Text>Access Token:</Text>
           <Text style={{ marginTop: 20 }}>{this.state.accessToken}</Text>
         </View>
       );
     } else {
       accessTokenArea = (
         <View style={{ marginTop: 60, height: 40 }}>
           <Button
             testID="getAccessTokenButton"
             onPress={async () => {
               this.exchangeSessionToken({
                 sessionToken: transaction.sessionToken,
               });
             }}
             title="Get Access Token"
           />
 
         </View>
       );
     }
 
     if (this.state.idtoken != null) {
       idtokenarea = (
         <View style={{ marginTop: 60, height: 140 }}>
           <Text>User-ID Token:</Text>
           <Text style={{ marginTop: 20 }}>{this.state.idtoken}</Text>
         </View>
       );
 
     } else {
       idtokenarea = (
         <View style={{ marginTop: 60, height: 40 }}>
           <Button
             onPress={async () => {
               this.getUserIdToken();
             }}
             title="Get User From Id Token"
           />
 
         </View>
       );
     } */
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <Spinner
            visible={this.state.progress}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
          <ImageBackground
            source={require('./components/background.jpg')}
            imageStyle={{ opacity: 0.5 }}
            style={{
              height: height,
              width: width,
              resizeMode: "cover",
              overflow: "hidden",
              flex: 1,
            }}>
            <Text style={styles.titleHello}>
              Hello {userProfile.firstName} {userProfile.lastName}
            </Text>
            <Text style={styles.titleDetails}>E-Mail: {userProfile.login}</Text>
            <Text style={styles.titleDetails}>User-ID: {userId}</Text>
            {/* <Text style={styles.titleDetails}>
              Session expires: {transaction.expiresAt}
            </Text> */}
            {/* <ScrollView> */}
            {/* {accessTokenArea}
              {idtokenarea} */}
            {/* </ScrollView> */}
            <View style={styles.buttonContainer}>
              <View style={styles.button}>
                <View style={{ marginTop: 60, height: 40 }}>
                  <Button
                    testID="logoutButton"
                    color="#004274"
                    onPress={async () => {
                      this.logout();
                    }}
                    title="Logout"

                  />
                </View>
                <View style={{ marginTop: 60, height: 40 }}>
                  <Button
                    style={{ marginTop: 20 }}
                    testID="accountButton"
                    color="#004274"
                    onPress={() => { this.openLink() }}
                    title="Manage my account"

                  />
                </View>
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
  button: {
    borderRadius: 40,
    width: 200,
    height: 40,
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  titleHello: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004274',
    paddingTop: 40,
    textAlign: 'center',
  },
  titleDetails: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    borderRadius: 40,
    width: 200,
    height: 40,
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 10,
  },
});

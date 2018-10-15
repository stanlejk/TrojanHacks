import React from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Button,
} from 'react-native';

import firebase from "firebase";
import axios from 'axios';
import { Expo, Camera, Permissions } from 'expo';
import { Icon } from 'react-native-elements';
import { CameraRoll } from 'react-native';

export default class CameraScreen extends React.Component {

    constructor(props) {
        super(props);
        var config = {
            apiKey: "AIzaSyBMORfGQ4sCZvcEfC75mTecn7Fmh7KTHTM",
            storageBucket: "trojanhacks-cdd28.appspot.com",
        };
        firebase.initializeApp(config);
        // Get a reference to the storage service, which is used to create references in your storage bucket
        var storage = firebase.storage();
        // Create a storage reference from our storage service
        var storageRef = storage.ref();


        this.state = {
            storageRef: storageRef,
            address: 'http://192.168.0.9/',
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            libraryPhotosURI: 'https://www.guidedogs.org/wp-content/uploads/2018/01/Mobile.jpg'
        };

        CameraRoll.getPhotos({
            first: 1,
            assetType: 'Photos',
        })
        .then(r => {
            console.log("r");

            const { manifest } = Expo.Constants;
            const api = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev
            ? manifest.debuggerHost.split(`:`).shift().concat(`:3000`)
            : `api.example.com`;

            this.setState({ address: api, libraryPhotosURI: r.edges[0].node.image.uri });
        })
        .catch((err) => {
            //Error Loading Images
        });
        console.log("c");
    }

    componentWillMount() {
        CameraRoll.getPhotos({
            first: 1,
            assetType: 'Photos',
        })
        .then(r => {
            console.log("r");
            this.setState({ libraryPhotosURI: r.edges[0].node.image.uri });
        })
        .catch((err) => {
            //Error Loading Images
        });
        console.log("wm");
    };

    render() {
        return (
            <View style={{ flex: 4 }}>
                <Camera ref={ref => { this.camera = ref; }} style={{ flex: 3 }} type={this.state.type}>
                </Camera>
                <View style={{ flex: 1 }}>
                    <Image
                        style={{
                            width: 100,
                            height: 100,
                        }}
                        source={{ uri: this.state.libraryPhotosURI }}
                    />
                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={ this.takePicture.bind(this )}>
                        <Text>CAPTURE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    fetchDataFromApi = ()  => {
        console.log("FETCHING");
        var url = this.state.address + 'transcribeData/transcribeData?imageURL=';
        console.log(url);

        console.log("GRABBED, still fetching");
        url += this.state.libraryPhotosURI;
        console.log(url);

        // axios.get(url)
        // .then(response=> {
        //     var blob = new Blob([response.data], {type: 'text;charset=utf-8', endings: 'native'});
        //     FileSaver.saveAs(blob, this.state.libraryPhotosURI + '.txt');




            console.log(this.state.libraryPhotosURI);
        // }).catch(err=> {
        //     console.log(err);
        // });

        this.setState({ loading: false });
    };

    takePicture = () => {
        this.snap();
        console.log("taking pic");
    }

    snap = async () => {
        if (this.camera) {
            let photo = await this.camera.takePictureAsync();
            CameraRoll.saveToCameraRoll(photo.uri)
            .then((uri) => {
                var ref = this.state.storageRef;
                photo = uri;

                // Convert to base64
                var request = new
                XMLHttpRequest();   request.onload = function() {
                    var file = new FileReader();
                    file.onloadend = function() {
                        callback(file.result);
                    }
                    file.readAsDataURL(request.response);
                };
                request.open('GET', photo);
                request.responseType = 'blob';
                request.send();

                // Upload to storage
                ref.child('images/' + photo).put(`data:image/jpg;base64,${request.response}`).then(function(snapshot) {
                    console.log('Uploaded a blob or file!');
                })
                .catch(err => console.log('err', err));

                storageRef.child('images/' + photo).getDownloadURL().then(function(url) {
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = function(event) {
                        var blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();

                    this.setState({ libraryPhotosURI: uri });
                    this.fetchDataFromApi();
                })
                .catch(err => {
                    console.log(err)
                });
            });
        }
    }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});

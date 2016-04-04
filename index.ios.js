/**
 * nagTriagr, free and open source forever
 * https://github.com/mirokuratczyk/nagTriagr
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import React, {
  AppRegistry,
  NavigatorIOS,
  ActivityIndicatorIOS,
  Component,
  TouchableHighlight,
  Image,
  ListView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

var UsernameBar = require('UsernameBar');
var PasswordBar = require('PasswordBar');
var ServernameBar = require('ServernameBar');
var t = require('tcomb-form-native');
var base64 = require('base-64');

var HTTP_HEALTH_URL = '/nagios/cgi-bin/statusjson.cgi?query=servicelist&details=true&dateformat=%25T'
var Form = t.form.Form;

var Servername = t.refinement(t.String, function (n) {
  /* stub for check later */
  return true;
});

var LoginInfo = t.struct({
  server: Servername,
  username: t.String,
  password: t.String,
  /*rememberMe: t.Boolean // to implement */
});

var options = {
  fields: {
    server: {
      autoCorrect: false,
      autoCapitalize: "none",
      placeholder: "example.com",
      label: "Server",
      error: "Expecting format https://x.y or http://x.y or example.com"
    },
    username: {
      autoCorrect: false,
      autoCapitalize: "none",
      placeholder: "username",
      label: "Username"
    },
    password: {
      password: true,
      secureTextEntry: true,
      placeholder: 'password',
      label: 'Password',
    },
  }
};

class nagTriagr extends Component {
  constructor(props) {
      super(props);
      this.renderStatusPage = this.renderStatusPage.bind(this);
      this.fetchNagiosData = this.fetchNagiosData.bind(this);
      this.returnToAuthScreen = this.returnToAuthScreen.bind(this);
      this.login = this.login.bind(this);

      this.state = {
        nagiosListData: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged : (s1, s2) => s1 !== s2}),
        nagiosData: {},
        loaded: false,
        isLoading: true,
        username: "",
        password: "",
        serverUrl: "",
        authSubmitted: false,
        statusLoaded: false,
      };
  }

  componentDidMount() {
    this.setState({loaded:true, isLoading:false});
  }

  onPress() {
    // call getValue() to get the values of the form
    var value = this.refs.form.getValue();
    if (value) { // if validation fails, value will be null
      console.log(value); // value here is an instance of Person
      this.setState({
        username: value.username,
        password: value.password,
        serverUrl: value.server,
      });
      this.login();
    }
  }

  onChange(value) {
    /*stub*/
  }

  onInputChange(event) {
    /*stub*/
  }

  render() {
    if(!this.state.loaded) { // check if authed
      return this.renderLoadingView();
    }

    if (!this.state.authSubmitted) {
      return this.renderAuthScreen();
    } else if (this.state.authSubmitted && this.state.statusLoaded) {
      return this.renderStatusPage(this.state.nagiosData.localhost);
    } else if (this.state.authSubmitted && this.state.statusLoaded==false) {
      return this.renderLoadingView();
    }
  }

  login() {
    console.log("Attemping login with " + this.state.username + this.state.password + this.state.serverUrl);
    if (this.state.username && this.state.password && this.state.serverUrl) {
      this.setState({authSubmitted: true});
      this.fetchNagiosData();
      console.log("Username,password and servername submitted, ready to fetch data from server");
    }
  }

  /* invalidate auth. information */
  returnToAuthScreen() {
    this.setState({
        username:"",
        password:"",
        serverUrl:"",
        statusLoaded:false,
        authSubmitted: false,
    });
  }

  renderLoadingView() {
    return (
      <View style={styles.loadingContainer}>
        <Text>
          Loading...
        </Text>
      </View>
    );
  }

  renderAuthScreen() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>nagTriagr</Text>
        </View>
        <View style={styles.container}>
          {/* display */}
          <Form
            ref="form"
            type={LoginInfo}
            options={options}
            value={this.props.value}
            onChange={this.props.onChange}
          />
          <TouchableHighlight style={styles.button} onPress={this.onPress.bind(this)} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  renderStatusPage(host) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarButton} onPress={this.fetchNagiosData}>refresh</Text>
          <Text style={styles.toolbarTitle}>nagiosTriagr</Text>
          <Text style={styles.toolbarButton} onPress={this.returnToAuthScreen}>new</Text>
        </View>
        <View style={styles.content}>
          <ListView
            dataSource={this.state.nagiosListData}
            renderSectionHeader={this.renderHostName}
            renderRow={this.renderHost}
            style={styles.listView}
          />
        <Text>
          Last snapshot at {this.state.nagiosData.result.query_time}
        </Text>
        </View>
      </View>
    );
  }

  renderHostName(host,hostname) {
    return (
      <Text>{hostname}</Text>
    );
  }

  renderHost(host) {
    return (
      <View style={styles.rightContainer}>
        <Text style={styles.pluginOutput}>{host.plugin_output}</Text>
      </View>
    );
  }

  fetchNagiosData() {
    console.log("Fetching data");
    /* probably should sanitize input here */
    var url = "";
    if (this.state.serverUrl.match("http://") || this.state.serverUrl.match("https://")) {
      url = this.state.serverUrl + HTTP_HEALTH_URL;
    } else {
      url = "https://" + this.state.serverUrl + HTTP_HEALTH_URL;
    }

    console.log("Attempting connection with " + url);
    fetch(url, {
      method:'GET',
      headers: {
        'Authorization':'Basic '+base64.encode(this.state.username+":"+this.state.password),
      },
    })
      .then((response) => response.json()) //.text
      .then((responseData)=> {
        console.log(responseData.data.servicelist);
        this.setState({
            nagiosListData: this.state.nagiosListData.cloneWithRowsAndSections(responseData.data.servicelist),
            nagiosData: responseData,
            statusLoaded:true,
        });
      }) //.done
      .catch((error) => {
        console.warn("Could not connect to server, please try again");
        this.setState({
          statusLoaded: false,
          authSubmitted: false,
        })
      });
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#F5FCFF',
    flex: 1,
  },
  content:{
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  pluginOutput: {
    fontSize: 8,
    marginBottom: 8,
    textAlign: 'left',
    paddingLeft: 8,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  toolbar:{
    backgroundColor:'#81c04d',
    paddingTop:30,
    paddingBottom:10,
    flexDirection:'row'
  },
  toolbarButton:{
    width: 50,
    color:'#fff',
    textAlign:'center'
  },
  toolbarTitle:{
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
    flex:1
  },
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  }
});

AppRegistry.registerComponent('nagTriagr', () => nagTriagr);

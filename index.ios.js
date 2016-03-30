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
var base64 = require('base-64');
var HTTP_HEALTH_URL = '/nagios/cgi-bin/statusjson.cgi?query=servicelist&details=true&dateformat=%25T'

class nagTriagr extends Component {
  constructor(props) {
      super(props);
      this.onUsernameSubmitted = this.onUsernameSubmitted.bind(this);
      this.onPasswordSubmitted = this.onPasswordSubmitted.bind(this);
      this.onServernameSubmitted = this.onServernameSubmitted.bind(this);
      this.renderAuthPage = this.renderAuthPage.bind(this);
      this.renderStatusPage = this.renderStatusPage.bind(this);
      this.fetchNagiosData = this.fetchNagiosData.bind(this);
      this.returnToAuthScreen = this.returnToAuthScreen.bind(this);
      this.login = this.login.bind(this);

      this.state = {
        nagiosListData: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
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

  render() {
    if(!this.state.loaded) { // check if authed
      return this.renderLoadingView();
    }

    if (!this.state.authSubmitted) {
      return this.renderAuthPage();
    } else if (this.state.authSubmitted && this.state.statusLoaded) {
      return this.renderStatusPage(this.state.nagiosData.localhost);
    } else if (this.state.authSubmitted && this.state.statusLoaded==false) {
      return this.renderLoadingView();
    }
  }

  login() {
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
        statusLoaded:false,
        authSubmitted: false,
    });
  }

  renderAuthPage() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>nagiosTriagr</Text>
        </View>
        <View style={styles.content}>
        <ServernameBar
          onInputChange={this.onInputChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
          onServernameSubmitted={this.onServernameSubmitted}
        />
        <UsernameBar
          onInputChange={this.onInputChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
          onUsernameSubmitted={this.onUsernameSubmitted} /* need to handle no return pressed */
        />
        <PasswordBar
          onInputChange={this.onInputChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
          onPasswordSubmitted={this.onPasswordSubmitted}
        />
        </View>
      </View>
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>
          Loading...
        </Text>
      </View>
    );
  }

  renderStatusPage(host) {
    console.log(this.state.nagiosData.result);
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

  renderHost(host) {
    //console.log(host);
    return (
     <View style={styles.container}>
       <Text>
         {host.HTTP.host_name}
       </Text>
       <View style={styles.rightContainer}>
         <Text style={styles.pluginOutput}>{host["Current Load"].plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host["Current Users"].plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host["Root Partition"].plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host.HTTP.plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host.PING.plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host.SSH.plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host["Swap Usage"].plugin_output}</Text>
         <Text style={styles.pluginOutput}>{host["Total Processes"].plugin_output}</Text>
       </View>
     </View>
   );
  }

  onInputChange(event) {
    /*stub*/
  }

  onServernameSubmitted(event) {
    var srvr = event.nativeEvent.text;
    console.log("Servername submitted: " + srvr);
    this.setState({serverUrl: srvr});
  }

  onUsernameSubmitted(event) {
    var usr = event.nativeEvent.text;
    console.log("Username submitted: " + usr);
    this.setState({username: usr});
  }

  onPasswordSubmitted(event) {
    var pwd = event.nativeEvent.text;
    console.log("Password submitted: " + pwd);
    this.setState({password: pwd});
    this.login();
  }

  fetchNagiosData() {
    /* probably should sanitize input here */
    var url = "https://" + this.state.serverUrl + HTTP_HEALTH_URL;
    console.log("Attempting connection with " + url);
    fetch(url, {
      method:'GET',
      headers: {
        'Authorization':'Basic '+base64.encode(this.state.username+":"+this.state.password),
      },
    })
      .then((response) => response.json()) //.text
      .then((responseData)=> {
        //console.log(responseData.data.service);
        this.setState({
            nagiosListData: this.state.nagiosListData.cloneWithRows(responseData.data.servicelist),
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
  container: {
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
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
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
  }
});

AppRegistry.registerComponent('nagTriagr', () => nagTriagr);

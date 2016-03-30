/**
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @providesModule ServernameBar
 * @flow
 */
'use strict';

var React = require('react-native');
var {
  ActivityIndicatorIOS,
  TextInput,
  StyleSheet,
  View,
} = React;

var ServernameBar = React.createClass({
  render: function() {
    return (
      <View style={styles.servernameBar}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChange={this.props.onInputChange}
          placeholder="example.com"
          onFocus={this.props.onFocus}
          onEndEditing={this.props.onServernameSubmitted}
          selectTextOnFocus={true}
          style={styles.servernameBarInput}
          onSubmitEditing={this.props.onServernameSubmitted}
          returnKeyType="next"
        />
        <ActivityIndicatorIOS
          animating={this.props.isLoading}
          style={styles.spinner}
        />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  servernameBar: {
    marginTop: 64,
    padding: 3,
    paddingLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  servernameBarInput: {
    fontSize: 15,
    flex: 1,
    height: 30,
    width: 150,
    backgroundColor: '#fffeee',
  },
  spinner: {
    width: 30,
  },
});

module.exports = ServernameBar;

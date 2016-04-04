# nagTriagr
----------
![License](https://img.shields.io/badge/License-MIT-yellowgreen.svg)
----------
iOS app for checking server health through nagios4

### Building and running


```
$ git clone https://github.com/mirokuratczyk/nagTriagr.git
$ cd ./nagTriagr
$ npm install
$ react-native upgrade
$ npm install tcomb-form-native
$ npm install base-64
$ npm-start --reset-cache
```

Now you can open the Xcode project in ./ios.

To run on the simulator make sure the following line is uncommented in `AppDelegate.m`
```
jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"];
```

To install and run on your device, make sure the following line is uncommented in `AppDelegate.m`
```
jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
```


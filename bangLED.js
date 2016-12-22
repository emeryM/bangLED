if (Meteor.isClient) {

  FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "display"});
    Meteor.call("twitteroff");
  }
  });
  FlowRouter.route('/display', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "display"});
    Meteor.call("twitteroff");
  }
  });
  FlowRouter.route('/twitter', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "twitter"});
    Meteor.call("setAllRed");
    Meteor.call("twitteron");
  }
  });
  FlowRouter.route('/off', {
  action: function() {
    BlazeLayout.render("mainLayout", {content: "off"});
    Meteor.call("setAllOff");
    Meteor.call("twitteroff");
  }
  });

  Template.multi.events({
    'click button': function () {
      Meteor.call(
        "setAllColor",
        Template.currentData().number,
        $("#colorpicker").spectrum("get"));
    }
  });

  Template.led.events({
    'click button': function () {
      Meteor.call(
        "setSingleColor",
        Template.currentData().number,
        $("#colorpicker").spectrum("get"));
    }
  });

  Template.led.events({
    'submit .single'(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      const target = event.target;
      const text = target.text.value;

      // Insert a task into the collection
      Meteor.call(
        "setSingleColor",
        text,
        $("#colorpicker").spectrum("get"));

      // Clear form
      target.text.value = '';
    },
  });

  Template.animation.events({
    'click button': function () {
      Meteor.call(
        "setAnimation",
        Template.currentData().number,
        $("#colorpicker").spectrum("get")
      )
    }
  });

  Template.colorpicker.rendered = function(){
    $("#colorpicker").spectrum({
    color: "#000",
    showInput: true,
    className: "full-spectrum",
    showInitial: true,
    showPalette: true,
    showSelectionPalette: true,
    maxSelectionSize: 10,
    preferredFormat: "hex",
    move: function (color) {

    },
    show: function () {

    },
    beforeShow: function () {

    },
    hide: function () {

    },
    change: function(color) {
      Meteor.call("logColor", color);
      Session.set('selectedColor', color);
    },
    palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
        "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
        "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
        "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
        "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
        "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
        "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
        "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
        "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
        "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
        "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
        "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ]
  });
  }
}

if (Meteor.isServer) {

  console.log('hi');
  var Twit = Meteor.npmRequire('twit');
  var T = new Twit({
    consumer_key:         Meteor.settings.consumer_key,
    consumer_secret:      Meteor.settings.consumer_secret,
    access_token:         Meteor.settings.access_token,
    access_token_secret:  Meteor.settings.access_token_secret
  });
  var stream = T.stream('statuses/filter', { follow: '20738245', language: 'en' })
  stream.on('tweet', function (tweet) {
    console.log('omg');
    if (twittermode == 1){
      console.log('omg twitter mode');
      if(tweet.user.id == '20738245'){
        console.log('omg morgan');
        Meteor.call("twitteron");
      }
    }
  });

  var twittermode = 0;

  var port = Meteor.settings.port;

  var serialPort = new SerialPort.SerialPort(port, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\r\n')
  });

  serialPort.on('open', function(error) {
    console.log('opened port ' + port);
    serialPort.on('data', function(data) {
        console.log('data received: ' + data);
    });
  });

  Meteor.methods({
      setSingleColor: function (pos, color){
        var buf = new Buffer(5);
        buf[0]= 0x00;
        buf[1]= pos;
        buf[2]= color._r;
        buf[3]= color._g;
        buf[4]= color._b;
        serialPort.write(buf, function(err, results) {
            if (err) {
                console.log('err ' + err);
            }
            console.log('wrote ' + results + ' bytes');
        });
      },
      setAnimation: function (selection, color){
        var buf = new Buffer(5);
        buf[0]= 0x01;
        buf[1]= selection;
        buf[2]= color._r;
        buf[3]= color._g;
        buf[4]= color._b;
        serialPort.write(buf, function(err, results) {
            if (err) {
                console.log('err ' + err);
            }
            console.log('wrote ' + results + ' bytes');
        });
      },
      setAllColor: function (pos, color){
        var buf = new Buffer(5);
        buf[0]= 0x02;
        buf[1]= pos;
        buf[2]= color._r;
        buf[3]= color._g;
        buf[4]= color._b;
        serialPort.write(buf, function(err, results) {
            if (err) {
                console.log('err ' + err);
            }
            console.log('wrote ' + results + ' bytes');
        });
      },
      setAllRed: function (){
        var buf = new Buffer(5);
        buf[0]= 0x02;
        buf[1]= 0x00;
        buf[2]= 0xFF;
        buf[3]= 0x00;
        buf[4]= 0x00;
        serialPort.write(buf, function(err, results) {
            if (err) {
                console.log('err ' + err);
            }
            console.log('wrote ' + results + ' bytes');
        });
      },
      setAllOff: function (){
        var buf = new Buffer(5);
        buf[0]= 0x02;
        buf[1]= 0x00;
        buf[2]= 0x00;
        buf[3]= 0x00;
        buf[4]= 0x00;
        serialPort.write(buf, function(err, results) {
            if (err) {
                console.log('err ' + err);
            }
            console.log('wrote ' + results + ' bytes');
        });
      },
      twitteron: function (){
        console.log('twitter mode on');
        twittermode = 1;
      },
      twitteroff: function (){
        console.log('twitter mode off');
        twittermode = 0;
      },
      blink: function (pos){
        console.log('pos: ' + pos);
        serialPort.write(new Buffer([pos], 'ascii'), function(err, results) {
            if (err) {
                console.log('err ' + err);
            }
            console.log('wrote ' + results + ' bytes');
        });
      },
      logColor: function (color){
        console.log(color._r);
        console.log(color._g);
        console.log(color._b);
      }
    });


    Meteor.startup(() => {

    });


}

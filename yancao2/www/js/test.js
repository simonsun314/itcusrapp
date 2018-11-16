var hellosimon = 0;

var initNfcCount = 0;

//send request to server

var tag; //the nfc tag

/*
  afterText:  '<div class="swiper-container" style="width: auto; margin:5px -15px -15px">'+
                  '<div class="swiper-pagination"></div>'+
                  '<div class="swiper-wrapper">'+
                    '<div class="swiper-slide"><img src="img/maotai.jpg" height="150" style="display:block"></div>' +
                  '</div>'+
                '</div>',
                */

var showhint = function (intxt) {
  var modal = myApp.modal({
    title: '<font color=green style="font-weight:bold">3J防伪友情提醒：</font>',
    text: '<font color=black size=4>' + intxt + '</font>',
    afterText: '<div class="swiper-container" style="width: auto; margin:5px -15px -15px">' +
      '<div class="swiper-slide"><img src="img/icon.png" height="150" style="display:block"></div>' +
      '</div>',
    buttons: [
      {
        text: 'Ok',
        bold: true,
        onClick: function () {
          //myApp.alert('Thanks! I know you like it!')
        }
      },
    ]
  });
}


/*
var tagThinfilmReq = function (){
    //myApp.alert("in thin film http request function");
   // myApp.alert(tag.id);  
   // myApp.alert(toHexString(tag.id));  

   //need use toHexString(tag.id) bytes array to calculate the hash value to server
   uidInHex = toHexString(tag.id);
   // myApp.alert("this one");
   //  myApp.alert(uidInHex);
    //myApp.alert(bigInt);
   // myApp.alert(sha256_digest);
   // myApp.alert(sha256_digest(uidInHex));
   tmpurl = sha256_digest(uidInHex);
    //start a request to thinfilm server with RESTFUL structure
   // myApp.alert(tmpurl);
    //get POS and local time
    getPos();
    getTime();

     thinreqXmlhttp();



    //send request to myServer
   
}
*/

function toHexString(byteArray) {
  return byteArray.map(function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}


var tag_lon = 0;
var tag_lat = 0;

var countnfcreg = 0;
//get position function
var onGeoSuccess = function (position) {
  tag_lat = position.coords.latitude;
  tag_lon = position.coords.longitude;
  /*
      myApp.alert('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
            */
  //getPos();
  registerNFC();
}

/*check location permission successful ok just */
var locChk2successCallback = function (authorized) {

  // logMyFunc("Location is " + (authorized ? "authorized" : "unauthorized"));
  if (authorized) {
    logMyFunc("Location is " + (authorized ? "authorized" : "unauthorized") + "but get value fail");
    tag_lon = 0;
    tag_lat = 0;
    registerNFC();
  } else {
    //getPos();
    logMyFunc("用户拒绝授权位置信息授权");
    //myApp.alert("请手动打开位置权限");
    showhint("请手动打开位置权限");
    exitMyApp();
  }
}

/*check permission setting result of location*/
var checkLocationOpen = function () {
  cordova.plugins.diagnostic.isLocationAuthorized(locChk2successCallback, locChkerrorCallback);
}

/*Geo not open and choose jump to setting interface to set permission*/
var posOpenCBOK = function () {
  if (window.cordova && window.cordova.plugins.settings) {
    logMyFunc('openSettingsTest is active');
    window.cordova.plugins.settings.open("application_details",
      function () {
        logMyFunc('opened geo settings');
        //set back here
        //getPos();
        setTimeout(function () {
          checkLocationOpen();
        }, 10000);

      },
      function () {
        logMyFunc('failed to open geo settings');
        //myApp.alert("程序打开设置页面出错，请手动打开位置权限");
        showhint("程序打开设置页面出错，请手动打开位置权限");
        //getPos();
        exitMyApp();
      });
  } else {
    logMyFunc('openSettingsTest is not active!');
    //myApp.alert("程序打开设置页面出错2，请手动打开位置权限");
    showhint("程序打开设置页面出错2，请手动打开位置权限");
    exitMyApp();
  }

}

/*Geo not open and choose refuse to setting interface to set permission*/
var posOpenCBCancel = function () {
  //getPos();
  logMyFunc("用户拒绝授权位置信息授权");
  //myApp.alert("请手动打开位置权限");
  showhint("请手动打开位置权限");
  exitMyApp();

}

/*check location permission successful ok just */
var locChksuccessCallback = function (authorized) {

  // logMyFunc("Location is " + (authorized ? "authorized" : "unauthorized"));
  if (authorized) {
    logMyFunc("Location is " + (authorized ? "authorized" : "unauthorized") + "but get value fail");
    tag_lon = 0;
    tag_lat = 0;
    registerNFC();
  } else {
    //jump to permission setting page and wait for return
    myApp.confirm("<font color=black size=4>请授予位置权限，对于帮助查询信息非常重要</font>", posOpenCBOK, posOpenCBCancel);
  }
}

/*check location permission fail just register NFC set address 0 0*/
var locChkerrorCallback = function () {
  logMyFunc("cehck location authority meet the following error: " + error);

  logMyFunc('failed to check Geo settings');
  //myApp.alert("程序检查权限出错");
  showhint("程序检查权限出错");
  //getPos();
  exitMyApp();


}

/*loop check permission of location*/
var posintervalID = 0;
var checktimeofpos = 0;
var checkGeoPermission = function () {
  //check permission
  cordova.plugins.diagnostic.isLocationAuthorized(locChksuccessCallback, locChkerrorCallback);


}

// onError Callback receives a PositionError object 
// 
function onGeoError(error) {

  /*2 case
  1: no authority
  2: get pos error
  to 1 check for 10 seconds and 
  then it be 2 we just use 0,0
  */
  //delay and check permission loop for 10 seconds
  /*
    switch(error.code){
    case error.TIMEOUT :
        alert( " 连接超时，请重试 " );
        break;
    case error.PERMISSION_DENIED :
        alert( " 您拒绝了使用位置共享服务，查询已取消 " );
        break;
    case error.POSITION_UNAVAILABLE : 
        alert( " 亲爱的火星网友，非常抱歉，我们暂时无法为您所在的星球提供位置服务 " );
        break;
}*/
  logMyFunc('位置获取错误: ' + error.code + '\n' + '消息: ' + error.message + '\n');
  checktimeofpos = 0;
  //posintervalID =  setInterval(checkGeoPermission,2000);
  checkGeoPermission();
  //now data error,just use 0,0



}

/*start get pos and first time will check the permission request and check*/
function getPos() {

  /*  $$(document).addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        myApp.alert("navigator.geolocation works well");
    }
    */
  // myApp.alert(navigator.geolocation);

  navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, { maximumAge: 1000, timeout: 4000, enableHighAccuracy: true });
}



var onGeo2Success = function (position) {
  tag_lat = position.coords.latitude;
  tag_lon = position.coords.longitude;
  /*
      myApp.alert('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
            */
  //getPos();
  thinreqXmlhttp();

}

function onGeo2Error(error) {


  tag_lon = 0;
  tag_lat = 0;
  /*
        switch(error.code){
          case error.TIMEOUT :
              alert( " 连接超时，请重试 " );
              break;
          case error.PERMISSION_DENIED :
              alert( " 您拒绝了使用位置共享服务，查询已取消 " );
              break;
          case error.POSITION_UNAVAILABLE : 
              alert( " 亲爱的火星网友，非常抱歉，我们暂时无法为您所在的星球提供位置服务 " );
              break;
      }*/
  logMyFunc('2位置获取错误: ' + error.code + '\n' + '消息2: ' + error.message + '\n');
  thinreqXmlhttp();

}
/*start get pos and first time will check the permission request and check if will go on http request*/
function getPos2() {

  /*  $$(document).addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        myApp.alert("navigator.geolocation works well");
    }
    */
  // myApp.alert(navigator.geolocation);
  myApp.showPreloader();
  navigator.geolocation.getCurrentPosition(onGeo2Success, onGeo2Error, { maximumAge: 1000, timeout: 4000, enableHighAccuracy: true });
}



var tag_date;

function getTime() {
  var currentdate = new Date();
  var datetime = "Last Sync: " + currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
  //myApp.alert(datetime);
  tag_date = currentdate.getFullYear() + "-" + ((currentdate.getMonth() + 1) < 10 ? "0" + (currentdate.getMonth() + 1) : (currentdate.getMonth() + 1)) + "-" + (currentdate.getDate() > 9 ? currentdate.getDate() : "0" + currentdate.getDate()) + " " + currentdate.getHours() + ":"
    + ((currentdate.getMinutes() > 9) ? currentdate.getMinutes() : ("0" + currentdate.getMinutes())) + ":"
    + ((currentdate.getSeconds() > 9) ? currentdate.getSeconds() : ("0" + currentdate.getSeconds()));
  //  myApp.alert(tag_date);
}

var testobj = {
  Result: '',
  Tag: '',
  Count: 0,
  Date: "",
  Addr: "",
  Vendor: '',
  VD: '',
  Product: '',
  PD: '',
  BatchNum: '',
  SN: '',
  ManufDate: '',
  Origin: '',
  ManufAddr: '',
  ShelfLife: '',
  VendorIcon: "",
  Icon: ""
};

var tag_raw;

var pageloadcont = 0;

var myservtime1;
var myservtime2;

var reqTagMyServer = function () {
  var xmlhttp;
  var urlMyServer = "http://106.14.1.85:8080/v1/product/antifake";
  //tag_lon = 0;
  //tag_lat = 0;
  //myApp.alert(thinresult.is_manipulated.toString());
  var tag_result = thinresult.is_manipulated == false ? "Real" : "Fake";
  //myApp.alert(tag_result);
  var tag_status = thinresult.status;
  //myApp.alert(tag_status);
  tag_raw = 'b7' + uidInHex.substring(4, 28);
  //myApp.alert(tag_raw);
  //myApp.alert(tag_lat);
  //myApp.alert(tag_lon);
  //myApp.alert(tag_date);

  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.timeout = 5000;

    xmlhttp.onreadystatechange = function () {
      //myApp.alert(this.readyState);
      //var DONE = this.DONE || 4;
      if (this.readyState == 4) {
        //myApp.alert(this.readyState);

        //myApp.alert(this.response);
        // myApp.alert(this.status);
        if (this.status == 200) {
          var tempdate1 = new Date();
          myservtime2 = tempdate1.getSeconds().toString() + "." + tempdate1.getMilliseconds().toString();
          logMyFunc("request thin server:" + thintime1 + " " + thintime2);
          logMyFunc("request tag my server:" + myservtime1 + " " + myservtime2);
          // myApp.alert(thintime1+"\n"+thintime2);
          // myApp.alert(myservtime1+" "+myservtime2);
          var result2 = this.response;
          if (xmlhttp.getResponseHeader("Content-Type").toString().search('json') != -1) {

            //myApp.alert(result2);
            var obj = JSON.parse(result2);
            // testobj = obj;
            testobj.Result = obj.Result == "real" ? "真品" : "假酒";
            testobj.Tag = obj.Tag == "sealed" ? "密封" : "开封";
            testobj.Count = obj.Count;
            testobj.Date = obj.Date;
            testobj.Addr = obj.Addr;
            testobj.Vendor = obj.ProductInfo.Vendor;
            testobj.VD = obj.ProductInfo.VD;
            testobj.Product = obj.ProductInfo.Product;
            testobj.PD = obj.ProductInfo.PD;
            testobj.BatchNum = obj.ProductInfo.BatchNum;
            testobj.SN = obj.ProductInfo.SN;
            testobj.ManufDate = obj.ManufInfo.ManufDate;
            testobj.Origin = obj.ManufInfo.Origin;
            testobj.ManufAddr = obj.ManufInfo.Addr;
            testobj.ShelfLife = obj.ManufInfo.ShelfLife;
            // testobj.VendorIcon = obj.ProductInfo.VendorIcon;
            // testobj.Icon = obj.ProductInfo.Icon;
            testobj.VendorIcon = "http://106.14.1.85:8591/static/img/jt-vendor.jpg";
            testobj.Icon = "http://106.14.1.85:8591/static/img/jt-product-1.jpg";
            //myApp.alert(testobj.VendorIcon);
            //myApp.alert(testobj.Icon);
            if (testobj.Result == "假酒") {
              testobj.Tag = "未知"
              testobj.Date = tag_date;
              testobj.Vendor = "3J防伪";
              testobj.VD = "3J防伪提醒您依法维权，杜绝假酒<br /><br /><br /><br />";
              testobj.Product = "";
              testobj.PD = "";
              testobj.BatchNum = "";
              testobj.SN = "";
              testobj.ManufDate = "";
              testobj.Origin = "";
              testobj.ManufAddr = "";
              testobj.ShelfLife = "";
              testobj.VendorIcon = "img/icon.png";
              testobj.Icon = 'img/jiajiu.jpeg';
            }
            //myApp.alert("status: "+obj.status);
            //  myApp.alert("addr: "+obj.Addr);
            // myApp.alert("vendor: "+obj.ProductInfo.Vendor);
            //myApp.alert(this.response);
            //if(pageloadcont==0) result();
            //else resultagain();
            // pageloadcont++;
            result();
            regNFCinMid();
          } else {
            myApp.hidePreloader();
            regNFCinMid();
            //myApp.alert("网络出错,请确保网络打开");
            showhint("网络出错,请确保网络打开");
            logMyFunc("my tag server 网络错误代码2:" + this.status);
            setTimeout(function () {
              myApp.closeModal();
              mainView.router.load({
                url: 'home.html'
              });
            }, 2000);
          }
        } else {
          myApp.hidePreloader();
          regNFCinMid();
          //myApp.alert("网络出错,请确保网络打开");
          showhint("网络出错,请确保网络打开");
          logMyFunc("my tag server 网络错误代码:" + this.status);
          setTimeout(function () {
            myApp.closeModal();
            mainView.router.load({
              url: 'home.html'
            });
          }, 2000);
        }
      }
    };

    xmlhttp.ontimeout = function (e) {
      myApp.hidePreloader();
      regNFCinMid();
      //myApp.alert("访问超时,请确保网络打开");
      showhint("访问超时,请确保网络打开");
      logMyFunc("访问超时2" + e + "请确保网络打开");
      setTimeout(function () {
        myApp.closeModal();
        mainView.router.load({
          url: 'home.html'
        });
      }, 2000);
    };
    xmlhttp.onerror = function (e) {
      myApp.hidePreloader();
      regNFCinMid();
      // myApp.alert("访问错误2"+e+"请确保网络打开");
      logMyFunc("访问错误2" + e + "请确保网络打开");
      /* setTimeout(function () {
         myApp.closeModal();
       }, 2000);*/
    };

    xmlhttp.open('POST', urlMyServer, true);
    //  xmlhttp.open('POST', 'https://api.thinfilm.no/v1/tags/fd92a2d5e6c45635b53a250e2dc60adcafc85003a3a95092724b278d643dacb0', true);
    //   xmlhttp.setRequestHeader("Authorization-Token", ""); 
    //  xmlhttp.setRequestHeader("Api-Key", ""); 
    //  xmlhttp.setRequestHeader("User-Agent","no.thinfilm.sample.authpublic/1.0.5-6(golden)ThinfilmSdk/14");
    //  xmlhttp.setRequestHeader("X-Requested-With", "no.thinfilm.sdk:v14"); 
    xmlhttp.setRequestHeader("Content-Type", "application/json");

    //xmlhttp.setRequestHeader("'"Access-Control-Allow-Headers',"");
    //xmlhttp.send("{\n\"tap_properties:\"\n{\n}\n}");

    var tempdate = new Date();
    myservtime1 = tempdate.getSeconds().toString() + "." + tempdate.getMilliseconds().toString();
    xmlhttp.send(JSON.stringify({
      Result: tag_result,
      Tag: tag_status,
      Raw: tag_raw,
      Gps:
        {
          Longitude: tag_lon,
          Latitude: tag_lat
        },
      DT: tag_date
    }));

  }
}



var result1;
var thinresult;

var thintime1;
var thintime2;
/*request thinfilm data*/
function thinreqXmlhttp() {
  var xmlhttp;
  //myApp.hidePreloader();
  //myApp.alert("here");
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
    // myApp.showPreloader();
    // myApp.alert("here");
    xmlhttp.onreadystatechange = function () {
      // myApp.alert(this.readyState);
      //var DONE = this.DONE || 4;
      if (this.readyState == 4) {
        //myApp.alert(this.readyState);

        //myApp.alert(this.response);
        // myApp.alert(this.status);
        if (this.status == 200) {
          var tempdate1 = new Date();
          thintime2 = tempdate1.getSeconds().toString() + "." + tempdate1.getMilliseconds().toString();
          result1 = this.response;
          //alert(xmlhttp.getResponseHeader("Content-Type").toString().search('json'));
          if (xmlhttp.getResponseHeader("Content-Type").toString().search('json') != -1) {
            //myApp.alert(result1);
            //var obj = JSON.parse(result1);




            // myApp.alert("status: "+obj.status);
            // myApp.alert("is manipulated: "+obj.is_manipulated);
            //myApp.alert(this.response);
            thinresult = JSON.parse(result1);
            //myApp.alert("status: "+thinresult.status);
            //showhint("status: "+thinresult.status);
            //myApp.alert("result1: "+result1);
            reqTagMyServer();
          } else {
            myApp.hidePreloader();
            regNFCinMid();

            showhint("网络出错，请确保网络打开");
            logMyFunc("thin server 网络错误0:" + this.status);
            setTimeout(function () {
              myApp.closeModal();
              mainView.router.load({
                url: 'home.html'
              });
            }, 2000);
          }
        } else {
          //myApp.alert("网络出错，请确保网络打开");
          myApp.hidePreloader();
          regNFCinMid();

          showhint("网络出错，请确保网络打开");
          logMyFunc("thin server 网络错误1:" + this.status);
          setTimeout(function () {
            myApp.closeModal();
            mainView.router.load({
              url: 'home.html'
            });
          }, 2000);
        }
      }
    };

    xmlhttp.ontimeout = function (e) {
      myApp.hidePreloader();
      regNFCinMid();
      //myApp.alert("访问超时，请确保网络打开");
      showhint("访问超时，请确保网络打开");
      logMyFunc("访问超时1" + e + "请确保网络打开");
      setTimeout(function () {
        myApp.closeModal();
        mainView.router.load({
          url: 'home.html'
        });
      }, 2000);
    };
    xmlhttp.onerror = function (e) {
      myApp.hidePreloader();
      regNFCinMid();
      //myApp.alert("访问错误1"+e+"请确保网络打开");
      logMyFunc("访问错误1" + e + "请确保网络打开");
      /* setTimeout(function () {
        myApp.closeModal();
      }, 2000);*/
    };

    //  xmlhttp.open('POST', 'https://api.thinfilm.no/v1/tags/'+tmpurl, true);
    //https://cnect.thinfilmelectronics.cn/v1/tags/fd92a2d5e6c45635b53a250e2dc60adcafc85003a3a95092724b278d643dacb0
    //xmlhttp.open('POST', 'https://api.thinfilm.no/v1/tags/'+tmpurl, true);
    // GLOBAL("https://cnect.thinfilm.no/v1/"),
    var globalurl = "https://cnect.thinfilm.no/v1/tags/"
    var chinaurl = "https://cnect.thinfilmelectronics.cn/v1/tags/"
    //  CHINA("https://cnect.thinfilmelectronics.cn/v1/");
    xmlhttp.open('POST', chinaurl + tmpurl, true);//the RESTFUL API url is changed in 201706 version
    xmlhttp.timout = 5000;
    //  xmlhttp.open('POST', 'https://api.thinfilm.no/v1/tags/fd92a2d5e6c45635b53a250e2dc60adcafc85003a3a95092724b278d643dacb0', true);
    //  xmlhttp.setRequestHeader("Authorization-Token", "28b232d6c0c14403abcefdf106754783"); 
    //  xmlhttp.setRequestHeader("Api-Key", ""); 
    //  xmlhttp.setRequestHeader("User-Agent","no.thinfilm.sample.authpublic/1.0.5-6(golden)ThinfilmSdk/14");
    //  xmlhttp.setRequestHeader("X-Requested-With", "no.thinfilm.sdk:v14"); 
    xmlhttp.setRequestHeader("Content-Type", "application/json");

    //xmlhttp.setRequestHeader("'"Access-Control-Allow-Headers',"");
    //xmlhttp.send("{\n\"tap_properties:\"\n{\n}\n}");
    var tempdate = new Date();
    thintime1 = tempdate.getSeconds().toString() + "." + tempdate.getMilliseconds().toString();
    xmlhttp.send(JSON.stringify({
      tap_properties:
        {

        }
    }));

    //xmlhttp.send("null");

    /*
            xmlhttp.open("GET", 'https://api.thinfilm.no/v1/tags/fd92a2d5e6c45635b53a250e2dc60adcafc85003a3a95092724b278d643dacb0' , true);
            xmlhttp.send(null);
            */
  } else {
    myApp.hidePreloader();
    logMyFunc("window.XMLHttpRequest 出错" + this.status);
    //myApp.alert("程序异常出错:"+this.status);
    showhint("程序异常出错");
    exitMyApp();
  }
  //myApp.alert(xmlhttp);
}






var uidInHex; //uid of tag raw data
var tmpurl; //sha256 of tagid to be the RESTFUL path of url

var tagThinfilmReq = function () {
  //myApp.alert("in thin film http request function");
  // myApp.alert(tag.id);  
  // myApp.alert(toHexString(tag.id));  

  //need use toHexString(tag.id) bytes array to calculate the hash value to server
  uidInHex = toHexString(tag.id);
  // myApp.alert("this one");
  //  myApp.alert(uidInHex);
  //myApp.alert(bigInt);
  // myApp.alert(sha256_digest);
  // myApp.alert(sha256_digest(uidInHex));
  tmpurl = sha256_digest(uidInHex);
  //start a request to thinfilm server with RESTFUL structure
  // myApp.alert(tmpurl);
  //get POS and local time

  getTime();

  getPos2();



  //myApp.showPreloader();
  //  thinreqXmlhttp();



  //send request to myServer

}

var tag2ThinfilmReq = function () {
  //myApp.alert("in thin film http request function");
  // myApp.alert(tag.id);  
  // myApp.alert(toHexString(tag.id));  

  //need use toHexString(tag.id) bytes array to calculate the hash value to server
  uidInHex = toHexString(tag.ndefMessage[0].id);
  // myApp.alert("this one");
  //  myApp.alert(uidInHex);
  //myApp.alert(bigInt);
  // myApp.alert(sha256_digest);
  // myApp.alert(sha256_digest(uidInHex));
  tmpurl = sha256_digest(uidInHex);
  //start a request to thinfilm server with RESTFUL structure
  // myApp.alert(tmpurl);
  //get POS and local time

  getTime();

  getPos2();


  //  myApp.showPreloader();
  // thinreqXmlhttp();



  //send request to myServer

}



var nfcCallbk = function (nfcEvent) {

  // if(nfcEvent==100)return;
  tag = nfcEvent.tag;
  //myApp.aler(nfcEvent);
  myApp.alert(nfcEvent.tag.sig);
  // myApp.alert("nfc");
  // myApp.alert(tag.id);
  // nfc.removeTagDiscoveredListener(nfcCallbk, function () {
  //   // alert("unregister success\n");
  // },
  //   function (error) {
  //     // alert("unregister failure \n"+error);
  //   });
  tagThinfilmReq();


}

var nfcmimeCallbk = function (nfcEvent) {
  // if(nfcEvent==100)return;
  tag = nfcEvent.tag;
  //myApp.alert("nfc");
  // myApp.alert(tag.ndefMessage[0].id);
  tag2ThinfilmReq();


}

var histtime1;
var histtime2;

var reqHistoryMyServer = function () {
  var xmlhttp;
  var urlMyServer = "http://106.14.1.85:8080/v1/product/history/" + tag_raw;

  // alert(urlMyServer);

  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.timeout = 5000;
    xmlhttp.onreadystatechange = function () {
      //myApp.alert(this.readyState);
      //var DONE = this.DONE || 4;
      if (this.readyState == 4) {
        //myApp.alert(this.readyState);

        //myApp.alert(this.response);
        // myApp.alert(this.status);
        if (this.status == 200) {
          var tempdate1 = new Date();
          histtime2 = tempdate1.getSeconds().toString() + "." + tempdate1.getMilliseconds().toString();
          logMyFunc("history server:" + histtime1 + " " + histtime2);
          //  myApp.alert(histtime1+" "+histtime2);
          var result3 = this.response;
          if (xmlhttp.getResponseHeader("Content-Type").toString().search('json') != -1) {

            //myApp.alert(result3);
            var obj = JSON.parse(result3);

            if (obj.HisList != null) {
              mainView.router.load({
                url: 'detail.html',
                context: obj.HisList, // CSS
                ignoreCache: true,
                //reload: true,
              });
            } else {
              mainView.router.load({
                url: 'detail.html',
                context: [
                  {
                    "Count": 1,
                    "Addr": "",
                    "DT": " ",
                    "Status": " "
                  }], // CSS
                ignoreCache: true,
                //reload: true,
              });
            }
            //mainView.router.refreshPage() ;
            //}
            // testobj = obj;

            //myApp.alert("status: "+obj.status);
            //  myApp.alert("addr: "+obj.Addr);
            // myApp.alert("vendor: "+obj.ProductInfo.Vendor);
            //myApp.alert(this.response);
            //result();
          } else {
            showhint("网络出错，请确保网络打开");
            logMyFunc("hisotry网络错误4:" + this.status + "请确保网络打开");
            setTimeout(function () {
              myApp.closeModal();
            }, 2000);
          }
        } else {
          //myApp.alert("网络出错，请确保网络打开");
          showhint("网络出错，请确保网络打开");
          logMyFunc("hisotry网络错误3:" + this.status + "请确保网络打开");
          setTimeout(function () {
            myApp.closeModal();
          }, 2000);
        }
      }
    };
    xmlhttp.ontimeout = function (e) {
      //myApp.alert("访问超时，请确保网络打开");
      showhint("访问超时，请确保网络打开");
      logMyFunc("访问超时3" + e + "请确保网络打开");
      setTimeout(function () {
        myApp.closeModal();
      }, 2000);
    };
    xmlhttp.onerror = function (e) {
      //myApp.alert("访问错误3"+e+"请确保网络打开");
      logMyFunc("访问错误3" + e + "请确保网络打开");
      /*setTimeout(function () {
       myApp.closeModal();
     }, 2000);*/
    };
    xmlhttp.open('GET', urlMyServer, true);

    var tempdate = new Date();
    histtime1 = tempdate.getSeconds().toString() + "." + tempdate.getMilliseconds().toString();
    xmlhttp.send(null);

  }

}

var logfileok = false;  //boolen for log file can work

var setlogfunc = function () {
  // get the logfilePath from the currently running logger instance 
  //logFunc();
  // window.logToFile.getLogfilePath(function (logfilePath) {
  //   // dosomething with the logfilepath 
  //   logFunc();
  // }, function (err) {
  //   // handle error 
  //   // myApp.alert("LOG获取出错 ");
  //   setTimeout(function () {
  //     myApp.closeModal();
  //     logFunc();
  //   }, 2000);
  // });
}


/*checklogpermission check log external storage permission given*/
var intervalID = 0;
var i = 0;
var checklogpermission = function () {
  cordova.plugins.diagnostic.isExternalStorageAuthorized(function (authorized) {
    if (authorized) {
      i = 5;
    }
    // myApp.alert("App is " + (authorized ? "authorized" : "denied") + " access to the external storage");
  }, function (error) {
    // myApp.alert("The following error occurred: "+error);
  });
  i++;
  if (i > 0) {  //just 2s wait for authorization

    //clearInterval(intervalID);

    if (i > 5) {
      logfileok = true;
      /*
       myApp.alert("LOG设置正确");
        setTimeout(function () {
        myApp.closeModal();
         timeFunc1();
    }, 2000);
    */


    } else {
      logfileok = false;
      /*
    myApp.alert("LOG设置出错 ");
    
    setTimeout(function () {
        myApp.closeModal();
         timeFunc1();
    }, 2000);
    */
    }
    timeFunc1();
  }
};


/*logFun is to set log file path*/
var logFunc = function () {

  //myApp.alert("log request");
  //get UUID
  var deviceID = device.uuid;
  //myApp.alert(deviceID);

  window.plugins.imei.get(
    function (imei) {
       myApp.alert("got imei: " + imei);
    },
    function () {
      //  myApp.alert("error loading imei");
    }
  );
  timeFunc1();
  // window.logToFile.setLogfilePath('/3Japp/log.txt', function () {
  //   // logger configured successfully
  //   //  myApp.alert("this");  
  //   logfileok = true;
  //   timeFunc1();

  // }, function (err) {
  //   // logfile could not be written
  //   // handle error
  //   //while check perssion
  //   i = 0;
  //   // intervalID =  setInterval(checklogpermission,2000);
  //   setTimeout(checklogpermission, 3000);



  //   // timeFunc1();
  // });
}

/*log file input function*/
var logMyFunc = function (x) {
  if (logfileok) {

    window.logToFile.debug(x);
  }
}


/*register NFC part*/
var timeFunc1 = function () {




  //  alert(logfileok);
  /*if(logfileok){
          
     window.logToFile.debug('appinit ok');
   }*/
  /*
  var clickedLink = '.page';
    var popoverHTML = '<div class="popover">'+
                        '<div class="popover-inner">'+
                          '<div class="content-block">'+
                            '<p>About Popover created dynamically.</p>'+
                            '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac diam ac quam euismod porta vel a nunc. Quisque sodales scelerisque est, at porta justo cursus ac.</p>'+
                          '</div>'+
                        '</div>'+
                      '</div>'
    myApp.popover(popoverHTML, clickedLink,false);
    */
  logMyFunc("app init ok");
  myApp.alert("init app");
  /*
  myApp.alert("init app");
  setTimeout(function () {
          myApp.closeModal();
      }, 2000);
  
  
   logMyFunc("app init ok");
       // myApp.alert("in timeout");
       */
  /*
        nfc.addTagDiscoveredListener(function (nfcEvent) {
  
              tag = nfcEvent.tag;
  
              tagThinfilmReq();
             
          },
          function () { // success callback
              myApp.alert("Waiting for  tag");
          },
          function (error) { // error callback
              myApp.alert("Error adding  listener " + JSON.stringify(error));
          });
          */
  //myApp.alert("我测测");
  // registerNFC();
  getPos();//got pos authority first


  /*
   nfc.addTagDiscoveredListener(nfcCallbk,
          function () { // success callback
             // myApp.alert("Waiting for  tag");
          },
          function (error) { // error callback
              myApp.alert("NFC出错 " + JSON.stringify(error)+"请打开NFC");
              logMyFunc("NFC出错 " + JSON.stringify(error)+"请打开NFC");
              setTimeout(function () {
                myApp.closeModal();
              }, 2000);
            });
  
  
  nfc.addMimeTypeListener ("text/pg",
          nfcmimeCallbk,
          function () { // success callback
              //alert("Waiting for NDEF tag");
          },
          function (error) { // error callback
               myApp.alert("NFC出错 " + JSON.stringify(error)+"请打开NFC");
               logMyFunc("NFC出错 " + JSON.stringify(error)+"请打开NFC");
                setTimeout(function () {
                myApp.closeModal();
              }, 2000);
          }
      );
      */
  // getPos();

}

/*delay 3 seconds and exit app*/
var exitMyApp = function () {
  setTimeout(function () {
    navigator.app.exitApp();
  }, 3000);
}

/*check NFC authority of APP*/
var checkNfcAuthor = function () {
  // myApp.alert("in check nfc permission");
  //noway to check authority
  //getPos();
  //do nothing just wait NFC scan tag
  setTimeout(function () {
    mainView.router.load({
      url: 'home.html'
    });
  }, 2000);

}

/*check if Nfc is open*/
var checkNfcOpen = function () {
  cordova.plugins.diagnostic.isNFCEnabled(function (enabled) {
    logMyFunc("NFC is " + (enabled ? "enabled" : "disabled"));
    if (enabled) {
      checkNfcAuthor();
    } else {
      logMyFunc("NFC is disabled,exit");
      // myApp.alert("NFC还是未打开，请手动打开");
      showhint("NFC还是未打开，请手动打开");
      exitMyApp();
    }
  }, function (error) {
    logMyFunc("cehck NFC open meet the following error: " + error);
  });
}

/*jump to nfc setting*/
var openNfcSetting = function () {
  if (window.cordova && window.cordova.plugins.settings) {
    logMyFunc('openSettingsTest is active');
    window.cordova.plugins.settings.open("nfc_settings",
      function () {
        logMyFunc('opened settings');
        //set back here
        //getPos();
        setTimeout(function () {
          checkNfcOpen();
        }, 5000);

      },
      function () {
        logMyFunc('failed to open settings');
        //myApp.alert("程序打开设置页面出错，请手动设置NFC打开");
        showhint("程序打开设置页面出错，请手动设置NFC打开");
        //getPos();
        exitMyApp();
      });
  } else {
    logMyFunc('openSettingsTest is not active!');
    exitMyApp();
  }
}

/*nfc not open and choose jump to setting interface to set nfc open*/
var nfcOpenCBOK = function () {
  openNfcSetting();
}

/*nfc not open and choose refuse to setting interface to set nfc open*/
var nfcOpenCBCancel = function () {
  //getPos();
  logMyFunc("用户拒绝打开NFC配置");
  //myApp.alert("请手动设置NFC打开");
  showhint("请手动设置NFC打开");
  exitMyApp();

}

/*register Mime NDEF nfc call back and return error when nfc close*/
var registerNfcMime = function () {

  nfc.addMimeTypeListener("text/pg",
    nfcmimeCallbk,
    function () { // success callback
      //alert("Waiting for NDEF tag");
      //getPos();
      checkNfcAuthor();
    },
    function (error) { // error callback
      //myApp.alert("NFC出错 " + JSON.stringify(error)+"请打开NFC");
      logMyFunc("MimeNFC出错 " + JSON.stringify(error) + "请打开NFC");
      myApp.confirm("<font color=black size=4>NFC未打开，为保证程序能正常运行，请打开NFC</font>", nfcOpenCBOK, nfcOpenCBCancel);
      /*
       setTimeout(function () {
       myApp.closeModal();
       getPos();
     }, 2000);
     */


    }
  );
}

/*register tag nfc call back and return error when nfc close*/
var registerNFC = function () {
   myApp.alert("register NFC");

  nfc.addTagDiscoveredListener(nfcCallbk,
    function () { // success callback
       myApp.alert("Waiting for  tag");
      //myApp.alert(nfcEvent);
      //alert(nfcEvent.tag.sig);
      //registerNfcMime();
    },
    function (error) { // error callback
      // myApp.alert("NFC出错 " + JSON.stringify(error)+"请打开NFC");
      logMyFunc("TagNFC出错 " + JSON.stringify(error) + "请打开NFC");
      //registerNfcMime();
      /*
      setTimeout(function () {
         //myApp.closeModal();
         registerNfcMime();
       }, 2000);
       */
    });


}


var regNFCinMid = function () {
  nfc.addTagDiscoveredListener(nfcCallbk,
    function () { // success callback
      // myApp.alert("Waiting for  tag");

    },
    function (error) { // error callback
      // myApp.alert("NFC出错 " + JSON.stringify(error)+"请打开NFC");
      logMyFunc("TagNFC出错 " + JSON.stringify(error) + "请打开NFC");

    });
}
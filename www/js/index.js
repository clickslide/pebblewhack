/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    state:"",
    timeout:5000,
    insideTimer:null,
    awayTimer:null,
    appName:"",
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if(app.state == "inside") {
            app.appName = "attahackhuesms";
            app.insideTimer = setInterval(function(){
                window.bluetooth.getPaired( onGetPairedSuccess, onGetPairedError); 
            }, app.timeout);
        }
        if(app.state == "away") {
            app.appName = "doggybedtemp";
            methods.login();
        }
    }
};
function onGetPairedSuccess(data) {
    methods.login();
}
function onGetPairedError(error) {
    console.log("Error getting paired devices");   
}

var methods = {};
methods.session ="";
methods.pageData = "";
methods.login = function () {
    console.log("https://192.168.1.105/clickslide/"+app.appName+"/login/doLogin.json");
     $.post( "https://192.168.1.105/clickslide/"+app.appName+"/login/doLogin.json", {email:"clickslide", password:"demo"})
      .done(function( data ) {
          methods.onlogin(data.session.id);
      });
 }
 methods.onlogin = function(ev) {
     console.log(ev);
     if(methods.session == ""){
        methods.session = ev;
     }
     var request = $.ajax({
      url: "https://192.168.1.105/clickslide/"+app.appName+".json?update&PHPSESSID="+methods.session,
      dataType: "json"
    });
     
    request.done(function( msg ) {
        methods.pageData = msg;
        console.log( methods.pageData );
        
        if(app.state == "away"){
            methods.processPageData();  
            app.insideTimer = setInterval(function(){
                methods.onlogin(methods.session); 
            }, 20000);
        }else{
            window.clearInterval(app.insideTimer);
        }
    });
     
    request.fail(function( jqXHR, textStatus ) {
      console.log( "Request failed: " + textStatus );
    });
     
 }
 methods.processPageData = function(){
     console.log(methods.pageData.BasicPage.title);
     $("#temp").html(methods.pageData.BasicPage.title);
}
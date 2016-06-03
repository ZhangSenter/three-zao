// Note window.ngem contains the API.
// Only 1 calls are public to user app:
//   getClientInfo()

//
(function(ngem, document, window, undefined) {
	'use strict';

	
	function isEmpty(str) {
    	return (!str || 0 === str.length);
	}

	var thisNgem = ngem;

	function bridgeLog(logContent) {
           // document.getElementById("show").innerHTML = logContent;
        }

        thisNgem.connectJsBridge= function connectWebViewJavascriptBridge(callback) {
            if (window.WebViewJavascriptBridge) {
                callback(WebViewJavascriptBridge)
            } else {
                document.addEventListener(
                    'WebViewJavascriptBridgeReady'
                    , function() {
                        callback(WebViewJavascriptBridge)
                    },
                    false
                );
            }
        }

 
	thisNgem.init= function(callback) {
        //call native method
		thisNgem.connectJsBridge(function(bridge) {
            	bridge.init(function(message, responseCallback) {
               	 console.log('JS engine init', message);
                var data = {
                    'JS Res': '三灶演示!'+message
                };
                responseCallback(data);
            });

            bridge.registerHandler("notifyUser", function(data, responseCallback) {
                document.getElementById("show").innerHTML = ("data from Java: = " + data);
                var responseData = "Javascript Says received!";
                responseCallback(responseData);
            });
        })
	}

	thisNgem.getClientInfo= function(callback) {
        //call native method
        window.WebViewJavascriptBridge.callHandler(
                'getClientInfo'
                , {}
                , function(responseData) {
                    var jsonObj = {};
                    if(!isEmpty(responseData)){
                        jsonObj = JSON.parse(responseData);
                   }    
                   callback(jsonObj);
                }
            );
	}


}((window.ngem = typeof Object.create !== 'undefined' ? Object.create(null) : {}), document, window));

window.ngem.init();


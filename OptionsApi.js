
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

function getHighStrike(calls){
	var hi = Number.MIN_VALUE;
	for(var i = 0; i < calls.length; i++){
		var strike = Number(calls[i].strike.replaceAll(",",""));
		if(strike > hi) hi = strike;
	}
	return hi;
}

function getLowStrike(calls){
	var lo = Number.MAX_VALUE;
	for(var i = 0; i < calls.length; i++){
		var strike = Number(calls[i].strike.replaceAll(",",""));
		if(strike < lo) lo = strike;
	}
	return lo;
}

function getAtMoneyIndex(calls, underlier){
	var close = Number.MAX_VALUE;
	var index = -1;

	for(var i = 0; i < calls.length; i++){
		var strike = Number(calls[i].strike.replaceAll(",",""));
		if(Math.abs(strike - underlier) < close){
			index = i;
			close = Math.abs(strike - underlier);
		}
	}
	return index;
}



function getStrikeList(chain){
	var calls = chain.calls;
	var midIndex = -1;
	midIndex = getAtMoneyIndex(calls, chain.underlying_price);
	var strikes = [];
	for(var i = midIndex - 8; i < calls.length && i < midIndex + 8; i++){
		if(i < 0)continue;
		strikes.push(Math.round(calls[i].strike.replaceAll(",","") * 100) / 100);
	}
	return strikes;
}


function getExpirations(chain){
	var exprs =[];

	for(var i = 0; i < chain.expirations.length; i++){
		var e = chain.expirations[i];
		exprs.push(e.m + '/' + e.d + '/' + e.y);
	}
	return exprs;
}

function getOptionChainNoDate(symbol, callback, errCallback){
	var googurl = "http://www.google.com/finance/option_chain?q=" + symbol + "&output=json";
	var url = "http://localhost:8080/proxyget?url=" + encodeURIComponent(googurl);
  var request = new XMLHttpRequest();
  request.onreadystatechange = (e) => {
	  console.log('readyState: ' + request.readyState)
    if (request.readyState !== 4) {
		console.log('readyState: ' + request.readyState)
      return;
    }

    if (request.status === 200) {
		console.log('test123123');
      callback(eval('(' + request.responseText + ')'));
    } else {
      console.warn('error ' + request.status);
      errCallback();
    }
  };
	console.log('sending ' + url);
	request.open('GET', url, true);
  request.send();


}

function getOptionChain(symbol, date, callback, errCallback){

	var dp = date.split('/');
	var d = Number(dp[1]);
	var m = Number(dp[0]);
	 var y = Number(dp[2]);

	var googurl = "http://www.google.com/finance/option_chain?q=" + symbol+ "&expd=" + d + "&expm=" + m + "&expy=" + y + "&output=json";
	var url = "http://localhost:8080/proxyget?url=" + encodeURIComponent(googurl);
    var request = new XMLHttpRequest();
	request.onreadystatechange = (e) => {
     if (request.readyState !== 4) {
       return;
     }

     if (request.status === 200) {
       callback(eval('(' + request.responseText + ')'));
     } else {
       console.warn('error ' + request.status);
       errCallback();
     }
   };

   request.open('GET', url, true);
   request.send();
}

function hasOptions(chain){
	return chain.calls ? true : false;
}

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

module.exports = {hasOptions,getOptionChainNoDate, getOptionChain, getAtMoneyIndex, getHighStrike, getLowStrike, getStrikeList, getExpirations}

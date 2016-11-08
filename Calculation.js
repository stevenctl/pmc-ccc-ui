function calc(stockPrice, strikePrice, callProceeds, brokersLot, expiry) {


	//valid input flags
    var A = true,
        B = true,
        C = false,
        D = true,
        E = true,
        F = false,
        G = true,
        H = false,
        I = false,
        L = false,
        M = true,
        N = false,
        O = false,
        Q = false;

	//misc vars
    var a = -1.0,
        b = 100.0,
        c = -1.0,
        d = -1.0,
        e = -1.0,
        f = -1.0,
        g = -1.0,
        h = -1.0,
        i = -1.0,
        m = 365.0,
        n = -1.0,
        o = -1.0,
        p = 100.0,
        q = -1.0;

    //Stock price
    d = Number(stockPrice);
    D = d >= 0;
    if(!stockPrice || stockPrice.length == 0)D = false;
    //Strike price
    g = Number(strikePrice);
    G = g >= 0;
    if(!strikePrice || strikePrice.length == 0)G = false;
    //Call proceeds
    e = Number(callProceeds);
    E = e >= 0;
    if(!callProceeds || callProceeds.length == 0)E = false;
    //Round Lot
    a = Number(brokersLot);
    A = a >= 0;
    if(!brokersLot || brokersLot.length == 0)A = false;
    //l is the days until call. (days till 3rd friday of that month)

	var l = daysUntil(expiry);
    L = l > 0;


    //Actual Calculations
    if (A && B) {
        c = a / b;
        C = true;
    }
    if (C && D && E) {
        f = c + d - e;
        F = true;
    }
    if (G && F) {
        h = g - f;
        H = true;
    }
    if (H && F) {
        i = h / f;
        I = true;
    }
    if (L && M) {
        n = l / m;
        N = true;
    }
    if (I && N) {
        o = i / n * 100;
        O = true;
    }
    if (E && D && A) {
        q = e / (d + (a / 100)) * p;
        Q = true;
    }
	var capitalAtRisk = F ?  "$" + f.toFixed(2) : "?";
	var riskMitigation = Q ? q.toFixed(1) + "%" : "?";
	var rateReturn = O ? o.toFixed(1) + "%" : "?";

    return {
		capitalAtRisk,
		riskMitigation,
		rateReturn
	}
}

function daysUntil(datestr){
	var oneDay = 24*60*60*1000;
	return Math.ceil((new Date(datestr).getTime() - new Date().getTime()) / oneDay) ;
}

module.exports = {daysUntil, calc}

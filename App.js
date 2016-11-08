import React, {Component} from 'react';
import {daysUntil, calc} from './Calculation.js';
import OptionsApi from './OptionsApi.js';
import Modal from 'react-modal';


const initialState = {
  expiryDataSource: [],
  strikeDataSource: [],
  callProcDataSource: [],
  brokersLot: "10",

};


var style = {
  inputStyle: {borderRadius: 5, fontSize: 22, width: '45%', height: 40, borderColor: 'gray', borderWidth: 1, textAlign: 'center'},
  rowStyle: {marginTop: 15, marginLeft: 5, marginRight: 5},
  button: {backgroundColor: '#eee', borderRadius: 15, height: 40, maxWidth: '33%'},
  buttonText: {fontSize: 20},
  labelStyle: {fontSize: 26, width: '50%'}
}

export default class App extends Component{

  constructor(){
    super();
    this.state = initialState;
  }
  
  componentDidMount(){
	  this.setState({showTickerDialog: true});
  }
  


  handleChange (e, name) {
		var change = {};
		var value = e.target.value;
    console.log(name + ":" + value);
    
	
	
	if(/\$.*/.test(value)){
      value = value.slice(1);
    }
	
	console.log('good number');
	
		change[name] = value;
		console.log('change (' + name + '): \n' + JSON.stringify(change) + '\n' + value);
		if(name != 'expiry'){
			value = Math.round(value * 100) / 100;
		}
		this.setState(change);
		this.setState(
                calc(
                  name === 'stockPrice' ? value : this.state.stockPrice,
                  name === 'strikePrice' ? value : this.state.strikePrice,
                  name === 'callProceeds' ? value : this.state.callProceeds,
                  name === 'brokersLot' ? value : this.state.brokersLot,
                  name === 'expiry' ? value : this.state.expiry
                      )
                  );

	}

  render(){
   

	




      return (
      <div>
	  
		<Modal style={{content : {top: '50%',left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)'}}}
		isOpen={this.state.showTickerDialog}>
			<h3>Enter Ticker Symbol</h3>
			<center><input style={Object.assign({},style.inputStyle,{marginLeft: '0', float: 'none'})} value={this.state.tickerSymbol} onChange={(text) => this.handleChange(text, 'tickerSymbol')}/></center>
		
			<center><button style={{ marginTop: 5}}className="btn btn-default" onClick={() => {
				this.setState({
                     showExpiries: true,
                     expiryDataSource: ['fetching...']
				});
	  
				OptionsApi.getOptionChainNoDate(this.state.tickerSymbol,
			(response) => { this.setState({showTickerDialog: false,optionChain: response, stockPrice: '' + Math.round(response.underlying_price * 100) / 100,expiryDataSource: OptionsApi.getExpirations(response)}); console.log('test!!!')  },
								    () => this.setState({showExpiries: false})
	);
			}}>Submit</button>&nbsp;
			
			<button style={{ marginTop: 5}}className="btn btn-default" onClick={() => {this.setState({showTickerDialog: false})}}>Cancel</button>
			</center>
		</Modal>
		
		<Modal style={{content : {top: '50%',left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)'}}}
		isOpen={this.state.showExpiries}>
			<h3>Select Expiration</h3>
			<div style={{minHeight: '160px', maxHeight: '320px', overflow: 'hidden',overflowY: 'scroll'}}>
			
					<ul className="new-list-view" >
					{this.state.expiryDataSource.map((item, i) => {
						return <li className="sellistitem" onClick={() => {
										
										this.setState({
											showStrikes: true,
											strikeDataSource: ['fetching...']
										});
										
										OptionsApi.getOptionChain(this.state.tickerSymbol, item,
											(response) => {
												this.setState({optionChain: response, strikeDataSource: OptionsApi.getStrikeList(response)});
											}
											,() => this.setState({showStrikes: false})
										);	
										
										this.setState({showExpiries: false, expiry: item});
										this.setState(calc(this.state.stockPrice, this.state.strikePrice, this.state.callProceeds, this.state.brokersLot, item));
									}}
								key={i}>
									
									<div className="list-view-item">{item}</div>
								</li>
					})}
					</ul>
			
			</div>
			
			<center>
			<button style={{ marginTop: 5}}className="btn btn-default" onClick={() => {this.setState({showExpiries: false})}}>Cancel</button>
			</center>
			
		</Modal>
		
		
		<Modal style={{content : {top: '50%',left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)'}}}
		isOpen={this.state.showStrikes}>
			<h3>Select Strike Price</h3><h4>(Underlier: ${this.state.stockPrice})</h4>
			<div style={{minHeight: '160px', maxHeight: '320px', overflow: 'hidden',overflowY: 'scroll'}}>
			
					<ul className="new-list-view" >
					{this.state.strikeDataSource.map((item, i) => {
						return <li className="sellistitem" onClick={() => {
										
										var bidmeanask = [];

										  for(var i = 0; i < this.state.optionChain.calls.length; i++){
											var call = this.state.optionChain.calls[i];
											if(call.strike == item){
											  var bid = call.b == '-' ? 0 : Number(call.b);
											  var ask = call.a == '-' ? 0 : Number(call.a);
											  var mean = (bid + ask) / 2.0;
											  bidmeanask.push(bid);
											  bidmeanask.push(mean);
											  bidmeanask.push(ask);
											  break;
											}
										  }
										
										this.setState({showStrikes: false, strikePrice: item, callProcDataSource: bidmeanask, showCallProc: true});
										this.setState(calc(this.state.stockPrice, item, this.state.callProceeds, this.state.brokersLot, this.state.expiry));
									}}
								key={i}>
									<div className="list-view-item">${item}</div>
								</li>
					})}
			</ul>
			</div>
			
			<center>
			<button style={{ marginTop: 5}}className="btn btn-default" onClick={() => {this.setState({showStrikes: false})}}>Cancel</button>
			</center>
		</Modal>
		
		
		<Modal style={{content : {top: '50%',left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)'}}}
		isOpen={this.state.showCallProc}>
			<h3>Select Call Proceeds</h3>
			<div style={{minHeight: '160px', maxHeight: '320px', overflow: 'hidden',overflowY: 'scroll'}}>
			
					<ul className="new-list-view" >
					{this.state.callProcDataSource.map((item, i) => {
						return <li className="sellistitem" onClick={() => {
										this.setState({callProceeds: item, showCallProc: false});
										this.setState(calc(this.state.stockPrice, this.state.strikePrice, item, this.state.brokersLot, this.state.expiry));
									}}
								key={i}>
									<div className="list-view-item">${item}</div>
								</li>
					})}
			</ul>
			</div>
			
			<center>
			<button style={{ marginTop: 5}}className="btn btn-default" onClick={() => {this.setState({showCallProc: false})}}>Cancel</button>
			</center>
		</Modal>
		
	  
        <img style={{width: '100%'}} src="banner.png"/>
        <div style={style.rowStyle}>
          <label style={style.labelStyle}>Stock Price</label>
          <input keyboardType="decimal-pad" style={style.inputStyle}
           value={this.state.stockPrice ? '$' + this.state.stockPrice : ''} onChange={(text) => this.handleChange(text, 'stockPrice')} />
        </div>
        <div style={style.rowStyle}>
          <label style={style.labelStyle}>Strike Price</label>
          <input keyboardType="decimal-pad" style={style.inputStyle}
          value={this.state.strikePrice ? '$' + this.state.strikePrice : ''} onChange={(text) => this.handleChange(text, 'strikePrice')} />
        </div>
        <div style={style.rowStyle}>
          <label style={style.labelStyle}>Expiration Date</label>
          <input style={style.inputStyle}
          value={this.state.expiry ? this.state.expiry : ''} onChange={(text) => this.handleChange(text, 'expiry')}/>
        </div>
        <div style={Object.assign({}, style.rowStyle, {height: 40})}>
          <label style={style.labelStyle}>Call Proceeds{'\n'}Collected</label>
          <input keyboardType="decimal-pad" style={style.inputStyle}
          value={this.state.callProceeds ? '$' + this.state.callProceeds : ''} onChange={(text) => this.handleChange(text, 'callProceeds')}/>
        </div>
        <div style={Object.assign({}, style.rowStyle, {height: 40})}>
          <label style={style.labelStyle}>Broker's Round Lot Commissions</label>
          <input style={style.inputStyle}
          value={this.state.brokersLot ? '$' + this.state.brokersLot : ''} onChange={(text) => this.handleChange(text, 'brokersLot')}/>
        </div>

        <div style={Object.assign(style.rowStyle, {height: 40})}>
          <div style={{fontSize: 13}}></div>
        </div>

        <div style={style.rowStyle}>
          <label style={style.labelStyle}>Capital At Risk</label>
          <input value={this.state.capitalAtRisk} style={style.inputStyle}/>
        </div>
        <div style={style.rowStyle}>
          <label style={style.labelStyle}>Risk Mitigation</label>
          <input value={this.state.riskMitigation} style={Object.assign({backgroundColor: '#8F8'},style.inputStyle)}/>
        </div>
        <div style={Object.assign(style.rowStyle, {height: 40})}>
          <label style={style.labelStyle}>Rate of Return{'\n'} Annualized</label>
          <input value={this.state.rateReturn} style={Object.assign({backgroundColor: '#8F8'},style.inputStyle)}/>
        </div>
		<div style={Object.assign( style.rowStyle, {marginBottom: 12})}>
          <button style={{ float: 'left', marginLeft: 5, marginRight: 'auto'}}className="btn btn-default" onClick={() => {this.setState({initialState}); this.setState({tickerSymbol: '', ticker: '', stockPrice: '', strikePrice: '', expiry: '', callProceeds: '', capitalAtRisk: '', riskMitigation: '', rateReturn: ''});}}>Reset</button>
		  <button style={{ float: 'right', marginLeft: 'auto', marginRight: 5, marginBottom: 10}}className="btn btn-default" onClick={() => {this.setState({showTickerDialog: true})}}>New Quote</button>
        </div>
	</div>	  
      );
    }


  }








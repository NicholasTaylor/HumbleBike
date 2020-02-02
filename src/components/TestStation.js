import React from 'react';

class TestStation extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return(
			<section>
				<div className="container-station">
					<h3 className="station-name">
						{this.props.name} ({this.props.dist} mi.)
					</h3>
					<div className="infoSection classic-bikes">
						<h4 className="bikes-remaining">
							{this.props.classic}
						</h4>
						<h5 className="descriptor">
							Classic
						</h5>
					</div>
					<div className="infoSection ebikes">
						<h4 className="bikes-remaining">
							{this.props.electric}
						</h4>
						<h5 className="descriptor">
							Electric
						</h5>
					</div>
					<div className="infoSection docks">
						<h4 className="bikes-remaining">
							{this.props.docks}
						</h4>
						<h5 className="descriptor">
							Docks
						</h5>
					</div>
				</div>
			</section>
		)
	}
}

export default TestStation;
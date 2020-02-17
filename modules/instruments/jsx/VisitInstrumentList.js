import React, {Component} from 'react';
// import Loader from 'Loader';
// import DataTable from 'jsx/DataTable';

class VisitInstrumentList extends Component {
     constructor(props) {
         super(props);
         this.state = {
             expanded: false,
         };
         this.toggleExpanded = this.toggleExpanded.bind(this);
         this.getInstruments = this.getInstruments.bind(this);
         this.calcAge= this.calcAge.bind(this);
     }

     calcAge(dob, visit) {
        let dobdate = new Date(dob);
        let vdate = new Date(visit);
        return (vdate.getFullYear() - dobdate.getFullYear()) + ' years old';
    }


    toggleExpanded() {
        if (!this.state.expanded === true && !this.state.instruments) {
            this.getInstruments();
        }
        this.setState({expanded: !this.state.expanded});
    }

    getInstruments() {
        fetch(this.props.BaseURL + '/instruments/visitsummary?CandID=' + this.props.Candidate.Meta.CandID + '&VisitLabel=' + this.props.Visit.Meta.Visit).then((response) => {
            return response.json();
        }).then((json) => {
            this.setState({instruments: json});
        });
    }
    render() {
        const squaresize = '98%';
        let style = {
            background: 'rgb(228, 235, 242)',
            marginBottom: '0.5%',
            marginRight: '0.5%',
            textAlign: 'center',
            boxSizing: 'border-box',
            transition: 'flex 0.3s, width 0.3s ease-out, height 0.3s ease-out',
            width: squaresize,
        };

        let vstatus = 'Not Started';
        if (this.props.Visit.Stages.Approval) {
            vstatus = 'Approval - ' + this.props.Visit.Stages.Approval.Status;
            // style.background = '#b6d7a8';
        } else if (this.props.Visit.Stages.Visit) {
            vstatus = 'Visit - ' + this.props.Visit.Stages.Visit.Status;
            // style.background = '#ffe599';
        } else if (this.props.Visit.Stages.Screening) {
            vstatus = 'Screening - ' + this.props.Visit.Stages.Screening.Status;
            // style.background = '#f9cb9c';
        } else {
            // style.background = '#ea9999';
        }

        let center = {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            width: '100%',
            height: '100%',
            alignItems: 'center',
        };
        center.justifyContent = 'flex-start';

        const termstyle = {paddingLeft: '2em', paddingRight: '2em'};

        let instruments = null;
        if (!this.state.instruments) {
            instruments = 'Loading...';
        } else {
            instruments = this.state.instruments.map((instrument) => {
                let conflicterror = null;
                console.log(instrument);
                if (instrument.NumOfConflict != 0) {
                    conflicterror = <i style={{color: 'red'}}class="fas fa-exclamation-triangle"></i>;
                }
                return <tr key={instrument.Test_name}><td style={{textAlign: 'left'}}>{instrument.Test_name}</td><td><progress value={instrument.Completion} max='100'>{instrument.Completion + '%'}</progress></td><td>{conflicterror}</td></tr>;
            });

            instruments = <div>
                <h5>Instruments</h5>
                <table style={{width: '95%'}}>
                    <tr><th>Instrument</th><th>Completion</th><th>Conflicts?</th></tr>
                    {instruments}
                </table>
                </div>;
        }
        if (!this.state.expanded) {
            instruments = null;
        }

        console.log(this.props.Visit);
        console.log(this.props.Candidate);
        return (<div style={style} onClick={this.toggleExpanded}>
            <div style={center}>
                <h4 style={{width: '20%'}}>{this.props.Visit.Meta.Visit}</h4>
                <div>
                <dl style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%', alignContent: 'center', justifyContent: 'center', margin: 0}}>
                    <div style={termstyle}><dt>Subproject</dt><dd>{this.props.Visit.Meta.Battery}</dd></div>
                    <div style={termstyle}><dt>Site</dt><dd>{this.props.Visit.Meta.Site}</dd></div>
                    <div style={termstyle}><dt>Date Of Visit</dt><dd>{this.props.Visit.Stages.Visit.Date}</dd></div>
                    <div style={termstyle}><dt>Age</dt><dd>{this.calcAge(this.props.Candidate.Meta.DoB, this.props.Visit.Stages.Visit.Date)}</dd></div>
                    <div style={termstyle}><dt>Status</dt><dd>{vstatus}</dd></div>
                </dl>
                {instruments}
                </div>
            </div>
            </div>
        );
    }
}

export default VisitInstrumentList;

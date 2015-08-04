
CandidateInfoTable = React.createClass({
    render: function() {
        return (
            <table className="table table-info table-bordered">
                <thead>
                    <tr className="info">
                        <th>DoB</th>
                        <th>Gender</th>
                        <th>Project</th>
                        <th>Comment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{this.props.DoB}</td>
                        <td>{this.props.Gender}</td>
                        <td>{this.props.Project}</td>
                        <td>{this.props.Comment}</td>
                    </tr>
                </tbody>
            </table>
            )
    }
});
SessionStageTable = React.createClass({
    render: function() {
        var rows = [];
        if(this.props.Stages.Screening) {
            rows.push(
                <tr key="Screening">
                    <td>Screening</td>
                    <td>{this.props.Stages.Screening.Status}</td>
                    <td>{this.props.Stages.Screening.Date}</td>
                </tr>);
        }
        if(this.props.Stages.Visit) {
            rows.push(
                <tr key="Visit">
                    <td>Visit</td>
                    <td>{this.props.Stages.Visit.Status}</td>
                    <td>{this.props.Stages.Visit.Date}</td>
                </tr>);
        }
        if(this.props.Stages.Approval) {
            rows.push(
                <tr key="Approval">
                    <td>Approval</td>
                    <td>{this.props.Stages.Approval.Status}</td>
                    <td>{this.props.Stages.Approval.Date}</td>
                </tr>);
        }
        return (
        <table className="table table-bordered">
            <thead>
                <tr className="info">
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
            );
    }

});
InstrumentGroupHeader = React.createClass({
    render: function() {
        return (<tr className="info">
                        <th>{this.props.Name}</th>
                        <th>Data Entry</th>
                        <th>Administration</th>
                        <th>Feedback</th>
                        <th>Double Data Entry</th>
                        <th>Double Data Entry Status</th>
                    </tr>
               );
    }
});
InstrumentListRow = React.createClass({
    componentDidMount: function() {
        var that = this;
        //GET /candidates/$CandID/$VisitLabel/instruments/$InstrumentName[/dde]/flags
        $.ajax({
            url: "/api/v0.0.1/candidates/" + this.props.CandID + "/" + this.props.Visit
                + "/instruments/" + this.props.TestName + "/flags",
            success: function (d) {
                var d = JSON.parse(d);
                that.setState({
                    'Administration' : d.Flags.Administration,
                    'Data_entry' : d.Flags.Data_entry
                });
            }
        });
        if(this.props.DoubleDataEntryEnabled === true) {
            $.ajax({
                url: "/api/v0.0.1/candidates/" + this.props.CandID + "/" + this.props.Visit
                    + "/instruments/" + this.props.TestName + "/dde/flags",
                success: function (d) {
                    var d = JSON.parse(d);
                    that.setState({
                        //'Administration' : d.Flags.Administration,
                        'Double_Data_entry' : d.Flags.Data_entry
                    });
                }
            });
        }
    },
    getInitialState: function() {
        return {
            'Administration' : 'Unknown',
            'Data_entry' : 'Unknown'
        }
    },
    render: function() {
        var DDE, admin, complete;
        if(this.props.DoubleDataEntryEnabled === true) {
            DDE = "Double Data Entry";
        } else {
            DDE = ".";
        }
        return (<tr>
                        <td>{this.props.Name}</td>
                        <td>{this.state.Data_entry}</td>
                        <td>{this.state.Administration}</td>
                        <td>.</td>
                        <td>{DDE}</td>
                        <td>{this.state.Double_Data_entry}</td>
                    </tr>
               );
    }
});
InstrumentListTable = React.createClass({
    getDefaultProps: function() {
        return {
            'Instruments' : [],
            'InstrumentDetails' : {}
        }
    },
    render: function() {
        var rows = [];
        if(this.props.InstrumentDetails) {

            var groups = {};
            this.props.Instruments.map(function(instrument) {
                if(this.props.InstrumentDetails[instrument]) {
                    var inst = this.props.InstrumentDetails[instrument];
                    if(groups[inst.Subgroup] === undefined) {
                        groups[inst.Subgroup] = [];
                    }
                    inst.TestName = instrument;
                    groups[inst.Subgroup].push(inst);
                }
            }, this);

            var gKeys = Object.keys(groups);
            gKeys.sort();
            for(var i = 0; i < gKeys.length; i += 1) {
                var groupName = gKeys[i];
                rows.push(<InstrumentGroupHeader Name={groupName} />);

                for(var j = 0; j < groups[groupName].length; j += 1) {
                    var inst = groups[groupName][j];
                    rows.push(<InstrumentListRow
                            TestName={inst.TestName}
                            Name={inst.FullName}
                            DoubleDataEntryEnabled={inst.DoubleDataEntryEnabled}
                            CandID={this.props.CandID}
                            Visit={this.props.Visit}
                            />);
                }
            }
        } else {
            // No details available, so just use the instrument name
            for(var i = 0; i < this.props.Instruments.length; i += 1) {
                var inst = this.props.Instruments[i];
                if(this.props.InstrumentDetails[inst]) {
                                    } else {
                    rows.push(<InstrumentListRow
                            TestName={this.props.Instruments[i]}
                            Name={this.props.Instruments[i]}
                            DoubleDataEntryEnabled={false}
                            />);
                }
            }
        }
        return (<div>
            <h3>Behavioural Battery of Instruments</h3>
            <table className="table table-bordered">
                <thead>
                    <tr className="info">
                        <th colSpan="6">List of Instruments</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            </div>
            );
    }

});
InstrumentSidebar = React.createClass({
    render: function() {
        var content = <div>
                <h3 className="controlPanelSection">Actions</h3>
                <ul className="controlPanel">
                    <li>Start Next Stage</li>
                </ul>
                <h3 className="controlPanelSection">Stage: Visit</h3>
                <ul className="controlPanel">
                    <li>Pass</li>
                    <li>Failure</li>
                    <li>Withdrawal</li>
                    <li>In Progress</li>
                </ul>
                <h3 className="controlPanelSection">Send Time Point</h3>
                <ul className="controlPanel">
                    <li>Send to DCC</li>
                </ul>
                <h3 className="controlPanelSection">BVL QC Type</h3>
                <ul className="controlPanel">
                    <li>Not Done</li>
                    <li>Visual</li>
                    <li>Hardcopy</li>
                </ul>
                <h3 className="controlPanelSection">BVL QC Status</h3>
                <ul className="controlPanel">
                    <li>Not Done</li>
                    <li>Complete</li>
                </ul>
            </div>;
        return (
                <LorisSidebar Content={content} />
               );
    }
});
CandidateVisitInstrumentList = React.createClass({
    getInitialState: function() {
        return {
            'InstrumentDetails' : {}
        }
    },
    getDefaultProps: function() {
        return {
            'CandData' : {
                'Visits' : [],
                'Meta' : {
                    'DoB' : 'Unknown',
                    'Gender' : 'Unknown'
                }
            },
            'VisitData' : {
                'Stages' : {
                    'Screening' : {},
                    'Visit' : {},
                    'Approval' : {}
                }
            },
            'VisitInstruments': {
                'Instruments' : []
            }
        };
    },
    componentDidMount: function() {
        var that = this;
        if(this.props.CandData.Meta.Project) {
        $.ajax({
            url: "/api/v0.0.1/projects/" + this.props.CandData.Meta.Project + "/instruments" ,
            success: function (d) {
                var d = JSON.parse(d);
                that.setState({
                    'InstrumentDetails' : d.InstrumentDetails
                });
                console.log(d);
            }
        });
        }

    },
    render: function() {

        return <div id="page" className="container-fluid">
            <div className="wrapper">
                    <InstrumentSidebar />
                    <div id="page-content-wrapper">

                    <div className="page-content inset">
                    <CandidateInfoTable
                        CandID={this.props.CandID}
                        DoB={this.props.CandData.Meta.DoB}
                        Gender={this.props.CandData.Meta.Gender}
                    />

                    <SessionStageTable Stages={this.props.VisitData.Stages}/>
                    <InstrumentListTable
                        Instruments={this.props.VisitInstruments.Instruments}
                        InstrumentDetails={this.state.InstrumentDetails}
                        CandID={this.props.CandID}
                        Visit={this.props.Visit} />
                    </div>
                    </div>
                    </div>
        </div>;
    }
});

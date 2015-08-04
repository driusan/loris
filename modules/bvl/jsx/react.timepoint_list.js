
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
CandidateActions = React.createClass({
    render: function() {
        var st = { paddingBottom: 30 };
        return (
            <div className="col-xs-12 row" style={st}>
                <h3>Actions:</h3>
                <button className="btn btn-primary" onclick="location.href='main.php?test_name=create_timepoint&amp;candID={this.props.CandID}&amp;identifier={this.props.CandID}'">Create time point</button>
                <button className="btn btn-primary" onclick="location.href='main.php?test_name=candidate_parameters&amp;candID={this.props.CandID}&amp;identifier={this.props.CandID}'">Edit Candidate Info</button>
            </div>
        );
    }
});

CandidateVisitRow = React.createClass({
    getInitialState: function() {
        return {
            'CandData' : {
                'Meta' : {
                    'Battery' : 'Unknown'
                }
            }
        };
    },
    componentDidMount: function() {
        var that = this;
        $.ajax({
            url: "/api/v0.0.1/candidates/" + this.props.CandID + "/" + this.props.Visit,
            success: function (d) {
                d = JSON.parse(d);
                that.setState({CandData : d});
            }
        });
    },
    visitClick: function() {
        if(this.props.onVisitClicked) {
            this.props.onVisitClicked(this.props.CandID, this.props.Visit);
        }
    },
    render: function() {
        var latestStage = {
            'Stage' : 'Unknown',
            'Date' : 'Unknown',
            'Status' : 'Unknown'
        }

        if(this.state && this.state.CandData && this.state.CandData.Stages) {
            if(this.state.CandData.Stages.length === 0) {
                latestStage['Stage'] = 'Unstarted Stage';
                latestStage['Date'] = '';
                latestStage['Status'] = '';
            } else if(this.state.CandData.Stages.Approval) {
                latestStage = this.state.CandData.Stages.Approval;
                latestStage['Stage'] = 'Approval';
            } else if(this.state.CandData.Stages.Visit) {
                latestStage = this.state.CandData.Stages.Visit;
                latestStage['Stage'] = 'Visit';
            } else if(this.state.CandData.Stages.Screening) {
                latestStage = this.state.CandData.Stages.Screening;
                latestStage['Stage'] = 'Screening';
            }
        }

        return (
                <tr>
                    <td><a onClick={this.visitClick}>{this.props.Visit}</a></td>
                    <td>{this.state.CandData.Meta.Battery}</td>
                    <td>{latestStage.Stage}</td>
                    <td>{latestStage.Status}</td>
                    <td>{latestStage.Date}</td>
                    <td>.</td>
                    <td>.</td>
                    <td>.</td>
                    <td>.</td>
                    <td>.</td>
                    <td>.</td>
                </tr>
        );
    }
});
CandidateVisitTable = React.createClass({
    getDefaultProps: function() {
        return { 'Visits' : [] };
    },
    render: function() {
        var candidateVisitRows = [];

        for(var i = 0; i < this.props.Visits.length; i += 1) {
            candidateVisitRows.push(
                    <CandidateVisitRow key={this.props.CandID + ':' + this.props.Visits[i]}
                        CandID={this.props.CandID}
                        Visit={this.props.Visits[i]}
                        onVisitClicked={this.props.onVisitClicked}
                        />
            );
        }
        return (
            <table className="table table-hover table-primary table-bordered">
                <thead>
                    <tr className="info">
                        <th>Visit Label (Clicked to Open)</th>
                        <th>Subproject</th>
                        <th>Stage</th>
                        <th>Stage Status</th>
                        <th>Date of Stage</th>
                        <th>Sent to DCC</th>
                        <th>MR Scan Done</th>
                        <th>Feedback</th>
                        <th>BVL QC</th>
                        <th>BVL Exclusion</th>
                        <th>Registered By</th>
                    </tr>
                </thead>
                <tbody>
                    {candidateVisitRows}
                </tbody>
            </table>
               );
    }
});
CandidateVisitList = React.createClass({
    getDefaultProps: function() {
        return {
            'CandData' : {
                'Visits' : [],
                'Meta' : {
                    'DoB' : 'Unknown',
                    'Gender' : 'Unknown'
                }
            }
        };
    },
    componentDidMount: function() {
    },
    render: function() {
        return <div>
            <CandidateInfoTable
                CandID={this.props.CandID}
                DoB={this.props.CandData.Meta.DoB}
                Gender={this.props.CandData.Meta.Gender}
                />
            <CandidateActions />

            <CandidateVisitTable CandID={this.props.CandID} Visits={this.props.CandData.Visits} onVisitClicked={this.props.onVisitClicked}/>
        </div>;
    }
});

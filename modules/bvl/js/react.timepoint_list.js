
CandidateInfoTable = React.createClass({displayName: 'CandidateInfoTable',
    render: function() {
        return (
            React.createElement("table", {className: "table table-info table-bordered"}, 
                React.createElement("thead", null, 
                    React.createElement("tr", {className: "info"}, 
                        React.createElement("th", null, "DoB"), 
                        React.createElement("th", null, "Gender"), 
                        React.createElement("th", null, "Project"), 
                        React.createElement("th", null, "Comment")
                    )
                ), 
                React.createElement("tbody", null, 
                    React.createElement("tr", null, 
                        React.createElement("td", null, this.props.DoB), 
                        React.createElement("td", null, this.props.Gender), 
                        React.createElement("td", null, this.props.Project), 
                        React.createElement("td", null, this.props.Comment)
                    )
                )
            )
            )
    }
});
CandidateActions = React.createClass({displayName: 'CandidateActions',
    render: function() {
        var st = { paddingBottom: 30 };
        return (
            React.createElement("div", {className: "col-xs-12 row", style: st}, 
                React.createElement("h3", null, "Actions:"), 
                React.createElement("button", {className: "btn btn-primary", onclick: "location.href='main.php?test_name=create_timepoint&candID={this.props.CandID}&identifier={this.props.CandID}'"}, "Create time point"), 
                React.createElement("button", {className: "btn btn-primary", onclick: "location.href='main.php?test_name=candidate_parameters&candID={this.props.CandID}&identifier={this.props.CandID}'"}, "Edit Candidate Info")
            )
        );
    }
});

CandidateVisitRow = React.createClass({displayName: 'CandidateVisitRow',
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
                React.createElement("tr", null, 
                    React.createElement("td", null, React.createElement("a", {onClick: this.visitClick}, this.props.Visit)), 
                    React.createElement("td", null, this.state.CandData.Meta.Battery), 
                    React.createElement("td", null, latestStage.Stage), 
                    React.createElement("td", null, latestStage.Status), 
                    React.createElement("td", null, latestStage.Date), 
                    React.createElement("td", null, "."), 
                    React.createElement("td", null, "."), 
                    React.createElement("td", null, "."), 
                    React.createElement("td", null, "."), 
                    React.createElement("td", null, "."), 
                    React.createElement("td", null, ".")
                )
        );
    }
});
CandidateVisitTable = React.createClass({displayName: 'CandidateVisitTable',
    getDefaultProps: function() {
        return { 'Visits' : [] };
    },
    render: function() {
        var candidateVisitRows = [];

        for(var i = 0; i < this.props.Visits.length; i += 1) {
            candidateVisitRows.push(
                    React.createElement(CandidateVisitRow, {key: this.props.CandID + ':' + this.props.Visits[i], 
                        CandID: this.props.CandID, 
                        Visit: this.props.Visits[i], 
                        onVisitClicked: this.props.onVisitClicked}
                        )
            );
        }
        return (
            React.createElement("table", {className: "table table-hover table-primary table-bordered"}, 
                React.createElement("thead", null, 
                    React.createElement("tr", {className: "info"}, 
                        React.createElement("th", null, "Visit Label (Clicked to Open)"), 
                        React.createElement("th", null, "Subproject"), 
                        React.createElement("th", null, "Stage"), 
                        React.createElement("th", null, "Stage Status"), 
                        React.createElement("th", null, "Date of Stage"), 
                        React.createElement("th", null, "Sent to DCC"), 
                        React.createElement("th", null, "MR Scan Done"), 
                        React.createElement("th", null, "Feedback"), 
                        React.createElement("th", null, "BVL QC"), 
                        React.createElement("th", null, "BVL Exclusion"), 
                        React.createElement("th", null, "Registered By")
                    )
                ), 
                React.createElement("tbody", null, 
                    candidateVisitRows
                )
            )
               );
    }
});
CandidateVisitList = React.createClass({displayName: 'CandidateVisitList',
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
        return React.createElement("div", null, 
            React.createElement(CandidateInfoTable, {
                CandID: this.props.CandID, 
                DoB: this.props.CandData.Meta.DoB, 
                Gender: this.props.CandData.Meta.Gender}
                ), 
            React.createElement(CandidateActions, null), 

            React.createElement(CandidateVisitTable, {CandID: this.props.CandID, Visits: this.props.CandData.Visits, onVisitClicked: this.props.onVisitClicked})
        );
    }
});

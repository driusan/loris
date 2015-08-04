
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
SessionStageTable = React.createClass({displayName: 'SessionStageTable',
    render: function() {
        var rows = [];
        if(this.props.Stages.Screening) {
            rows.push(
                React.createElement("tr", {key: "Screening"}, 
                    React.createElement("td", null, "Screening"), 
                    React.createElement("td", null, this.props.Stages.Screening.Status), 
                    React.createElement("td", null, this.props.Stages.Screening.Date)
                ));
        }
        if(this.props.Stages.Visit) {
            rows.push(
                React.createElement("tr", {key: "Visit"}, 
                    React.createElement("td", null, "Visit"), 
                    React.createElement("td", null, this.props.Stages.Visit.Status), 
                    React.createElement("td", null, this.props.Stages.Visit.Date)
                ));
        }
        if(this.props.Stages.Approval) {
            rows.push(
                React.createElement("tr", {key: "Approval"}, 
                    React.createElement("td", null, "Approval"), 
                    React.createElement("td", null, this.props.Stages.Approval.Status), 
                    React.createElement("td", null, this.props.Stages.Approval.Date)
                ));
        }
        return (
        React.createElement("table", {className: "table table-bordered"}, 
            React.createElement("thead", null, 
                React.createElement("tr", {className: "info"}, 
                    React.createElement("th", null, "Stage"), 
                    React.createElement("th", null, "Status"), 
                    React.createElement("th", null, "Date")
                )
            ), 
            React.createElement("tbody", null, 
                rows
            )
        )
            );
    }

});
InstrumentGroupHeader = React.createClass({displayName: 'InstrumentGroupHeader',
    render: function() {
        return (React.createElement("tr", {className: "info"}, 
                        React.createElement("th", null, this.props.Name), 
                        React.createElement("th", null, "Data Entry"), 
                        React.createElement("th", null, "Administration"), 
                        React.createElement("th", null, "Feedback"), 
                        React.createElement("th", null, "Double Data Entry"), 
                        React.createElement("th", null, "Double Data Entry Status")
                    )
               );
    }
});
InstrumentListRow = React.createClass({displayName: 'InstrumentListRow',
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
        return (React.createElement("tr", null, 
                        React.createElement("td", null, this.props.Name), 
                        React.createElement("td", null, this.state.Data_entry), 
                        React.createElement("td", null, this.state.Administration), 
                        React.createElement("td", null, "."), 
                        React.createElement("td", null, DDE), 
                        React.createElement("td", null, this.state.Double_Data_entry)
                    )
               );
    }
});
InstrumentListTable = React.createClass({displayName: 'InstrumentListTable',
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
                rows.push(React.createElement(InstrumentGroupHeader, {Name: groupName}));

                for(var j = 0; j < groups[groupName].length; j += 1) {
                    var inst = groups[groupName][j];
                    rows.push(React.createElement(InstrumentListRow, {
                            TestName: inst.TestName, 
                            Name: inst.FullName, 
                            DoubleDataEntryEnabled: inst.DoubleDataEntryEnabled, 
                            CandID: this.props.CandID, 
                            Visit: this.props.Visit}
                            ));
                }
            }
        } else {
            // No details available, so just use the instrument name
            for(var i = 0; i < this.props.Instruments.length; i += 1) {
                var inst = this.props.Instruments[i];
                if(this.props.InstrumentDetails[inst]) {
                                    } else {
                    rows.push(React.createElement(InstrumentListRow, {
                            TestName: this.props.Instruments[i], 
                            Name: this.props.Instruments[i], 
                            DoubleDataEntryEnabled: false}
                            ));
                }
            }
        }
        return (React.createElement("div", null, 
            React.createElement("h3", null, "Behavioural Battery of Instruments"), 
            React.createElement("table", {className: "table table-bordered"}, 
                React.createElement("thead", null, 
                    React.createElement("tr", {className: "info"}, 
                        React.createElement("th", {colSpan: "6"}, "List of Instruments")
                    )
                ), 
                React.createElement("tbody", null, 
                    rows
                )
            )
            )
            );
    }

});
InstrumentSidebar = React.createClass({displayName: 'InstrumentSidebar',
    render: function() {
        var content = React.createElement("div", null, 
                React.createElement("h3", {className: "controlPanelSection"}, "Actions"), 
                React.createElement("ul", {className: "controlPanel"}, 
                    React.createElement("li", null, "Start Next Stage")
                ), 
                React.createElement("h3", {className: "controlPanelSection"}, "Stage: Visit"), 
                React.createElement("ul", {className: "controlPanel"}, 
                    React.createElement("li", null, "Pass"), 
                    React.createElement("li", null, "Failure"), 
                    React.createElement("li", null, "Withdrawal"), 
                    React.createElement("li", null, "In Progress")
                ), 
                React.createElement("h3", {className: "controlPanelSection"}, "Send Time Point"), 
                React.createElement("ul", {className: "controlPanel"}, 
                    React.createElement("li", null, "Send to DCC")
                ), 
                React.createElement("h3", {className: "controlPanelSection"}, "BVL QC Type"), 
                React.createElement("ul", {className: "controlPanel"}, 
                    React.createElement("li", null, "Not Done"), 
                    React.createElement("li", null, "Visual"), 
                    React.createElement("li", null, "Hardcopy")
                ), 
                React.createElement("h3", {className: "controlPanelSection"}, "BVL QC Status"), 
                React.createElement("ul", {className: "controlPanel"}, 
                    React.createElement("li", null, "Not Done"), 
                    React.createElement("li", null, "Complete")
                )
            );
        return (
                React.createElement(LorisSidebar, {Content: content})
               );
    }
});
CandidateVisitInstrumentList = React.createClass({displayName: 'CandidateVisitInstrumentList',
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

        return React.createElement("div", {id: "page", className: "container-fluid"}, 
            React.createElement("div", {className: "wrapper"}, 
                    React.createElement(InstrumentSidebar, null), 
                    React.createElement("div", {id: "page-content-wrapper"}, 

                    React.createElement("div", {className: "page-content inset"}, 
                    React.createElement(CandidateInfoTable, {
                        CandID: this.props.CandID, 
                        DoB: this.props.CandData.Meta.DoB, 
                        Gender: this.props.CandData.Meta.Gender}
                    ), 

                    React.createElement(SessionStageTable, {Stages: this.props.VisitData.Stages}), 
                    React.createElement(InstrumentListTable, {
                        Instruments: this.props.VisitInstruments.Instruments, 
                        InstrumentDetails: this.state.InstrumentDetails, 
                        CandID: this.props.CandID, 
                        Visit: this.props.Visit})
                    )
                    )
                    )
        );
    }
});

SelectionFilter = React.createClass({displayName: 'SelectionFilter',
    changeFilter: function(e) {
        if(this.props.onFilterChange) {
            this.props.onFilterChange(e.target.name, e.target.value);
        }
    },
    render: function() {
        return (
                React.createElement("div", {className: "panel panel-primary"}, 
                React.createElement("div", {className: "panel-heading"}, "Selection Filter"), 
                React.createElement("div", {className: "panel-body"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "form-group col-sm-4"}, 
                        React.createElement("label", {className: "col-sm-12 col-md-4"}, "PSCID"), 
                        React.createElement("div", {className: "col-sm-12 col-md-8"}, 
                            React.createElement("input", {name: "PSCID", type: "text", className: "form-control input-sm", onChange: this.changeFilter})
                        )
                    ), 
                    React.createElement("div", {className: "form-group col-sm-4"}, 
                        React.createElement("label", {className: "col-sm-12 col-md-4"}, "DCCID"), 
                        React.createElement("div", {className: "col-sm-12 col-md-8"}, 
                            React.createElement("input", {name: "CandID", type: "text", className: "form-control input-sm", onChange: this.changeFilter})
                        )
                    ), 
                    React.createElement("div", {className: "form-group col-sm-4"}, 
                        React.createElement("label", {className: "col-sm-12 col-md-4"}, "Visit Label"), 
                        React.createElement("div", {className: "col-sm-12 col-md-8"}, 
                            React.createElement("select", {name: "Visit_label", className: "form-control input-sm"}, 
                                React.createElement("option", {value: ""}, "All"), 
                                React.createElement("option", {value: "V03"}, "V03"), 
                                React.createElement("option", {value: "V06"}, "V06"), 
                                React.createElement("option", {value: "V09"}, "V09"), 
                                React.createElement("option", {value: "V09LENA"}, "V09LENA"), 
                                React.createElement("option", {value: "V12"}, "V12"), 
                                React.createElement("option", {value: "V15"}, "V15"), 
                                React.createElement("option", {value: "V15LENA"}, "V15LENA"), 
                                React.createElement("option", {value: "V18"}, "V18"), 
                                React.createElement("option", {value: "V24"}, "V24"), 
                                React.createElement("option", {value: "V36"}, "V36")
                            )
                        )
                    )
                )
                )
                )
        );
    }
});

CandidateTableRow = React.createClass({displayName: 'CandidateTableRow',
        /*
    componentDidMount: function() {
        var that = this;
        $.ajax({
            url: "/api/v0.0.1/candidates/" + this.props.CandID,
            success: function (d) {
                d = JSON.parse(d);
                that.setState({
                    'Site' : d.Meta.Site,
                    'PSCID' : d.Meta.PSCID,
                    'Project' : d.Meta.Project,
                    'Gender' : d.Meta.Gender,
                    'DoB' : d.Meta.DoB,
                    'EDC' : d.Meta.EDC,
                    'VisitCount' : d.Visits.length
                });
            }
        });

    },
    getInitialState: function() {
        return {
            'Site' : 'Unknown',
            'Project' : 'Unknown',
            'PSCID' : 'Unknown',
            'Gender' : 'Unknown',
            'DoB' : 'Unknown',
            'EDC' : 'Unknown',
            'VisitCount' : 'Unknown'
        };
    },
        */
    render: function() {
        return (
           React.createElement("tr", null, 
              React.createElement("td", null, this.props.RowNum), 
              React.createElement("td", null, this.props.Candidate.Site), 
              React.createElement("td", null, this.props.Candidate.CandID), 
              React.createElement("td", {onClick: this.props.onPSCIDClicked}, React.createElement("a", {onClick: this.props.onPSCIDClicked}, this.props.Candidate.PSCID)), 
              React.createElement("td", null, this.props.Candidate.Gender), 
              React.createElement("td", null, "."), 
              React.createElement("td", null, this.props.Candidate.Project), 
              React.createElement("td", null, "."), 
              React.createElement("td", null, this.props.Candidate.DoB), 
              React.createElement("td", null, "."), 
              React.createElement("td", null, this.props.Candidate.EDC), 
              React.createElement("td", null, this.props.Candidate.VisitCount), 
              React.createElement("td", null, "."), 
              React.createElement("td", null, ".")
          )
          );
    }
});

CandidateListTable = React.createClass({displayName: 'CandidateListTable',
    getDefaultProps: function() {
        return {
            'StartIndex' : 0,
            'RowsPerPage' : 10,
            'Filters' : {}
        };
    },
    PSCIDClicked: function(CandID) {
        var that = this;
        return function(e) {
            if(that.props.onPSCIDClicked) {
                that.props.onPSCIDClicked(CandID);
            }
        };
    },
    render: function() {
        var candidateRows = [];
        var numDisplayed = 0;

        for(var i = this.props.StartIndex;i < this.props.Candidates.length && candidateRows.length < this.props.RowsPerPage; i += 1) {
            var candidate = this.props.Candidates[i];
            if(this.props.Filters.PSCID) {
                if(candidate.PSCID.toLowerCase().indexOf(this.props.Filters.PSCID.toLowerCase()) === -1) {
                    continue;
                }
            }
            if(this.props.Filters.CandID) {
                if(candidate.CandID.indexOf(this.props.Filters.CandID) === -1) {
                    continue;
                }
            }
            candidateRows.push(
                    React.createElement(CandidateTableRow, {
                        Candidate: candidate, 
                        RowNum: i+1, 
                        key: candidate.CandID, onPSCIDClicked: this.PSCIDClicked(candidate.CandID)}) );

        }
        return (
                React.createElement("table", {className: "table table-hover table-primary table-bordered"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", {className: "info"}, "No."), 
                            React.createElement("th", {className: "info"}, "Site"), 
                            React.createElement("th", {className: "info"}, "DCCID"), 
                            React.createElement("th", {className: "info"}, "PSCID"), 
                            React.createElement("th", {className: "info"}, "Gender"), 
                            React.createElement("th", {className: "info"}, "Participant Status"), 
                            React.createElement("th", {className: "info"}, "Project"), 
                            React.createElement("th", {className: "info"}, "Subproject"), 
                            React.createElement("th", {className: "info"}, "DoB"), 
                            React.createElement("th", {className: "info"}, "Scan Done"), 
                            React.createElement("th", {className: "info"}, "EDC"), 
                            React.createElement("th", {className: "info"}, "Visit Count"), 
                            React.createElement("th", {className: "info"}, "Latest Visit Status"), 
                            React.createElement("th", {className: "info"}, "Feedback")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        candidateRows
                    )
                )
               );
    }
});
CandidateListApp = React.createClass({displayName: 'CandidateListApp',
    getInitialState: function() {
        return {
            'Candidates': [],
            'PageNumber' : 1,
            'Filters' : {}
        };
    },
    changePage: function(i) {
        this.setState({
            'PageNumber' : i
        });
    },
    componentDidMount: function() {
        var that = this;
        $.ajax({
            url: "/api/v0.0.1/candidates/",
            success: function (d) {
                var d = JSON.parse(d);
                that.setState({
                    'Candidates' : d.Candidates
                });
            }
        });
    },
    changeFilter: function(filter, value) {
        var filters = this.state.Filters;
        filters[filter] = value;
        this.setState(filters);
    },
    render: function () {
        return (
                React.createElement("div", null, 
                    React.createElement(SelectionFilter, {onFilterChange: this.changeFilter}), 
                    React.createElement(PaginationLinks, {Total: this.state.Candidates.length, RowsPerPage: 10, Active: this.state.PageNumber, 
                        onChangePage: this.changePage}
                    ), 
                    React.createElement(CandidateListTable, {
                        Candidates: this.state.Candidates, 
                        onPSCIDClicked: this.props.onPSCIDClicked, 
                        StartIndex: (this.state.PageNumber-1)*10, 
                        Filters: this.state.Filters, 
                        RowsPerPage: 10}
                    )
                )
               );
    }
});


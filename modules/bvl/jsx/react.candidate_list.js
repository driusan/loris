SelectionFilter = React.createClass({
    changeFilter: function(e) {
        if(this.props.onFilterChange) {
            this.props.onFilterChange(e.target.name, e.target.value);
        }
    },
    render: function() {
        return (
                <div className="panel panel-primary">
                <div className="panel-heading">Selection Filter</div>
                <div className="panel-body">
                <div className="row">
                    <div className="form-group col-sm-4">
                        <label className="col-sm-12 col-md-4">PSCID</label>
                        <div className="col-sm-12 col-md-8">
                            <input name="PSCID" type="text" className="form-control input-sm" onChange={this.changeFilter} />
                        </div>
                    </div>
                    <div className="form-group col-sm-4">
                        <label className="col-sm-12 col-md-4">DCCID</label>
                        <div className="col-sm-12 col-md-8">
                            <input name="CandID" type="text" className="form-control input-sm" onChange={this.changeFilter}/>
                        </div>
                    </div>
                    <div className="form-group col-sm-4">
                        <label className="col-sm-12 col-md-4">Visit Label</label>
                        <div className="col-sm-12 col-md-8">
                            <select name="Visit_label" className="form-control input-sm">
                                <option value=''>All</option>
                                <option value='V03' >V03</option>
                                <option value='V06' >V06</option>
                                <option value='V09' >V09</option>
                                <option value='V09LENA' >V09LENA</option>
                                <option value='V12' >V12</option>
                                <option value='V15' >V15</option>
                                <option value='V15LENA' >V15LENA</option>
                                <option value='V18' >V18</option>
                                <option value='V24' >V24</option>
                                <option value='V36' >V36</option>
                            </select>
                        </div>
                    </div>
                </div>
                </div>
                </div>
        );
    }
});

CandidateTableRow = React.createClass({
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
           <tr>
              <td>{this.props.RowNum}</td>
              <td>{this.props.Candidate.Site}</td>
              <td>{this.props.Candidate.CandID}</td>
              <td onClick={this.props.onPSCIDClicked}><a onClick={this.props.onPSCIDClicked}>{this.props.Candidate.PSCID}</a></td>
              <td>{this.props.Candidate.Gender}</td>
              <td>.</td>
              <td>{this.props.Candidate.Project}</td>
              <td>.</td>
              <td>{this.props.Candidate.DoB}</td>
              <td>.</td>
              <td>{this.props.Candidate.EDC}</td>
              <td>{this.props.Candidate.VisitCount}</td>
              <td>.</td>
              <td>.</td>
          </tr>
          );
    }
});

CandidateListTable = React.createClass({
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
                    <CandidateTableRow
                        Candidate={candidate}
                        RowNum={i+1}
                        key={candidate.CandID} onPSCIDClicked={this.PSCIDClicked(candidate.CandID)} /> );

        }
        return (
                <table className="table table-hover table-primary table-bordered">
                    <thead>
                        <tr>
                            <th className="info">No.</th>
                            <th className="info">Site</th>
                            <th className="info">DCCID</th>
                            <th className="info">PSCID</th>
                            <th className="info">Gender</th>
                            <th className="info">Participant Status</th>
                            <th className="info">Project</th>
                            <th className="info">Subproject</th>
                            <th className="info">DoB</th>
                            <th className="info">Scan Done</th>
                            <th className="info">EDC</th>
                            <th className="info">Visit Count</th>
                            <th className="info">Latest Visit Status</th>
                            <th className="info">Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidateRows}
                    </tbody>
                </table>
               );
    }
});
CandidateListApp = React.createClass({
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
                <div>
                    <SelectionFilter onFilterChange={this.changeFilter}/>
                    <PaginationLinks Total={this.state.Candidates.length} RowsPerPage={10} Active={this.state.PageNumber}
                        onChangePage={this.changePage}
                    />
                    <CandidateListTable
                        Candidates={this.state.Candidates}
                        onPSCIDClicked={this.props.onPSCIDClicked}
                        StartIndex={(this.state.PageNumber-1)*10}
                        Filters={this.state.Filters}
                        RowsPerPage={10}
                    />
                </div>
               );
    }
});


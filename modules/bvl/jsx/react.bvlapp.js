LorisBVLApp = React.createClass({
    getInitialState: function() {
        if(window.location.hash.length > 0) {
            var components = window.location.hash.split("/");
            // 0 = #, 1 = CandID, 2 = Visit
            if(components.length == 2) {
                this.selectCandidate(components[1]);
                return {
                    'CandID' : components[1]
                }
            } else if (components.length === 3) {
                this.selectCandidate(components[1]);
                this.selectVisit(components[1], components[2]);
                return {
                    'CandID' : components[1],
                    'Visit' : components[2]
                }
            }
        }
        history.pushState({},
        "Loris Candidate List",
        "#/");
        return {
        };

    },
    selectCandidate: function(CandID) {
        var that = this;
        $.ajax({
            url: "/api/v0.0.1/candidates/" + CandID,
            success: function (d) {
                d = JSON.parse(d);
                that.setState({CandData : d});

            }
        });
        this.setState({ 'CandID' : CandID, Visit : false});
        history.pushState({
            'CandID' : CandID
        },
        "Loris Candidate " + CandID,
        "#/" + CandID);
    },
    selectVisit(CandID, Visit) {
        // TODO: Convert these to promises
        var that = this;
        $.ajax({
            url: "/api/v0.0.1/candidates/" + CandID + "/" + Visit,
            success: function (d) {
                d = JSON.parse(d);
                that.setState({VisitData : d});
            }
        });
        $.ajax({
            url: "/api/v0.0.1/candidates/" + CandID + "/" + Visit + "/instruments",
            success: function (d) {
                d = JSON.parse(d);
                that.setState({VisitInstruments: d});
            }
        });
        history.pushState({
            'CandID' : CandID,
            'Visit' : Visit
        },
        "Loris Candidate " + CandID + " Visit " + Visit,
        "#/" + CandID + "/" + Visit);
        this.setState({ 'CandID' : CandID, 'Visit' : Visit });
    },
    componentDidMount: function() {
        var that = this;
        var components = window.location.hash;
        if(window.location.hash === '#' || window.location.hash === '') {
            history.pushState({}, "Loris Behavioural Module", "#");
        }
        window.addEventListener("popstate", function(e) {
            console.log(e);
            if(e.state.Visit) {
                that.selectVisit(e.state.CandID, e.state.Visit);
            } else if(e.state.CandID) {
                that.selectCandidate(e.state.CandID);
            } else {
                that.replaceState({});
            }

        });
    },
    render: function() {
        if (this.state.CandID === undefined || this.state.CandID === false) {
            return <CandidateListApp onPSCIDClicked={this.selectCandidate} />
        }
        if (this.state.Visit === undefined || this.state.Visit === false) {
            return <CandidateVisitList CandID={this.state.CandID} CandData={this.state.CandData} onVisitClicked={this.selectVisit}/>
        }
        return <CandidateVisitInstrumentList CandID={this.state.CandID} CandData={this.state.CandData} Visit={this.state.Visit} VisitData={this.state.VisitData} VisitInstruments={this.state.VisitInstruments} />
    }
});
RLorisBVLApp = React.createFactory(LorisBVLApp);

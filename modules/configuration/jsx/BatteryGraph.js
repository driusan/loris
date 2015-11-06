var TimeTab = React.createClass({
    componentDidMount: function() {
        var that = this;
        var baseDate = new Date();
        $.ajax("AjaxHelper.php?Module=configuration&script=GetBatteryData.php&SubprojectID=" + this.props.SubprojectID,
            {
                success: function(data) {
                    data = JSON.parse(data);
                    var battery = [];

                    for(var i =0 ; i < data.length; i += 1) {
                        var row = data[i];
                        battery.push({
                            "startDate" : d3.time.day.offset(baseDate, parseInt(row.AgeMinDays)),
                            "endDate" : d3.time.day.offset(baseDate, parseInt(row.AgeMaxDays)),
                            "taskName" : row.TestName,
                            "status" : "RUNNING"
                        });
                    }
                    
                    that.setState({
                        'Battery' : battery
                    });
                    that.redrawGantt();
                }
            }
        );
        this.redrawGantt();
    },
    redrawGantt: function() {
        var taskNames = this.props.Tests;
        if(taskNames.length > 0) {
            var node = $(this.getDOMNode()).find(".graph")[0];
            var gantt = d3.gantt().renderTo(node).width($(node).width()).height(taskNames.length*20).taskTypes(taskNames).tickFormat("%Y-%m-%d");
            gantt(this.state.Battery);
        }
    },
    getInitialState: function() {
        return {
            'Battery' : {
            }
        }
    },
    render: function() {
        return (
            <div>
                <div className="col-md-8 graph">
                </div>
                <div className="col-md-4">
                    Info goes here
                </div>
            </div>
        );
    }
});
var VisitList = React.createClass({
    getDefaultProps: function() {
        return {Tests : []};
    },
    render: function() {
        var tests = this.props.Tests.map(function(testname) {
            return <li>{testname}</li>;
        });
        return (
            <ul>
                {tests}
            </ul>); 
    }
});
var VisitTab = React.createClass({
    getInitialState: function() {
        return {
            'Visits' : [],
            'Tests' : {},
            'ActiveVisit' : '',
        };
    },
    componentDidMount: function() {
        var that = this;
        var baseDate = new Date();
        $.ajax("AjaxHelper.php?Module=configuration&script=GetVisits.php&SubprojectID=" + this.props.SubprojectID,
            {
                success: function(data) {
                    data = JSON.parse(data);
                    var Visits = Object.keys(data);
                    if(Visits.length > 0) {
                        that.setState({
                            'Visits' : Visits,
                            'Tests' : data,
                            'ActiveVisit' : Visits[0]
                        });
                    }
                }
            }
        );
    },
    changeActive: function(Visit) {
        var that = this;
        return function(e) {
            e.preventDefault();
            that.setState({
                'ActiveVisit' : Visit
            });
        };
    },
    render: function() {
        var that = this;
        var visitsUL = this.state.Visits.map(function(Visit) {
            if(that.state.ActiveVisit === Visit) {
                return <li className="active" ><a href="#" onClick={that.changeActive(Visit)}>{Visit}</a></li>;
            }
            return <li><a href="#" onClick={that.changeActive(Visit)}>{Visit}</a></li>;
        });

        return (
            <div>
                <div className="col-xs-4">
                    <ul className="nav nav-pills nav-stacked">
                        {visitsUL}
                    </ul>
                </div>
                <div className="col-xs-8">
                    <VisitList Tests={this.state.Tests[this.state.ActiveVisit]} />
                </div>
            </div>
        );
    }
});
var BatteryGraph = React.createClass({
    componentDidMount: function() {
        var that = this;
        $.ajax("AjaxHelper.php?Module=configuration&script=GetTestNames.php",
            {
                success: function(data) {
                    that.setState({
                        'Tests' : JSON.parse(data)
                    });
                }
            }
        );
    },
    getInitialState: function() {
        return {
            'Selected' : 'time',
            'Tests' : []
        };
    },
    changeTab: function(tab) {
        var that = this;
        return function() {
            that.setState({'Selected' : tab });
        };
    },
    render: function() {
        var activeTab;
        if(this.state.Selected === 'time') {
            activeTab = <TimeTab SubprojectID={this.props.SubprojectID} Tests={this.state.Tests}/>
        } else {
            activeTab = <VisitTab SubprojectID={this.props.SubprojectID} Tests={this.state.Tests}/>
        }
        return (
            <div>
                <nav>
                <ul className="nav nav-tabs">
                    <li role="presentation" onClick={this.changeTab("time")} className={this.state.Selected === 'time' ? "active" : ''}><a href="#">Time Based</a></li>
                    <li role="presentation" onClick={this.changeTab("visit")} className={this.state.Selected === 'visit' ? "active" : ''}><a href="#">Visit Label Based</a></li>
                </ul>
                </nav>
                <div className="panel panel-default">
                    <div className="panel-body">
                        {activeTab}
                    </div>
                </div>
            </div>
        );

    }
});
RBatteryGraph = React.createFactory(BatteryGraph);


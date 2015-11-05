var TimeTab = React.createClass({
    componentDidMount() {
        var that = this;
        var baseDate = new Date();
        $.ajax("AjaxHelper.php?Module=configuration&script=GetTestNames.php",
            {
                success: function(data) {
                    that.setState({
                        'TestNames' : JSON.parse(data)
                    });
                }
            }
        );
        $.ajax("AjaxHelper.php?Module=configuration&script=GetBatteryData.php",
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
    redrawGantt() {
        var taskNames = this.state.TestNames;
        if(taskNames.length > 0) {
            var node = $(this.getDOMNode()).find(".graph")[0];
            var gantt = d3.gantt().renderTo(node).width($(node).width()).taskTypes(taskNames).tickFormat("%Y-%m-%d");
            gantt(this.state.Battery);
        }
    },
    getInitialState: function() {
        return {
            'TestNames' : [],
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
var VisitTab = React.createClass({
    render: function() {
        return (
            <div>Under construction</div>
        );
    }
});
var BatteryGraph = React.createClass({
    getInitialState: function() {
        return {
            'Selected' : 'time'
        };
    },
    changeTab: function(tab) {
        var that = this;
        return function() {
            that.setState({'Selected' : tab });
        };
    },
    render: function() {
        var active;
        if(this.state.Selected === 'time') {
            active = <TimeTab />
        } else {
            active = <VisitTab />
        }
        return (
            <div>
                <nav>
                <ul className="nav nav-tabs">
                    <li role="presentation" onClick={this.changeTab("time")}>Time Based</li>
                    <li role="presentation" onClick={this.changeTab("visit")}>Visit Label Based</li>
                </ul>
                </nav>
                <div className="panel panel-default">
                    <div className="panel-body">
                        {active}
                    </div>
                </div>
            </div>
        );

    }
});
RBatteryGraph = React.createFactory(BatteryGraph);


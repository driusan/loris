var TimeTab = React.createClass({
    componentDidMount() {
        var that = this;
        var baseDate = new Date();
        $.ajax("AjaxHelper.php?Module=configuration&script=GetTestNames.php", {
            success: function (data) {
                that.setState({
                    'TestNames': JSON.parse(data)
                });
            }
        });
        $.ajax("AjaxHelper.php?Module=configuration&script=GetBatteryData.php", {
            success: function (data) {
                data = JSON.parse(data);
                var battery = [];

                for (var i = 0; i < data.length; i += 1) {
                    var row = data[i];
                    battery.push({
                        "startDate": d3.time.day.offset(baseDate, parseInt(row.AgeMinDays)),
                        "endDate": d3.time.day.offset(baseDate, parseInt(row.AgeMaxDays)),
                        "taskName": row.TestName,
                        "status": "RUNNING"
                    });
                }

                that.setState({
                    'Battery': battery
                });
                that.redrawGantt();
            }
        });
        this.redrawGantt();
    },
    redrawGantt() {
        var taskNames = this.state.TestNames;
        if (taskNames.length > 0) {
            var node = $(this.getDOMNode()).find(".graph")[0];
            var gantt = d3.gantt().renderTo(node).width($(node).width()).taskTypes(taskNames).tickFormat("%Y-%m-%d");
            gantt(this.state.Battery);
        }
    },
    getInitialState: function () {
        return {
            'TestNames': [],
            'Battery': {}
        };
    },
    render: function () {
        return React.createElement(
            "div",
            null,
            React.createElement("div", { className: "col-md-8 graph" }),
            React.createElement(
                "div",
                { className: "col-md-4" },
                "Info goes here"
            )
        );
    }
});
var VisitTab = React.createClass({
    render: function () {
        return React.createElement(
            "div",
            null,
            "Under construction"
        );
    }
});
var BatteryGraph = React.createClass({
    getInitialState: function () {
        return {
            'Selected': 'time'
        };
    },
    changeTab: function (tab) {
        var that = this;
        return function () {
            that.setState({ 'Selected': tab });
        };
    },
    render: function () {
        var active;
        if (this.state.Selected === 'time') {
            active = React.createElement(TimeTab, null);
        } else {
            active = React.createElement(VisitTab, null);
        }
        return React.createElement(
            "div",
            null,
            React.createElement(
                "nav",
                null,
                React.createElement(
                    "ul",
                    { className: "nav nav-tabs" },
                    React.createElement(
                        "li",
                        { role: "presentation", onClick: this.changeTab("time") },
                        "Time Based"
                    ),
                    React.createElement(
                        "li",
                        { role: "presentation", onClick: this.changeTab("visit") },
                        "Visit Label Based"
                    )
                )
            ),
            React.createElement(
                "div",
                { className: "panel panel-default" },
                React.createElement(
                    "div",
                    { className: "panel-body" },
                    active
                )
            )
        );
    }
});
RBatteryGraph = React.createFactory(BatteryGraph);
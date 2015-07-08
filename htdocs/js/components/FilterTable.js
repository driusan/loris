FilterTable = React.createClass({displayName: 'FilterTable',
    mixins: [React.addons.PureRenderMixin],
    propTypes: {
        'Module' : React.PropTypes.string.isRequired,
    },
    getInitialState: function() {
        return { 'collapsed' : false }
    },
    toggleCollapsed: function() {
        this.setState({ 'collapsed' : !this.state.collapsed });
    },
    render: function() {
        var children, glyph, formURL = "main.php?test_name=" + this.props.Module;
        if(this.state.collapsed === false) {
            children = React.createElement("div", {className: "panel-body"}, 
                        React.createElement("form", {method: "post", action: formURL}, 
                            this.props.children
                        )
                       );

        }
        glyph = "glyphicon " + (this.state.collapsed ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up') + " pull-right";

        return (
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-sm-9"}, 
                        React.createElement("div", {className: "panel panel-primary"}, 
                            React.createElement("div", {className: "panel-heading", onClick: this.toggleCollapsed}, 
                                "Selection Filter ", React.createElement("span", {className: glyph})
                            ), 
                            children
                        )
                    )

                )
       );
    }
});

FilterField = React.createClass({displayName: 'FilterField',
    mixins: [React.addons.PureRenderMixin],
    propTypes: {
        'Label' : React.PropTypes.string.isRequired,
        'FormName' : React.PropTypes.string.isRequired,
        'Type' : React.PropTypes.oneOf(['Dropdown', 'Text'])
    },
    getDefaultProps: function() {
        return {
            'Type' : "Text",
        };
    },
    render: function() {
        var item = React.createElement("div", null);
        if(this.props.Type === 'Text') {
            item = React.createElement("div", {className: "col-sm-12 col-md-8"}, 
                    React.createElement("input", {name: this.props.FormName, type: "text", className: "form-control input-sm"})
                )
        }
        return React.createElement("div", {className: "form-group col-sm-6"}, 
                React.createElement("label", {className: "col-sm-12 col-md-4"}, this.props.Label), 
                item
            )
    }
});

FilterActions = React.createClass({displayName: 'FilterActions',
    mixins: [React.addons.PureRenderMixin],
    propTypes: {
        'Module' : React.PropTypes.string.isRequired,
    },
    resetFilters: function() {
        location.href = 'main.php?test_name=' + this.props.Module + "&reset=true";
    },
    render: function() {
        return React.createElement("div", null, 
                    React.createElement("div", {className: "form-group col-md-2"}, 
                        React.createElement("input", {type: "submit", className: "btn btn-sm btn-primary col-xs-12", name: "filter", value: "Show Data"})
                    ), 
                    React.createElement("div", {className: "form-group col-md-2"}, 
                        React.createElement("input", {type: "button", name: "reset", value: "Clear Form", className: "btn btn-sm btn-primary col-xs-12", onClick: this.resetFilters})
                    )
            )
    }
});

DICOMFilterTable = React.createClass({displayName: 'DICOMFilterTable',
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        return (React.createElement(FilterTable, {Module: "dicom_archive"}, 
                React.createElement("div", {className: "row"}, 
                    React.createElement(FilterField, {Label: "Site", Type: "Dropdown", Options: ["All", "DCC"], FormName: "SiteID"}), 
                    React.createElement(FilterField, {Label: "Patient ID", Type: "Text", FormName: "PatientID"})
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement(FilterField, {Label: "Patient Name", Type: "Text", FormName: "PatientName"}), 
                    React.createElement(FilterField, {Label: "Gender", Type: "Text", FormName: "Gender"})
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement(FilterField, {Label: "Date of Birth", Type: "Text", FormName: "DoB"}), 
                    React.createElement(FilterField, {Label: "Acquisition Date", Type: "Text", FormName: "Acquisition"})
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement(FilterField, {Label: "Archive Location", Type: "Text", FormName: "Location"}), 
                    React.createElement(FilterActions, {Module: "dicom_archive"})
                )
        )
        );
    }

});
RFilterTable = React.createFactory(FilterTable);
RDICOMFilterTable = React.createFactory(DICOMFilterTable);

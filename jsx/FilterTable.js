FilterTable = React.createClass({
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
            children = <div className="panel-body">
                        <form method="post" action={formURL}>
                            {this.props.children}
                        </form>
                       </div>;

        }
        glyph = "glyphicon " + (this.state.collapsed ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up') + " pull-right";

        return (
                <div className="row">
                    <div className="col-sm-9">
                        <div className="panel panel-primary">
                            <div className="panel-heading" onClick={this.toggleCollapsed}>
                                Selection Filter <span className={glyph}></span>
                            </div>
                            {children}
                        </div>
                    </div>

                </div>
       );
    }
});

FilterField = React.createClass({
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
        var item = <div></div>;
        if(this.props.Type === 'Text') {
            item = <div className="col-sm-12 col-md-8">
                    <input name={this.props.FormName} type="text" className="form-control input-sm" />
                </div>
        }
        return <div className="form-group col-sm-6">
                <label className="col-sm-12 col-md-4">{this.props.Label}</label>
                {item}
            </div>
    }
});

FilterActions = React.createClass({
    mixins: [React.addons.PureRenderMixin],
    propTypes: {
        'Module' : React.PropTypes.string.isRequired,
    },
    resetFilters: function() {
        location.href = 'main.php?test_name=' + this.props.Module + "&reset=true";
    },
    render: function() {
        return <div>
                    <div className="form-group col-md-2">
                        <input type="submit" className="btn btn-sm btn-primary col-xs-12" name="filter" value="Show Data" />
                    </div>
                    <div className="form-group col-md-2">
                        <input type="button" name="reset" value="Clear Form" className="btn btn-sm btn-primary col-xs-12" onClick={this.resetFilters} />
                    </div>
            </div>
    }
});

DICOMFilterTable = React.createClass({
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        return (<FilterTable Module="dicom_archive">
                <div className="row">
                    <FilterField Label="Site" Type="Dropdown" Options={["All", "DCC"]} FormName="SiteID" />
                    <FilterField Label="Patient ID" Type="Text" FormName="PatientID" />
                </div>
                <div className="row">
                    <FilterField Label="Patient Name" Type="Text" FormName="PatientName" />
                    <FilterField Label="Gender" Type="Text" FormName="Gender" />
                </div>
                <div className="row">
                    <FilterField Label="Date of Birth" Type="Text" FormName="DoB" />
                    <FilterField Label="Acquisition Date" Type="Text" FormName="Acquisition" />
                </div>
                <div className="row">
                    <FilterField Label="Archive Location" Type="Text" FormName="Location" />
                    <FilterActions Module="dicom_archive" />
                </div>
        </FilterTable>
        );
    }

});
RFilterTable = React.createFactory(FilterTable);
RDICOMFilterTable = React.createFactory(DICOMFilterTable);

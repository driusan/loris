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

DICOMDataTable = React.createClass({displayName: 'DICOMDataTable',
    render: function() {
        return React.createElement(StaticDataTable, {Headers: this.props.Headers, Data: this.props.Data});
    }
});

DICOMModule = React.createClass({displayName: 'DICOMModule',
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        var changePage = function(pageNum) {
            location.href="main.php?test_name=dicom_archive&pageID=" + pageNum;
        };

        return (
                React.createElement("div", null, 
                    React.createElement(DICOMFilterTable, null), 

                        React.createElement("div", {className: "row"}, 
                            React.createElement("div", {className: "col-xs-12 col-md-9"}, 
                                this.props.TotalTimepoints, " timepoints selected"
                            ), 
                            React.createElement("div", {className: "col-md-3 col-sm-12 col-md"}, 
                                React.createElement(PaginationLinks, {Total: this.props.TotalTimepoints, RowsPerPage: this.props.RowsPerPage, onChangePage: changePage, Active: this.props.PageNumber})
                            )
                        ), 
                        React.createElement(DICOMDataTable, {Headers: this.props.Headers, Data: this.props.Data})
                )
        );
    }
});

RDICOMModule = React.createFactory(DICOMModule);


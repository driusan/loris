LorisSidebar = React.createClass({displayName: 'LorisSidebar',
    render: function() {
        return (
                React.createElement("div", {id: "sidebar-wrapper", className: "sidebar-div"}, 
                    React.createElement("div", {id: "sidebar-content"}, 
                        this.props.Content
                    )
                )
               );
    }
});

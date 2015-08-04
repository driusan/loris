

LorisSidebar = React.createClass({
    render: function() {
        return (
                <div id="sidebar-wrapper" className="sidebar-div">
                    <div id="sidebar-content">
                        {this.props.Content} 
                    </div>
                </div>
               );
    }
});

<div id="accessprofilewidget"></div>
<script>
    ReactDOM.render(
        React.createElement(
            lorisjs.candidate_list.accesswidget.default,
            {
                'BaseURL': "{$BaseURL}",
                'AccessWidget': true,
                'QRWidget': true,
            },
            null,
        ),
        document.getElementById('accessprofilewidget'),
    );
</script>

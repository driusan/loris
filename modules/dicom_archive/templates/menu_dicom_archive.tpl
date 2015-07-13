<div id="dicomModule"></div>
<script>
    /* Convert the $items array from the format that Smarty passes it, into a simple array of rows of data*/
    var data = {$items|@json_encode};
    data = data.map(function(row) {
        var values = row.map(function(item) {
            return item.value;
        });
        // Don't include the row number that came from smarty StaticDataTable will add it itself
        return values.slice(1);
    });
    var dicomModule = RDICOMModule({
        RowsPerPage : {$rowsPerPage},
        PageNumber : {$pageID},
        TotalTimepoints: {$numTimepoints},
        Headers: ["{'","'|implode:$simpleHeaders|escape:"js"}"],
        Data: data
    }
    );
    React.render(dicomModule, document.getElementById("dicomModule"));
</script>

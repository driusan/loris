<script src="/js/react-with-addons-0.13.3.js"></script>
<script src="/js/components/PaginationLinks.js"></script>
<script src="GetJS.php?Module=bvl&file=react.sidebar.js"></script>
<script src="GetJS.php?Module=bvl&file=react.candidate_list.js"></script>
<script src="GetJS.php?Module=bvl&file=react.timepoint_list.js"></script>
<script src="GetJS.php?Module=bvl&file=react.instrument_list.js"></script>
<script src="GetJS.php?Module=bvl&file=react.bvlapp.js"></script>
<div id="reactTest">
</div>

<script>
var queryApp = RLorisBVLApp();
React.render(queryApp, document.getElementById("reactTest"));
</script>

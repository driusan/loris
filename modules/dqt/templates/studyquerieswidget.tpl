<script>
function getMatchCount(QueryID, domEl) {
    console.log('Getting count for', QueryID);
    fetch(
      loris.BaseURL + '/dqt/queries/'
        + QueryID + '/count',
      {
         method: 'GET',
         credentials: 'same-origin',
      }).then((resp) => {
          console.log(resp);
         if (!resp.ok) {
           throw new Error('Could not get count.');
         }
         return resp.json();
      }).then((result) => {
          console.log(result, domEl);
          domEl.textContent = result.count;
      });
}
</script>
<div class="list-group">
    {foreach from=$queries item=query}
        <a href="{$baseURL}/dqt/?queryID={$query.QueryID}" class="list-group-item">
            {$query.Name}
            <span class="pull-right text-muted small">Candidate matches:
                <span id="studyquerymatch_{$query.QueryID}"></span>
            </span>
            <script>
            window.addEventListener('load', function() {
                getMatchCount(
                    {$query.QueryID},
                    document.getElementById("studyquerymatch_{$query.QueryID}")
                );
            });
            </script>
        </a>
        
    {/foreach}
</div>
<div style="padding-bottom: 1em; font-style: italic">
Note: matches count only includes candidates that you have access to. Results may vary from other users due to permissions.
</div>

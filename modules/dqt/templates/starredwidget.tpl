<div class="list-group">
    {foreach from=$starredqueries item=query}
        <a href="{$baseURL}/dqt/?queryID={$query.QueryID}" class="list-group-item">
            <span class="fa-stack">
                <i style="color: yellow"
                   class="fas fa-star fa-stack-1x"
                ></i>
                <i style="color: black"
                   class="far fa-star fa-stack-1x"
                ></i>
            </span>
            {$query.Name}
        </a>
    {/foreach}
    <ul>
        <li>Saved query should be above here</li>
    </ul>
</div>

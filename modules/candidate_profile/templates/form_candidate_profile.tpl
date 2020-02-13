<div id="candidatedashboard"></div>

{section name=widget loop=$widgets}
<script src="{$widgets[widget]->getJSURL()}" type="text/javascript"></script>
{/section}

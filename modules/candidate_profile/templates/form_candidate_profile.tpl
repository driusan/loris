<div id="candidatedashboard"></div>

{section name=widget loop=$widgets}
{assign var="widget" value=$widgets[widget]}
<script src="{$widgets[widget]->getJSURL()}" type="text/javascript"></script>
<script>
window.addEventListener('dashboardloaded', () => {
    window.dispatchEvent(
        new CustomEvent('registercard', {
            detail: {
                title: 'Behavioural Data ',
                content: React.createElement(
                    {$widget->getComponentName()},
                    {$widget->getComponentProps()|json_encode}
                )
                {if $widget->getWidth()},width: {$widget->getWidth()}{/if}
            },
        })
    );
});
</script>

{/section}

function ZJSONPage(props) {
    const elements = props.elements.map( (name) => {
        const elementSchema = props.schema.elements[name];
        // const elementUI = props.ui[name];
        // FIXME: Use ui from ZJSON

        const label= elementSchema.description[props.defaultLang];
        switch (elementSchema.type) {
            // DATA Element types
        case 'enum':
            // FIXME: Support all options in ZJSON spec
            // missing:
            //    - allowMultipleValues
            //    - requireResponse
            //    - readOnly
            //    - hideInSurvey
            //    - showDesc
            //    - correctResponse
            //    - isSavable (sic)

            let options = {};
            for (const value of elementSchema.options.values) {
                options[value.value] = value.description[props.defaultLang];
            }
            return <SelectElement
                name={name}
                options={options}
                label={label}
                value={options}
                multiple={false}
                emptyOption={true}
            />;
        case 'string':
            // FIXME: Support all options in ZJSON spec
            return <TextboxElement
                        name={name}
                        label={label}
                    />;
        // FIXME: Implement below this line. 
        case 'integer':
        case 'decimal':

        case 'date':
        case 'time':
        case 'datetime':

        case 'boolean':

        // FIXME: Comment on the spec that this doesn't seem necessary given
        // the hideInSurvey option. The score field should be encapsulated
        // by one of the other types (or be considered "display", not a "field"
        case 'score': 

        // LAYOUT Element Types
        case 'text':
        case 'group':
        case 'row':
        case 'table':
        case 'section':
        case 'image':
            console.error('Unhandled element type');
            break;
        default:
            console.error('Invalid element type');
        }
    });
    return <div>
        <h2>{props.page.description[props.defaultLang]}</h2>
        {elements}
    </div>;
}

function ZJSONInstrument(props) {
    const schema = props.zjson.schema;
    const defaultLang = schema.meta.defaultLanguage;
    const instrumentTitle = schema.meta.longName[defaultLang];
    const pageNames = schema.setup.map(
        (obj) => {
            return obj.description[defaultLang];
    });
    const pageList = <ul>
        {pageNames.map( (name) => <li key={name}>{name}</li>)}
    </ul>;

    return <div><h1>{instrumentTitle}({defaultLang})</h1>
        <h2>Page List</h2>
        {pageList}
        <ZJSONPage
            page={schema.setup[0]}
            elements={schema.setup[0].order}
            schema={schema}
            defaultLang={defaultLang}
        />
    </div>;
}
export function RenderZJSON(json) {
    ReactDOM.render(
        <ZJSONInstrument zjson={JSON.parse(json)} />,
        document.getElementById('instrumentroot')
    );
}

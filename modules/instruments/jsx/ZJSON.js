function ZJSONPage(props) {
    const elements = props.elements.map( (name) => {
        const elementSchema = props.schema.elements[name];
        const elementUI = props.ui[name];
        if (!elementUI) {
            throw new Error('Invalid element. Missing UI.');
        }
        const label= elementSchema.description[props.defaultLang];
        switch (elementUI.type) {
            case 'select':
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
                    multiple={false}
                    emptyOption={true}
                />;
            case 'text':
            return <TextboxElement
                        name={name}
                        label={label}
                    />;
            default:
                console.error('Unhandled element type: ' + elementUI.type);
        }
    });
    return <div>
        <h2>{props.page.description[props.defaultLang]}</h2>
        {elements}
    </div>;
}

function ZJSONInstrument(props) {
    const schema = props.zjson.schema;
    const [pageNum, setPageNum] = useState(0);
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
            ui={props.zjson.ui}
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

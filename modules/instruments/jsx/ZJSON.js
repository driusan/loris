import {useState} from 'react';

function ZJSONPage(props) {
    const elements = props.elements.map( (name, idx) => {
        const elementSchema = props.schema.elements[name];
        const elementUI = props.ui[name];
        if (!elementUI) {
            throw new Error('Invalid element. Missing UI for ' + name + '.');
        }
        const label= elementSchema.description[props.defaultLang];
        switch (elementUI.type) {
            case 'select':
                if (elementSchema.type != 'enum') {
                    throw new Error(
                        'Incompatible element and UI. select UI elements'
                        + ' must be backed by an enum data type.'
                    );
                }
                // FIXME: Support all options in ZJSON spec
                // missing:
                //    - allowMultipleValues (done)
                //    - requireResponse (done)
                //    - readOnly (what does this mean?)
                //    - hideInSurvey (ignore, not a survey)
                //    - showDesc (why is this here?)
                //    - correctResponse (why is this here? )
                //    - isSavable (sic) (why is this here?)

                let options = {};
                for (const value of elementSchema.options.values) {
                    options[value.value] = value.description[props.defaultLang];
                }

                // if it's multiselect they can choose nothing, if it's a select
                // we need an empty option so that it doesn't default to the first
                // value.
                const includeEmpty = !elementSchema.allowMultipleValues;
                return <SelectElement
                    key={idx}
                    name={name}
                    required={elementSchema.requireResponse}
                    options={options}
                    label={label}
                    multiple={elementSchema.allowMultipleValues}
                    emptyOption={includeEmpty}
                />;
            case 'text':
                // FIXME: Support all valid ZJSON options here
                return <TextboxElement
                            key={idx}
                            name={name}
                            label={label}
                        />;
            case 'checkbox':
                if (elementSchema.type != 'boolean') {
                    // XXX: Allow other data types? The spec doesn't say
                    // how they should be handled.
                    throw new Error(
                        'Incompatible element and UI. checkbox UI elements'
                        + ' must be backed by a boolean data type.'
                    );
                }
                // FIXME: Support all valid ZJSON options here.
                return <CheckboxElement
                            key={idx}
                            name={name}
                            label={label}
                        />;
            case 'date':
                if (elementSchema.type != 'date') {
                    // XXX: Allow other data types? The spec doesn't say
                    // how they should be handled.
                    throw new Error(
                        'Incompatible element and UI. date UI elements'
                        + ' must be backed by a date data type.'
                    );
                }
                // FIXME: Support all valid ZJSON options here.
                return <DateElement
                            key={idx}
                            name={name}
                            label={label}
                        />;
            case 'time':
                if (elementSchema.type != 'time') {
                    // XXX: Allow other data types? The spec doesn't say
                    // how they should be handled.
                    throw new Error(
                        'Incompatible element and UI. time UI elements'
                        + ' must be backed by a time data type.'
                    );
                }
                // FIXME: Support all valid ZJSON options here.
                return <TimeElement
                            key={idx}
                            name={name}
                            label={label}
                        />;
            case 'datetime':
                if (elementSchema.type != 'datetime') {
                    // XXX: Allow other data types? The spec doesn't say
                    // how they should be handled.
                    throw new Error(
                        'Incompatible element and UI. datetime UI elements'
                        + ' must be backed by a datetime data type.'
                    );
                }
                // FIXME: Support all valid ZJSON options here.
                return <div>
                            <DateElement
                                key={idx + 'date'}
                                name={name}
                                label={label}
                            />
                            <TimeElement
                                key={idx + 'time'}
                                name={name}
                                label={label}
                            />
                        </div>;
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
        {pageNames.map( (name, idx) => {
            let style={};
            if (idx == pageNum) {
                style.fontWeight = 'bolder';
            }
            return <li key={idx} style={style}>
                <a href="#" onClick={() => setPageNum(idx)}>{name}</a>
            </li>;
        })}
    </ul>;

    return <div><h1>{instrumentTitle}({defaultLang})</h1>
        <h2>Page List</h2>
        {pageList}
        <ZJSONPage
            page={schema.setup[pageNum]}
            elements={schema.setup[pageNum].order}
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

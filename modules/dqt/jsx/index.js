// import {Component} from 'react';
// import PropTypes from 'prop-types';
// import {StepperPanel} from './components/stepper';
import ExpansionPanels from './components/expansionpanels';
import {NavigationStepper} from './navigationstepper';
import {useState, useEffect} from 'react';
import Select from 'react-select';

/**
 * Render a select with option groups that can be
 * filtered
 *
 * @param {object} props - react props
 *
 * @return {ReactDOM}
 */
function FilterableSelectGroup(props) {
    let groups = [];
    for (const [module, subcategories]
        of Object.entries(props.groups)) {
      let options = [];
      for (const [value, desc] of Object.entries(subcategories)) {
        options.push({
          value: value,
          label: desc,
          module: module,
        });
      }

      let label = {module};
      if (props.mapGroupName) {
        label = props.mapGroupName(module);
      }
      groups.push({
        label: label,
        options: options,
      });
    }

    const selected = (e) => {
        props.onChange(e.module, e.value);
    };
    return (
        <div>
            <h4>Choose a category</h4>
            <Select options={groups} onChange={selected}
                 menuPortalTarget={document.body}
                 styles={{menuPortal: (base) => ({...base, zIndex: 9999})}}
            />
        </div>
    );
}
/**
 * Render the define fields tab
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function DefineFields(props) {
  console.log('Define Fields', props.allCategories);
  console.log('Fields', props.displayedFields);

  const fields = Object.keys(props.displayedFields || {}).map((item, i) => {
      const value = props.displayedFields[item];
      console.log(value);
      const equalField = (element) => {
          return (element.module == props.module
              && element.category === props.category
              && element.field == item);
      };

      const className = props.selected.some(equalField) ?
        'list-group-item active' :
        'list-group-item';

      return (<div className={className} key={item}
                   onClick={() => props.onFieldToggle(
                        props.module,
                        props.category,
                        item,
                        value,
                   )}>
        <dt>{item}</dt>
        <dd>{value.description}</dd>
      </div>);
  });
  return (<div>
    <FilterableSelectGroup groups={props.allCategories.categories}
      mapGroupName={(key) => props.allCategories.modules[key]}
      onChange={props.onCategoryChange}
    />
    <dl className="list-group">{fields}</dl>
  </div>);
}
/**
 * Return the main page for the DQT
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function DataQueryApp(props) {
    const [activeTab, setActiveTab] = useState('Info');
    const [selectedModule, setSelectedModule] = useState(false);
    const [moduleDictionary, setModuleDictionary] = useState(false);
    const [selectedModuleCategory, setSelectedModuleCategory] = useState(false);
    const [categories, setCategories] = useState(false);
    const [selectedFields, setFields] = useState([]);

    useEffect(() => {
        if (categories !== false) {
            return;
        }
          fetch('/dictionary/categories', {credentials: 'same-origin'})
          .then((resp) => {
                  if (!resp.ok) {
                      throw new Error('Invalid response');
                  }
                  return resp.json();
          }).then((result) => {
                  setCategories(result);
                  }
          ).catch( (error) => {
                  console.error(error);
                  });
    }, []);

    useEffect(() => {
        if (selectedModule === false) {
            return;
        }
        fetch('/dictionary/module/' + selectedModule,
            {credentials: 'same-origin'}
            )
        .then((resp) => {
                if (!resp.ok) {
                throw new Error('Invalid response');
                }
                return resp.json();
                }).then((result) => {
                    setModuleDictionary(result);
                    console.log(result);
                  }
          ).catch( (error) => {
                  console.error(error);
                  });
    }, [selectedModule, selectedModuleCategory]);

    const getModuleFields = (module, category) => {
        setSelectedModule(module);
        setSelectedModuleCategory(category);
    };

    const addRemoveField = (module, category, field) => {
        const newFieldObj = {
                module: module,
                category: category,
                field: field,
            };
        const equalField = (element) => {
            return (element.module == module
                && element.category === category
                && element.field == field);
        };
        if (selectedFields.some(equalField)) {
            // Remove
            const newfields = selectedFields.filter((el) => !(equalField(el)));
            setFields(newfields);
        } else {
            // Add
            const newfields = [...selectedFields, newFieldObj];
            setFields(newfields);
        }
    };

    console.log(selectedFields);


    let content;

    switch (activeTab) {
        case 'Info':
            content = <div>
                <h1 style={{
                  color: '#0a3572',
                  textAlign: 'center',
                  padding: '30px 0 0 0',
                }}>
                  Welcome to the Data Query Tool
                </h1>
                <p style={{textAlign: 'center', margin: '10px 0 20px 0'}}>
                  There is no data.
                </p>
                <ExpansionPanels
                  panels={[
                    {
                      title: 'Instructions on how to create a query',
                      content: (
                        <>
                          <p>
                            To start a new query, use the above navigation
                            and or click on <i style={{color: '#596978'}}>
                            "Define Fields"</i>
                            &nbsp;to begin building the fields for the query.
                          </p>
                          <p>
                            You may choose to then click the navigation
                            again for the <i style={{color: '#596978'}}>
                            "Define Filters (Optional)"</i>
                            &nbsp;and define how you will filter the query data.
                          </p>
                          <p>Lastly, navigate to the
                          <i style={{color: '#596978'}}>"Run Query"</i> and
                          run the query you built. 🙂</p>
                        </>
                      ),
                      alwaysOpen: true,
                    },
                    ]
                  }
                  />
              </div>;
            break;
        case 'DefineFields':
            content = <DefineFields allCategories={categories}
                displayedFields={moduleDictionary[selectedModuleCategory]}

                module={selectedModule}
                category={selectedModuleCategory}
                selected={selectedFields}

                onCategoryChange={getModuleFields}
                onFieldToggle={addRemoveField}
               />;
            break;
        case 'DefineFilters':
            content = <div>Unimplemented tab</div>;
            break;
        case 'ViewData':
            content = <div>Unimplemented tab</div>;
            break;
        default:
            content = <div>Invalid tab</div>;
    }
    // Define Fields tab.
    return (<>
        <NavigationStepper
          setIndex={activeTab}
          stepperClicked={setActiveTab}
        />
        {content}
    </>);
}

window.addEventListener('load', () => {
  ReactDOM.render(
    <DataQueryApp />,
    document.getElementById('lorisworkspace')
  );
});

export default DataQueryApp;

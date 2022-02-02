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
            <Select options={groups} onChange={selected}
                 menuPortalTarget={document.body}
                 styles={{menuPortal: (base) => ({...base, zIndex: 9999})}}
                 placeholder='Select a category'
            />
        </div>
    );
}

/**
 * Displays a single field to be selected for querying
 *
 * @param {object} props - react props
 *
 * @return {ReactDOM}
 */
function QueryField(props) {
  const item=props.item;
  const className = props.selected ?
    'list-group-item active' :
    'list-group-item';
  const value=props.value;

  let visits;
  let selectedVisits;

  if (value.scope === 'session') {
    const selected = (newvisits) => {
        props.onChangeVisitList(
         props.module,
         props.category,
         item,
         value,
         newvisits,
        );
    };

    const selectOptions = value.visits.map((vl) => {
        return {value: vl, label: vl};
    });

    if (props.selected && props.selected.visits) {
        selectedVisits = props.selected.visits;
    } else {
        selectedVisits = selectOptions.filter((opt) => {
            return props.defaultVisits.includes(opt.value);
        });
    }

    if (props.selected) {
        visits = <div onClick={(e) => e.stopPropagation()}>
            <h4>Visits</h4>
            <Select options={selectOptions}
                isMulti
                onChange={selected}
                placeholder='Select Visits'
                value={selectedVisits}
                menuPortalTarget={document.body}
                styles={{menuPortal: (base) => ({...base, zIndex: 9999})}}
                closeMenuOnSelect={false}
            />
        </div>;
    }
  }
  const download = value.type == 'URI' ?
    <i className="fas fa-download" /> : null;
  return (
    <div className={className}
       style={{
       cursor: 'pointer',
       display: 'flex',
       justifyContent: 'space-between',
       }}
       onClick={() => props.onFieldToggle(
         props.module,
         props.category,
         item,
         value,
         selectedVisits,
       )}>
         <dl>
           <dt>{item}</dt>
           <dd>{value.description} {download}</dd>
         </dl>
         {visits}
    </div>);
}
/**
 * Render the define fields tab
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function DefineFields(props) {
  const [activeFilter, setActiveFilter] = useState('');
  const displayed = Object.keys(props.displayedFields || {}).filter((value) => {
      if (activeFilter === '') {
          // No filter set
          return true;
      }

      // Filter with a case insensitive comparison to either the description or
      // the field name displayed to the user
      const lowerFilter = activeFilter.toLowerCase();
      const desc = props.displayedFields[value].description;
      return (value.toLowerCase().includes(lowerFilter)
        || desc.toLowerCase().includes(lowerFilter));
  });

  const fields = displayed.map((item, i) => {
      const equalField = (element) => {
          return (element.module == props.module
              && element.category === props.category
              && element.field == item);
      };
      const selobj = props.selected.find(equalField);
      return <QueryField
                key={item}
                item={item}
                value={props.displayedFields[item]}
                selected={selobj}
                module={props.module}
                category={props.category}
                onFieldToggle={props.onFieldToggle}
                onChangeVisitList={props.onChangeVisitList}
                selectedVisits={props.selectedVisits}
                defaultVisits={props.defaultVisits}
            />;
  });


  const setFilter = (e) => {
      setActiveFilter(e.target.value);
  };

  const addAll = () => {
      const toAdd = displayed.map((item, i) => {
          const dict = props.displayedFields[item];
          const visits = dict.visits.filter((visit) => {
              return props.defaultVisits.includes(visit);
          }).map((vl) => {
                  return {value: vl, label: vl};
          });
          return {
              module: props.module,
              category: props.category,
              field: item,
              dictionary: dict,
              visits: visits,
          };
      });
      props.onAddAll(toAdd);
  };
  const removeAll = () => {
      const toRemove = displayed.map((item, i) => {
          const dict = props.displayedFields[item];
          return {
              module: props.module,
              category: props.category,
              field: item,
              dictionary: dict,
          };
      });
      props.onRemoveAll(toRemove);
  };

  let fieldList = null;
  if (props.category) {
      // Put into a short variable name for line length
      const mCategories = props.allCategories.categories[props.module];
      const cname = mCategories[props.category];
      let defaultVisits;
      if (props.defaultVisits) {
          const allVisits = props.allVisits.map((el) => {
              return {value: el, label: el};
          });
          const selectedVisits = props.defaultVisits.map((el) => {
              return {value: el, label: el};
          });
          defaultVisits = <div style={{paddingBottom: '1em', display: 'flex'}}>
                <h4 style={{paddingRight: '1ex'}}>Default Visits</h4>
                <Select options={allVisits}
                    isMulti
                    onChange={props.onChangeDefaultVisits}
                    placeholder='Select Visits'
                    menuPortalTarget={document.body}
                    styles={{menuPortal: (base) => ({...base, zIndex: 9999})}}
                    value={selectedVisits}
                    closeMenuOnSelect={false}
                />
            </div>;
      }

      fieldList = (<div>
            <div style={{display: 'flex', flexWrap: 'wrap',
                justifyContent: 'space-between'}}>
                <h2>{cname} fields</h2>
                <div style={{marginTop: '1em',
                    display: 'flex',
                    flexWrap: 'nowrap',
                    flexDirection: 'column',
                    }}>
                    {defaultVisits}
                    <div className="input-group">
                        <input onChange={setFilter}
                            className='form-control'
                            type="text"
                            placeholder="Filter within category"
                            aria-describedby="input-filter-addon"
                            value={activeFilter} />
                        <span className="input-group-addon">
                                <span className="glyphicon glyphicon-search"/>
                        </span>
                    </div>
                    <div style={{margin: '1ex',
                        display: 'flex',
                        flexWrap: 'wrap',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                    }}>
                        <button type="button" className="btn btn-primary"
                            onClick={addAll}>
                            Add all
                        </button>
                        <button type="button" className="btn btn-primary"
                            onClick={removeAll}>
                            Remove all
                        </button>
                    </div>
                </div>
            </div>
            <div className="list-group">{fields}</div>
        </div>);
  }

  return (
    <div style={{display: 'flex', flexWrap: 'nowrap'}}>
       <div style={{width: '80vw', padding: '1em'}}>
            <h1>Available Fields</h1>
            <FilterableSelectGroup groups={props.allCategories.categories}
              mapGroupName={(key) => props.allCategories.modules[key]}
              onChange={props.onCategoryChange}
            />
            {fieldList}
      </div>
      <div style={{
          padding: '1em',
          position: 'sticky',
          top: 0,
          maxHeight: '90vh',
          overflow: 'auto',
        }}>
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '1em',
            }}>
                <h2>Selected Fields</h2>
                <div>
                    <button type="button" className="btn btn-primary"
                        style={{marginBottom: 7}}
                        onClick={props.onClearAll}>Clear</button>
                </div>
            </div>
            <SelectedFieldList
                selected={props.selected}
                removeField={props.removeField}
            />
        </div>
      </div>
   </div>);
}

/**
 * Render the selected fields
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function SelectedFieldList(props) {
  const fields = props.selected.map((item, i) => {
      const removeField = (item) => {
          props.removeField(item.module, item.category, item.field);
      };
      return (<div key={i} style={{display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'space-between'}}>
        <div>
            <dt>{item.field}</dt>
            <dd>{item.dictionary.description}</dd>
        </div>
        <div><i
            className="fas fa-trash-alt" onClick={() => removeField(item)}
            style={{cursor: 'pointer'}} />
        </div>
      </div>);
  });
  return <div className="list-group">{fields}</div>;
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
    const [defaultVisits, setDefaultVisits] = useState(false);
    const [allVisits, setAllVisits] = useState(false);

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
        if (defaultVisits !== false) {
            return;
        }
          fetch('/dqt/visitlist', {credentials: 'same-origin'})
          .then((resp) => {
                  if (!resp.ok) {
                      throw new Error('Invalid response');
                  }
                  return resp.json();
          }).then((result) => {
                  setDefaultVisits(result.Visits);
                  setAllVisits(result.Visits);
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
                  }
          ).catch( (error) => {
                  console.error(error);
                  });
    }, [selectedModule, selectedModuleCategory]);

    const getModuleFields = (module, category) => {
        setSelectedModule(module);
        setSelectedModuleCategory(category);
    };

    const removeField = (module, category, field) => {
      const equalField = (element) => {
        return (element.module == module
          && element.category === category
          && element.field == field);
      };
      const newfields = selectedFields.filter((el) => !(equalField(el)));
      setFields(newfields);
    };

    const addManyFields = (elements) => {
        let newfields = selectedFields;
        for (let i = 0; i < elements.length; i++) {
            const newFieldObj = elements[i];
            const equalField = (element) => {
                return (element.module == newFieldObj.module
                    && element.category === newFieldObj.category
                    && element.field == newFieldObj.field);
            };
            if (!newfields.some((el) => equalField(el))) {
                newfields = [...newfields, newFieldObj];
            }
        }
        setFields(newfields);
    };

    const removeManyFields = (removeelements) => {
        const equalField = (el1, el2) => {
           return (el1.module == el2.module
                    && el1.category === el2.category
                    && el1.field == el2.field);
            };
        const newfields = selectedFields.filter((el) => {
            if (removeelements.some((rel) => equalField(rel, el))) {
                return false;
            }
            return true;
        });
        setFields(newfields);
    };

    const addRemoveField = (module, category, field, dict, visits) => {
        const newFieldObj = {
                module: module,
                category: category,
                field: field,
                dictionary: dict,
                visits: visits,
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

    const modifyFieldVisits = (module, category, field, dict, visits) => {
        const newfields = [...selectedFields];
        const equalField = (element) => {
            return (element.module == module
                && element.category === category
                && element.field == field);
        };

        for (let i = 0; i < newfields.length; i++) {
            if (equalField(newfields[i])) {
                newfields[i].visits = visits;
                setFields(newfields);
                return;
            }
        }
    };

    const clearAllFields = () => {
        setFields([]);
    };

    const modifyDefaultVisits = (values) => {
        setDefaultVisits(values.map((el) => el.value));
    };

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

                defaultVisits={defaultVisits}
                onChangeDefaultVisits={modifyDefaultVisits}
                allVisits={allVisits}

                module={selectedModule}
                category={selectedModuleCategory}
                selected={selectedFields}

                onCategoryChange={getModuleFields}
                onFieldToggle={addRemoveField}

                onChangeVisitList={modifyFieldVisits}

                removeField={removeField}
                onAddAll={addManyFields}
                onRemoveAll={removeManyFields}
                onClearAll={clearAllFields}
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

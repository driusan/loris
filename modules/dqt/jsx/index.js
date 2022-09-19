// import {Component} from 'react';
// import PropTypes from 'prop-types';
// import {StepperPanel} from './components/stepper';
import ExpansionPanels from './components/expansionpanels';
import {NavigationStepper} from './navigationstepper';
import {useState, useEffect} from 'react';

import DefineFilters from './definefilters';
import DefineFields from './definefields';

import {QueryGroup} from './querydef';

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

    const [searchType, setSearchType] = useState('candidates');
    const [criteria, setCriteria] = useState([]);

    const [query, setQuery] = useState(new QueryGroup('and'));

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
        // console.log('get', module, category);
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

    const addCriteria = () => {
        const newcriteria = {...criteria};
        newcriteria.state = 'editing';
        newcriteria.op = 'and';
        if (newcriteria.groups) {
            newcriteria.groups = [...newcriteria.groups, {editstate: 'new'}];
        } else {
            newcriteria.groups = [{editstate: 'new'}];
        }
        console.log(newcriteria);
        setCriteria(newcriteria);
    };

    const deleteCriteria = (idx) => {
        const newcriteria = criteria.filter((el, fidx) => {
            return idx != fidx;
        });
        setCriteria(newcriteria);
    };

    const addQueryGroupItem = (querygroup) => {
        // clone the top level query to force
        // a new rendering
        let newquery = new QueryGroup(query.operator);

        // Add to this level of the tree
        querygroup.addTerm();

        newquery.group = query.group;
        setQuery(newquery);
    };

    const addNewQueryGroup = (parentgroup) => {
        // clone the top level query to force
        // a new rendering
        let newquery = new QueryGroup(query.operator);

        // Add to this level of the tree
        parentgroup.addGroup();

        newquery.group = query.group;

        setQuery(newquery);
    };
    /*
    const resetCriteria = (value) => {
        const newcriteria = [...criteria];
        setCriteria(newcriteria);
    };
    */

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
            content = <DefineFilters
                setSearchType={setSearchType}
                searchtype={searchType}

                module={selectedModule}
                category={selectedModuleCategory}

                dictionary={moduleDictionary[selectedModuleCategory]}

                categories={categories}
                onCategoryChange={getModuleFields}

                criteria={criteria}

                setCriteria={setCriteria}
                onAddCriteria={addCriteria}
                deleteCriteria={deleteCriteria}
                addQueryGroupItem={addQueryGroupItem}
                addNewQueryGroup={addNewQueryGroup}
                query={query}
            />;
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

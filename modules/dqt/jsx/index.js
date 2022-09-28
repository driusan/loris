import {NavigationStepper} from './navigationstepper';
import {useState, useEffect} from 'react';

import Welcome from './welcome';
import DefineFilters from './definefilters';
import DefineFields from './definefields';
import ViewData from './viewdata';

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
    const [fulldictionary, setDictionary] = useState({});
    const [selectedModuleCategory, setSelectedModuleCategory] = useState(false);
    const [categories, setCategories] = useState(false);
    const [selectedFields, setFields] = useState([]);
    const [defaultVisits, setDefaultVisits] = useState(false);
    const [allVisits, setAllVisits] = useState(false);

    const [searchType, setSearchType] = useState('candidates');
    const [usedModules, setUsedModules] = useState({});

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
        Object.keys(usedModules).forEach((module) => {
            if (!fulldictionary[module]) {
                fetch('/dictionary/module/' + module,
                    {credentials: 'same-origin'}
                    )
                .then((resp) => {
                        if (!resp.ok) {
                            throw new Error('Invalid response');
                        }
                        return resp.json();
                        }).then((result) => {
                            console.log(
                                'retrieved',
                                module,
                                fulldictionary,
                                result,
                            );
                            fulldictionary[module] = result;
                            let newdictcache = {...fulldictionary};
                            setDictionary(newdictcache);

                            setSelectedModule(module);
                          }
                  ).catch( (error) => {
                          console.error(error);
                  });
            }
        });
    }, [usedModules]);

    useEffect(() => {
        if (selectedModule === false) {
            return;
        }
        getModuleFields(selectedModule);
        if (fulldictionary[selectedModule]) {
            // Use the cache
            setModuleDictionary(fulldictionary[selectedModule]);
            return;
        }
    }, [selectedModule, selectedModuleCategory, fulldictionary]);

    const getModuleFields = (module, category) => {
        console.log('Should get module fields', module);
        if (!usedModules[module]) {
            let newUsedModules = {...usedModules};
            newUsedModules[module] = [module, category];
            setUsedModules(newUsedModules);
        }
        setSelectedModuleCategory(category);
        return fulldictionary[module];
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


    const addQueryGroupItem = (querygroup, condition) => {
        // clone the top level query to force
        // a new rendering
        let newquery = new QueryGroup(query.operator);

        // Add to this level of the tree
        querygroup.addTerm(condition);


        newquery.group = [...query.group];
        setQuery(newquery);
        return newquery;
    };

    const removeQueryGroupItem = (querygroup, idx) => {
        // Remove from this level of the tree
        querygroup.removeTerm(idx);

        // clone the top level query to force
        // a new rendering
        let newquery = new QueryGroup(query.operator);

        newquery.group = [...query.group];
        setQuery(newquery);

        return newquery;
    };

    const addNewQueryGroup = (parentgroup) => {
        // Add to this level of the tree
        parentgroup.addGroup();

        // clone the top level query to force
        // a new rendering
        let newquery = new QueryGroup(query.operator);
        newquery.group = [...query.group];

        setQuery(newquery);
    };

    let content;

    const mapModuleName = (name) => {
        if (categories.modules) {
            return categories.modules[name];
        }
        return name;
    };
    const mapCategoryName = (module, category) => {
        if (categories.categories
            && categories.categories[module]) {
            return categories.categories[module][category];
        }
        return category;
        // return props.categories.categories[name];
    };

    const loadQuery = (fields, filters) => {
        setFields(fields);
        if (!filters) {
            setQuery(new QueryGroup('and'));
        } else {
            setQuery(filters);
        }
    };

    switch (activeTab) {
        case 'Info':
            content = <Welcome
                        loadQuery={loadQuery}
                        savedQueries={
                            [{
                                type: 'candidates',
                                fields: [
                                    {
                                        module: 'candidate_parameters',
                                        category: 'Identifiers',
                                        field: 'PSCID',
                                    },
                                    {
                                        module: 'candidate_parameters',
                                        category: 'Demographics',
                                        field: 'DoB',
                                    },
                                ],
                            },
                            {
                                type: 'candidates',
                                fields: [
                                    {
                                        module: 'candidate_parameters',
                                        category: 'Demographics',
                                        field: 'Sex',
                                    },
                                    {
                                        module: 'candidate_parameters',
                                        category: 'Demographics',
                                        field: 'DoB',
                                    },
                                ],
                                criteria: unserializeSavedQuery({
                                    operator: 'and',
                                    group: [
                                        {
                                            module: 'candidate_parameters',
                                            category: 'Demographics',
                                            fieldname: 'Sex',
                                            op: 'eq',
                                            value: 'Male',
                                        },
                                    ],
                                }),
                            },
                            {
                                'type': 'candidates',
                                'fields': [
                                    {
                                        'module': 'instruments',
                                        'category': 'aosi',
                                        'field': 'aosi_Examiner',
                                    },
                                    {
                                        'module': 'instruments',
                                        'category': 'aosi',
                                        'field': 'aosi_Window_Difference',
                                    },
                                ],
                                'criteria': unserializeSavedQuery({
                                    'operator': 'or',
                                    'group': [
                                        {
                                            'module': 'candidate_parameters',
                                            'category': 'Meta',
                                            'fieldname': 'EntityType',
                                            'op': 'in',
                                            'value': ['Human'],
                                        },
                                        {
                                            'operator': 'and',
                                            'group': [
                                                {
                                                    'module': 'imaging_browser',
                                                    'category': 'Images',
                                                    'fieldname': 't1',
                                                    'op': 'exists',
                                                    'value': '',
                                                    'visits': [
                                                        'V1',
                                                        'V2',
                                                        'V3',
                                                        'V4',
                                                        'V5',
                                                        'V6',
                                                    ],
                                                },
                                                {
                                                    'module': 'instruments',
                                                    'category': 'aosi',
                                                    'fieldname':
                                                       'aosi_examiner_location',
                                                    'op': 'eq',
                                                    'value': 'in_room_observer',
                                                    'visits': [
                                                        'V1',
                                                        'V2',
                                                        'V3',
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                }),
                            },
                            ]
                        }

                        // Need dictionary related stuff
                        // to display saved queries
                        getModuleFields={getModuleFields}
                        mapModuleName={mapModuleName}
                        mapCategoryName={mapCategoryName}
                        fulldictionary={fulldictionary}
                    />;
            break;
        case 'DefineFields':
            content = <DefineFields allCategories={categories}
                displayedFields={moduleDictionary[selectedModuleCategory]}

                defaultVisits={defaultVisits}
                onChangeDefaultVisity={modifyDefaultVisits}
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

                fulldictionary={fulldictionary}

               />;
            break;
        case 'DefineFilters':
            content = <DefineFilters
                setSearchType={setSearchType}
                searchtype={searchType}

                module={selectedModule}
                category={selectedModuleCategory}

                dictionary={moduleDictionary[selectedModuleCategory]}
                displayedFields={moduleDictionary[selectedModuleCategory]}

                categories={categories}
                onCategoryChange={getModuleFields}

                addQueryGroupItem={addQueryGroupItem}
                removeQueryGroupItem={removeQueryGroupItem}
                addNewQueryGroup={addNewQueryGroup}
                query={query}

                setQuery={setQuery}

                getModuleFields={getModuleFields}
                fulldictionary={fulldictionary}

                mapModuleName={mapModuleName}
                mapCategoryName={mapCategoryName}
            />;
            break;
        case 'ViewData':
            content = <ViewData
                fields={selectedFields}
                filters={query}
            />;
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

/**
 * Takes a saved query from a JSON object and marshal
 * it into a QueryGroup object
 *
 * @param {object} query - the json object
 *
 * @return {QueryGroup}
 */
function unserializeSavedQuery(query) {
    if (!query.operator) {
        console.error('Invalid query tree', query);
        return null;
    }
    const root = new QueryGroup(query.operator);
    query.group.forEach((val) => {
        if (val.operator) {
            const childTree = unserializeSavedQuery(val);
            root.group.push(childTree);
            return;
        }
        if (!val.module
            || !val.category
            || !val.fieldname
            || !val.op) {
            console.error('Invalid criteria', val);
            return;
        }
        root.addTerm({
            Module: val.module,
            Category: val.category,
            Field: val.fieldname,
            Op: val.op,
            Value: val.value,
        });
    });
    return root;
}

window.addEventListener('load', () => {
  ReactDOM.render(
    <DataQueryApp />,
    document.getElementById('lorisworkspace')
  );
});
export default DataQueryApp;

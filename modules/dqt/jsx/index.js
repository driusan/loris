// import {Component} from 'react';
// import PropTypes from 'prop-types';
// import {StepperPanel} from './components/stepper';
import ExpansionPanels from './components/expansionpanels';
import {NavigationStepper} from './navigationstepper';
import {useState, useEffect} from 'react';

/**
 * Render a select with option groups that can be
 * filtered
 *
 * @param {object} props - react props
 *
 * @return {ReactDOM}
 */
function FilterableSelectGroup(props) {
    const [filter, setFilter] = useState('');

    const updateFilter = (e) => {
        const newfilter = filter + e.key;
        setFilter(newfilter);
    };

    let groups = [];
    Object.keys(props.groups).forEach(
            (key, index) => {
                let options = [];
                for (const [value, desc] of Object.entries(props.groups[key])) {
                    options.push(
                        <option value={value} data-group={key}>{desc}</option>
                    );
                }

                let label = {key};
                if (props.mapGroupName) {
                    label = props.mapGroupName(key);
                }
                groups.push(<optgroup label={label}>{options}</optgroup>);
            }
    );
    const onChange = (e) => {
        props.onChange(
            e.target.value,
            e.target.selectedOptions[0].dataset.group
        );
    };
    return (<select onKeyPress={updateFilter}
        onChange={onChange}>
        {groups}
    </select>);
}
/**
 * Render the define fields tab
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function DefineFields(props) {
  console.log(props.categories);
  return (<div>
                <FilterableSelectGroup groups={props.categories.categories}
                    mapGroupName={(key) => props.categories.modules[key]}
                    onChange={props.onFieldChange}
                />
          this is not implemented.
          </div>
          );
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
    const [categories, setCategories] = useState(false);
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
                    console.log(result);
                  setCategories(result);
                  console.log(categories);
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
                    console.log(result);
                  }
          ).catch( (error) => {
                  console.error(error);
                  });
    }, [selectedModule]);

    const getModuleFields = (category, module) => {
        setSelectedModule(module);
        // http://localhost:8000/dictionary/module/$module
        console.log(category, module);
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
            content = <DefineFields categories={categories}
                onFieldChange={getModuleFields}/>;
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
    /*
    tabs.push(
      <StepperPanel
        key={'DefineFields'}
        TabId='DefineFields'
        active={activeTab === 'DefineFields'}
        content={(
          <div>This is the select field tab</div>
        )}
      />
    );
//    const [activeTab, setActiveTab] = useState('Info');
//    const activeTab = 'Info';
*/

    // Define Fields tab.
    return (<>
        <NavigationStepper
          setIndex={activeTab}
          stepperClicked={setActiveTab}
        />
        {content}
    </>);
}

/*
    let tabs = [];

    // Create or Load tab.
    tabs.push(
      <StepperPanel
        key={'Info'}
        TabId='Info'
        active={this.state.ActiveTab === 'Info'}
        content={(
          <>
            <h1 style={{
              color: '#0a3572',
              textAlign: 'center',
              padding: '30px 0 0 0',
            }}>
              Welcome to the Data Query Tool
            </h1>
            <p style={{textAlign: 'center', margin: '10px 0 20px 0'}}>
              Data was last updated on {this.props.UpdatedTime}.
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
                      <p>Lastly, navigate to the <i style={{color: '#596978'}}>
                        "Run Query"</i> and run the query you built. 🙂</p>
                    </>
                  ),
                  alwaysOpen: true,
                },
                {
                  title: 'Load Existing Query',
                  content: (
                    <>
                      <ManageSavedQueriesTabPane
                        key='SavedQueriesTab'
                        TabId='SavedQueriesTab'
                        userQueries={this.state.queryIDs.User}
                        globalQueries={this.state.queryIDs.Shared}
                        onSaveQuery={this.saveCurrentQuery}
                        queryDetails={this.state.savedQueries}
                        onSelectQuery={this.loadSavedQuery}
                        queriesLoaded={this.state.queriesLoaded}
                        Loading={this.state.loading}
                        savePrompt={this.state.savePrompt}
                      />
                      <SavedQueriesList
                        userQueries={this.state.queryIDs.User}
                        globalQueries={this.state.queryIDs.Shared}
                        queryDetails={this.state.savedQueries}
                        queriesLoaded={this.state.queriesLoaded}
                        onSelectQuery={this.loadSavedQuery}
                        loadedQuery={this.state.loadedQuery}
                      />
                    </>
                  ),
                },
              ]}
            />
          </>
        )}
      />
    );
    // Define Fields tab.
    tabs.push(
      <StepperPanel
        key={'DefineFields'}
        TabId='DefineFields'
        active={this.state.ActiveTab === 'DefineFields'}
        content={(
          <FieldSelectTabPane
            key='DefineFields'
            TabId='DefineFields'
            categories={this.props.categories}
            onFieldChange={this.fieldChange}
            selectedFields={this.state.selectedFields}
            Visits={this.props.Visits}
            fieldVisitSelect={this.fieldVisitSelect}
            Loading={this.state.loading}
            Active={this.state.ActiveTab === 'DefineFields'}
          />
        )}
      />
    );
    // Define Filters (Optional) tab.
    tabs.push(
      <StepperPanel
        key={'DefineFilters'}
        TabId='DefineFilters'
        active={this.state.ActiveTab === 'DefineFilters'}
        content={(
          <FilterSelectTabPane
            key='DefineFilters'
            TabId='DefineFilters'
            categories={this.props.categories}
            filter={this.state.filter}
            updateFilter={this.updateFilter}
            Visits={this.props.Visits}
            Loading={this.state.loading}
            Active={this.state.ActiveTab === 'DefineFilters'}
          />
        )}
      />
    );

    // Define the data displayed type and add the view data tab
    let displayType = (this.state.grouplevel === 0)
      ? 'Cross-sectional'
      : 'Longitudinal';

    // Run Query tab.
    tabs.push(
      <StepperPanel
        key={'ViewData'}
        TabId='ViewData'
        active={this.state.ActiveTab === 'ViewData'}
        content={(
          <ViewDataTabPane
            key='ViewData'
            TabId='ViewData'
            Active={this.state.ActiveTab === 'ViewData'}
            Fields={this.state.fields}
            Criteria={this.state.criteria}
            Sessions={this.getSessions()}
            Data={this.state.rowData.rowdata}
            RowInfo={this.state.rowData.Identifiers}
            RowHeaders={this.state.rowData.RowHeaders}
            FileData={this.state.rowData.fileData}
            onRunQueryClicked={this.runQuery}
            displayType={displayType}
            changeDataDisplay={this.changeDataDisplay}
            Loading={this.state.loading}
            runQuery={this.runQuery}
            displayVisualizedData={this.displayVisualizedData}
          />
        )}
      />
    );

    // Add the stats tab
    tabs.push(<StatsVisualizationTabPane
      key='Statistics'
      TabId='Statistics'
      Active={this.state.ActiveTab === 'Statistics'}
      Fields={this.state.rowData.RowHeaders}
      Data={this.state.rowData.rowdata}
      Loading={this.state.loading}
    />);

    let sideBar = this.getSideBarVisibleStatus()
      ? (
        <div className='col-md-2'>
          <FieldsSidebar
            Fields={this.state.fields}
            Criteria={this.state.criteria}
            resetQuery={this.resetQuery}
          />
        </div>
      )
      : null;

    let widthClass = this.getSideBarVisibleStatus()
      ? 'col-md-10'
      : 'col-md-12';

    let mySavePrompt = this.state.savePrompt ? (
      <SaveQueryDialog
        onDismissClicked={() => {
          this.setState({savePrompt: false});
        }}
        onSaveClicked={(name, shared) => {
          this.saveCurrentQuery(name, shared, 'false');
          this.setState({savePrompt: false});
        }}
      />
    ) : null;

    return (
      <>
        <NavigationWithSave
          index={this.state.navigation.index}
          disable={this.state.navigation.disable}
          onClickHandler={this.navigationClicked}
        />
        <NavigationStepper
          setIndex={this.state.ActiveTab}
          stepperClicked={this.stepperClicked}
        />
        <NoticeMessage
          dismissAlert={this.dismissAlert}
          overrideQuery={this.overrideQuery}
          alertConflict={this.state.alertConflict}
          alertSaved={this.state.alertSaved}
          alertLoaded={this.state.alertLoaded}
        />
        {mySavePrompt}
        <div className={widthClass}>
          <div className='tab-content'>
            {tabs}
          </div>
        </div>
        {sideBar}
      </>
    );
  }
}
*/

window.addEventListener('load', () => {
  ReactDOM.render(
    <DataQueryApp />,
    document.getElementById('lorisworkspace')
  );
});

export default DataQueryApp;

// import {Component} from 'react';
// import PropTypes from 'prop-types';
// import {StepperPanel} from './components/stepper';
import {useState} from 'react';
import Select from 'react-select';
import FilterableSelectGroup from './components/filterableselectgroup';
import getDictionaryDescription from './getdictionarydescription';


/**
* Displays a singae field to be selected for querying
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
                fulldictionary={props.fulldictionary}
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
            <dd>{getDictionaryDescription(
                    item.module,
                    item.category,
                    item.field,
                    props.fulldictionary,
                )}</dd>
        </div>
        <div><i
            className="fas fa-trash-alt" onClick={() => removeField(item)}
            style={{cursor: 'pointer'}} />
        </div>
      </div>);
  });
  return <div className="list-group">{fields}</div>;
}

export default DefineFields;
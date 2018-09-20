import React, {Component} from 'react';

// This to be removed from webpack as an entrypoint to be imported
//import DynamicDataTable from 'jsx/DynamicDataTable';
import FilterForm from 'jsx/FilterForm';

class FilterableDataTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <FilterForm
          Module={this.props.name}
          name={this.props.name + '_filter'}
          id={this.props.name + '_filter_form'}
          ref={this.props.name + 'Filter'}
          columns={3}
          formElements={this.props.FilterForm}
          onUpdate={this.props.updateFilter}
          filter={this.props.Filters}
        >
            <div>{this.props.children}</div>
        </FilterForm>

        <DynamicDataTable {...this.props}
          Filter={this.props.Filters}
        />
      </div>);
  }
}

export default FilterableDataTable;

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Loader from 'Loader';
import FilterableDataTable from 'FilterableDataTable';

class CandidateListIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      error: false,
      isLoaded: false,
    };

    this.fetchData = this.fetchData.bind(this);
    this.formatColumn = this.formatColumn.bind(this);
  }

  componentDidMount() {
    this.fetchData()
      .then(() => this.setState({isLoaded: true}));
  }

  /**
   * Retrieve data from the provided URL and save it in state
   * Additionally add hiddenHeaders to global loris variable
   * for easy access by columnFormatter.
   *
   * @return {object}
   */
  fetchData() {
    return fetch(this.props.dataURL, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((data) => this.setState({data}))
      .catch((error) => {
        this.setState({error: true});
        console.error(error);
      });
  }

  /**
   * Modify behaviour of specified column cells in the Data Table component
   *
   * @param {string} column - column name
   * @param {string} cell - cell content
   * @param {object} row - row content indexed by column
   *
   * @return {*} a formated table cell for a given column
   */
    formatColumn(column, cell, row) {
        if (column === 'PSCID') {
            let url = this.props.baseURL + '/' + row['PSCID'] + '/';
            return <td><a href ={url}>{cell}</a></td>;
        }
        if (column === 'Feedback') {
            switch (cell) {
                case '1': return <td style ={{background: '#E4A09E'}}>opened</td>;
                case '2': return <td style ={{background: '#EEEEAA'}}>answered</td>;
                case '3': return <td style ={{background: '#99CC99'}}>closed</td>;
                case '4': return <td style ={{background: '#99CCFF'}}>comment</td>;
                default: return <td>None</td>;
            }
        }
        if (column === 'Scan Done' && cell === 'Y') {
            return (
                <td className="scanDoneLink">
                <a href="#"
                onClick={loris.loadFilteredMenuClickHandler('imaging_browser/',
                    {pscid: row[2]})}
                >
                {cell}
                </a>
                </td>
            );
        }
        return <td>{cell}</td>;
    }

  render() {
    // If error occurs, return a message.
    // XXX: Replace this with a UI component for 500 errors.
    if (this.state.error) {
      return <h3>An error occured while loading the page.</h3>;
    }

    // Waiting for async data to load
    if (!this.state.isLoaded) {
      return <Loader/>;
    }

   /**
    * XXX: Currently, the order of these fields MUST match the order of the
    * queried columns in _setupVariables() in media.class.inc
    */
    const options = this.state.data.fieldOptions;
    const fields = [
        {
            label: 'PSCID',
            show: true,
            filter: {
                name: 'pscid',
                type: 'text',
            },
        },
        {
            label: 'DCCID',
            show: true,
            filter: {
                name: 'dccid',
                type: 'text',
            },
        },
        {
            label: 'Site',
            show: true,
            filter: {
                name: 'sites',
                type: 'select',
                options: options.sites,
            },
        },
        {
            label: 'Sex',
            show: true,
            filter: {
                name: 'sex',
                type: 'select',
                options: {
                    'Male': 'Male',
                    'Female': 'Female',
                },
            },
        },
        {
            label: 'Entity Type',
            show: true,
            filter: {
                name: 'entity_type',
                type: 'select',
                options: {
                    'Human': 'Human',
                    'Scanner': 'Scanner',
                },
            },
        },
        {
            'label': 'Participant Status',
            'show': true,
            'filter': {
                name: 'ParticipantStatus',
                type: 'select',
                options: options.participantstatus,
            },
        },
        {
            'label': 'Subproject',
            'show': true,
            'filter': {
                name: 'subproject',
                type: 'select',
                options: options.subprojects,
            },
        },
        {
            'label': 'DoB',
            'show': true,
            'filter': {
                name: 'DoB',
                type: 'date',
            },
        },
        {
            'label': 'Scan Done',
            'show': true,
            'filter': {
                name: 'ScanDone',
                type: 'select',
                options: {
                    'Yes': 'Yes',
                    'No': 'No',
                },
            },
        },
        {
            'label': 'VisitCount',
            'show': true,
            'filter': {
                name: 'VisitCount',
                type: 'text',
            },
        },
        {
            'label': 'Latest Visit Status',
            'show': true,
            'filter': {
                name: 'VisitStatus',
                type: 'select',
                options: {
                    'Not Started': 'Not Started',
                    'Screening': 'Screening',
                    'Visit': 'Visit',
                    'Approval': 'Approval',
                    'Recycling Bin': 'Recycling Bin',
                },
            },
        },
        {
            'label': 'Feedback',
            'show': true,
            'filter': {
                name: 'VisitStatus',
                type: 'select',
                options: {
                    'None': 'None',
                    'opened': 'opened',
                    'answered': 'answered',
                    'closed': 'closed',
                    'comment': 'comment',
                },
            },
        },
        {
            'label': 'Project',
            'show': true,
            'filter': {
                name: 'project',
                type: 'select',
                options: options.projects,
            },
        },
        {
            'label': 'EDC',
            'show': true,
            'filter': {
                name: 'edc',
                type: 'date',
            },
        },
    ];

    // FIXME: Basic/Advanced toggle
    // FIXME: OpenProfile button
    return (
          <FilterableDataTable
            name="candidateList"
            data={this.state.data.Data}
            fields={fields}
            getFormattedCell={this.formatColumn}
          />
    );
  }
}

CandidateListIndex.propTypes = {
  dataURL: PropTypes.string.isRequired,
  hasPermission: PropTypes.func.isRequired,
};

window.addEventListener('load', () => {
  ReactDOM.render(
    <CandidateListIndex
      dataURL={`${loris.BaseURL}/candidate_list/?format=json`}
      hasPermission={loris.userHasPermission}
      baseURL={loris.BaseURL}
    />,
    document.getElementById('lorisworkspace')
  );
});

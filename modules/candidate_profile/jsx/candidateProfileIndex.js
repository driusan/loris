import React, {Component} from 'react';
import PropTypes from 'prop-types';

import swal from 'sweetalert2';
import Loader from 'Loader';

import DataTable from 'jsx/DataTable';
import Card from 'Card';

/**
 * Candidate Profile Menu
 *
 * Create a candidate profile menu
 *
 * @author  Shen Wang
 * @version 1.0.0
 * */
class CandidateProfileIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      error: false,
      data: {},
    };
    this.fetchData = this.fetchData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.formatBVLTable = this.formatBVLTable.bind(this);
    this.formatTimepointTable = this.formatTimepointTable.bind(this);
    this.createTimepoint = this.createTimepoint.bind(this);
    this.viewImagingDataset = this.viewImagingDataset.bind(this);
    this.viewCandParams = this.viewCandParams.bind(this);
    this.renderCandInfoCard = this.renderCandInfoCard.bind(this);
    this.renderImagingCard = this.renderImagingCard.bind(this);
    this.renderCandParameters = this.renderCandParameters.bind(this);
    this.renderSpecimenCard = this.renderSpecimenCard.bind(this);
    this.renderBVLCard = this.renderBVLCard.bind(this);
    this.renderTimepoints = this.renderTimepoints.bind(this);
  }

  componentDidMount() {
    this.fetchData()
      .then(() => this.setState({isLoaded: true}));
  }

  /**
   * Retrieve data from the provided URL and save it in state
   *
   * @return {object}
   */
  fetchData() {
    return fetch(this.props.dataURL, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((data) => {
        this.setState({data});
      })
      .catch((error) => {
        this.setState({error: true});
        console.error(error);
      });
  }

  /**
   * Handles form submission
   *
   * @param {event} e - Form submission event
   */
  handleSubmit(e) {
    e.preventDefault();
    const match = this.validateMatchDate();
    if (!match) {
      this.setState({
        isCreated: false,
      });
    } else {
      let formData = this.state.formData;
      let formObject = new FormData();
      for (let key in formData) {
        if (formData[key] !== '') {
          formObject.append(key, formData[key]);
        }
      }
      formObject.append('fire_away', 'New Candidate');

      // disable button to prevent form resubmission.
      this.setState({submitDisabled: true});

      fetch(this.props.submitURL, {
        method: 'POST',
        cache: 'no-cache',
        credentials: 'same-origin',
        body: formObject,
        })
      .then((resp) => {
        if (resp.ok && resp.status === 201) {
          resp.json().then((data) => {
            this.setState({newData: data});
            this.setState({isCreated: true});
          });
        } else {
          resp.json().then((message) => {
            // enable button for form resubmission.
            this.setState({submitDisabled: false});
            swal.fire('Error!', message, 'error');
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  /**
   * Set the form data based on state values of child elements/components
   *
   * @param {string} formElement - name of the selected element
   * @param {string} value - selected value for corresponding form element
   */
  setFormData(formElement, value) {
    let formData = Object.assign({}, this.state.formData);
    formData[formElement] = value;

    this.setState({formData: formData});
  }

  /**
   * Modify behaviour of specified column cells in the Behavioural Data Table component
   *
   * @param {string} column - column name
   * @param {string} cell - cell content
   * @param {object} row - row content indexed by column
   *
   * @return {*} a formated table cell for a given column
   */
  formatBVLTable(column, cell, row) {
    let result = <td>{cell}</td>;
    switch (column) {
      case 'Visit Label':
        if (row['No.'] == 1) {
          const url = loris.BaseURL + '/instrument_list/?candID=' + this.state.data.candID + '&sessionID=' + row['Session ID'];
          result = <td rowSpan='0'><a href={url}>{cell}</a></td>;
        } else {
          result = null;
        }
        break;
      case 'Date of Visit':
        if (row['No.'] == 1) {
          result = <td rowSpan='0'>{cell}</td>;
        } else {
          result = null;
        }
        break;
      case 'Instrument':
        if (row['Status'] === 'Not Started') {
          result = null;
        }
        break;
      case 'Status':
        if (row['No.'] == 1) {
          if (cell === 'Not Started') {
            result = <td colspan='2' rowSpan='0' style={{background: '#ea9999'}}>{cell}</td>;
          } else if (cell === 'Screening') {
            result = <td rowSpan='0' style={{background: '#f9cb9c'}}>{cell} - {row['Screening']}</td>;
          } else if (cell === 'Visit') {
            result = <td rowSpan='0' style={{background: '#ffe599'}}>{cell} - {row['Visit']}</td>;
          } else if (cell === 'Approval') {
            result = <td rowSpan='0' style={{background: '#b6d7a8'}}>{cell} - {row['Approval']}</td>;
          }
        } else {
          result = null;
        }
        break;
      case 'Completion':
        const value = cell + '%';
        if (cell == 100) {
          result = <td style={{background: '#b6d7a8'}}>{value}</td>;
        } else if (50 <= cell && cell < 100) {
          result = (
            <td style={{padding: '0'}}>
              <div
                style={{
                  background: '#ffe599',
                  width: value,
                  padding: '8px',
                  borderRight: '1px solid #C3D5DB',
                  marginTop: '-1px',
                }}>
                {value}
              </div>
            </td>
          );
        } else if (0 < cell && cell < 50) {
          result = (
            <td style={{padding: '0'}}>
              <div
                style={{
                  background: '#f9cb9c',
                  width: value,
                  padding: '8px',
                  borderRight: '1px solid #C3D5DB',
                  marginTop: '-1px',
                }}>
                {value}
              </div>
            </td>
          );
        } else if (cell == 0) {
          result = <td>{cell}%</td>;
        }
        break;
      case 'Conflict':
        if (cell != '0') {
          result = <td><i className='fas fa-exclamation-circle' style={{color: 'red'}}></i></td>;
        } else {
          result = <td></td>;
        }
        break;
    }
    return result;
  }

  /**
   * Modify behaviour of specified column cells in the Timepoint Data Table component
   *
   * @param {string} column - column name
   * @param {string} cell - cell content
   * @param {object} row - row content indexed by column
   *
   * @return {*} a formated table cell for a given column
   */
  formatTimepointTable(column, cell, row) {
    let result = <td>{cell}</td>;
    switch (column) {
      case 'Visit Label':
        const url = loris.BaseURL + '/instrument_list/?candID=' + this.state.data.candID + '&sessionID=' + row['Session ID'];
        result = <td><a href={url}>{cell}</a></td>;
        break;
      case 'Date of Visit':
        if (cell === null) {
          result = <td>-</td>;
        }
        break;
      case 'Stage':
        if (cell === 'Not Started') {
          result = <td colspan='3'>{cell}</td>;
        }
        break;
      case 'Status':
        if (row['Stage'] === 'Not Started') {
          result = <td style={{background: '#ea9999'}}>{row['Stage']}</td>;
        } else {
          result = <td>{row['Stage']} - {cell}</td>;
        }
        break;
      case 'Stage Status':
      case 'Date of Stage':
        if (row['Stage'] === 'Not Started') {
          result = null;
        }
        break;
      case 'Sent To DCC':
        if (cell === 'Y') {
          const img = loris.BaseURL + '/images/check_blue.gif';
          result = <td><img src={img} border='0' /></td>;
        } else if (cell === 'N') {
          result = <td>-</td>;
        }
        break;
      case 'Imaging Scan Done':
        if (cell === 'N') {
          result = <td>No</td>;
        } else if (cell === 'Y') {
          const url = loris.BaseURL + '/imaging_browser/viewSession/?sessionID=' + row['Session ID'];
          result = <td><a href={url}>Yes (View Images)</a></td>;
        }
        break;
      case 'Feedback':
        if (row['Feedback Count'] === null) {
          result = <td bgColor={row['Feedback Color']}>-</td>;
        } else {
          result = <td bgColor = {row['Feedback Color']}>{cell}</td>;
        }
        break;
      case 'BVL QC':
        if (row['BVL QC Status'] === null) {
          const img = loris.BaseURL + '/images/delete.gif';
          result = <td><img src={img} border='0' /></td>;
        } else {
          result = <td>{cell}</td>;
        }
      case 'BVL Exclusion':
        if (cell === null) {
          const img = loris.BaseURL + '/images/delete.gif';
          result = <td><img src={img} border='0' /></td>;
        } else {
          if (cell === 'Not Excluded') {
            result = <td>Pass</td>;
          } else {
            result= <td>Fail</td>;
          }
        }
        break;
    }
    return result;
  }

  createTimepoint() {
    location.href='/create_timepoint/?candID=' + this.state.data.candID + '&identifier=' + this.state.data.candID;
  }

  viewImagingDataset() {
    location.href='/imaging_browser/?DCCID=' + this.state.data.candID;
  }

  viewCandParams() {
    location.href='/candidate_parameters/?candID=' + this.state.data.candID + '&identifier=' + this.state.data.candID;
  }

  renderCandInfoCard() {
    const active = (this.state.data.participant_status === 'Inactive') ? 'No' : 'Yes';
    const dataLeft = [
      {
        value: this.state.data.pscid,
        label: 'PSCID',
      },
      {
        value: this.state.data.candID,
        label: 'DCCID',
      },
      {
        value: this.state.data.candidateData.DoB,
        label: 'Date of Birth',
      },
      {
        value: this.state.data.candidateData.Age,
        label: 'Age',
      },
      {
        value: this.state.data.candidateData.Sex,
        label: 'Sex',
      },
    ];
    const dataRight = [
      {
        value: this.state.data.candidateData.Subproject,
        label: 'Subproject',
      },
      {
        value: this.state.data.candidateData.ProjectTitle,
        label: 'Project',
      },
      {
        value: this.state.data.candidateData.PSC,
        label: 'Site',
      },
      {
        value: active,
        label: 'Active',
      },
    ];
    const cardInfoLeft = dataLeft.map((info, index) => {
      return (
        <StaticElement
          key={index}
          text={
            <span>
              <h3
                style={{
                  lineHeight: '1.42857143',
                  marginTop: '-7px',
                }}
              >
                {info.value}
              </h3>
            </span>
          }
          label={info.label}
        />
      );
    });
    const cardInfoRight = dataRight.map((info, index) => {
      return (
        <StaticElement
          key={index}
          text={
            <span>
              <h3
                style={{
                  lineHeight: '1.42857143',
                  marginTop: '-7px',
                }}
              >
                {info.value}
              </h3>
            </span>
          }
          label={info.label}
        />
      );
    });
    const backgroundColour = (active === 'Yes') ? '#b6d7a8' : '#ea9999';
    return (
      <Card
        id='candidate_info'
        title='Candidate Info'
        backgroundColour={backgroundColour}
      >
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          <div style={{flexGrow: '1', order: '1'}}>
            <FormElement
              name='candinfo_form1'
            >
              {cardInfoLeft}
            </FormElement>
          </div>
          <div style={{flexGrow: '1', order: '2'}}>
            <FormElement
              name='candinfo_form2'
            >
              {cardInfoRight}
            </FormElement>
          </div>
        </div>
      </Card>
    );
  }

  renderImagingCard() {
    const imagingCount = (
      <StaticElement
        text={
          <span>
            <h3
              style={{
                lineHeight: '1.42857143',
                marginTop: '-7px',
              }}
            >
              {this.state.data.imagingData.numberOfMincs}
            </h3>
          </span>
        }
        label='Number of scans inserted'
      />
    );
    const imageLinks = this.state.data.timepointData.map((timepoint, index) => {
      if (timepoint.Scan_done === 'Y') {
        const url = loris.BaseURL + '/imaging_browser/viewSession/?sessionID=' + timepoint.SessionID;
        return <a key={index} href={url}>{timepoint.Visit_label}</a>;
      }
    });
    const linkValue = (
      <span>
        {imageLinks.reduce((prev, link) => {
          return [prev, ' ', link];
        })}
      </span>
    );
    const data = [
      {
        value: linkValue,
        label: 'View images',
      },
      {
        value: this.state.data.imagingData.lastInserted || '-',
        label: 'Most recent insert',
      },
    ];
    const cardInfo = data.map((info, index) => {
      return (
        <StaticElement
          key={index}
          text={info.value}
          label={info.label}
        />
      );
    });
    const picThumbnail = this.state.data.imagingData.checkPics.map((pic, index) => {
      return (
        <div key={index} className='imaging_browser_pic'>
          <img
            className='img-checkpic img-responsive'
            src={pic}
            style={{
              padding: '5px',
              width: '400px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        </div>
      );
    });
    return (
      <Card
        id='imaging_info'
        title='Imaging Dataset'
        onClick={this.viewImagingDataset}
      >
        <div className="form-horizontal">
          {imagingCount}
          {cardInfo}
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
          {picThumbnail}
        </div>
        <br />
        <p style={{textAlign: 'center'}}>Click for Imaging Browser</p>
      </Card>
    );
  }

  renderCandParameters() {
    const participantStatus = (
      <StaticElement
        text={this.state.data.participant_status}
        label='Participant Status'
      />
    );
    const consentData = Object.keys(this.state.data.consentData).map((key) => {
      const consent = this.state.data.consentData[key];
      let consentStatus = '-';
      let consentDate = '';
      switch (consent.Status) {
        case 'yes':
          consentStatus = 'Yes';
          consentDate = '(' + consent.DateGiven + ')';
          break;
        case 'no':
          consentStatus = 'No';
          break;
      }
      return (
        <StaticElement
          key={key}
          text={consentStatus + consentDate}
          label={consent.Label}
        />
      );
    });
    return (
      <Card
        id='cand_parameters'
        title='Candidate Parameters'
        onClick={this.viewCandParams}
      >
        <div className="form-horizontal">
          {participantStatus}
          {consentData}
        </div>
        <p style={{textAlign: 'center'}}>Click for more details</p>
      </Card>
    );
  }

  renderSpecimenCard() {
    return (
      <Card
        id='specimen'
        title='Biospecimen Data'
        onClick={this.viewCandParams}
      >
      </Card>
    );
  }

  renderBVLCard() {
    const tables = Object.keys(this.state.data.bvlData).map((visitLabel) => {
      const behavioural = this.state.data.bvlData[visitLabel];
      const data = behavioural.map((instrument) => {
        return (
          [
            instrument.Visit_label,
            instrument.SessionID,
            instrument.Date_visit,
            instrument.Current_stage,
            instrument.Test_name,
            instrument.Screening,
            instrument.Visit,
            instrument.Approval,
            instrument.Completion,
            instrument.NumOfConflict,
          ]
        );
      });
      return behavioural.length > 0 ? (
        <div key={visitLabel + '_table'}>
          <h3 style={{margin: '14px', textAlign: 'center'}}>{visitLabel}</h3>
          <DataTable
            fields={[
              {label: 'Visit Label', show: true},
              {label: 'Session ID', show: false},
              {label: 'Date of Visit', show: true},
              {label: 'Status', show: true},
              {label: 'Instrument', show: true},
              {label: 'Screening', show: false},
              {label: 'Visit', show: false},
              {label: 'Approval', show: false},
              {label: 'Completion', show: true},
              {label: 'Conflict', show: true},
            ]}
            data={data}
            getFormattedCell={this.formatBVLTable}
            hide={{
              rowsPerPage: true,
              downloadCSV: true,
              defaultColumn: false,
            }}
          />
        </div>
      ) : null;
    });
    return (
      <Card
        id='behavioural'
        title='Behavioural Data'
      >
        {tables}
      </Card>
    );
  }

  renderTimepoints() {
    const data = this.state.data.timepointData.map((timepoint) => {
      return (
        [
          timepoint.Visit_label,
          timepoint.SubprojectTitle,
          timepoint.SiteAlias,
          timepoint.Date_visit,
          timepoint.Current_stage,
          timepoint.currentStatus,
          timepoint.currentDate,
          timepoint.Submitted,
          timepoint.Scan_done,
          timepoint.feedbackStatus,
          timepoint.feedbackCount,
          timepoint.feedbackColor,
          timepoint.BVLQCType,
          timepoint.BVLQCStatus,
          timepoint.BVLQCExclusion,
          timepoint.Real_name,
          timepoint.SessionID,
        ]
      );
    });
    const createTimepointButton = this.state.data.isDataEntryPerson ? (
      <div style={{margin: '10px 10px'}}>
        <CTA
          label='Create Time Point'
          buttonClass='btn btn-default'
          onUserInput={this.createTimepoint}
        />
      </div>
    ) : null;
    return (
      <Card
        id='timepoint_list'
        title='Timepoints'
      >
        {createTimepointButton}
        <DataTable
          fields={[
            {label: 'Visit Label', show: true},
            {label: 'Subproject', show: true},
            {label: 'Site', show: true},
            {label: 'Date of Visit', show: true},
            {label: 'Stage', show: false},
            {label: 'Status', show: true},
            {label: 'Date of Stage', show: false},
            {label: 'Sent To DCC', show: false},
            {label: 'Imaging Scan Done', show: false},
            {label: 'Feedback', show: false},
            {label: 'Feedback Count', show: false},
            {label: 'Feedback Color', show: false},
            {label: 'BVL QC', show: false},
            {label: 'BVL QC Status', show: false},
            {label: 'BVL Exclusion', show: false},
            {label: 'Registered By', show: true},
            {label: 'Session ID', show: false},
          ]}
          data={data}
          getFormattedCell={this.formatTimepointTable}
          hide={{
            rowsPerPage: true,
            downloadCSV: true,
            defaultColumn: false,
          }}
        />
      </Card>
    );
  }

  render() {
    // If error occurs, return a message.
    if (this.state.error) {
      return <h3>An error occurred while loading the page.</h3>;
    }
    // Waiting for async data to load
    if (!this.state.isLoaded) {
      return <Loader/>;
    }
    const candInfoCard = this.state.data.isDataEntryPerson ? this.renderCandInfoCard() : null;

    const cards = (
      <div
        id='cards'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <div
          id='cardblock_top'
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexGrow: '2',
            order: '1',
            justifyContent: 'space-between',
            alignItems: 'stretch',
          }}

        >
          <div
            id='cardblock_left'
            style={{
              display: 'flex',
              order: '1',
              flexDirection: 'column',
              width: '30%',
              flexGrow: '1',
            }}
          >
            {candInfoCard}
            {this.renderCandParameters()}
            {this.renderTimepoints()}
            {this.renderSpecimenCard()}
          </div>
          <div
            id='cardblock_right'
            style={{
              display: 'flex',
              order: '2',
              flexGrow: '1',
              flexDirection: 'column',
              minWidth: '69%',
            }}
          >
            {this.renderBVLCard()}
            {this.renderImagingCard()}
          </div>
        </div>
        <div
          id='cardblock_middle'
          style={{
            flexGrow: '1',
            order: '2',
          }}
        >
        </div>
      </div>
    );
    return (
      <div>
        {cards}
      </div>
    );
  }
}

CandidateProfileIndex.propTypes = {
  dataURL: PropTypes.string.isRequired,
};

window.addEventListener('load', () => {
  const candID = location.href.split('/')[3];
  ReactDOM.render(
    <CandidateProfileIndex
      dataURL = {`${loris.BaseURL}/${candID}/?format=json`}
    />,
    document.getElementById('lorisworkspace')
  );
});

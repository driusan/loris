import React, {Component} from 'react';
import Loader from 'Loader';


class CandidateInfo extends Component {
 constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      error: false,
        Candidate: {},
    };
     this.fetchData = this.fetchData.bind(this);
     this.calcAge = this.calcAge.bind(this);
 }

    fetchData() {
          fetch(this.props.BaseURL + '/api/v0.0.2/candidates/' + this.props.CandID,
              {method: 'GET'}
          )
          .then(function(response) {
              return response.json();
          })
          .then((json) => {
              this.setState({
                  Candidate: json,
                  isLoaded: true,
              });
          });
    }

      componentDidMount() {
          this.fetchData();
      }

    calcAge(dob) {
        let dobdate = new Date(dob);
        let now = new Date();
        return (now.getFullYear() - dobdate.getFullYear()) + ' years old';
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
        const data = [
            {
                value: this.state.Candidate.Meta.PSCID,
                label: 'PSCID',
            },
            {
                value: this.state.Candidate.Meta.CandID,
                label: 'DCCID',
            },
            {
                value: this.state.Candidate.Meta.DoB,
                label: 'Date of Birth',
            },
            {
                value: this.calcAge(this.state.Candidate.Meta.DoB),
                label: 'Age',
            },
            {
                value: this.state.Candidate.Meta.Sex,
                label: 'Sex',
            },
            /*
            {
                value: this.state.data.candidateData.Subproject,
                label: 'Subproject',
            },
            */
            {
                value: this.state.Candidate.Meta.Project,
                label: 'Project',
            },
            {
                value: this.state.Candidate.Meta.Site,
                label: 'Site',
            },
        ];
        const cardInfo = data.map((info, index) => {
            return (
                <div className="form-horizontal" style={{flex: '1 1 25%'}}>
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
                </div>
            );
        });
        return (
            <div style={{width: '100%'}}>
            <div style={{display: 'flex', flexFlow: 'wrap', marginBottom: '-15px', marginTop: '10px'}}>
            {cardInfo}
            </div>
            </div>
        );
    }
}


window.addEventListener('dashboardloaded', () => {
    window.dispatchEvent(
        new CustomEvent('registercard', {
            detail: {
                title: 'Candidate Info',
                content: <CandidateInfo BaseURL={loris.BaseURL} CandID="965327"/>,
                width: 3,
            },
        })
    );
});

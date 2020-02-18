import React, {Component} from 'react';
import Loader from 'Loader';
// import DataTable from 'jsx/DataTable';
import VisitInstrumentList from './VisitInstrumentList';

class CandidateInstrumentList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            error: false,
            Candidate: {},
        };
        this.fetchData = this.fetchData.bind(this);
    }

    fetchData() {
        fetch(this.props.BaseURL + '/api/v0.0.2/candidates/' + this.props.CandID,
            {method: 'GET'}
        )
            .then(function(response) {
                return response.json();
            })
            .then((json) => {
                Promise.all(
                    json.Visits.map((visit) =>
                        // FIXME: This shouldn't use the dev version. See #6058
                        fetch(this.props.BaseURL + '/api/v0.0.3-dev/candidates/' + this.props.CandID + '/' + visit).then((response) => response.json())
                    )
                ).then((values) => {
                    this.setState({
                        Candidate: json,
                        Visits: values,
                        isLoaded: true,
                    });
                    console.log(json);
                });
            });
    }

    componentDidMount() {
        this.fetchData();
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

        const visits = this.state.Visits.map((visit) => {
            return <VisitInstrumentList BaseURL={this.props.BaseURL} Candidate={this.state.Candidate} Visit={visit} />;
                /*
            let stage = '';
            if (visit.Stages.Approval) {
                stage = 'Approval - ' + visit.Stages.Approval.Status;
            } else if (visit.Stages.Visit) {
                stage = 'Visit - ' + visit.Stages.Visit.Status;
            } else if (visit.Stages.Screening) {
                stage = 'Screening - ' + visit.Stages.Screening.Status;
            } else {
                stage = 'Unknown';
            }
            return [
                visit.Meta.Visit,
                visit.Meta.Battery,
                visit.Meta.Site,
                visit.Stages.Visit.Date,
                stage,
            ]; */
        });

        const style={
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
            padding: 0,
            margin: 0,
        };
        return <div style={style}>
                {visits}
            </div>;
    }
}

export default CandidateInstrumentList;

/*


window.addEventListener('dashboardloaded', () => {
    window.dispatchEvent(
        new CustomEvent('registercard', {
            detail: {
                title: 'Behavioural Data ',
                content: <CandidateInstrumentList BaseURL={loris.BaseURL} CandID="965327"/>,
                width: 2,
            },
        })
    );
});
*/

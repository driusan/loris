import React, {Component} from 'react';
import Loader from 'Loader';
// import DataTable from 'jsx/DataTable';
import VisitInstrumentList from './VisitInstrumentList';

export class CandidateInstrumentList extends Component {
    constructor(props) {
        super(props);
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

        const visits = this.props.Visits.map((visit) => {
            return <VisitInstrumentList BaseURL={this.props.BaseURL} Candidate={this.props.Candidate} Visit={visit} />;
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

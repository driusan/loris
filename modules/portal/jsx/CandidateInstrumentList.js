import VisitInstrumentList from './VisitInstrumentList';

/**
 * A CandidateInstrumentList provides a list of instruments for
 * a candidate and their status in a widget. There is one card
 * for each visit, and clicking on the visit expands to display
 * a list of instruments in that visit.
 *
 * @param {object} props - React props
 *
 * @return {object} - The JSX component
 */
function CandidateInstrumentList(props) {
    console.log('instrument list props', props);
    const visits = props.Visits.filter((visit) => {
        return visit.Meta.Visit == props.VisitLabel
    }).map((visit) => {
        return (
            <VisitInstrumentList
                key={visit.Meta.Visit}
                BaseURL={props.BaseURL}
                Candidate={props.Candidate}
                Visit={visit} />
        );
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

export default CandidateInstrumentList;

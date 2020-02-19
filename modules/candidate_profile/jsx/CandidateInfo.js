import React, {Component} from 'react';

export class CandidateInfo extends Component {
    constructor(props) {
        super(props);

        this.calcAge = this.calcAge.bind(this);
    }

    calcAge(dob) {
        const dobdate = new Date(dob);
        const now = new Date();
        const years = now.getFullYear()-dobdate.getFullYear();
        const months = years*12 + now.getMonth() - dobdate.getMonth();

        if (months <= 36) {
            return months + ' months old';
        }
        return years + ' years old';
    }

    render() {
        const data = [
            {
                value: this.props.Candidate.Meta.PSCID,
                label: 'PSCID',
            },
            {
                value: this.props.Candidate.Meta.CandID,
                label: 'DCCID',
            },
            {
                value: this.props.Candidate.Meta.DoB,
                label: 'Date of Birth',
            },
            {
                value: this.calcAge(this.props.Candidate.Meta.DoB),
                label: 'Age',
            },
            {
                value: this.props.Candidate.Meta.Sex,
                label: 'Sex',
            },
            {
                value: this.props.Candidate.Meta.Project,
                label: 'Project',
            },
            {
                value: this.props.Candidate.Meta.Site,
                label: 'Site',
            },
            {
                value: this.props.Candidate.Visits.length,
                label: 'Visits',
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

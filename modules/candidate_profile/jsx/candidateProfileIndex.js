import React, {Component} from 'react';

import Loader from 'Loader';
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
        error: false,
        isLoaded: false,
        cards: [],
    };
  }

  componentDidMount() {
      window.addEventListener('registercard', (e) => {
          const title = e.detail.title;
          let style= {};
          if (e.detail.width) {
              style.gridColumnEnd = 'span ' + e.detail.width;
          }
          if (e.detail.height) {
              style.gridRowEnd = 'span ' + e.detail.height;
          }
          if (e.detail.order) {
              style.order = e.detail.order;
          }
          style.alignSelf = 'stretch';

          this.state.cards.push(<Card title={title} style={style}>
              {e.detail.content}
              </Card>);
          this.setState({cards: this.state.cards, isLoaded: true});
      });
      window.dispatchEvent( new CustomEvent('dashboardloaded'));
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

    const grid = {
        display: 'grid',
        gridTemplateColumns: '33% 33% 33%',
        gridAutoFlow: 'row dense',
        gridRowGap: '1em',
        rowGap: '1em',
    };
    return (
      <div style={grid}>
        {this.state.cards}
      </div>
    );
  }
}

window.addEventListener('load', () => {
  ReactDOM.render(
    <CandidateProfileIndex />,
    document.getElementById('candidatedashboard')
  );
});

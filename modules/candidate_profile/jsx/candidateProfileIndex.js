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
          console.log(e);
          console.log(this);
          const title = e.detail.title || 'Test';
          let style= {};
          if (e.detail.width) {
              style.gridColumnEnd = 'span ' + e.detail.width;
          }
          if (e.detail.height) {
              style.gridRowEnd = 'span ' + e.detail.height;
              style.alignSelf = 'stretch';
          }

          this.state.cards.push(<Card title={title} id='abc' style={style}>
              Thissia test test test
              </Card>);
          console.log('registered');
          this.setState({cards: this.state.cards, isLoaded: true});
      });
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
    document.getElementById('lorisworkspace')
  );
    let evt = new CustomEvent('registercard', {detail: {title: '1', height: 2}});
    window.dispatchEvent(evt);
    evt = new CustomEvent('registercard', {detail: {title: ' 2', width: 2}});
    window.dispatchEvent(evt);
    evt = new CustomEvent('registercard', {detail: {title: '3'}});
    window.dispatchEvent(evt);
    evt = new CustomEvent('registercard', {detail: {title: '4', width: 3, height: 2}});
    window.dispatchEvent(evt);
    evt = new CustomEvent('registercard', {detail: {title: '5'}});
    window.dispatchEvent(evt);
    evt = new CustomEvent('registercard', {detail: {title: '6'}});
    window.dispatchEvent(evt);
    evt = new CustomEvent('registercard', {detail: {title: '7'}});
    window.dispatchEvent(evt);
});

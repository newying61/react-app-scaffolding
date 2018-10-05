import React, { Component } from 'react';

import './App.css';

import Scrollable from './Components/Scrollable/Scrollable';

const Items = '1234567890'.split('');

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          Component examples
        </div>
        <Scrollable className='images-list' length={Items.length}>
          {Items.map((v, i) => {
            return <img key={i} className="img-place-holder" src="https://via.placeholder.com/300x200" width="300" height="200" alt="" />;
          })}
        </Scrollable>
      </div>
    );
  }
}

export default App;

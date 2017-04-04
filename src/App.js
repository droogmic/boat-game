import React, { Component } from 'react';
import './App.css';
// import {Responsive, WidthProvider} from 'react-grid-layout';
import ReactGridLayout from 'react-grid-layout';

class App extends Component {

    constructor(props) {
        super(props);
        this.createElement = this.createElement.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            items: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function(i) {
                if (i === 0) {
                    return {i: 's'+i.toString()+'-N/A', x: i, y: 0, w: 1, h: 1, static: true};
                } else {
                    return {i: 's'+i.toString()+'-M'+i.toString(), x: i, y: 0, w: 1, h: 1, static: true};
                }
            }),
            newCounter: 0,
            cols: 9,
        };
    }

    createElement(el) {
        var removeStyle = {
            position: 'absolute',
            right: '2px',
            top: 0,
            cursor: 'pointer'
        };
        var i = el.i;
        return (
            <div key={i} data-grid={el}>
                <span className="text">{i.split('-')[1]}</span>
                {
                    (el.static === true) ?
                    (null) :
                    (<span className="remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, i)}>x</span>)
                }
            </div>
        );
    }

    onAddItem(val="") {
        // console.log('adding', 'n' + this.state.newCounter);
        this.setState({
            // Add a new item. It must have a unique key!
            items: this.state.items.concat({
                i: 'n' + this.state.newCounter + '-' + val,
                x: 0,
                y: Infinity, // puts it at the bottom
                w: 1,
                h: 1
            }),
            // Increment the counter to ensure key is always unique.
            newCounter: this.state.newCounter + 1
        });
    }

    onRemoveItem(i) {
        // console.log('removing', i);
        this.setState({items: Array.prototype.filter.call(this.state.items, item => item.i!==i)});
    }

    render() {
        let layout = this.state.items;
        return (
            <div className="App">
                <NameInput onClick={this.onAddItem}/>
                <ReactGridLayout
                cols={this.state.cols}
                rowHeight={40}
                width={1600}
                layout={layout}>
                    {this.state.items.map(this.createElement)}
                </ReactGridLayout>
            </div>
        );
    }
}

class NameInput extends React.Component {
    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.onClick(e.target.value);
            e.target.value = "";
        }
    }
    _handleButtonPress = () => {
        this.props.onClick(this.refs.name.value);
        this.refs.name.value = "";
    }
    render() {
        return (
            <div>
                <input ref='name' type="text" onKeyPress={this._handleKeyPress}/>
                <button onClick={this._handleButtonPress}>Add Person (Enter)</button>
            </div>
        )
    }
}
NameInput.propTypes = {
    onClick: React.PropTypes.func.isRequired,
};

export default App;

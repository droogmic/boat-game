    import React, { Component } from 'react';
import './App.css';
// import {Responsive, WidthProvider} from 'react-grid-layout';
import ReactGridLayout from 'react-grid-layout';

class App extends Component {

    constructor(props) {
        super(props);
        this.getInitialState = this.getInitialState.bind(this);
        this.createElement = this.createElement.bind(this);
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleRemoveItem = this.handleRemoveItem.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            static_items: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function(i) {
                if (i === 0) {
                    return {i: 's'+i.toString()+'-N/A', x: i, y: 0, w: 1, h: 1, static: true};
                } else {
                    let prefix = getHashName('Crew ');
                    return {
                        i: 's'+i.toString()+'-'+prefix+i.toString(),
                        x: i, y: 0,
                        w: 1, h: 1,
                        static: true
                    };
                }
            }),
            items: (getFromHash() || getFromLS() || []).map(this.fillLayout),
            newCounter: 0,
            cols: 9,
        };
    }

    handleLayoutChange(layout) {
        this.setState({items: layout.slice(9)});
        let save_items = this.state.items.map(this.sparseLayout);
        setToHash(save_items);
        saveToLS(save_items);
    }

    fillLayout(item){
        item.w = 1;
        item.h = 1;
        item.isResizable = false;
        return item;
    }

    sparseLayout(item){
        return {
            i: item.i,
            x: item.x,
            y: item.y,
        }
    }

    createElement(el) {
        var removeStyle = (el.static === true) ? {border: '0px'} : {};
        var removeButtonStyle = {
            position: 'absolute',
            right: '2px',
            top: 0,
            cursor: 'pointer'
        };
        var i = el.i;
        return (
            <div key={i} style={removeStyle}>
                <div><span className="text">{i.split('-')[1]}</span></div>
                {
                    (el.static === true) ?
                    (null) :
                    (<span className="remove" style={removeButtonStyle} onClick={ this.handleRemoveItem.bind(this, i) }>x</span>)
                }
            </div>
        );
    }

    handleAddItem(val="") {
        this.setState({
            // add a new item
            items: this.state.items.concat({
                i: 'n' + this.state.newCounter + '-' + val,
                x: 0,
                y: Infinity, // puts it at the bottom
                w: 1,
                h: 1,
                isResizable: false,
            }),
            // ncrement the counter for unique key i
            newCounter: this.state.newCounter + 1
        });
    }

    handleRemoveItem(i) {
        this.setState({items: Array.prototype.filter.call(this.state.items, item => item.i!==i)});
    }

    handleClear() {
        this.setState({items: []});
        window.location.hash = "";
    }

    render() {
        let layout = this.state.items.map(this.fillLayout).concat(this.state.static_items);
        return (
            <div className="App">
                <Input onAdd={ this.handleAddItem } onClear={ this.handleClear }/>
                <ReactGridLayout
                cols={this.state.cols}
                rowHeight={40}
                width={1600}
                layout={layout}
                onLayoutChange={ this.handleLayoutChange.bind(this) }>
                    { this.state.static_items.map(this.createElement) }
                    { this.state.items.map(this.createElement) }
                </ReactGridLayout>
            </div>
        );
    }
}

class Input extends React.Component {
    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.onAdd(e.target.value);
            e.target.value = "";
        }
    }
    _handleButtonPress = () => {
        this.props.onAdd(this.refs.name.value);
        this.refs.name.value = "";
    }
    render() {
        return (
            <div>
                <input ref='name' type="text" onKeyPress={this._handleKeyPress}/>
                <button onClick={ this._handleButtonPress }>Add Person (Enter)</button>
                <button onClick={ this.props.onClear }>Clear</button>
            </div>
        )
    }
}
Input.propTypes = {
    onAdd: React.PropTypes.func.isRequired,
    onClear: React.PropTypes.func.isRequired,
};

function stringify_with_inf(items) {
    return JSON.stringify(items.map(
        function(item) {
            return Object.assign(item, (
                (item.y===Infinity) ? {y:"$inf"} : {}
            ));
        }
    ));
}

function parse_with_inf(json) {
    let items = JSON.parse(json);
    if (!!items.length) {
        return items.map(
            function(item) {
                return Object.assign(item  , (
                    (item.y==="$inf") ? {y:Infinity} : {}
                ));
            }
        )
    } else {
        return null;
    }
}

function getHashState() {
    let stripped = window.location.hash.replace('#/', '');
    return decodeURIComponent(
        (stripped[0] === '#') ?
        stripped.split('/')[0].substr(1) :
        stripped.split('/')[1].substr(1) || ''
    );
}

function getHashName(val='') {
        let stripped = window.location.hash.replace('#/', '');
    return decodeURIComponent(
        (stripped[0] !== '#') ?
        stripped.split('/')[0] || val :
        val
    );
}

function getFromHash() {
    if (!!window.location.hash) {
        let hash = getHashState();
        if (hash !== "") {
            let json = window.atob(hash);
            let items = parse_with_inf(json);
            return items;
        }
    }
    return null;
}

function setToHash(items) {
    if (items.length === 0) {
        if (!!window.location.hash) {
            window.location.hash = '/'+ encodeURIComponent(getHashName()) + '/';
        }
    } else {
        let json = stringify_with_inf(items);
        let hash = window.btoa(json);
        window.location.hash = (
            '/'+ encodeURIComponent(getHashName()) + '/#' + hash
        );
    }
}

function getFromLS() {
    let ls = null;
    if (window.sessionStorage) {
        try {
            ls = parse_with_inf(window.localStorage.getItem('boat-game'));
        }
        catch(e) {}
    }
    return ls;
}

function saveToLS(items) {
    if (window.sessionStorage) {
        window.localStorage.removeItem('boat-game');
        window.sessionStorage.setItem('boat-game', stringify_with_inf(items));
    }
}

export default App;

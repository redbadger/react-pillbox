/** @jsx React.DOM */

var pillbox = {};

(function () {
  pillbox.PillBox = React.createClass({
    getInitialState: function() {
      var selectedPills = this.props.pills.filter(function(pill) {
        return pill.selected == true;
      });
      return {
        highlightedIndex: -1,
        selectedPills: selectedPills,
        suggestedPills: []
      };
    },
    addPill: function(input) {
      var found = this.props.pills.filter(function(pill) {
        return pill.label.toLowerCase() == input.toLowerCase();
      });
      var item = found[0];
      var filteredSelected = this.state.selectedPills.filter(function(pill) {
        return pill.label.toLowerCase() == input.toLowerCase();
      });
      if(item && filteredSelected.length == 0) {
        this.state.selectedPills.push(item);
        this.setState({selectedPills: this.state.selectedPills});
      }
      this.clearPrescription();
    },
    removePill: function(pill) {
      this.state.selectedPills.splice(this.state.selectedPills.indexOf(pill), 1);
      this.setState({selectedPills: this.state.selectedPills});
    },
    updatePrescription: function(input) {
      if(input.length > 0) {
        this.state.suggestedPills = this.props.pills.filter(function (pill) {
          var isSelected = this.state.selectedPills.indexOf(pill) >= 0;
          return !isSelected && pill.label.toLowerCase().indexOf(input.toLowerCase()) == 0;
        }, this);
        this.setState({suggestedPills: this.state.suggestedPills});
      } else {
        this.clearPrescription();
      }
    },
    clearPrescription: function() {
      this.setState({suggestedPills: []});
    },
    highlightPillWithLabel: function(label) {
      var found = -1;
      this.state.selectedPills.forEach(function(pill, index) {
        if(pill.label.toLowerCase() == label.toLowerCase()) {
          found = index;
          return;
        }
      });

      this.setState({highlightedIndex: found});
    },
    highlightPillAt: function(index) {
      this.setState({highlightedIndex: index});

      return this.state.selectedPills[index];
    },
    handleBackspace: function() {
      var lastIndex = this.state.selectedPills.length - 1;
      if(lastIndex == this.state.highlightedIndex) {
        this.removePill(this.state.selectedPills[lastIndex]);
      } else {
        this.highlightPillAt(lastIndex);
      }
    },
    render: function() {
      var selectedPills = this.state.selectedPills.map(function(pill, index) {
        return (
          <Pill
            key={'selected-' + index}
            data={pill}
            highlighted={this.state.highlightedIndex == index}
            onRemove={this.removePill}
            onMouseOver={this.highlightPillWithLabel}
          />
        );
      }, this);

      var json = JSON.stringify(this.state.selectedPills);

      return (
        <div className='pillbox'>
          <div>
            {selectedPills}
            <Prescription
              items={this.state.suggestedPills}
              autoFocus={this.props.autoFocus}
              onInput={this.updatePrescription}
              onEnter={this.addPill}
              onEscape={this.clearPrescription}
              onBackspace={this.handleBackspace}
            />
          </div>
          <input type='hidden' name='pillbox-selected' value={json}/>
        </div>
      );
    }
  });

  var Pill = React.createClass({
    handleRemove: function() {
      if(this.props.onRemove) {
        this.props.onRemove(this.props.data);
      }
    },
    handleMouseOver: function() {
      this.props.onMouseOver(this.props.data.label);
    },
    handleMouseOut: function() {
      this.props.onMouseOver('');
    },
    render: function() {
      var classes = ['pill'];
      if(this.props.highlighted) classes.push('highlighted');

      var className = classes.join(' ');

      var label = this.props.data.label;
      var button = this.props.onRemove ? <button className='remove' onClick={this.handleRemove}>X</button> : null;

      return (
        <div
          className={className}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        >
          <span>{label}</span>
          {button}
        </div>
      );
    }
  });

  var Prescription = React.createClass({
    getInitialState: function() {
      return {
        highlightedIndex: 0
      };
    },
    setHighlight: function(label) {
      var found = 0;
      this.props.items.forEach(function(item, index) {
        if(item.label.toLowerCase() == label.toLowerCase()) {
          found = index;
          return;
        }
      });

      this.setState({highlightedIndex: found});
    },
    clearLookup: function() {
      this.refs.lookup.getDOMNode().value = '';
      this.setState({highlightedIndex: 0});
    },
    postPrescription: function() {
      if(this.props.items[this.state.highlightedIndex]) {
        this.props.onEnter(this.props.items[this.state.highlightedIndex].label);
      }
      this.clearLookup();
    },
    handleKeyDown: function(event) {
      // BACKSPACE
      if(event.which === 8) {
        if(this.refs.lookup.getDOMNode().value.length == 0) {
          this.props.onBackspace();
        }
      }
    },
    handleKeyUp: function(event) {
      var input = this.refs.lookup.getDOMNode().value.trim();

      this.props.onInput(input);

      // ENTER
      if(event.which === 13) {
        this.postPrescription();
        this.setState({highlightedIndex: 0});
      }

      // ESC
      else if(event.which === 27) {
        this.props.onEscape();
        this.clearLookup();
      }

      // UP
      else if(event.which === 38) {
        this.setState({highlightedIndex: Math.max(0, this.state.highlightedIndex - 1)});
      }

      // DOWN
      else if(event.which === 40) {
        this.setState({highlightedIndex: Math.min(this.props.items.length - 1, this.state.highlightedIndex + 1)});
      }
    },
    render: function() {
      var items = this.props.items.map(function(item, index) {
        return (
          <PrescriptionItem
            key={'prescription-item-' + index}
            data={item}
            highlighted={this.state.highlightedIndex == index}
            onMouseOver={this.setHighlight}
            onClick={this.postPrescription}
          />
        );
      }, this);

      return (
        <div className='prescription'>
          <input
            ref='lookup'
            type='text'
            autoFocus={this.props.autoFocus}
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
          />
          <div className='prescription-list'>{items}</div>
        </div>
      );
    }
  });

  var PrescriptionItem = React.createClass({
    getInitialState: function() {
      return {
        highlighted: false
      };
    },
    handleMouseOver: function() {
      this.props.onMouseOver(this.props.data.label);
    },
    handleClick: function() {
      this.props.onClick();
    },
    render: function() {
      var classes = ['prescription-item'];
      if(this.props.highlighted) classes.push('highlighted');

      var className = classes.join(' ');

      return (
        <div
          className={className}
          onMouseOver={this.handleMouseOver}
          onClick={this.handleClick}
        >
          {this.props.data.label}
        </div>
      );
    }
  });
})();

var PillBox = pillbox.PillBox;
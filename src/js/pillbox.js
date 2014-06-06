/** @jsx React.DOM */

var pillbox = {};

(function () {
  function cancelEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  pillbox.PillBox = React.createClass({
    getDefaultProps: function() {
      return {
        pills: [],
        autoFocus: true,
        numSuggestions: 5
      };
    },
    getInitialState: function() {
      var selectedPills = this.props.pills.filter(function(pill) {
        return pill.selected == true;
      });
      return {
        highlightSelected: -1,
        highlightSuggested: 0,
        selectedPills: selectedPills,
        suggestedPills: [],
        lookup: ''
      };
    },
    getLookup: function() {
      return this.refs.lookup.getDOMNode().value
    },
    addSelectedPill: function() {
      var item = this.state.suggestedPills[this.state.highlightSuggested];

      this.clearLookup();
      this.clearPrescription();

      if(!item) return;

      /*
       * Check if the given pill is already selected.
       */
      var filteredSelected = this.state.selectedPills.filter(function(pill) {
        return pill.label.toLowerCase() == item.label.toLowerCase();
      });
      if(item && filteredSelected.length == 0) {
        this.state.selectedPills.push(item);
        this.setState({selectedPills: this.state.selectedPills});
      }
    },
    clearLookup: function() {
      this.refs.lookup.getDOMNode().value = '';
      this.setState({
        highlightSelected: -1,
        highlightSuggested: 0,
        lookup: this.getLookup()
      });
    },
    clearPrescription: function() {
      this.setState({
        highlightSuggested: 0,
        suggestedPills: []
      });
    },
    removePill: function(pill) {
      this.state.selectedPills.splice(this.state.selectedPills.indexOf(pill), 1);
      this.setState({selectedPills: this.state.selectedPills});
    },
    updatePrescription: function(input) {
      if(input.length > 0) {
        this.setState({highlightSelected: -1});
        var suggestedPills = this.props.pills.filter(function (pill) {
          var isSelected = this.state.selectedPills.indexOf(pill) >= 0;
          return !isSelected && pill.label.toLowerCase().indexOf(input.toLowerCase()) == 0;
        }, this);
        this.setState({
          suggestedPills: suggestedPills.slice(0, this.props.numSuggestions),
          highlightSuggested: 0
        });
      } else {
        this.clearPrescription();
      }
    },
    highlightSelectedPillWithLabel: function(label) {
      var found = -1;
      this.state.selectedPills.forEach(function(pill, index) {
        if(pill.label.toLowerCase() == label.toLowerCase()) {
          found = index;
          return;
        }
      });

      this.setState({highlightSelected: found});
    },
    highlightSelectedPillAt: function(index) {
      this.setState({highlightSelected: index});
    },
    highlightSuggestedPillAt: function(index) {
      var pill = this.state.suggestedPills[index]
      if(pill) {
        this.setState({highlightSuggested: index});
//        this.refs.lookup.getDOMNode().value = pill.label;
      }
    },
    handleKeyDown: function(event) {
      this.setState({lookup: this.getLookup()});

      // BACKSPACE
      if(event.which === 8) {
        if(this.getLookup().length == 0) {
          var lastIndex = this.state.selectedPills.length - 1;
          if(lastIndex == this.state.highlightSelected) {
            this.removePill(this.state.selectedPills[lastIndex]);
          } else {
            this.highlightSelectedPillAt(lastIndex);
          }
        }
      }

      // ENTER
      if(event.which === 13) {
        this.addSelectedPill();
      }

      // ESC
      else if(event.which === 27) {
        this.clearPrescription();
        this.clearLookup();
      }

      // UP
      else if(event.which === 38) {
        cancelEvent(event);
      }

      // DOWN
      else if(event.which === 40) {
        cancelEvent(event);
      }
    },
    handleKeyUp: function(event) {
      this.updatePrescription(this.getLookup().trim());

      // UP
      if(event.which === 38) {
        cancelEvent(event);
        this.highlightSuggestedPillAt(Math.max(0, this.state.highlightSuggested - 1));
      }

      // DOWN
      else if(event.which === 40) {
        cancelEvent(event);
        this.highlightSuggestedPillAt(Math.min(this.state.suggestedPills.length - 1, this.state.highlightSuggested + 1));
      }
    },
    handleClick: function(event) {
      this.refs.lookup.getDOMNode().focus();
      this.updatePrescription(this.getLookup().trim());
    },
    render: function() {
      var selectedPills = this.state.selectedPills.map(function(pill, index) {
        return (
          <Pill
            key={'selected-' + index}
            data={pill}
            highlighted={this.state.highlightSelected == index}
            onRemove={this.removePill}
            onMouseOver={this.highlightSelectedPillWithLabel}
          />
        );
      }, this);

      var json = JSON.stringify(this.state.selectedPills);

      var pillbox = this;
      document.onclick = function(event) {
        if(event.target != pillbox.refs.pills.getDOMNode()) {
          pillbox.clearPrescription();
        }
      };

      return (
        <div
          className='pillbox'
          onClick={this.handleClick}
        >
          <div
            className='pillbox-pills'
            ref='pills'
          >
            {selectedPills}
            <span className='prescription'>
              <input
                type='text'
                size={this.state.lookup.length + 1}
                className='prescription-lookup'
                ref='lookup'
                autoFocus={this.props.autoFocus}
                onKeyDown={this.handleKeyDown}
                onKeyUp={this.handleKeyUp}
              />
            </span>
          </div>
          <PrescriptionList
            items={this.state.suggestedPills}
            highlightedIndex={this.state.highlightSuggested}
            onMouseOver={this.highlightSuggestedPillAt}
            onItemClick={this.addSelectedPill}
          />
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
      if(this.props.highlighted) classes.push('pill-highlighted');

      var className = classes.join(' ');

      var label = this.props.data.label;
      var button = this.props.onRemove ? <button className='remove' onClick={this.handleRemove}>X</button> : null;

      return (
        <span
          className={className}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        >
          <span>{label}</span>
          {button}
        </span>
      );
    }
  });

  var PrescriptionList = React.createClass({
    setHighlight: function(label) {
      var found = 0;
      this.props.items.forEach(function(item, index) {
        if(item.label.toLowerCase() == label.toLowerCase()) {
          found = index;
          return;
        }
      });

      this.props.onMouseOver(found);
    },
    handleItemClick: function(label) {
      this.setHighlight(label);
      this.props.onItemClick();
    },
    render: function() {
      var prescriptionItems = this.props.items.map(function(item, index) {
        return (
          <PrescriptionItem
            key={'prescription-item-' + index}
            data={item}
            highlighted={this.props.highlightedIndex == index}
            onMouseOver={this.setHighlight}
            onClick={this.handleItemClick}
          />
          );
      }, this);

      var classes = ['prescription-list'];
      if(this.props.items.length == 0) classes.push('prescription-list-empty');

      var className = classes.join(' ');

      return (
        <div className={className}>
          {prescriptionItems}
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
      this.props.onClick(this.props.data.label);
    },
    render: function() {
      var classes = ['prescription-item'];
      if(this.props.highlighted) classes.push('prescription-item-highlighted');

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
/** @jsx React.DOM */

var pillbox = {};

(function () {
  pillbox.PillBox = React.createClass({
    getInitialState: function() {
      return {
        selectedPills: [],
        suggestedPills: []
      };
    },
    addPrescriptionItem: function(input) {
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
    removeSelectedPill: function(pill) {
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
    render: function() {
      var selectedPills = this.state.selectedPills.map(function(pill) {
        return <Pill data={pill} onRemove={this.removeSelectedPill} />;
      }, this);

      var availablePills = this.props.pills.filter(function(pill) {
        var isSelected = this.state.selectedPills.indexOf(pill) >= 0;
        return !isSelected;
      }, this).map(function(pill) {
        return <Pill data={pill}/>;
      });

      return (
        <div>
          <h1>Pill Box</h1>
          <div>
            {selectedPills}
          </div>
          <Prescription
            items={this.state.suggestedPills}
            onInput={this.updatePrescription}
            onEnter={this.addPrescriptionItem}
            onEscape={this.clearPrescription}
          />
          <div>
            <h2>Available Pills</h2>
            {availablePills}
          </div>
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
    render: function() {
      var label = this.props.data.label;
      var button = this.props.onRemove ? <button onClick={this.handleRemove}>X</button> : null;

      return (
        <div className='pill'>
          <span>{label}</span>
          <span> ({this.props.data.value})</span>
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
      this.props.onEnter(this.props.items[this.state.highlightedIndex].label);
      this.clearLookup();
    },
    handleKeyUp: function(event) {
      var input = event.target.value.trim();

      this.props.onInput(input);

      if(event.which === 13) {
        // ENTER
        this.postPrescription();
        this.setState({highlightedIndex: 0});
      }

      else if(event.which === 27) {
        // ESC
        this.props.onEscape();
        this.clearLookup();
      }

      else if(event.which === 38) {
        // UP
        this.setState({highlightedIndex: Math.max(0, this.state.highlightedIndex - 1)});
      }

      else if(event.which === 40) {
        // DOWN
        this.setState({highlightedIndex: Math.min(this.props.items.length - 1, this.state.highlightedIndex + 1)});
      }
    },
    render: function() {
      var items = this.props.items.map(function(item, index) {
        return (
          <PrescriptionItem
            data={item}
            highlighted={this.state.highlightedIndex == index}
            onMouseOver={this.setHighlight}
            onClick={this.postPrescription}
          />
        );
      }, this);

      return (
        <div>
          <input
            ref="lookup"
            type="text"
            onKeyUp={this.handleKeyUp}
          />
          <div>{items}</div>
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
      var isHighlighted = this.state.highlighted || this.props.highlighted;

      var classes = React.addons.classSet({
        'autocomplete-item': true,
        'highlighted': isHighlighted
      });

      return (
        <div
          className={classes}
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
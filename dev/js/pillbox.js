/** @jsx React.DOM */

var pillbox = {};

(function () {
  function cancelEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  pillbox.PillBox = React.createClass({displayName: 'PillBox',
    getDefaultProps: function() {
      return {
        name: 'pillbox',
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
        placeholderIndex: -1,
        draggedIndex: -1,
        highlightSelected: -1,
        highlightSuggested: 0,
        selectedPills: selectedPills,
        suggestedPills: [],
        lookup: ''
      };
    },
    componentDidMount: function() {
      document.addEventListener('click', this.handleClickOutside);
    },
    componentWillUnmount: function() {
      document.removeEventListener('click', this.handleClickOutside);
    },
    getLookup: function() {
      return this.refs.lookup.getDOMNode().value
    },
    getAllSelectedPills: function() {
      return this.state.selectedPills;
    },
    getJSON: function() {
      return JSON.stringify(this.state.selectedPills);
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

      this.handleChange();
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
      this.handleChange();
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
    indexPillWithLabel: function(label) {
      var found = -1;
      this.state.selectedPills.forEach(function(pill, index) {
        if(pill.label.toLowerCase() == label.toLowerCase()) {
          found = index;
          return;
        }
      });

      return found;
    },
    highlightSelectedPillWithLabel: function(label) {
      this.setState({highlightSelected: this.indexPillWithLabel(label)});
    },
    highlightSelectedPillAt: function(index) {
      this.setState({highlightSelected: index});
    },
    highlightSuggestedPillAt: function(index) {
      var pill = this.state.suggestedPills[index]
      if(pill) {
        this.setState({highlightSuggested: index});
      }
    },
    handleClickOutside: function(event) {
      var pillbox = this;
      if(event.target != pillbox.refs.pills.getDOMNode()) {
        pillbox.clearPrescription();
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
        event.stopPropagation();
        event.preventDefault();

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
    setPlaceholder: function(label) {
      this.setState({draggedIndex: this.indexPillWithLabel(label)});
    },
    removePlaceholder: function() {
      var placeholderIndex = this.state.placeholderIndex;
      var newIndex = this.state.draggedIndex < placeholderIndex ? placeholderIndex - 1 : placeholderIndex;
      var pill = this.state.selectedPills[this.state.draggedIndex];
      var selectedPills = this.state.selectedPills;

      selectedPills.splice(this.state.draggedIndex, 1);
      selectedPills.splice(newIndex, 0, pill);
      this.handleChange();

      this.setState({
        placeholderIndex: -1,
        highlightSelected: newIndex,
        selectedPills: selectedPills
      });
    },
    handleDragOver: function(event) {
      event.preventDefault();

      /*
       * If dragging over a pill
       */
      var eventTarget = event.target;
      if(eventTarget.parentNode.className.split(' ').indexOf('pill') >= 0) {
        eventTarget = eventTarget.parentNode;
      }
      if(eventTarget.className.split(' ').indexOf('pill') >= 0) {
        var found = -1;
        var index = -1;
        var tmp = -1;
        var childNodes = this.refs.pills.getDOMNode().childNodes;
        var placeholderIndex = this.state.placeholderIndex;

        for(var i = 0 ; i < childNodes.length ; ++i) {
          var child = childNodes[i];
          if(placeholderIndex != i) {
            ++index;
          }

          if(child.getAttribute('data-key') == eventTarget.getAttribute('data-key')) {
            found = index;
            tmp = i;
            break;
          }
        }

        if(placeholderIndex != found) {
          this.setState({placeholderIndex: found});
        }
      }
      /*
       * Place the placeholder at the end of the list
       */
      else if(eventTarget.className == 'prescription') {
        this.setState({placeholderIndex: this.state.selectedPills.length});
      }
    },
    handleChange: function() {
      if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        this.getDOMNode().dispatchEvent(evt);
      }
      else {
        this.getDOMNode().fireEvent("onchange");
      }
    },
    render: function() {
      var selectedPills = this.state.selectedPills.map(function(pill, index) {
        return (
          Pill(
            {key:'selected-' + index,
            data:pill,
            highlighted:this.state.highlightSelected == index,
            onRemove:this.removePill,
            onMouseOver:this.highlightSelectedPillWithLabel,
            onDragStart:this.setPlaceholder,
            onDragEnd:this.removePlaceholder}
          )
        );
      }, this);

      var placeholderIndex = this.state.placeholderIndex;
      if(placeholderIndex >= 0) {
        selectedPills.splice(this.state.placeholderIndex, 0, PlaceholderPill( {data:this.state.selectedPills[this.state.draggedIndex].label}));
      }

      var json = this.getJSON();

      return (
        React.DOM.div(
          {className:"pillbox",
          onClick:this.handleClick}
        , 
          React.DOM.div(
            {className:"pillbox-pills",
            ref:"pills",
            onDragOver:this.handleDragOver}
          , 
            selectedPills,
            React.DOM.span( {className:"prescription"}, 
              React.DOM.input(
                {type:"text",
                size:this.state.lookup.length + 1,
                className:"prescription-lookup",
                ref:"lookup",
                autoFocus:this.props.autoFocus,
                onKeyDown:this.handleKeyDown,
                onKeyUp:this.handleKeyUp}
              )
            )
          ),
          PrescriptionList(
            {items:this.state.suggestedPills,
            highlightedIndex:this.state.highlightSuggested,
            onMouseOver:this.highlightSuggestedPillAt,
            onItemClick:this.addSelectedPill}
          ),
          React.DOM.input( {type:"hidden", name:this.props.name, value:json})
        )
      );
    }
  });

  var Pill = pillbox.Pill = React.createClass({displayName: 'Pill',
    handleRemove: function() {
      this.props.onRemove(this.props.data);
    },
    handleMouseOver: function() {
      this.props.onMouseOver(this.props.data.label);
    },
    handleMouseOut: function() {
      this.props.onMouseOver('');
    },
    handleDragStart: function(event) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData("text/html", event.currentTarget); // Firefox
      this.props.onDragStart(this.props.data.label);
    },
    handleDragEnd: function() {
      this.props.onDragEnd();
    },
    render: function() {
      var classes = ['pill'];
      if(this.props.highlighted) classes.push('pill-highlighted');

      var className = classes.join(' ');

      var label = this.props.data.label;
      var button = this.props.onRemove ? React.DOM.button( {className:"remove", onClick:this.handleRemove}, "X") : null;

      return (
        React.DOM.span(
          {draggable:"true",
          className:className,
          'data-key':this.props.key,
          onMouseOver:this.handleMouseOver,
          onMouseOut:this.handleMouseOut,
          onDragStart:this.handleDragStart,
          onDragEnd:this.handleDragEnd}
        , 
          React.DOM.span(null, label),
          button
        )
      );
    }
  });

  var PlaceholderPill = pillbox.PlaceholderPill = React.createClass({displayName: 'PlaceholderPill',
    render: function() {
      return (
        React.DOM.span( {className:"pill-placeholder"})
      );
    }
  });

  var PrescriptionList = pillbox.PrescriptionList = React.createClass({displayName: 'PrescriptionList',
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
          PrescriptionItem(
            {key:'prescription-item-' + index,
            data:item,
            highlighted:this.props.highlightedIndex == index,
            onMouseOver:this.setHighlight,
            onClick:this.handleItemClick}
          )
          );
      }, this);

      var classes = ['prescription-list'];
      if(this.props.items.length == 0) classes.push('prescription-list-empty');

      var className = classes.join(' ');

      return (
        React.DOM.div( {className:className}, 
          prescriptionItems
        )
      );
    }
  });

  var PrescriptionItem = pillbox.PrescriptionItem = React.createClass({displayName: 'PrescriptionItem',
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
        React.DOM.div(
          {className:className,
          onMouseOver:this.handleMouseOver,
          onClick:this.handleClick}
        , 
          this.props.data.label
        )
      );
    }
  });
})();

var PillBox = pillbox.PillBox;
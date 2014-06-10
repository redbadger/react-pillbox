/** @jsx React.DOM */

var ReactTestUtils = React.addons.TestUtils;

describe('Pill Box Component', function() {
  it('all classes should be defined', function() {
    expect(PillBox).toBeDefined();
    expect(pillbox.PillBox).toBeDefined();
    expect(pillbox.Pill).toBeDefined();
    expect(pillbox.PlaceholderPill).toBeDefined();
    expect(pillbox.PrescriptionList).toBeDefined();
    expect(pillbox.PrescriptionItem).toBeDefined();
  });

  describe('pill box', function() {
    var pillbox;

    describe('default pill box', function() {
      beforeEach(function() {
        pillbox = ReactTestUtils.renderIntoDocument(PillBox(null));
      });

      it('should have correct default props', function() {
        expect(pillbox.props.name).toBe('pillbox');
        expect(pillbox.props.pills).toEqual([]);
        expect(pillbox.props.autoFocus).toBeTruthy();
        expect(pillbox.props.numSuggestions).toBe(5);
      });
    });

    describe('initialise pill box with no preselect', function() {
      beforeEach(function() {
        pillbox = ReactTestUtils.renderIntoDocument(PillBox( {pills:pillsNoPreselect}));
      });

      it('should have no selected pills', function() {
        expect(pillbox.getAllSelectedPills().length).toBe(0);
      });

      it('should be able to add a selected pill', function() {
        pillbox.addToSelected(2);
        expect(pillbox.getAllSelectedPills().length).toBe(1);
      });

      it('should not add unavailable pill to the selected', function() {
        pillbox.addToSelected(2);
        pillbox.addToSelected(999);
        expect(pillbox.getAllSelectedPills().length).toBe(1);
      });

      it('should not add a pill to the selected if the pill is already selected', function() {
        pillbox.addToSelected(2);
        pillbox.addToSelected(2);
        pillbox.addToSelected(2);

        expect(pillbox.getAllSelectedPills().length).toBe(1);
      });

      it('should be able to clear the selected', function() {
        pillbox.addToSelected(1);
        pillbox.addToSelected(2);
        pillbox.addToSelected(3);
        pillbox.clearSelected();

        expect(pillbox.getAllSelectedPills().length).toBe(0);
      });
    });
  });
});
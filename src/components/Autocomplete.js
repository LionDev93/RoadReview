/*global google*/

import React from "react";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import { Button, Icon } from "semantic-ui-react";

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input
        }
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.place_name, query);
  const parts = parse(suggestion.place_name, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) =>
          part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )
        )}
      </div>
    </MenuItem>
  );
}

function getSuggestionValue(suggestion) {
  return suggestion.place_name;
}

const styles = theme => ({
  input: {
    textAlign: "right"
  },
  root: {
    // height: 250,
    flexGrow: 1
  },
  container: {
    position: "relative",
    marginRight: "10px"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  },
  divider: {
    height: theme.spacing.unit * 2
  }
});

class IntegrationAutosuggest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      single: this.props.answer,
      popper: "",
      suggestions: [],
      suggestionSelected: false
    };
  }
  getSuggestions(value) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;
    return inputLength === 0
      ? []
      : this.props.placesList.filter(suggestion => {
          const keep =
            count < 5 &&
            suggestion.place_name.slice(0, inputLength).toLowerCase() ===
              inputValue;

          if (keep) {
            count += 1;
          }
          return keep;
        });
  }
  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleChange = name => (event, { newValue, method }) => {
    if (method !== "up" && method !== "down")
      this.setState({
        [name]: newValue
      });
    // change state to show "Find location" button in UI for case where no suggestions
    if (name === "single") {
      this.setState({
        suggestionSelected: false
      });
    }
  };
  onSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    let lat = parseFloat(suggestion.lat);
    let lng = parseFloat(suggestion.lon);
    let newmarker = {};
    newmarker.position = new google.maps.LatLng(lat, lng);
    let markers = [newmarker];
    this.props.onPlacesChangedAutoCompleate(markers, suggestion);
    // change state to remove "Find location" button from UI
    this.setState({
      suggestionSelected: true
    });
  };

  static getDerivedStateFromProps(props, state) {
    if (props.changed) {
      props.changeToFalse();
      return { single: props.answer };
    } else return null;
  }

  render() {
    const { classes } = this.props;
    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion,
      onPlacesChangedAutoCompleate: this.props.onPlacesChangedAutoCompleate,
      onSuggestionSelected: this.onSuggestionSelected
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            placeholder: "חפש שם מקום במאגר שלנו",
            value: this.state.single,
            onChange: this.handleChange("single")
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion
          }}
          renderSuggestionsContainer={options => {
            if (options.children) {
              // if we've got suggestions
              return (
                <Paper {...options.containerProps} square>
                  {options.children}
                </Paper>
              );
            } else if (
              this.state.single &&
              options.children === null &&
              !this.state.suggestionSelected
            ) {
              // show google button if no suggestions
              return (
                <Button
                  style={{ marginTop: "4px" }}
                  size="mini"
                  type={"button"}
                  onClick={this.props.clickGoogle}
                  icon
                  labelPosition="left"
                >
                  <Icon name="map" />
                  Find location
                </Button>
              );
            }
          }}
        />
        <div className={classes.divider} />
      </div>
    );
  }
}

IntegrationAutosuggest.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IntegrationAutosuggest);

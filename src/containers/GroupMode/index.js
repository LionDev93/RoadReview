import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { NotificationManager } from 'react-notifications';
import { connect } from 'react-redux';

import MapWrapper from '../../views/organisms/MapWrapper';
import MapManager from './MapManager';

import {
  postGroup,
  getGroup,
  clearGroupPlaces,
} from '../../store/actions/placesActions';

const styles = theme => ({
  card: {
    maxWidth: 345,
  },
  media: {
    height: 200,
  },

  itemsCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textField: {
    margin: 8,
  },
  listStyle: {
    marginBottom: 12,
  },
});

class GroupMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: '',
      lat: '',
      lon: '',
      radius: '',
      questionArray: null,

      selectedIndex: -1,

      isLoaded: false,
    };
  }

  componentDidMount() {}
  componentWillReceiveProps(newProps) {}

  handleInput = input => e => {
    this.setState({ [input]: e.target.value });
  };

  handleEditQuestion = e => {
    this.state.questionArray[this.state.selectedIndex].question =
      e.target.value;
    this.setState({ questionArray: this.state.questionArray });
  };

  handleEditStory = e => {
    this.state.questionArray[this.state.selectedIndex].story = e.target.value;
    this.setState({ questionArray: this.state.questionArray });
  };

  handleLoad = () => {
    this.setState({ selectedIndex: -1 }, function() {
      this.getGroup();
    });
  };

  getGroup = () => {
    const { getGroup } = this.props;
    const { lat, lon, radius, groupName } = this.state;
    getGroup({
      lat: lat,
      lng: lon,
      radius,
      groupName,
    });

    this.setState({ isLoaded: true });
  };

  componentWillReceiveProps = nextProps => {
    const { group } = nextProps;
    this.setState({ questionArray: group.group_items });
  };

  handleSelectMarker = index => {
    this.setState({ selectedIndex: index });
  };

  handleMarkerPos = (index, pos) => {
    this.state.questionArray[index].coords[0][0] = pos.lat;
    this.state.questionArray[index].coords[0][1] = pos.lng;
    this.setState({
      questionArray: this.state.questionArray,
      selectedIndex: index,
    });
  };

  handleClickOnMap = pos => {
    const gname = this.state.groupName;
    const lat = pos.lat;
    const lng = pos.lng;
    this.state.questionArray.push({
      answers: [],
      assigned_user: null,
      categories: [],
      coords: [[pos.lat, pos.lng]],
      datastore_id: undefined,
      difficulty: undefined,
      distance: undefined,
      distance_to_edge: 0,
      editor_username: undefined,
      enabled: true,
      extended_story: null,
      extended_story_voices: [],
      groups: [this.state.groupName],
      groups_locations: undefined, //{123: {…}}
      is_ready: true,
      is_test: false,
      item_id: undefined, //"4efa0461027ed3a0a3234e84cafe8a30"
      labels: undefined, //["מודיעין-מכבים-רעות"]
      last_modified: undefined, //"Wed, 24 Jul 2019 10:25:23 GMT"
      lat: pos.lat,
      lon: pos.lng,
      night_item: false,
      notes: null,
      original_id: undefined,
      parents: [],
      place: undefined, //"GRP_מודיעין-מכבים-רעות"
      place_relevancy: null,
      question: '',
      question_images: [],
      question_videos: [],
      qustion_voice: null,
      raw_text: null,
      related: [],
      right_answer: '',
      score: undefined,
      see_item: false,
      source: 'playbuzz',
      story: '',
      story_images: [],
      story_ref: null,
      story_videos: [],
      story_voices: [],
      submission_time: undefined,
      tourists_relevancy: null,
      type: 'question',
      urlsafe: undefined,
      writer_username: undefined, //"May"
    });
    this.setState({ questionArray: this.state.questionArray });
  };

  handleRemoveItem = index => {
    if (this.state.selectedIndex === index) {
      this.setState({ selectedIndex: -1 });
    }
    this.state.questionArray[index].isDeleted = true;
    this.setState({ questionArray: this.state.questionArray });
  };

  handleSave = () => {
    const { postGroup } = this.props;
    postGroup({
      group_name: this.state.groupName,
      items: this.state.questionArray.map(p => {
        if (!p.isDeleted) return { ...p, ref: undefined };
      }),
    });
  };

  render() {
    const { classes } = this.props;
    const {
      groupName,
      lat,
      lon,
      radius,
      questionArray,
      selectedIndex,
    } = this.state;
    return (
      <div style={{ padding: 8 }}>
        <Grid container>
          <Grid item xs={12} sm={5}>
            <TextField
              id="group-name"
              label="Group Name"
              placeholder="..."
              className={classes.textField}
              margin="normal"
              value={groupName}
              onChange={this.handleInput('groupName')}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Grid container>
              <Grid item xs={4}>
                <TextField
                  id="lat"
                  label="LAT"
                  placeholder="0~90"
                  className={classes.textField}
                  margin="normal"
                  value={lat}
                  onChange={this.handleInput('lat')}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="lon"
                  label="LON"
                  placeholder="0~180"
                  className={classes.textField}
                  margin="normal"
                  value={lon}
                  onChange={this.handleInput('lon')}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="radius"
                  label="Radius"
                  placeholder="..."
                  className={classes.textField}
                  margin="normal"
                  value={radius}
                  onChange={this.handleInput('radius')}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container>
          <Grid
            item
            xs={12}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              style={{ margin: 16 }}
              variant="contained"
              color="primary"
              onClick={this.handleLoad}
            >
              Load
            </Button>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} sm={4}>
            {selectedIndex > -1 && (
              <Grid container>
                <Grid item xs={12}>
                  <p>Label: {selectedIndex}</p>
                </Grid>
                <Grid item xs={12}>
                  <p>
                    Pos: {questionArray[selectedIndex].coords[0].join(', ')}
                  </p>
                </Grid>
                <Grid item xs={12} style={{ paddingRight: 8 }}>
                  <TextField
                    label="Question"
                    placeholder="..."
                    className={classes.textField}
                    style={{ marginLeft: 0 }}
                    margin="normal"
                    value={questionArray[selectedIndex].question}
                    multiline
                    fullWidth
                    onChange={this.handleEditQuestion}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Story"
                    placeholder="..."
                    className={classes.textField}
                    style={{ marginLeft: 0 }}
                    margin="normal"
                    value={questionArray[selectedIndex].story}
                    multiline
                    fullWidth
                    onChange={this.handleEditStory}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12} sm={8}>
            {questionArray && (
              <MapManager
                questionMarkers={questionArray}
                center={
                  questionArray.length > 0
                    ? {
                        lat: questionArray[0].coords[0][0],
                        lng: questionArray[0].coords[0][1],
                      }
                    : { lat: 36, lng: 32 }
                }
                onClickMarker={this.handleSelectMarker}
                onMarkerPosChange={this.handleMarkerPos}
                onCreateNewItem={this.handleClickOnMap}
                onClickCloseBtn={this.handleRemoveItem}
              />
            )}
          </Grid>
        </Grid>
        {questionArray && (
          <Grid container>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                style={{ margin: 16 }}
                variant="contained"
                color="secondary"
                onClick={this.handleSave}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        )}
        {questionArray &&
          questionArray.length > 0 &&
          questionArray.map((item, index) => {
            if (!item.isDeleted) {
              return (
                <div
                  style={{
                    borderWidth: 1,
                    borderColor: '#333',
                    borderStyle: 'dotted',
                    marginBottom: 4,
                    padding: 4,
                  }}
                >
                  <Grid container className={classes.listStyle}>
                    <Grid item xs={12} sm={4}>
                      {index}. {item.question}
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      {item.story}
                    </Grid>
                  </Grid>
                </div>
              );
            }
          })}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  group: state.placesReducer.group,
});

export default connect(
  mapStateToProps,
  { postGroup, getGroup, clearGroupPlaces },
)(withStyles(styles)(GroupMode));

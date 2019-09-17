import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Grid, DialogTitle } from '@material-ui/core';
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
// import LoadingOverlay from 'react-loading-overlay';
import Dialog from '@material-ui/core/Dialog';
import { DialogContent } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

import MapWrapper from '../../views/organisms/MapWrapper';
import MapManager from './MapManager';

import {
  postGroup,
  getGroup,
  clearGroupPlaces,
} from '../../store/actions/placesActions';
import { Checkbox } from '@material-ui/core';
import EditNewItem from './EditNewItem';

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
  listStyle_group: {
    marginBottom: 12,
    backgroundColor: '#ffcc80',
  },
  group_background: {
    backgroundColor: '#ffcc80',
  },
});

class GroupMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: '',
      lat: '',
      lng: '',
      radius: '',
      questionArray: [],
      // itemsArray: [],

      selectedIndex: -1,
      // selectedItemIndex: -1,

      isLoading: false,
      isMapForLat: true,
      isNewItemDlg: false,
    };
  }

  componentDidMount() {}

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

  handleEditQuestionChild = e => {
    this.state.questionArray[this.state.selectedIndex].related[0].question =
      e.target.value;
    this.setState({ questionArray: this.state.questionArray });
  };

  handleEditStoryChild = e => {
    this.state.questionArray[this.state.selectedIndex].related[0].story =
      e.target.value;
    this.setState({ questionArray: this.state.questionArray });
  };

  handleLoad = () => {
    const { lat, lng, radius, groupName } = this.state;
    if (!lat || !lng || !radius || !groupName) {
      NotificationManager.warning('Fill the input boxes!');
      return;
    }
    this.setState({ selectedIndex: -1 }, function() {
      this.getGroup();
    });
  };

  getGroup = () => {
    const { getGroup } = this.props;
    const { lat, lng, radius, groupName } = this.state;
    getGroup({
      lat: lat,
      lng: lng,
      radius,
      groupName,
    });

    this.setState({ isLoading: true });
  };

  componentWillReceiveProps = nextProps => {
    console.log('willReceiveProps called,', nextProps);
    const { group, updated } = nextProps;
    if (group === null) {
      NotificationManager.warning('Failed to load');
      this.setState({ isLoading: false });
      return;
    }
    var itemsAll = [];
    group.group_items.map(item => {
      if (!item.coords) {
        item.coords = [[32, 34]];
      }

      item.kind = 'group';
      item.isDeleted = false;
      item.include_follow_up = true;

      itemsAll.push(item);
    });
    group.items.map(item => {
      if (!item.coords) {
        item.coords = [[32, 34]];
      }

      item.kind = 'item';
      item.isDeleted = false;
      item.include_follow_up = true;

      itemsAll.push(item);
    });

    this.setState({ questionArray: itemsAll, isLoading: false });
  };

  handleSelectMarker = index => {
    this.setState({ selectedIndex: index });
  };

  handleMarkerPos = (index, pos) => {
    this.state.questionArray[index].coords[0][0] = pos.lat;
    this.state.questionArray[index].coords[0][1] = pos.lng;
    if (this.state.questionArray[index].kind === 'group') {
      if (!this.state.questionArray[index].groups_locations)
        this.state.questionArray[index].groups_locations = {};
      this.state.questionArray[index].groups_locations[this.state.groupName] = {
        lat: pos.lat,
        lon: pos.lng,
      };
      console.log(
        'group location has changed',
        this.state.questionArray[index].groups_locations,
      );
      // Object.keys(this.state.questionArray[index].groups_locations).map(
      //   item => {
      //     this.state.questionArray[index].groups_locations[item] = {
      //       lat: pos.lat,
      //       lon: pos.lng,
      //     };
      //   },
      // );
    }
    this.setState({
      questionArray: this.state.questionArray,
      selectedIndex: index,
    });
  };

  handleClickOnMap = pos => {
    if (this.state.isMapForLat) {
      this.setState({ lat: pos.lat, lng: pos.lng });
      return;
    }

    this.setState({ isNewItemDlg: true });
    return;
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
      // group_items: this.state.questionArray.filter(function(p) {
      //   if (!p.isDeleted && p.kind === 'group') return true;
      //   return false;
      // }),
      // items: this.state.questionArray.filter(function(p) {
      //   if (!p.isDeleted && p.kind === 'item') return true;
      //   return false;
      // }),
      items: this.state.questionArray.filter(function(p) {
        if (!p.isDeleted && p.kind === 'group') {
          // p.include_follow_up = true;
          return true;
        }
        return false;
      }),
    });
    this.setState({ isLoading: true });
  };

  handleRemoveChild = () => {
    const { questionArray, selectedIndex } = this.state;
    questionArray[selectedIndex].related.splice(0, 1);
    questionArray[selectedIndex].include_follow_up = false;
    // const item_id = questionArray[selectedIndex].item_id;
    // questionArray.map(item => {
    //   if (item.item_id === item_id) {
    //     console.log('fff', item_id);
    //     item.include_follow_up = false;
    //   }
    // });
    this.setState({ questionArray: questionArray });
  };

  handleAddtoGroup = () => {
    const { questionArray, selectedIndex } = this.state;
    questionArray[selectedIndex].kind = 'group';
    this.setState({ questionArray: questionArray });
  };

  handleRemoveFromGroup = () => {
    const { questionArray, selectedIndex } = this.state;
    questionArray[selectedIndex].kind = 'item';
    this.setState({ questionArray: questionArray });
  };

  saveItem = data => {
    this.state.questionArray.push({
      answers: [
        data.correctAnswer,
        data.incorrectAnswer1,
        data.incorrectAnswer2,
        data.incorrectAnswer3,
      ],
      assigned_user: null,
      categories: [],
      coords: [[this.state.lat, this.state.lng]],
      datastore_id: undefined,
      difficulty: data.difficultyLevel,
      distance: undefined,
      distance_to_edge: 0,
      editor_username: undefined,
      enabled: true,
      extended_story: null,
      extended_story_voices: [],
      groups: [this.state.groupName],
      groups_locations: {
        [this.state.groupName]: {
          lat: this.state.lat,
          lon: this.state.lng,
        },
      }, //{123: {…}}
      is_ready: true,
      is_test: false,
      item_id: undefined, //"4efa0461027ed3a0a3234e84cafe8a30"
      labels: undefined, //["מודיעין-מכבים-רעות"]
      last_modified: undefined, //"Wed, 24 Jul 2019 10:25:23 GMT"
      lat: this.state.lat,
      lng: this.state.lng,
      night_item: false,
      notes: null,
      original_id: undefined,
      parents: [],
      place: undefined, //"GRP_מודיעין-מכבים-רעות"
      place_relevancy: null,
      question: data.question,
      question_images: [data.askingImg],
      question_videos: [],
      qustion_voice: null,
      raw_text: null,
      related: [],
      right_answer: data.correctAnswer,
      score: data.qualityLevel,
      see_item: false,
      source: 'playbuzz',
      story: data.story,
      story_images: data.replyImg,
      story_ref: null,
      story_videos: [],
      story_voices: [],
      submission_time: undefined,
      tourists_relevancy: null,
      type: 'question',
      urlsafe: undefined,
      writer_username: undefined, //"May"
      kind: 'group',
      isDeleted: false,
      include_follow_up: true,
    });
    this.setState({
      questionArray: this.state.questionArray,
      isNewItemDlg: false,
    });
  };

  render() {
    const { classes } = this.props;
    const {
      groupName,
      lat,
      lng,
      radius,
      questionArray,
      // itemsArray,
      // selectedItemIndex,

      selectedIndex,
      isMapForLat,

      isLoading,
      isNewItemDlg,
    } = this.state;
    return (
      <div>
        <Grid style={{ padding: 8 }}>
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
                    id="lng"
                    label="lng"
                    placeholder="0~180"
                    className={classes.textField}
                    margin="normal"
                    value={lng}
                    onChange={this.handleInput('lng')}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="radius"
                    label="Radius"
                    placeholder="..."
                    className={classes.textField}
                    margin="normal"
                    type="number"
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
                <Grid container style={{ marginTop: 60 }}>
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
                  {questionArray[selectedIndex].related.length > 0 && (
                    <div>
                      <Grid item xs={12}>
                        Child:
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={this.handleRemoveChild}
                        >
                          Remove child only
                        </Button>
                      </Grid>
                      <Grid item xs={12} style={{ paddingRight: 8 }}>
                        <TextField
                          label="Question"
                          placeholder="..."
                          className={classes.textField}
                          style={{ marginLeft: 0 }}
                          margin="normal"
                          value={
                            questionArray[selectedIndex].related[0].question
                          }
                          multiline
                          fullWidth
                          onChange={this.handleEditQuestionChild}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Story"
                          placeholder="..."
                          className={classes.textField}
                          style={{ marginLeft: 0 }}
                          margin="normal"
                          value={questionArray[selectedIndex].related[0].story}
                          multiline
                          fullWidth
                          onChange={this.handleEditStoryChild}
                        />
                      </Grid>
                    </div>
                  )}
                  {questionArray[selectedIndex].kind === 'item' && (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={this.handleAddtoGroup}
                      >
                        Add to Group
                      </Button>
                    </Grid>
                  )}
                  {questionArray[selectedIndex].kind === 'group' && (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={this.handleRemoveFromGroup}
                      >
                        Remove whole item from Group
                      </Button>
                    </Grid>
                  )}
                </Grid>
              )}
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControlLabel
                style={{ marginLeft: 16 }}
                control={
                  <Checkbox
                    color="primary"
                    checked={isMapForLat}
                    onChange={e => {
                      this.setState({ isMapForLat: e.target.checked });
                    }}
                  />
                }
                label="use map for select lat,lng"
              />
              <MapManager
                questionMarkers={questionArray}
                center={
                  // questionArray.length > 0
                  //   ? {
                  //       lat: questionArray[0].coords[0][0],
                  //       lng: questionArray[0].coords[0][1],
                  //     }
                  // :
                  { lat: 32.060576042538216, lng: 34.8643424543518 }
                }
                onClickMarker={this.handleSelectMarker}
                onMarkerPosChange={this.handleMarkerPos}
                onCreateNewItem={this.handleClickOnMap}
                onClickCloseBtn={this.handleRemoveItem}
              />
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
              if (!item.isDeleted && item.kind === 'group') {
                return (
                  <div
                    style={{
                      borderWidth: 1,
                      borderColor: '#333',
                      borderStyle: 'dotted',
                      marginBottom: 4,
                      padding: 4,
                    }}
                    className={
                      item.kind === 'group' ? classes.group_background : ''
                    }
                  >
                    <Grid container className={classes.listStyle}>
                      <Grid item xs={12} sm={4}>
                        {index}. {item.question}
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        {item.story}
                      </Grid>
                      {item.related.length > 0 && (
                        <Grid item xs={12} container>
                          <Grid item xs={12}>
                            Child:
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            {item.related[0].question}
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            {item.related[0].story}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </div>
                );
              }
            })}
          {questionArray &&
            questionArray.length > 0 &&
            questionArray.map((item, index) => {
              if (!item.isDeleted && item.kind !== 'group') {
                return (
                  <div
                    style={{
                      borderWidth: 1,
                      borderColor: '#333',
                      borderStyle: 'dotted',
                      marginBottom: 4,
                      padding: 4,
                    }}
                    className={
                      item.kind === 'group' ? classes.group_background : ''
                    }
                  >
                    <Grid container className={classes.listStyle}>
                      <Grid item xs={12} sm={4}>
                        {index}. {item.question}
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        {item.story}
                      </Grid>
                      {item.related.length > 0 && (
                        <Grid item xs={12} container>
                          <Grid item xs={12}>
                            Child:
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            {item.related[0].question}
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            {item.related[0].story}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </div>
                );
              }
            })}
        </Grid>
        <Dialog disableBackdropClick disableEscapeKeyDown open={isLoading}>
          <DialogContent
            style={{
              minWidth: 150,
              minHeight: 150,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
          </DialogContent>
        </Dialog>
        <Dialog maxWidth="md" open={isNewItemDlg}>
          <DialogTitle>New Item</DialogTitle>
          <DialogContent>
            <EditNewItem
              onSave={this.saveItem}
              onCancel={() => this.setState({ isNewItemDlg: false })}
            ></EditNewItem>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  group: state.placesReducer.group,
  updated: state.placesReducer.updated,
});

export default connect(
  mapStateToProps,
  { postGroup, getGroup, clearGroupPlaces },
)(withStyles(styles)(GroupMode));

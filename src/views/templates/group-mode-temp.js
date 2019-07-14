import React, { Component } from "react";
import PropTypes from "prop-types";
import MapWrapper from "../organisms/MapWrapper";
import AroundLocation from "../organisms/AroundLocation";
import GroupModeQuestions from "../organisms/GroupModeQuestions";
import { Button } from "semantic-ui-react";
import Grid from "@material-ui/core/Grid";
import GroupModeMapChildren from "../organisms/GroupModeMapChildren";
import Divider from "@material-ui/core/Divider";
import { connect } from "react-redux";
import {
  postGroup,
  getGroup,
  clearGroupPlaces
} from "../../store/actions/placesActions";

class GroupModeTemp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      aroundLat: 32,
      aroundLng: 34,
      radius: 5000,
      groupPlaces: [],
      mapView: "all",
      groupName: "",
      nextPlaces: [],
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.handlePlaceChanges = this.handlePlaceChanges.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  componentWillUnmount() {
    this.props.clearGroupPlaces();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  onMapClick = event => {
    this.setState({
      aroundLat: event.latLng.lat(),
      aroundLng: event.latLng.lng()
    });
  };

  onPositionChanged = (ref, place, index) => {
    const { nextPlaces } = this.state;
    const places = [...nextPlaces];
    const nextIndex = places.findIndex(
      p => p.datastore_id === place.datastore_id
    );
    console.log("before", places[nextIndex]);
    let nextCoords = places[nextIndex].coords;
    nextCoords[index] = [
      ref.current.getPosition().lat(),
      ref.current.getPosition().lng(),
      nextCoords[index][2]
    ];
    places[nextIndex] = { ...places[nextIndex], coords: nextCoords };
    this.setState({ nextPlaces: places });
  };

  measure(lat1, lon1, lat2, lon2) {
    // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000; // meters
  }
  sendGroup = () => {
    const { groupPlaces, groupName, nextPlaces } = this.state;
    const { postGroup } = this.props;
    console.log(groupPlaces);
    postGroup({
      group_name: groupName,
      items: nextPlaces.map(p => ({ ...p, ref: undefined }))
    });
  };

  onMarkerClick(place) {
    this.setState(state => ({
      nextPlaces: Array.from(
        new Set([...state.nextPlaces, { ...place, ref: React.createRef() }])
      )
    }));
  }

  handlePlaceChanges(event, place, target) {
    const { groupPlaces } = this.state;
    console.log("handlePlaceChanges", event.target.value, place, target);
    const places = [...groupPlaces];
    const index = places.findIndex(p => p.datastore_id === place.datastore_id);
    places[index] = { ...place, [target]: event.target.value };
    this.setState({
      groupPlaces: places
    });
  }

  getGroup = () => {
    const { getGroup } = this.props;
    const { aroundLat, aroundLng, radius, groupName } = this.state;
    getGroup({
      lat: aroundLat,
      lng: aroundLng,
      radius,
      groupName
    });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.group !== this.props.group) {
      this.setState({
        groupPlaces: this.props.group ? this.props.group.group_items : [],
        nextPlaces: this.props.group ? this.props.group.items : [],
      });
    }
    // const groupItems = this.props.group ? this.props.group.group_items : [];
    // if (groupItems.length !== 0 && this.state.groupPlaces.length === 0) {
    //   this.setState({
    //     groupPlaces: groupItems
    //   });
    // }
  }

  removeItem = index => {
    const { nextPlaces: places } = this.state;
    const nextPlaces = [...places];
    nextPlaces.splice(index, 1);
    this.setState({
      nextPlaces: nextPlaces
    });
  };

  render() {
    let { places, group } = this.props;
    const {
      aroundLat,
      aroundLng,
      radius,
      groupPlaces,
      mapView,
      groupName,
      nextPlaces
    } = this.state;

    // const nextPlaces = places
    //   .filter(place => place.coords)
    //   .filter(place => {
    //     const coords = place.coords[0];
    //     return (
    //       this.measure(coords[0], coords[1], aroundLat, aroundLng) <= radius
    //     );
    //   });

    // const nextPlaces = group ? group.items : [];

    return (
      <div>
        <div>
          <span>Group name</span>
          <input
            type="text"
            name={"groupName"}
            value={groupName}
            onChange={this.handleInputChange}
          />
        </div>
        <AroundLocation
          lat={aroundLat}
          lng={aroundLng}
          handleChange={this.handleInputChange}
          radius={radius}
        />
        <Button onClick={this.getGroup}>Get/create group</Button>
        <Divider />
        <Grid container>
          <Grid item xs={6}>
            <GroupModeQuestions
              places={groupPlaces}
              handlePlaceChanges={this.handlePlaceChanges}
              remove={this.removeItem}
            />
          </Grid>
          <Grid item xs={6}>
            <div>
              <input
                type="radio"
                id="all"
                name="mapView"
                value="all"
                onChange={this.handleInputChange}
                checked={mapView === "all"}
              />
              <label htmlFor="all">all</label>
              <input
                type="radio"
                id="selected"
                name="mapView"
                value="selected"
                onChange={this.handleInputChange}
                checked={mapView === "selected"}
              />
              <label htmlFor="selected">selected</label>
            </div>
            <MapWrapper onMapClick={this.onMapClick}>
              <GroupModeMapChildren
                places={mapView === "all" ? groupPlaces : []}
                selectedPlaces={nextPlaces}
                onMarkerClick={this.onMarkerClick}
                onPositionChanged={this.onPositionChanged}
              />
            </MapWrapper>
          </Grid>
        </Grid>
        <Button onClick={this.sendGroup}>Send</Button>
      </div>
    );
  }
}

GroupModeTemp.propTypes = {};

const mapStateToProps = state => ({
  group: state.placesReducer.group
});

export default connect(
  mapStateToProps,
  { postGroup, getGroup, clearGroupPlaces }
)(GroupModeTemp);

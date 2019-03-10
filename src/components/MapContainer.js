/*global google*/

import React from "react";
import Autosuggest from "./Autocomplete";
import "../css/MapContainer.css";
import _ from "lodash";
import { compose, withProps, withStateHandlers, lifecycle } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
import { InfoWindow } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import markerIcon from "../img/bluemapicon.png";
import Checkbox from "./Checkbox";
import { Button, Icon, Input } from "semantic-ui-react";

let defaultLat = 36;
let defaultLon = 32;

const mapStyle = {
  margin: `20px 10px 30px 10px`,
  width: `100%`
};

const MapContainer = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDSbOVMr0GAABOWMFiaUZJqjWrWu9p00fw&v=3&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: (
      <div className="mainContainer" style={{ height: `400px` }} />
    ),
    mapElement: <div className="map-item" style={{ ...mapStyle }} />
  }),

  lifecycle({
    componentWillMount() {
      this.getQuestionMarkers();

      const refs = {};
      const formState = this.props.isFormMap
        ? {
            center:
              this.props.post.lat === undefined
                ? { lat: 39, lng: 16 }
                : {
                    lat: parseFloat(this.props.post.lat),
                    lng: parseFloat(this.props.post.lon)
                  },
            currentPlace:
              this.props.post.place === null
                ? { place_name: "", lat: undefined, lon: undefined }
                : {
                    place_name: this.props.post.place,
                    lat: this.props.post.lat,
                    lon: this.props.post.lon
                  }
          }
        : null;

      this.setState({
        ...formState,
        bounds: null,
        markers: [],
        editedChecker: true,
        writeGoogleCurrentPlace: googlePlace => {
          let newPlace = {
            lat: googlePlace.geometry.location.lat().toString(),
            lon: googlePlace.geometry.location.lng().toString(),
            place_name: googlePlace.name
          };
          this.setState({ currentPlace: newPlace, editedChecker: false });
        },
        onMapMounted: ref => {
          refs.map = ref;
          let newmarker = [];
          if (this.props.isFormMap) {
            newmarker.position = new google.maps.LatLng(
              parseFloat(this.props.post.lat),
              parseFloat(this.props.post.lon)
            );
          } else {
            newmarker.position = new google.maps.LatLng(
              parseFloat(defaultLat),
              parseFloat(defaultLon)
            );
          }

          let markers = [newmarker];
          //TODO same here as below
          // this.setState({markers});
        },
        onPositionChanged: () => {
          console.log("marker moved");
          let editPlaces = this.state.updatePlaces();
          this.setState({ currentPlace: editPlaces });
        },

        updatePlaces: () => {
          let editedPlace = Object.assign({}, this.state.currentPlace);
          editedPlace.place_name =
            editedPlace.place_name.startsWith("_edited") ||
            !this.state.editedChecker
              ? editedPlace.place_name
              : "_edited" + editedPlace.place_name;
          const position = refs.marker.getPosition();
          let lat = position.lat().toString();
          let lng = position.lng().toString();
          editedPlace.lat = lat;
          editedPlace.lon = lng;
          editedPlace.coords = this.state.markers.map(marker => [
            marker.position.lat(),
            marker.position.lng()
          ]);
          console.log("place_name1: " + editedPlace.place_name);
          this.props.handleAnswer(editedPlace);
          return editedPlace;
        },

        updatePlacesInDB: () => {
          let editedPlace = this.state.updatePlaces();
          return editedPlace;
        },

        onMarkerMounted: ref => {
          refs.marker = ref;
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },

        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();
          places.forEach(place => {
            // this.setState({
            //   ...this.state.currentPlace,
            //   place_name: place.name
            // });
            this.state.writeGoogleCurrentPlace(place);
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location
          }));
          const nextCenter = _.get(
            nextMarkers,
            "0.position",
            this.state.center
          );
          this.setState({ center: { nextCenter }, markers: nextMarkers });
          refs.map.fitBounds(bounds);
          console.log("place_name2: " + this.state.currentPlace.place_name);
          this.props.handleAnswer({
            place: this.state.currentPlace.place_name,
            coords: this.state.markers.map(marker => [
              marker.position.lat(),
              marker.position.lng()
            ])
          });
          console.log(this);
        },

        onPlacesChangedAutoCompleate: (newmarkers, newPlace) => {
          console.log("place_name3: " + this.state.currentPlace.place_name);
          let newcenter = newmarkers[0].position;
          this.setState(
            {
              currentPlace: {
                ...newPlace,
                place_name: this.state.currentPlace.place_name
              },
              center: newcenter,
              markers: newmarkers,
              editedChecker: true
            },
            () => {
              this.props.handleAnswer({
                place: this.state.currentPlace.place_name,
                coords: this.state.markers.map(marker => [
                  marker.position.lat(),
                  marker.position.lng()
                ])
              });
            }
          );
        },

        toggle: (activeBtn, fieldToShow, greyBtn, fieldToHide) => {
          document.getElementById(activeBtn).className = "ui button violet";
          document.getElementById(greyBtn).className = "ui button active";
          document.getElementById(fieldToShow).style.display = "block";
          document.getElementById(fieldToHide).style.display = "none";
        },

        clickGoogle: () => {
          this.state.toggle("btnG", "inputG", "btnC", "inputC");
        },

        clickCustom: () => {
          this.state.toggle("btnC", "inputC", "btnG", "inputG");
        },

        getPlaceData: place => {
          let items = [];

          this.props.data.map((item, index) => {
            if (item.labels.length > 0 && item.place == place) {
              items.push(
                <p
                  style={{ textAlign: "right" }}
                  dir="rtl"
                  key={`item${index}`}
                >
                  {item.question}
                </p>
              );
            }
            return;
          });

          if (items.length > 0) {
            return items;
          } else {
            return "אין מידע";
          }
        },
        handleAddMarkerClick: () => {
          console.log(this.state.markers);
          console.log(this.state.center);
          this.setState({
            markers: this.state.markers.concat([
              {
                position: new google.maps.LatLng(
                  parseFloat(refs.map.getCenter().lat()),
                  parseFloat(refs.map.getCenter().lng())
                )
              }
            ])
          });
        },
        removeMarker: index => {
          console.log("index: " + index);
          this.setState({
            markers: this.state.markers.filter((elem, i) => i !== index)
          });
        },
        handleInputChange: event => {
          const target = event.target;
          const value =
            target.type === "checkbox" ? target.checked : target.value;
          const name = target.name;
          this.setState({
            currentPlace: {
              ...this.state.currentPlace,
              place_name: value
            }
          });
        }
      });
    },
    componentDidMount() {
      //this.getQuestionMarkers(); same call in componentWillMount
    },
    componentDidUpdate(prevProps) {
      console.log("update passed!");
      if (this.props === prevProps) return;
      console.log("update prev passed!");
      // this.getQuestionMarkers(); It's too hard call, moved to componentDidMount
      // console.log(this.props.placesList);
      if (this.props.isFormMap && this.props.changed) {
        let lat = parseFloat(this.props.post.lat);
        let lng = parseFloat(this.props.post.lon);
        if (lat != undefined) {
          let newCentr = { lat: lat, lng: lng };
          let newmarker = {};
          newmarker.position = new google.maps.LatLng(
            parseFloat(this.props.post.lat),
            parseFloat(this.props.post.lon)
          );
          let markers = [newmarker];
          //TODO removed markers: markers from setState, need to check is it needed somewhere
          this.setState({
            center: newCentr,
            currentPlace: {
              // place_name: this.props.post.place,
              lat: this.props.post.lat,
              lon: this.props.post.lon
            }
          });
          console.log("updateMap:", newCentr);
        } else {
          this.setState({
            markers: [],
            currentPlace: { place_name: "", lat: undefined, lon: undefined }
          });
        }
      }
    },
    componentWillReceiveProps(nextProps) {
      console.log("recev passed!");
      if (this.props.data === nextProps.data) return;
    },
    getQuestionMarkers() {
      let questionMarkers = [];

      this.props.data.map((item, index) => {
        if (
          item.labels.length <= 0 ||
          !item.lat ||
          !item.lon ||
          questionMarkers.findIndex(marker => marker.place == item.place) > -1
        ) {
          return;
        }
        if (questionMarkers.length == 1) {
          defaultLat = questionMarkers[0].lat;
          defaultLon = questionMarkers[0].lon;
        }
        questionMarkers.push({ ...item });
      });

      this.setState({ questionMarkers });
    }
  }),
  withStateHandlers(
    () => ({
      showInfoIndex: -1
    }),
    {
      onShowInfo: ({ showInfoIndex }) => index => ({
        showInfoIndex: index
      }),
      onCloseInfo: ({ showInfoIndex }) => () => ({
        showInfoIndex: -1
      })
    }
  ),
  withScriptjs,
  withGoogleMap
)(props => (
  <div className="mapController-item">
    <GoogleMap
      ref={props.onMapMounted}
      defaultZoom={props.isFormMap ? 15 : 6}
      center={
        props.isFormMap ? props.center : { lat: defaultLat, lng: defaultLon }
      }
      onClick={() => {
        props.onCloseInfo();
      }}
      defaultCenter={{ lat: 36, lng: 32 }}
    >
      {props.showCurrentMarker &&
        props.markers.map((marker, index) => (
          <div key={`marker${index}`}>
            <Marker
              key={index}
              position={marker.position}
              draggable={true}
              onPositionChanged={props.onPositionChanged}
              ref={props.onMarkerMounted}
            >
              <InfoWindow>
                <div>{index}</div>
              </InfoWindow>
            </Marker>
          </div>
        ))}
      {props.questionMarkers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.lat, lng: marker.lon }}
          icon={markerIcon}
          onClick={() => props.onShowInfo(index)}
        >
          {props.showInfoIndex === index && (
            <InfoWindow
              onCloseClick={() => {
                props.onCloseInfo();
              }}
              options={{ closeBoxURL: ``, enableEventPropagation: true }}
            >
              <div>{props.getPlaceData(marker.place)}</div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
    {props.isFormMap && (
      <div style={{ minWidth: "20vw" }}>
        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={props.onPlacesChanged}
        >
          <input
            id="inputG"
            type="text"
            placeholder="חפש שם מקום בגוגל"
            style={{
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              width: `240px`,
              height: `32px`,
              marginTop: `27px`,
              padding: `0 12px`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`,
              display: "none"
            }}
          />
        </SearchBox>
        <div
          className="ui buttons"
          style={{
            display: "none",
            justifyContent: "center",
            margin: "20px 30px 20px 20px"
          }}
        >
          <div
            className="ui button active"
            id="btnG"
            onClick={props.clickGoogle}
          >
            {" "}
            Google{" "}
          </div>
          <div className="or" />
          <div
            className="ui button violet"
            id="btnC"
            onClick={props.clickCustom}
          >
            {" "}
            מאגר פנימי{" "}
          </div>
        </div>

        <div id="inputC" style={{ minWidth: "20vw" }}>
          <Autosuggest
            placesList={props.placesList}
            onPlacesChangedAutoCompleate={props.onPlacesChangedAutoCompleate}
            answer={props.answer}
            changed={props.changed}
            changeToFalse={props.changeToFalse}
            clickGoogle={props.clickGoogle}
          />
        </div>
        {/*Place name from Google maps*/}
        {props.currentPlace.place_name.length > 0 && (
          <Input
            onChange={props.handleInputChange}
            name={"placeName"}
            value={props.currentPlace.place_name}
            style={{ marginTop: "4px" }}
          />
        )}
        {/*List of markers*/}
        {props.markers.map((marker, index) => (
          <p key={`marker${index}`}>
            {index} : Lat {marker.position.lat()} Lng {marker.position.lng()}{" "}
            {props.markers.length > 1 && (
              <Icon onClick={() => props.removeMarker(index)} name={"trash"} />
            )}
          </p>
        ))}
        {/*Add marker button*/}
        {props.markers.length > 0 && (
          <div style={{ margin: "4px 0" }}>
            <Button
              size="mini"
              type={"button"}
              onClick={props.handleAddMarkerClick}
              icon
              labelPosition="left"
            >
              <Icon name="map marker alternate" />
              Add marker
            </Button>
          </div>
        )}
        <Checkbox
          question={props.checkQuestion}
          checked={props.checked}
          handleCheck={e => props.handleCheck(e)}
        />
      </div>
    )}
  </div>
));

export default MapContainer;

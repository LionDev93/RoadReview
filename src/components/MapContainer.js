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
  Marker,
  Circle
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
        placeName: "",
        editedFromDB: false,
        editedChecker: true,
        locationFromDB: false,
        updatedFromPost: false,
        nameWasModified: false,
        isMap: false,
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
        onPositionChanged: ref => {
          console.log("marker moved");
          let editPlaces = this.state.updatePlaces(ref);
          // this.setState({ currentPlace: editPlaces });
        },

        // markers moves
        updatePlaces: (ref, index) => {
          console.log("f updatePlaces");
          let editedPlace = Object.assign({}, this.state.currentPlace);
          console.log("is new form: " + this.props.isNewForm);
          let place_name = this.state.placeName;
          console.log("Lat: " + ref.current.getPosition().lat());
          console.log("Lng: " + ref.current.getPosition().lng());
          let changedMarkers = Object.assign([], this.state.markers);
          changedMarkers[index] = {
            ...changedMarkers[index],
            position: new google.maps.LatLng(
              parseFloat(ref.current.getPosition().lat()),
              parseFloat(ref.current.getPosition().lng())
            )
          };
          this.setState({
            markers: changedMarkers
          });
          console.log(changedMarkers);
          this.props.handleAnswer({
            place_name: place_name,
            coords: changedMarkers.map(marker => [
              marker.position.lat(),
              marker.position.lng(),
              marker.radius || undefined
            ])
          });
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
        // Location from map
        onPlacesChanged: () => {
          this.setState({
            editedFromDB: false
          });
          console.log("f onPlacesChanged");
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();
          places.forEach(place => {
            this.setState({
              currentPlace: {
                ...this.state.currentPlace,
                place_name: place.name
              }
            });
            this.setState({
              placeName: place.name
            });
            this.state.writeGoogleCurrentPlace(place);
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location,
            ref: React.createRef()
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
            place_name:
              this.state.placeName.length > 0
                ? this.state.placeName
                : this.state.currentPlace.place_name,
            coords: this.state.markers.map(marker => [
              marker.position.lat(),
              marker.position.lng()
            ])
          });
          console.log(this);
        },

        // Location from database
        onPlacesChangedAutoCompleate: (newmarkers, newPlace) => {
          console.log("f onPlacesChangedAutoCompleate");
          this.setState({
            editedFromDB: true,
            locationFromDB: true
          });
          let newcenter = newmarkers[0].position;
          this.setState(
            {
              currentPlace: newPlace,
              center: newcenter,
              markers: newmarkers.map(marker => {
                console.log(`marker`);
                console.log(marker);
                return { ...marker, ref: React.createRef() };
              }),
              editedChecker: true,
              placeName: newPlace.place_name
            },
            () => {
              this.props.handleAnswer({
                place_name: this.state.currentPlace.place_name,
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
          // document.getElementById(fieldToHide).style.display = "none";
        },

        clickGoogle: () => {
          // this.state.toggle("btnG", "inputG", "btnC", "findLocationBtn");
          document.getElementById("findLocationBtn").style.display = "none";
          document.getElementById("inputG").style.display = "block";
          this.setState({
            isMap: true
          });
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
          console.log("f handleAddMarkerClick");
          this.state.markers = [
            ...this.state.markers,
            {
              position: new google.maps.LatLng(
                parseFloat(refs.map.getCenter().lat()),
                parseFloat(refs.map.getCenter().lng())
              ),
              ref: React.createRef()
            }
          ];
          this.state.updateMarkersInAnswers();
        },
        removeMarker: index => {
          this.state.markers = this.state.markers.filter(
            (elem, i) => i !== index
          );
          this.state.updateMarkersInAnswers();
        },
        updateRadius: (index, radius) => {
          console.log(`update ${index} with ${radius}`);
          this.setState(state => {
            let newMarkers = [...state.markers];
            newMarkers[index].radius = parseInt(radius);
            this.props.handleAnswer({
              coords: newMarkers.map(marker => [
                marker.position.lat(),
                marker.position.lng(),
                marker.radius || undefined
              ])
            });
            return {
              markers: newMarkers
            }
          });
        },
        updateMarkersInAnswers: () => {
          this.props.handleAnswer({
            coords: this.state.markers.map(marker => [
              marker.position.lat(),
              marker.position.lng()
            ])
          });
        },
        updateMapFromPost: () => {
          let getPosition = (lat, lng) => {
            return new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
          };
          if (
            this.props.isNewForm !== undefined &&
            !this.props.isNewForm &&
            !this.state.updatedFromPost
          ) {
            this.setState({
              updatedFromPost: true,
              locationFromDB: true
            });
            if (
              this.props.post &&
              this.props.post.coords &&
              this.props.post.coords.length > 0
            ) {
              this.setState({
                markers: this.props.post.coords.map(place => {
                  return {
                    position: getPosition(
                      parseFloat(place[0]),
                      parseFloat(place[1]),
                    ),
                    radius: place[2] ? place[2] : 500,
                    ref: React.createRef()
                  };
                }),
                placeName: this.props.post.place
              });
            }
          }
        },
        handleInputChange: event => {
          const target = event.target;
          const value =
            target.type === "checkbox" ? target.checked : target.value;
          const name = target.name;
          this.setState({
            [name]: value
          });
          if (name === "placeName") {
            this.props.handleAnswer({ place_name: value });
            this.setState({
              nameWasModified: true
            });
          }
        }
      });
    },
    componentDidMount() {
      //this.getQuestionMarkers(); same call in componentWillMount
    },
    componentDidUpdate(prevProps) {
      console.log("update passed!");
      if (this.props === prevProps) return;
      console.log("cur passed!", this.props);
      console.log("pre passed!", prevProps);

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
    shouldComponentUpdate(nextProps, nextState) {
      if (this.props.updateQuestion == nextProps.updateQuestion) {
        return true;
      } else {
        return false;
      }
    },
    componentWillReceiveProps(nextProps) {
      console.log("recev passed!", this.props);
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
        props.markers.map((marker, index) => {
          // console.log("marker_ref: " + marker.ref);
          return (
            <div key={`marker${index}`}>
              {console.log(marker)}
              <Circle center={{
                lat: parseFloat(marker.position.lat()),
                lng: parseFloat(marker.position.lng())
              }} radius={marker.radius || 500} defaultOptions={{ fillColor: '#42A5F5', strokeColor: '#1565C0', strokeWeight: 1 }} fillColor={'#4CAF50'} />
              <Marker
                key={index}
                position={marker.position}
                draggable={true}
                ref={marker.ref}
                onPositionChanged={() => props.updatePlaces(marker.ref, index)}
              // ref={props.onMarkerMounted}
              >
                <InfoWindow>
                  <div>{index}</div>
                </InfoWindow>
              </Marker>
            </div>
          );
        })}
      {props.questionMarkers.map((question, index) => (
        <React.Fragment key={`question${index}`}>
          {question.coords && question.coords.map((coords, qindex) => (<Marker
            key={`coords${index}${qindex}`}
            position={{
              lat: parseFloat(coords[0]),
              lng: parseFloat(coords[1])
            }}
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
                <div>{props.getPlaceData(question.place)}</div>
              </InfoWindow>
            )}
          </Marker>))}
        </React.Fragment>
      ))}
    </GoogleMap>
    {props.updateMapFromPost()}
    {props.isFormMap && (
      <div>
        <div
          style={{ minWidth: "20vw", minHeight: "340px", textAlign: "right" }}
        >
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

          {
            <div id="inputC" style={{ minWidth: "20vw" }}>
              <Autosuggest
                placesList={props.placesList}
                onPlacesChangedAutoCompleate={
                  props.onPlacesChangedAutoCompleate
                }
                answer={props.answer}
                changed={props.changed}
                changeToFalse={props.changeToFalse}
                clickGoogle={props.clickGoogle}
                locationFromDB={props.locationFromDB}
                isNewForm={props.isNewForm}
                liftUpValue={props.handleInputChange}
                placeValue={props.placeName}
                isMap={props.isMap}
              />
            </div>
          }
          {/*Place name from Google maps*/}
          {/*{(props.placeName.length > 0 || props.nameWasModified) && (*/}
          {/*<Input*/}
          {/*onChange={props.handleInputChange}*/}
          {/*name={"placeName"}*/}
          {/*value={props.placeName}*/}
          {/*style={{ marginTop: "4px", direction: "RTL", textAlign: "right" }}*/}
          {/*/>*/}
          {/*)}*/}
          {/*List of markers*/}
          {props.markers.map((marker, index) => {
            let radius = marker.radius || 500;
            return <div key={`marker${index}`}>
              <Icon name={"plus"} onClick={() => props.updateRadius(index, (radius + 100))} />
              <input type={"number"} value={radius} style={{ width: "60px" }}
                onChange={(e) => {
                  props.updateRadius(index, parseInt(e.target.value))
                }} />
              <Icon name={"minus"} onClick={() => props.updateRadius(index, (radius - 100))} />
              {index} {"נעץ"}{" "}
              {props.markers.length > 1 && (
                <Icon
                  style={{ cursor: "pointer" }}
                  onClick={() => props.removeMarker(index)}
                  name={"trash"}
                />
              )}
            </div>
          })}
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
                הוסף מיקום
              </Button>
            </div>
          )}
        </div>
        <div style={{ minWidth: "20vw", textAlign: "right" }}>
          <Checkbox
            question={props.checkQuestion}
            checked={props.checked}
            handleCheck={e => props.handleCheck(e)}
          />
        </div>
      </div>
    )}
  </div>
));

export default MapContainer;

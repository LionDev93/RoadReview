/*global google*/ 
import React from "react";
import Autosuggest from './Autocomplete';
import '../css/MapContainer.css';
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

const MapContainer = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDSbOVMr0GAABOWMFiaUZJqjWrWu9p00fw&v=3&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div className="mainContainer" style={{ height: `400px` }} />,
    mapElement: <div className="map-item" style={{ height: `100%`, margin: '0px 30px' }} />
  }),

  lifecycle({

    componentWillMount() {
      let areas = [];
      
      {this.props.data.map((item, index) => {
        if (item.labels.length <= 0 || ! item.lat || ! item.lon ||
          areas.findIndex(area => area.place == item.place) > -1) {
          return;
        }
        
        let temp = {
          lat: item.lat,
          lon: item.lon,
          place: item.place
        };
        
        areas.push(temp);
      })}

      const refs = {}
      this.setState({
        areas: areas,
        bounds: null,
        center: this.props.post.lat === undefined ? {lat: 39 , lng: 16} : {lat: parseFloat(this.props.post.lat) , lng: parseFloat(this.props.post.lon)},
        markers: [],
        currentPlace: this.props.post.place === null ? { place_name: null, lat: undefined, lon: undefined} : {place_name: this.props.post.place, lat: this.props.post.lat, lon: this.props.post.lon},
        editedChecker: true,
        writeGoogleCurrentPlace: (googlePlace) => {
          let newPlace = {
            lat: googlePlace.geometry.location.lat().toString(),
            lon: googlePlace.geometry.location.lng().toString(),
            place_name: googlePlace.name,
          };
          this.setState({currentPlace: newPlace, editedChecker: false});
        },
        onMapMounted: ref => {
          refs.map = ref;
          console.log("test map");
          let newmarker = {};
          newmarker.position = new google.maps.LatLng(parseFloat(this.props.post.lat), parseFloat(this.props.post.lon));
          let markers = [newmarker];      
          this.setState({markers}); 
        },
        onPositionChanged: () => {
          let editPlaces = this.state.updatePlaces();
          this.setState({currentPlace: editPlaces});
        },

        updatePlaces: () => {
          let editedPlace = Object.assign({}, this.state.currentPlace);
          editedPlace.place_name = (editedPlace.place_name.startsWith("_edited") || !this.state.editedChecker ) ? editedPlace.place_name : ("_edited" + editedPlace.place_name) ;
          const position = refs.marker.getPosition();
          let lat = position.lat().toString();
          let lng = position.lng().toString();
          editedPlace.lat = lat;
          editedPlace.lon = lng;
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
            this.state.writeGoogleCurrentPlace(place);
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location)
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location,
          }));
          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);
          this.setState({center: {nextCenter}, markers: nextMarkers,});
          refs.map.fitBounds(bounds);
          this.props.handleAnswer(this.state.currentPlace);
          console.log(this);
        },

        onPlacesChangedAutoCompleate: (newmarkers, newPlace) => {
          let newcenter = newmarkers[0].position;
          this.setState({
            currentPlace : newPlace,
            center: newcenter,
            markers: newmarkers,
            editedChecker : true,
          }, () =>{
            this.props.handleAnswer(this.state.currentPlace);
          });
        },

        toggle: (activeBtn, fieldToShow, greyBtn, fieldToHide, ) => {
          document.getElementById(activeBtn).className = 'ui button violet';
          document.getElementById(greyBtn).className = 'ui button active';
          document.getElementById(fieldToShow).style.display = 'block';
          document.getElementById(fieldToHide).style.display = 'none';
        }, 

        clickGoogle: () => {
          this.state.toggle('btnG', 'inputG', 'btnC',  'inputC');
        }, 
      
        clickCustom:  () => {
          this.state.toggle('btnC',  'inputC', 'btnG', 'inputG');
        },
        
        getPlaceData: (place) => {
          let items = [];
          
          this.props.data.map((item, index) => {
              if (item.labels.length > 0 && item.place == place) {
                items.push(<p style={{textAlign: "right"}} dir="rtl" key={`item${index}`}>{item.question}</p>)
              }
              return;
          });
          
          if (items.length > 0) {
            return items;
          } else {
            return "אין מידע";
          }
        }
	    })
    },
    componentDidUpdate(){
      // console.log(this.props.placesList);
      if(this.props.changed){
        let lat = parseFloat(this.props.post.lat);
        let lng = parseFloat(this.props.post.lon);
        if(lat != undefined){
          let newCentr = {lat: lat , lng: lng};
          let newmarker = {};
          newmarker.position = new google.maps.LatLng(parseFloat(this.props.post.lat), parseFloat(this.props.post.lon));
          let markers = [newmarker];
          this.setState({center: newCentr, markers: markers, currentPlace: {place_name: this.props.post.place, lat: this.props.post.lat, lon: this.props.post.lon}});
        }
        else{
          this.setState({markers: [], currentPlace: { place_name: null, lat: undefined, lon: undefined}});
        }
      }
    },
  }),
  withStateHandlers(() => ({
      showInfoIndex: -1
    }), {
    onShowInfo: ({showInfoIndex}) => (index) => ({
      showInfoIndex: index
    }),
    onCloseInfo: ({showInfoIndex}) => () => ({
      showInfoIndex: -1
    })
  }),
  withScriptjs,
  withGoogleMap
)(props =>
    <div className="mapController-item"> 
      <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={15}
        center = {props.center}
        onClick={() => {props.onCloseInfo()}}
      >
        {props.markers.map((marker, index) =>
          <div key={`marker${index}`}>
            <Marker
              key={index}
              position={marker.position} 
              draggable={true}
              onPositionChanged={props.onPositionChanged}
              ref={props.onMarkerMounted}/>
          </div>
        )}
        {props.areas.map((area, index) => 
          <Marker
            key={index}
            position={{ lat: area.lat, lng: area.lon}}
            icon={markerIcon}
            onClick={() => props.onShowInfo(index)}>
            {props.showInfoIndex === index &&
              <InfoWindow
                onCloseClick={() => {props.onCloseInfo()}}
                options={{ closeBoxURL: ``, enableEventPropagation: true }}
              >
                <div>
                  {props.getPlaceData(area.place)}
                </div>
              </InfoWindow>
            }
          </Marker>
        )}        
      </GoogleMap>

        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={ google.maps.ControlPosition.TOP_LEFT }
          onPlacesChanged={props.onPlacesChanged}
        >
          <input
            id='inputG'
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
              display: 'none',
            }}
          />
        </SearchBox>
        <div className="ui buttons" style={{ display: 'flex', justifyContent: 'center', 
          margin: '20px 30px 20px 20px' }}>
          <div className="ui button active" id='btnG' onClick={props.clickGoogle} > Google </div >
          <div className="or"></div>
          <div  className="ui button violet" id='btnC' onClick={props.clickCustom} > מאגר פנימי </div >
        </div>

        <div id='inputC' >
          <Autosuggest 
          placesList = {props.placesList}
          onPlacesChangedAutoCompleate={props.onPlacesChangedAutoCompleate}
          answer={props.answer}
          changed={props.changed}
          changeToFalse={props.changeToFalse}
          />
        </div>
  </div>);

export default MapContainer;

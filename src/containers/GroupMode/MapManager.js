/*global google*/

import React from 'react';
import Autosuggest from '../../components/Autocomplete';
// import "../css/MapManager.css";
import _ from 'lodash';
import { compose, withProps, withStateHandlers, lifecycle } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Circle,
} from 'react-google-maps';
import { InfoWindow } from 'react-google-maps';
import { SearchBox } from 'react-google-maps/lib/components/places/SearchBox';
import markerIcon from '../../img/bluemapicon.png';
import Checkbox from '../../components/Checkbox';
import { Button, Icon, Input } from 'semantic-ui-react';

let defaultLat = 36;
let defaultLon = 32;

const mapStyle = {
  margin: `20px 10px 30px 10px`,
  width: `100%`,
};

const MapManager = compose(
  withProps({
    googleMapURL:
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyDSbOVMr0GAABOWMFiaUZJqjWrWu9p00fw&v=3&libraries=geometry,drawing,places',
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: (
      <div className="mainContainer" style={{ height: `700px` }} />
    ),
    mapElement: <div className="map-item" style={{ ...mapStyle }} />,
  }),

  lifecycle({
    componentWillMount() {
      const refs = {};
    },
    componentDidMount() {
      //this.getQuestionMarkers(); same call in componentWillMount
    },
    componentDidUpdate(prevProps) {
      if (this.props === prevProps) return;
    },
    // shouldComponentUpdate(nextProps, nextState) {
    // },
    componentWillReceiveProps(nextProps) {
      // if (this.props.data === nextProps.data) return;
    },
  }),
  withScriptjs,
  withGoogleMap,
)(props => {
  const onMarkerDragEnd = index => event => {
    console.log('markerDragEnd', event.latLng.lat(), event.latLng.lng());
    props.onMarkerPosChange(index, {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };
  const handleMarkerClick = index => {
    props.onClickMarker(index);
  };

  const handleClickNew = event => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    props.onCreateNewItem({ lat: lat, lng: lng });
  };

  return (
    <div className="mapController-item">
      <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={10}
        // center={
        //   props.center ? props.center : { lat: defaultLat, lng: defaultLon }
        // }
        onClick={handleClickNew}
        defaultCenter={
          props.center ? props.center : { lat: defaultLat, lng: defaultLon }
        }
      >
        {props.questionMarkers &&
          props.questionMarkers
            .slice(0)
            .reverse()
            .map((question, index) => {
              if (!question.isDeleted) {
                return (
                  <Marker
                    key={index}
                    position={{
                      lat: question.coords
                        ? parseFloat(question.coords[0][0])
                        : 32,
                      lng: question.coords
                        ? parseFloat(question.coords[0][1])
                        : 34,
                    }}
                    icon={question.kind === 'group' ? markerIcon : ''}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd(
                      props.questionMarkers.length - 1 - index,
                    )}
                    onClick={() =>
                      handleMarkerClick(
                        props.questionMarkers.length - 1 - index,
                      )
                    }
                  >
                    <InfoWindow
                      onCloseClick={() => {
                        console.log(
                          'infoClose',
                          props.questionMarkers.length - 1 - index,
                        );
                        props.onClickCloseBtn(
                          props.questionMarkers.length - 1 - index,
                        );
                      }}
                    >
                      <div>{props.questionMarkers.length - 1 - index}</div>
                    </InfoWindow>
                  </Marker>
                );
              }
            })}
      </GoogleMap>
    </div>
  );
});

export default MapManager;

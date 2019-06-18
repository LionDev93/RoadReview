import React from "react";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import markerIcon from "../../img/bluemapicon.png";

/**
 * Show Google Maps
 * Use MapWrapper only with redux-form Field component
 * For example: <Field name="LatLng" component={MapWrapper} />
 * Don't forget to change Google API key in googleMapURL property
 * Height property for containerElement is required, value is up to you
 */
// TODO change Google API key in googleMapURL property, current key is bounded to domain name
// TODO map localization
const MapWrapper = compose(
  withProps(props => {
    return {
      googleMapURL:
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyDSbOVMr0GAABOWMFiaUZJqjWrWu9p00fw&v=3&libraries=geometry,drawing,places",
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `400px` }} />,
      mapElement: <div style={{ height: `100%` }} />
    };
  }),
  withScriptjs,
  withGoogleMap
)(props => {
  return (
    <GoogleMap
      defaultZoom={13}
      defaultCenter={{ lat: 32.04681428187113, lng: 34.78926808229278 }}
      onClick={props.onMapClick}
    >
      {props.children}
    </GoogleMap>
  );
});

export default MapWrapper;

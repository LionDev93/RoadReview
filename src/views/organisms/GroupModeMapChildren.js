import React from "react";
import PropTypes from "prop-types";
import { GoogleMap, InfoWindow, Marker } from "react-google-maps";
import markerIcon from "../../img/bluemapicon.png";

const GroupModeMapChildren = props => {
  const { onPositionChanged } = props;
  return (
    <React.Fragment>
      {props.places.map(place =>
        place.coords.map((coords, index) => (
          <Marker
            key={`coords${index}`}
            position={{
              lat: parseFloat(coords[0]),
              lng: parseFloat(coords[1])
            }}
            onClick={() => props.onMarkerClick(place)}
          />
        ))
      )}
      {props.selectedPlaces.map((place, placeIndex) =>
        place.coords.map((coords, index) => (
          <Marker
            key={`coords${index}`}
            position={{
              lat: parseFloat(coords[0]),
              lng: parseFloat(coords[1])
            }}
            icon={markerIcon}
            draggable={true}
            ref={place.ref}
            onDragEnd={() => onPositionChanged(place.ref, place, index)}
          >
            <InfoWindow>
              <span>{placeIndex}</span>
            </InfoWindow>
          </Marker>
        ))
      )}
    </React.Fragment>
  );
};

GroupModeMapChildren.propTypes = {};

export default GroupModeMapChildren;

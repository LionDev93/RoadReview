import React from "react";
import PropTypes from "prop-types";

const AroundLocation = ({ lat, lng, radius, handleChange }) => {
  return (
    <div>
      Around location
      <div>
        <label htmlFor="lat">LAT</label>
        <input type="text" name="lat" value={lat} disabled />
        <label htmlFor="lng">LNG</label>
        <input type="text" name="lng" value={lng} disabled />
      </div>
      <span>click on map to set up lat/lng</span>
      <div>
        <label htmlFor="radius">Radius</label>
        <input type="number" name='radius' value={radius} onChange={handleChange}/>
      </div>
    </div>
  );
};

AroundLocation.propTypes = {};

export default AroundLocation;

import React from 'react';
import PropTypes from 'prop-types';
import {setPlaces} from "../../store/actions/placesActions";
import {connect} from "react-redux";
import GroupModeTemp from "../templates";

const GroupMode = ({places}) => {
  return (
      <React.Fragment>
        {places && <GroupModeTemp places={places}/>}
      </React.Fragment>
  );
};

GroupMode.propTypes = {

};

const mapStateToProps = state => ({
  places: state.placesReducer.data
});

export default connect(mapStateToProps, { setPlaces })(GroupMode);
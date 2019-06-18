import React from "react";
import PropTypes from "prop-types";
import Divider from "@material-ui/core/Divider";

const GroupModeQuestions = ({ places, handlePlaceChanges, remove }) => {
  const showPlace = (place, index, isRelated = false) => (
    <div key={place.datastore_id}>
      <div>
        {isRelated ? <b>Related {index}</b> : <b>{index}</b>}
        {!isRelated && (
          <b style={{ cursor: "pointer" }} onClick={() => remove(index)}>
            [remove]
          </b>
        )}
      </div>
      <div>
        <div>Question</div>
        <textarea
          disabled={isRelated}
          style={{ width: "95%" }}
          rows={3}
          onChange={e => handlePlaceChanges(e, place, "question")}
          value={place.question}
        />
      </div>
      <div>
        <div>Story</div>
        <textarea
          disabled={isRelated}
          style={{ width: "95%" }}
          rows={6}
          value={place.story}
          onChange={e => handlePlaceChanges(e, place, "story")}
        />
      </div>
      <Divider />
      {place.related &&
        place.related.map((related, index) => showPlace(related, index, true))}
    </div>
  );
  return <div>{places.map((place, index) => showPlace(place, index))}</div>;
};

GroupModeQuestions.propTypes = {};

export default GroupModeQuestions;

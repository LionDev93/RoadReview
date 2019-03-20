import React from 'react';
import PropTypes from 'prop-types';
import {Button, List} from "semantic-ui-react";
import {Link} from "react-router-dom";

const ChildQuestion = props => {
  const q = props.question;
  return (
      <List.Item style={{direction: "RTL"}}>
        <span style={{color: "grey"}}>{q.place}</span>{" "}<a style={{fontWeight: "bold"}} href={"/" + q.datastore_id}>{q.question}</a>
      </List.Item>
  );
};

ChildQuestion.propTypes = {

};

export default ChildQuestion;
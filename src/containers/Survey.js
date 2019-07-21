import React, { Component } from 'react';

import gcp_config from '../GCP_configs';
import SurveyQuestions from '../components/SurveyQuestions';
import fetchStream from 'fetch-readablestream';
import ErrorModal from '../components/ErrorModal';

import '../css/Button.css';

import {
  withRouter
} from 'react-router-dom'

class Survey extends Component {

  constructor(props) {
    super(props);

    // console.log("SURVEY ANS: ", this.props.post);

    this.state = {
      setNewFields: this.setNewFields.bind(this),
      answers: this.props.submitted ? '' : this.setNewFields(this.props.post),
      listWithPreviosAnswers: [],
      changed: false,
      changedForMap: false,
      showModal: false,
      errorMsg: '',
      questionChanged: false,
    }; // <- set up react state
  }

  static defaultProps = {
    constants: {
      numericFields: ['difficulty', 'score'],
      textFields: ['place', 'story'],
      arrayFields: ['labels', 'question_images', 'story_images', 'coords'],
      checkFields: ['tourists_relevancy', 'night_item', 'see_item']
    },
  }

  handleCloseErrorMsg = () => {
    this.setState({ showModal: false });
  };

  readAllChunks = (readableStream) => {
    const reader = readableStream.getReader();
    const chunks = [];

    function pump() {
      return reader.read().then(({ value, done }) => {
        if (done) {
          return chunks;
        }
        chunks.push(value);
        return pump();
      });
    }

    return pump();
  }

  setNewFields(change) {
    const { numericFields, textFields, checkFields } = this.props.constants;

    change.editor_username = this.props.user;

    for (let i = 1; i < 3; i++) {
      change = this.setTrivia(i, change);
    }

    for (let prop in change) {
      if ((numericFields.indexOf(prop) !== -1) && (change[prop] === ""))
        change[prop] = null;
      else if ((textFields.indexOf(prop) !== -1) && (change[prop] === null))
        change[prop] = "";
      else if ((checkFields.indexOf(prop) !== -1) && (change[prop] === null))
        change[prop] = false;
    }

    return change;
  }

  setTrivia = (triviaNum, change) => {
    const getIfNotNull = this.getIfNotNull;
    let trivia = this.getTriviaByNum(triviaNum);

    let right = getIfNotNull(change, 'right_answer');
    let index = change.answers.indexOf(right);
    if (index !== -1) {
      change.answers.splice(index, 1);
    }

    change[trivia] = (triviaNum === 1) ? {
      question: getIfNotNull(change, 'question'),
      right_answer: right,
      wrong_answer1: getIfNotNull(change, 'answers', 0),
      wrong_answer2: getIfNotNull(change, 'answers', 1),
      wrong_answer3: getIfNotNull(change, 'answers', 2),
    } : {
        question: undefined,
        right_answer: undefined,
        wrong_answer1: undefined,
        wrong_answer2: undefined,
        wrong_answer3: undefined,
      }
    return change;
  }

  getIfNotNull = (getFromThere, getThis, index = null) => {
    if (index === null) {
      if (getFromThere[getThis] !== null | undefined)
        return getFromThere[getThis];
    } else {
      if (getFromThere[getThis].length > index) {
        if (getFromThere[getThis][index] !== null | undefined)
          return getFromThere[getThis][index];
      }
    } return undefined;
  }

  getTriviaByNum = (num) => {
    let trivia;
    switch (num) {
      case 1:
        trivia = 'trivia1';
        break;
      case 2:
        trivia = 'trivia2';
        break;
      default:
        return null;
    }
    return trivia;
  }


  addToAnswer = (answers) => {
    console.log('edit answers', answers);
    this.setState({ answers: answers, questionChanged: true });
  }


  // ---> 1. GCP <---
  //Submit
  addAnswers = (e, postNum) => {
    const { answers, } = this.state;
    const { showEl } = this.props;

    e.preventDefault(); // <- prevent form submit from reloading the page

    let copy = Object.assign({}, answers);
    copy.submission_time = new Date().toLocaleString("en-US");

    this.processTrivias(e, postNum, copy);  // <- process trivias and send to db

    showEl('success', 1000, true);
    this.setState({ preview: null, hanged: true, changedForMap: true });

  }

  processTrivias = (e, postNum, answers) => {
    let trivias = [answers.trivia1, answers.trivia2];
    delete answers.trivia1;
    delete answers.trivia2;

    let sent = false;
    let toDB = [];
    for (var i in trivias) {

      let tr = trivias[i];
      for (var prop in tr) {

        if (tr[prop] !== undefined) {
          let newAn = Object.assign({}, answers);
          const pushIfExist = this.pushIfExist;

          newAn.question = pushIfExist(newAn.question, tr['question']);
          newAn.right_answer = pushIfExist(newAn.right_answer, tr['right_answer']);
          newAn.answers = [];
          newAn.answers = pushIfExist(newAn.answers, tr['right_answer'], true);
          newAn.answers = pushIfExist(newAn.answers, tr['wrong_answer1'], true);
          newAn.answers = pushIfExist(newAn.answers, tr['wrong_answer2'], true);
          newAn.answers = pushIfExist(newAn.answers, tr['wrong_answer3'], true);

          if (sent)
            delete newAn.datastore_id;
          toDB.push(newAn);

          sent = true;
          break;
        }
      }
    }

    if (toDB.length === 0) {
      this.updatePostInDB(e, postNum, answers);
    } else {
      for (let i in toDB) {
        this.updatePostInDB(e, postNum, toDB[i]);
      }
    }
  }

  pushIfExist = (pushThere, pushThat, isArr = false) => {
    if (pushThat !== undefined) {
      if (isArr) {
        pushThere.push(pushThat);
      } else {
        pushThere = pushThat;
      }
    } return pushThere;
  }

  updatePostInDB = (e, postNum, data) => {
    const { answers, } = this.state;
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(gcp_config.username + ":" + gcp_config.password));
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    delete data.lat;
    delete data.lon;
    const toDB = JSON.stringify({ item: data });
    console.log("UPDATE: ", toDB);

    fetchStream('https://roadio-master.appspot.com/v1/edit_item', {
      method: 'POST',
      headers: headers,
      body: toDB
    })
      .then(res => {
        console.log('Update Status: ', res.status);
        if (res.status === 500) {
          this.setState({ showModal: true });
          return this.readAllChunks(res.body);
        }

        this.props.updateDataItems(JSON.parse(toDB));

        this.addToPreviousAnswers(answers);

        document.getElementById("form").reset(); // <- clear the input
        this.showNextItems(e, postNum);
      })
      .then(chunks => {
        chunks && this.setState({ errorMsg: String.fromCharCode.apply(null, chunks[0]) });
      })
      .catch(error => console.error('Error: ', error));
  }

  showNextItems = (e, postNum) => {
    const { nextElementExistanse, showNext, toUndef } = this.props;

    if (nextElementExistanse) // <- use methods from App.js
      showNext(postNum, e);
    else {
      toUndef(postNum, e);
    }
  }

  addToPreviousAnswers = (answers) => {
    let temporaryList = this.state.listWithPreviosAnswers;
    temporaryList.push(answers);
    this.setState({ listWithPreviosAnswers: temporaryList });
  }

  //Show previous answers
  showPrev = (e) => {
    e.preventDefault();
    this.props.showPrev(e);
    let temporaryList = this.state.listWithPreviosAnswers;

    let previosAnswers = temporaryList.pop();
    this.setState({ answers: previosAnswers, listWithPreviosAnswers: temporaryList, changedForMap: true });
  }

  changeToFalse = () => {
    this.setState({ changedForMap: false });
  }

  //react lifecycle methods
  static getDerivedStateFromProps(props, state) {
    // console.log("DELIVER ANSWERS: ", state.answers);

    if (state.answers && state.answers.datastore_id !== props.post.datastore_id) {
      return { answers: props.submitted ? '' : state.setNewFields(props.post), changedForMap: true };
    }
    if (state.changed) {
      return { answers: props.submitted ? '' : state.setNewFields(props.post), changed: false };
    } return null;
  }

  removeQuestion = () => {
    const { post: { datastore_id } } = this.props;
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(gcp_config.username + ":" + gcp_config.password));
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    fetchStream(`https://roadio-master.appspot.com/v1/delete_item_control?datastore_id=${datastore_id}`, {
      method: 'GET',
      headers: headers,
    }).then(res => {
      const { history } = this.props;
      history.push("/");
    }).catch(err => { });
  };

  render() {

    const { answers } = this.state;
    const { postNum, numberOfPreviousElemnts, submitted } = this.props;

    return submitted ? (
      <button className={numberOfPreviousElemnts > 0 ?
        'ui labeled icon violet basic massive button disabled' : 'ui labeled icon grey basic massive button disabled'}
        style={{ margin: '30px 35%' }}
        onClick={this.showPrev}>
        <i className="arrow left icon"></i>
        הקודם
      </button>
    ) : (
        <div>

          <SurveyQuestions
            answers={answers}
            placesList={this.props.placesList}
            changed={this.state.changedForMap}
            changeToFalse={this.changeToFalse}
            addToAnswer={this.addToAnswer}
            post={this.props.post}
            validator={this.props.validator}
            data={this.props.data}
            isNewForm={false}
            removeQuestion={this.removeQuestion}
            questionChanged={this.state.questionChanged}
          />

          <ErrorModal
            text={this.state.errorMsg}
            showModal={this.state.showModal}
            handleCloseModal={this.handleCloseErrorMsg}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <button className={numberOfPreviousElemnts > 0 ?
              'ui labeled icon violet basic button' : 'ui labeled icon grey basic button'}
              style={{ margin: '30px' }}
              onClick={this.showPrev}>
              <i className="arrow left icon"></i>
              הקודם
            </button>
            <button className='ui right labeled icon violet basic button'
              style={{ margin: '30px' }}
              onClick={(e) => { this.addAnswers(e, postNum) }}>
              הבא
              <i className="arrow right icon"></i>
            </button>
          </div>
        </div >
      )
  }
}

export default withRouter(Survey);
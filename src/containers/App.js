import React, { Component } from 'react';
import { HashRouter as Router, Switch, Redirect } from 'react-router-dom';
import Route from 'react-router-dom/Route';

import fireDB from '../fireDB';
import gcp_config from '../GCP_configs';

import Text from '../components/Text';
import Top from '../components/Top';
import Heading from '../components/Heading';
import Message from '../components/Message';
import Survey from './Survey';
import NewForm from './NewForm';
import Login from './Login';
import DataTable from './DataTable';
import SimpleReactValidator from 'simple-react-validator';

import '../css/Hidden.css';
import MapContainer from '../components/MapContainer';
import { setPlaces } from '../store/actions/placesActions';
import { connect } from 'react-redux';
// import GroupMode from '../views/pages';
import GroupMode from '../containers/GroupMode';

class App extends Component {
  static getDerivedStateFromError(error) {
    console.log(error);
  }

  constructor(props) {
    super(props);
    this.state = {
      post: 0,
      text: [],
      userText: [],
      placesList: [],
      previosIndexList: [],
      previosIndex: undefined,
      previosDatascore_id: undefined,
      user: {},
      newItem: false,
      dbIsFull: false,
      tableLoading: false,
      params: '',
    }; // <- set up react state

    this.validator = new SimpleReactValidator({
      validators: {
        google: {
          // name the rule
          message: 'אנא הצמידו את האייטם למיקום במאגר שלנו או בגוגל',
          rule: (val, params, validator) => {
            return val ? true : false;
          },
          required: true,
        },
      },
      messages: {
        required: 'יש למלא שדה זה',
      },
    });
  }

  setNew = bool => {
    this.setState({ newItem: bool });
  };

  // ---> 1. FIREBASE DB <---
  authListener() {
    fireDB.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user });
        localStorage.setItem('user', user.uid);
      } else {
        this.setState({ user: null });
        localStorage.removeItem('user');
      }
    });
  }

  showPrev = e => {
    e.preventDefault();
    this.hideEl('negative', true);
    let temporaryList = this.state.previosIndexList;
    if (temporaryList.length > 0) {
      let previosElement = temporaryList.pop();
      this.setState({
        post: previosElement,
        previosIndexList: temporaryList,
        previosDatascore_id: this.state.text[previosElement].datastore_id,
      });
    }
  };

  showNext = (post, e) => {
    e.preventDefault();
    let temporaryList = this.state.previosIndexList;
    let number = this.findNextUnsubmitedElement(post);
    if (number !== undefined) {
      temporaryList.push(post);
      console.log('number: ', number);
      console.log('post: ', post);
      this.setState({ post: number, previosIndexList: temporaryList });
    }
  };

  toUndef = (post, e) => {
    e.preventDefault();
    let temporaryList = this.state.previosIndexList;
    temporaryList.push(post);
    this.setState({ post: undefined, previosIndexList: temporaryList });
  };

  findNextUnsubmitedElement = post => {
    const { text } = this.state;

    for (let i = post + 1, size = Object.values(text).length; i < size; i++) {
      if (
        text[i].assigned_user === this.state.user.email &&
        text[i].submission_time === null
      ) {
        console.log('###assigned-ok: ', i);
        return i;
      }
    }
  };

  //CSS methods
  showEl = (el, time, bool) => {
    const current = document.getElementById(el);
    this.hideEl('negative', false);
    this.hideEl('error', false);
    if (current.style.display === 'none') {
      current.style.display = 'block';
      current.scrollIntoView(true);
      setTimeout(this.hideEl, time, el, bool);
    }
  };
  hideEl = (el, bool) => {
    try {
      document.getElementById(el).style.display = 'none';
      if (bool) document.getElementById('top').scrollIntoView(true);
    } catch (err) {
      //
    }
  };

  getUserDataItems = () => {
    let data = [];

    this.state.text &&
      this.state.text.map(item => {
        if (this.state.user && item.writer_username === this.state.user.email)
          data.push(item);
      });

    this.setState({ userText: data });
  };

  getDataItems = () => {
    this.authListener(); // <--- FIREBASE DB
    this.setState({ tableLoading: true });
    let headers = new Headers();
    headers.set(
      'Authorization',
      'Basic ' + btoa(gcp_config.username + ':' + gcp_config.password),
    );
    fetch('https://roadio-master.appspot.com/v1/get_places?limit=-1')
      .then(response => response.json())
      .then(placeData =>
        this.setState({ placesList: placeData }, () => {
          let params = window.location.href.split('/#/')[1];

          typeof parseInt(params) == 'number' && parseInt(params) > 0
            ? fetch(
                'https://roadio-master.appspot.com/v1/get_user_items?user_id=management_user&datastore_id=' +
                  parseInt(params),
                { method: 'GET', headers: headers },
              )
                .then(response => response.json())
                .then(data => {
                  console.log('edit api call', data.items.length);
                  this.setState(
                    { text: data.items, tableLoading: false },
                    () => {
                      this.getUserDataItems();
                      this.setState({ dbIsFull: true });
                    },
                  );
                  this.props.setPlaces(data.items);
                })
            : fetch(
                'https://roadio-master.appspot.com/v1/get_user_items?user_id=management_user&limit=-1',
                { method: 'GET', headers: headers },
              )
                .then(response => response.json())
                .then(data => {
                  console.log('api call', data.items.length);
                  this.setState(
                    { text: data.items, tableLoading: false },
                    () => {
                      this.getUserDataItems();
                      this.setState({ dbIsFull: true });
                    },
                  );
                  this.props.setPlaces(data.items);
                });
        }),
      );
  };

  insertDataItems = newItem => {
    let length = this.state.userText.length;

    this.setState(prevState => ({
      userText: [...prevState.userText, newItem],
      text: [...prevState.userText, newItem],
    }));
  };

  updateDataItems = updateItem => {
    this.setState(state => {
      const userText = state.userText.map((item, j) => {
        if (updateItem.item.datastore_id == item.datastore_id) {
          return updateItem.item;
        } else {
          return item;
        }
      });

      return {
        userText,
      };
    });
  };

  // ---> 3. GCP <---
  componentDidMount() {
    this.getDataItems();
  }

  render() {
    if (this.state.user) {
      const { post, text, previosIndexList, user, newItem } = this.state;
      let submitted = false;
      let hideMessage, hideDiv;
      let number = this.findNextUnsubmitedElement(post);
      if (post !== 0) {
        number = post;
      }

      let isNextElementExist =
        this.findNextUnsubmitedElement(number) !== undefined;
      const itemId =
        text[number] === undefined ? false : text[number].datastore_id;
      let routes = undefined;
      if (text.length === 0) {
        //Loading
        routes = (
          <Router>
            <Route
              render={() => (
                <Top user={user.email} itemId={false} setNew={this.setNew}>
                  <Message
                    color="teal"
                    icon="circle notched loading icon"
                    text1="רק שניה"
                    text2="מביאים לכם את התוכן"
                  />
                </Top>
              )}
            />
          </Router>
        );
      } else if (this.state.newItem) {
        const routeRender = id => {
          const item = this.state.text.find(
            q => q.datastore_id === parseInt(id),
          );
          return (
            <Top user={user.email} itemId={false} setNew={this.setNew}>
              {item ? (
                <Heading heading={`Add item to ${item.question}`} />
              ) : (
                <Heading heading={'New item'} />
              )}
              <NewForm
                user={user.email}
                post={{
                  place: null,
                  lat: undefined,
                  lon: undefined,
                }}
                placesList={this.state.placesList}
                setNew={this.setNew}
                data={this.state.text}
                validator={this.validator}
                getDataItems={this.getDataItems}
                insertDataItems={this.insertDataItems}
                parentId={id}
              />
            </Top>
          );
        };
        //TODO Sadly, but Route path param is not supporting an array of strings for now. Should be fixed in react-router-dom 4.4
        routes = (
          <Router>
            <Switch>
              <Route
                path={'/addNewItem/:parentId'}
                render={routeParams => {
                  const id = routeParams.match.params.parentId;
                  return routeRender(id);
                }}
              />
              <Route
                path={'/addNewItem/'}
                render={routeParams => {
                  return routeRender();
                }}
              />
              <Route
                path={'/group-mode'}
                render={routeParams => {
                  return (
                    <Top user={user.email} itemId={false} setNew={this.setNew}>
                      <GroupMode />
                    </Top>
                  );
                }}
              />
            </Switch>
          </Router>
        );
      } else if (post === undefined || (post === 0 && number === undefined)) {
        //All text submitted
        submitted = true;
        hideMessage = false;
        hideDiv = true;
      } else {
        //Main
        hideMessage = true;
        hideDiv = false;
      }

      return (
        <div>
          {routes ? (
            routes
          ) : (
            <Router>
              <Switch>
                <React.Fragment>
                  <Route
                    path={'/:name'}
                    exact
                    strict
                    render={routeProps => {
                      let string = '/' + routeProps.match.params.name;

                      let postExistanse = false;
                      if (
                        (number === undefined &&
                          Object.values(text).length > 0 &&
                          this.state.previosIndexList.length === 0) ||
                        routeProps.history.action == 'POP'
                      ) {
                        for (
                          let i = 0, size = Object.values(text).length;
                          i < size;
                          i++
                        ) {
                          if (
                            text[i].datastore_id == routeProps.match.params.name
                          ) {
                            submitted = false;
                            hideMessage = true;
                            hideDiv = false;
                            postExistanse = true;
                            number = i;
                            break;
                          }
                        }
                      }
                      if (itemId) {
                        if (
                          !(
                            this.state.previosIndexList.length > 0 &&
                            this.findNextUnsubmitedElement(
                              this.state.previosIndexList[
                                this.state.previosIndexList.length - 1
                              ],
                            ) === number
                          ) &&
                          this.state.previosDatascore_id !=
                            text[number].datastore_id
                        ) {
                          for (
                            let i = 0, size = Object.values(text).length;
                            i < size;
                            i++
                          ) {
                            if (
                              text[i].datastore_id ==
                              routeProps.match.params.name
                            ) {
                              submitted = false;
                              postExistanse = true;
                              number = i;
                              break;
                            }
                          }
                        }

                        string = '/' + text[number].datastore_id;
                      }
                      isNextElementExist =
                        this.findNextUnsubmitedElement(number) !== undefined;
                      if (!hideMessage) string = '/';
                      return (
                        <Top
                          user={user.email}
                          itemId={itemId}
                          setNew={this.setNew}
                        >
                          <Redirect to={string} />
                          {/* <Message className={hideMessage ? 'hidden' : ''} color='green' icon='check icon'
                      text1='מצטערים' text2='כל הפוסטים כבר נבדקו' /> */}
                          <div className={hideDiv ? 'hidden' : ''}>
                            <Text
                              text={
                                text[number] &&
                                text[number].raw_text &&
                                !hideDiv
                                  ? text[number].raw_text
                                  : ''
                              }
                              heading={hideDiv ? '' : text[number].place}
                            />
                          </div>

                          <Survey
                            postNum={number}
                            showPrev={this.showPrev}
                            showNext={this.showNext}
                            showEl={this.showEl}
                            numberOfPreviousElemnts={previosIndexList.length}
                            nextElementExistanse={isNextElementExist}
                            toUndef={this.toUndef}
                            post={submitted ? '' : text[number]}
                            user={submitted ? '' : user.email}
                            submitted={submitted}
                            placesList={this.state.placesList}
                            validator={this.validator}
                            data={this.state.text}
                            updateDataItems={this.updateDataItems}
                            params={routeProps.match.params.name}
                          />
                        </Top>
                      );
                    }}
                  />
                  <Route
                    path={'/'}
                    exact
                    render={routeProps => {
                      let string =
                        '/' +
                        (text[number] === undefined
                          ? ''
                          : text[number].datastore_id);

                      return (
                        <Top
                          user={user.email}
                          itemId={itemId}
                          setNew={() => this.setNew(true)}
                        >
                          <Redirect to={string} />
                          <div className={hideDiv ? 'hidden' : ''}>
                            <Text
                              text={
                                text[number] &&
                                text[number].raw_text &&
                                !hideDiv
                                  ? text[number].raw_text
                                  : ''
                              }
                              heading={hideDiv ? '' : text[number].place}
                            />
                          </div>

                          <DataTable
                            data={this.state.userText}
                            tableLoading={this.state.tableLoading}
                            setNew={this.setNew}
                            fullTable={text}
                          />

                          <MapContainer
                            data={this.state.userText}
                            isFormMap={false}
                          />
                          <Survey
                            postNum={number}
                            showPrev={this.showPrev}
                            showNext={this.showNext}
                            showEl={this.showEl}
                            numberOfPreviousElemnts={previosIndexList.length}
                            nextElementExistanse={isNextElementExist}
                            toUndef={this.toUndef}
                            post={submitted ? '' : text[number]}
                            user={submitted ? '' : user.email}
                            submitted={submitted}
                            placesList={this.state.placesList}
                            validator={this.validator}
                            data={this.state.text}
                            updateDataItems={this.updateDataItems}
                            params={routeProps.match.params.name}
                          />
                        </Top>
                      );
                    }}
                  />
                </React.Fragment>
              </Switch>
            </Router>
          )}
        </div>
      );
    } else {
      return (
        <Login
          showEl={this.showEl}
          hideEl={this.hideEl}
          getDataItems={() => this.getDataItems()}
        />
      );
    }
  }
}

export default connect(
  null,
  { setPlaces },
)(App);

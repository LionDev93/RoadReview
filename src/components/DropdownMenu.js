import React from 'react';
import { Divider, Dropdown, Icon } from 'semantic-ui-react';
import fireDB from '../fireDB';
import gcp_config from '../GCP_configs';
import { Link } from 'react-router-dom';

const DropdownMenu = props => {
  // ---> FIREBASE DB <---
  const signOut = () => {
    fireDB.auth().signOut();
  };

  const deleteItem = itemId => {
    if (window.confirm('Are you sure?')) {
      let headers = new Headers();
      headers.set(
        'Authorization',
        'Basic ' + btoa(gcp_config.username + ':' + gcp_config.password),
      );
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');

      fetch('https://roadio-master.appspot.com/v1/delete_item', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ datastore_id: itemId }),
      })
        .then(res => console.log('Status: ', res.status))
        .catch(error => console.error('Error: ', error));

      window.location.reload();
    }
  };

  const getDelete = itemId => {
    if (!itemId) {
      return null;
    } else {
      return (
        <Dropdown.Item onClick={() => deleteItem(props.itemId)}>
          <Icon name="trash alternate" />
          <span className="text">Delete this item</span>
        </Dropdown.Item>
      );
    }
  };

  return (
    <Dropdown
      text="Menu"
      floating
      labeled
      button
      className="icon"
      icon="bars"
      style={{ height: '35px', alignSelf: 'flex-end' }}
    >
      <Dropdown.Menu className="right">
        <Dropdown.Item
          onClick={() => props.setNew(true)}
          as={Link}
          to={'/addNewItem'}
        >
          <Icon name="edit" />
          <span className="text">Add new item</span>
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => props.setNew(true)}
          as={Link}
          to={'/group-mode'}
        >
          <Icon name="boxes" />
          <span className="text">Group mode</span>
        </Dropdown.Item>

        {getDelete(props.itemId)}

        <Divider />

        <Dropdown.Item onClick={signOut}>
          <Icon name="sign-out" />
          <span className="text">Sign out</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownMenu;

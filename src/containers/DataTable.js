import React, { Component } from "react";
import ReactTable from "react-table";
import moment from "moment";
import { runInNewContext } from "vm";
import "../css/reactTable.css";

import "react-table/react-table.css";
import { CommunicationRingVolume } from "material-ui/svg-icons";
import { Button, Icon, List, Popup } from "semantic-ui-react";
import { Link } from "react-router-dom";

class DataTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
    this.renderEditable = this.renderEditable.bind(this);
  }

  componentDidMount() {
    this.getFilterData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.data === prevProps.data) return;
    this.getFilterData();
  }

  getFilterData() {
    this.setState({
      data: this.props.data,
      editRow: null
    });
  }

  renderEditable(cellInfo) {
    if (cellInfo.original.datastore_id === this.state.editRow) {
      return (
        <div
          style={{ boxShadow: "0 0 0 0.2rem rgba(0,0,0,.1)" }}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => {
            const data = [...this.state.data];
            data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
            this.setState({ data });
          }}
          dangerouslySetInnerHTML={{
            __html: this.state.data[cellInfo.index][cellInfo.column.id]
          }}
        />
      );
    }
    return <div>{cellInfo.value}</div>;
  }

  render() {
    const { data } = this.state;
    const fullTable = this.props.fullTable;
    return (
      <div style={{ textAlign: "right", direction: "rtl" }}>
        <ReactTable
          resizable={false}
          loading={this.props.tableLoading}
          loadingText={"ˈlōdiNG..."}
          data={data}
          classname={"testing"}
          columns={[
            {
              Header: "שאלות המשך",
              accessor: "children",
              width: 100,
              Cell: ({ row, original }) => (
                <List>
                  {original.related &&
                    original.related.map(r => (
                      <List.Item key={r.datastore_id}>
                        <a target={"_blank"} href={"#/" + r.datastore_id}>
                          {" "}
                          {r.question.slice(0, 15)}
                        </a>
                      </List.Item>
                    ))}
                </List>
              )
            },
            {
              Header: "שאלות מקדימות",
              accessor: "parent",
              width: 100,
              Cell: ({ row, original }) => (
                <List>
                  {original.parents &&
                    original.parents.map(p => (
                      <List.Item key={p}><a target={"_blank"} href={"#/" + p}>
                        {fullTable.find(item => item.datastore_id === parseInt(p)).question.slice(0, 15)}
                      </a></List.Item>
                    ))}
                </List>
              )
            },
            {
              Header: "",
              Cell: ({ original }) => {
                return (
                  <Popup
                    trigger={
                      <Button
                        onClick={this.props.setNew}
                        as={Link}
                        to={"/addNewItem/" + original.datastore_id}
                        size="mini"
                        icon
                      >
                        <Icon name="plus" />
                      </Button>
                    }
                    content="הוסף שאלת המשך"
                    position="bottom right"
                  />
                );
              },
              width: 50
            },
            {
              Header: "Question",
              accessor: "question",
              width: 280,
              Cell: ({ row, original }) => (
                <textarea
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    resize: "none",
                    outline: "none",
                    rows: "3"
                  }}
                  readOnly
                  value={row.question ? row.question : ""}
                />
              )
            },
            {
              Header: "Place",
              accessor: "place",
              width: 120,
            },
            {
              Header: "Modified Date",
              id: "last_modified",
              accessor: original => new Date(original.last_modified),
              Cell: ({ row }) => {
                return (
                  <div>
                    {row.last_modified
                      ? <p>{moment(row.last_modified).format("YYYY/MM/DD")}</p>
                      : ""}
                    {row.last_modified
                      ? <p>{moment(row.last_modified).format("HH:mm:ss")}</p>
                      : ""}
                  </div>
                );
              },
              sortable: true,
              width: 100
            },
            {
              Header: "",
              Cell: ({ original }) => {
                return (
                  <button>
                    <a href={`#/${original.datastore_id}`} target="_blank">
                      Edit
                    </a>
                  </button>
                );
              },
              width: 50
            }
          ]}
          defaultSorted={[
            {
              id: "last_modified",
              desc: true
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

export default DataTable;

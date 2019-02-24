import React, { Component } from "react";
import ReactTable from "react-table";
import moment from 'moment';
import { runInNewContext } from "vm";

import "react-table/react-table.css";
import { CommunicationRingVolume } from "material-ui/svg-icons";

class DataTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
    this.renderEditable = this.renderEditable.bind(this);
  }

  componentDidMount() {
    console.log(this.props.data);
    this.getFilterData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.data === prevProps.data) return;
    this.getFilterData();
  }

  getFilterData() {
    let data = [];
    if (!this.props.data) return;
    this.props.data.map((item) => {
      if (item.writer_username === this.props.user)
        data.push(item);
    });
    
    this.setState({
      data,
      editRow: null
    });
  }
   
  renderEditable(cellInfo) {
    if (cellInfo.original.datastore_id === this.state.editRow) {
      return (
        <div
          style={{ boxShadow: '0 0 0 0.2rem rgba(0,0,0,.1)'}}
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
    return <div>{cellInfo.value}</div>
  }
 

  render() {
    const { data } = this.state;
    return (
      <div style={{textAlign: "right", direction: "rtl"}}>
        <ReactTable
          resizable={false}
          loading={this.props.tableLoading}
          loadingText={'ˈlōdiNG...'}
          data={data}
          columns={[{
              Header: "Question",
              accessor: "question",
              Cell: ({row}) => (
                <textarea
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    resize: 'none',
                    outline: 'none',
                    rows: '3'
                  }}
                  readOnly
                  value={row.question ? row.question : ""}
                />
              )
            }, {
              Header: "Place",
              accessor: "place",
              width: 250
            }, {
              Header: "Modified Date",
              accessor: "last_modified",
              Cell: ({row}) => {
                return (
                <div>
                  {row.last_modified ? moment(row.last_modified).format("YYYY/MM/DD hh:mm:ss") : ""}
                </div>
                )
                },
              sortable:true,
              sortMethod: (a, b) => {
                if (!a) return -1;
                if (!b) return 1;
                a = moment(a).format("YYYY/MM/DD hh:mm:ss");
                b = moment(b).format("YYYY/MM/DD hh:mm:ss");
                if (a > b)
                  return 1;
                if (a < b)
                  return -1;
                return 0;
              },
              width: 250
            }, {
              Header: '',
              Cell: ({original}) => {
                return (
                  <button>
                    <a href={`#/${original.datastore_id}`} target="_blank">Edit</a>
                  </button>
              )},
              width: 50
            }
          ]}
          defaultSorted={[{
            id: "last_modified",
            desc: true
          }]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

export default DataTable;

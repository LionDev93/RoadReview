import React, { Component } from "react";
import ReactTable from "react-table";

import "react-table/react-table.css";

class DataTable extends Component {
  constructor(props) {
    super();
    this.state = {
      data: props.data
    };
    this.renderEditable = this.renderEditable.bind(this);
  }
  renderEditable(cellInfo) {
    return (
      <div
        style={{ backgroundColor: "#fafafa" }}
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
  render() {
    const { data } = this.state;
    return (
      <div style={{textAlign: "right", direction: "rtl"}}>
        <ReactTable
          resizable={false}
          data={data}
          columns={[
            {
              Header: "Modified Date",
              accessor: "last_modified",
              Cell: this.renderEditable
            },
            {
              Header: "Place",
              accessor: "place",
              Cell: this.renderEditable
            },
            {
              Header: "Right Answer",
              accessor: "right_answer",
              Cell: this.renderEditable
            },
            {
              Header: "Question",
              accessor: "question",
              Cell: this.renderEditable
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

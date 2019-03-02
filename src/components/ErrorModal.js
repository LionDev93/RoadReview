import React, { Component } from 'react'
import ReactModal from 'react-modal';
import '../css/ErrorModal.css';

ReactModal.setAppElement('#root');

class ErrorModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: props.text,
      showModal: props.showModal
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;

    this.setState({
      showModal: this.props.showModal,
      text: this.props.text
    });
  }

  handleCloseModal = () => {
    this.setState({ showModal: false });
    this.props.handleCloseModal();
  };

  render() {
    return (
      <div>
        <ReactModal 
          isOpen={this.state.showModal}
          contentLabel="500 error"
          onRequestClose={this.handleCloseModal}
          className="Modal"
          overlayClassName="Overlay"
          appElement={null}
        >
          <button onClick={this.handleCloseModal}>&times;</button>
          <p dir="rtl">{this.state.text}</p>
        </ReactModal>
      </div>
    )
  }
}

export default ErrorModal;
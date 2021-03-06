import React, {Component} from "react";
import {Modal, ModalBody, ModalFooter, ModalHeader, Button} from "reactstrap";

export default class ConfirmModal extends Component {
    static defaultProps = {
        onConfirm: () => {
        },
        onDecline: () => {
        },
        title: 'Confirm',
        message: 'Are you sure?',
        willGenerateLineItems: 0,
        willGenerateKeywords: 0
    };

    state = {
        open: false
    };

    confirm = () => {
        this.toggle();
        this.props.onConfirm();
    };

    decline = () => {
        this.toggle();
        this.props.onDecline();
    };

    toggle = () => {
        this.setState(state => ({open: !state.open}));
    };

    render() {
        return (
            <Modal isOpen={this.state.open} toggle={this.toggle}>
                <ModalHeader>{this.props.title}</ModalHeader>
                <ModalBody dangerouslySetInnerHTML={{__html: this.props.message}}>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.decline}>No</Button>
                    <Button onClick={this.confirm}>Yes</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

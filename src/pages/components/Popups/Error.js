import React, {Component} from 'react'
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

export class ErrorPopup extends Component {

    render() {
        let {toggleModal, isOpen, header, message} = this.props;
        if (typeof header === "undefined") {
            header = "Something went wrong";
        }

        return (
            <Modal
                isOpen={isOpen}
                className="error-popup"
            >
                <ModalHeader>{header}</ModalHeader>
                <ModalBody>
                    <dl>
                        <dt>
                            <i className="fa fa-exclamation-triangle"></i>&nbsp;
                        </dt>
                        <dd dangerouslySetInnerHTML={{__html: message}}/>
                    </dl>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Ok</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

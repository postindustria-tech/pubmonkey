import React, {Component} from 'react'
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

export class AlertPopup extends Component {


    render() {
        let {toggleModal, isOpen, header, message} = this.props;

        return (
            <Modal
                isOpen={isOpen}
                className="alert-popup"
            >
                <ModalHeader>{header}</ModalHeader>
                <ModalBody>
                    <dl>
                        <dt>
                            <i className="fa fa-info-circle"></i>&nbsp;
                        </dt>
                        <dd>
                            {message}
                        </dd>
                    </dl>

                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Ok</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

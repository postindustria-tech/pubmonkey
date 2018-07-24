import React, { Component } from 'react'
import bind from 'bind-decorator'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap'

export class ErrorPopup extends Component {


    render() {
        let { toggleModal, isOpen, message } = this.props

        return (
            <Modal
                isOpen={ isOpen }
                className="error-popup"
            >
                <ModalHeader>Something went wrong</ModalHeader>
                <ModalBody>
                    <i className="fa fa-exclamation-triangle"></i>&nbsp;
                    { message }
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={ toggleModal }>Ok</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

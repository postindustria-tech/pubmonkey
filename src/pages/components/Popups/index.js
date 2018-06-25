import React, { Component } from 'react'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

export class ProgressModal extends Component {
    render() {
        let { toggleModal, isOpen, progress } = this.props

        return (
            <Modal
                // toggle={ this.toggleModal }
                isOpen={ isOpen }
            >
                {/* <ModalHeader toggle={ this.toggleModal }>Backup orders</ModalHeader> */}
                <ModalHeader>Progress</ModalHeader>
                <ModalBody>
                    <Progress value={ progress }/>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" disabled onClick={ toggleModal }>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

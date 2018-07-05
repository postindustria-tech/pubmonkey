import React, { Component } from 'react'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

export class ProgressModal extends Component {
    constructor() {
        super()

        this.onCancel = this.onCancel.bind(this)
    }

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
                    { progress.map && progress.map(({ title, progress }, idx) => (
                        <div key={ idx }>
                            { title }
                            { progress && <Progress { ...progress }/> }
                        </div>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" disabled={ !this.props.onCancel } onClick={ this.onCancel }>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    onCancel() {
        let { onCancel } = this.props

        onCancel()
    }
}

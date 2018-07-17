import React, { Component } from 'react'
import bind from 'bind-decorator'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

export class ProgressModal extends Component {
    render() {
        let { toggleModal, isOpen, progress, onCancel } = this.props

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
                    <Button color="secondary" disabled={ !onCancel } onClick={ this.onCancel }>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    @bind
    onCancel() {
        let { onCancel } = this.props

        onCancel()
    }
}

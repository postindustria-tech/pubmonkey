import React, { Component } from 'react'
import bind from 'bind-decorator'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import {AD_SERVER_MOPUB} from "../../constants/source";

export class ProgressModal extends Component {
    render() {
        let { toggleModal, isOpen, progress, onCancel, adServer } = this.props

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
                    {/* {adServer === AD_SERVER_MOPUB ? (
                        <div style={{width: "100%", textAlign: "left", color: "red"}}>
                            Please don't close or refresh MoPub tab
                        </div>
                    ) : null} */}
                    <Button color="secondary" disabled={ !onCancel } onClick={ this.onCancel }>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    @bind
    onCancel() {
        let { onCancel } = this.props;
        onCancel()
    }
}

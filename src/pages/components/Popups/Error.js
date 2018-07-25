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
                    <dl>
                        <dt>
                            <i className="fa fa-exclamation-triangle"></i>&nbsp;
                        </dt>
                        <dd>
                            { message }
                        </dd>
                    </dl>

                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={ toggleModal }>Ok</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

import React, { Component } from 'react'
import bind from 'bind-decorator'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap'

export class CloneModal extends Component {
    state = { number: 1 }
    render() {
        let { clones = [], isOpen, progress, onCancel, onClone } = this.props,
            { number } = this.state,
            count = Number(number) * clones[0]

        return (
            <Modal
                // toggle={ this.toggleModal }
                isOpen={ isOpen }
            >
                {/* <ModalHeader toggle={ this.toggleModal }>Backup orders</ModalHeader> */}
                <ModalHeader>Clone</ModalHeader>
                <ModalBody>
                    Create following number of copies:
                    <Input
                        type="number"
                        min="1"
                        value={ number }
                        onChange={ this.onNumberChange }
                    />
                    You get a total of { count } line-items
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" disabled={ !onClone || number === 0 } onClick={ this.onClone }>Clone</Button>
                    <Button color="secondary" disabled={ !onCancel } onClick={ this.onCancel }>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    @bind
    onNumberChange({ target: { value: number }}) {
        this.setState({ number })
    }

    @bind
    onClone() {
        let { onClone } = this.props,
            { number } = this.state

        onClone(Number(number))
    }

    @bind
    onCancel() {
        let { onCancel } = this.props

        onCancel()
    }
}

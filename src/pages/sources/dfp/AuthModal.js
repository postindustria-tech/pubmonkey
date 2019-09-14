import React, {Component} from "react";
import {Modal, ModalBody, ModalFooter, ModalHeader, Button, Col, Form, FormGroup, Label, Input, Row} from "reactstrap";
import {isEmpty} from "../../helpers";
import bind from "bind-decorator";

export default class AuthModal extends Component {

    static defaultProps = {
        onSubmit: () => {}
    };

    state = {
        open: false,
        networkCode: localStorage.getItem("dfpNetworkCode") || "",
        formErrors: {
            networkCode: ""
        }
    };

    submit = () => {
        this.toggle();

        localStorage.setItem("dfpNetworkCode", this.state.networkCode);

        this.props.onSubmit(this.state.networkCode);
    };

    toggle = () => {
        this.setState(state => ({open: !state.open}));
    };

    render() {
        return (
            <Modal isOpen={this.state.open} toggle={this.toggle}>
                <ModalHeader>Google Ad Manager (DFP)</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col className={"col-sm-12"}>
                            <Form inline>
                                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                    <Label for="networkCode" className="mr-sm-2 mp-label">
                                        Network Code:
                                    </Label>
                                    <Input
                                        invalid={!isEmpty(this.state.formErrors.networkCode)}
                                        type="text"
                                        name={"networkCode"}
                                        id="networkCode"
                                        onChange={this.handleInputChange}
                                        value={this.state.networkCode}
                                        className={"mp-form-control"}
                                    />
                                </FormGroup>
                            </Form>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.submit}>Submit</Button>
                </ModalFooter>
            </Modal>
        );
    }

    @bind
    handleInputChange(event) {
        const {value, name} = event.target;
        this.setState({[name]: value});
    }
}

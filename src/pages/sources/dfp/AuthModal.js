import React, {Component} from "react";
import {Modal, ModalBody, ModalFooter, ModalHeader, Button, Col, Form, FormGroup, Label, Input, Row} from "reactstrap";
import {isEmpty} from "../../helpers";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import FormErrors from "../../components/FormErrors";
import {ONLY_NUMBERS} from "../../constants/common";

class AuthModal extends Component {

    static defaultProps = {
        onSubmit: () => {}
    };

    state = {
        networkCode: localStorage.getItem("dfpNetworkCode") || "",
        formErrors: {
            networkCode: ""
        },
        formValid: true
    };

    submit = () => {

        if (isEmpty(this.state.networkCode)) {
            this.setState({
                formErrors: {
                    networkCode: "Network Code is required!"
                },
                formValid: false
            });
            return;
        }

        this.toggle();

        localStorage.setItem("dfpNetworkCode", this.state.networkCode);

        this.props.setNetworkCode(this.state.networkCode);
        this.setState({
            formErrors: {
                networkCode: ""
            },
            formValid: true
        });
    };

    toggle = () => {
        this.props.dfpAuthModalToggle();
    };

    render() {
        return (
            <Modal isOpen={this.props.dfpAuthModalOpen} toggle={this.toggle}>
                <ModalHeader>Google Ad Manager</ModalHeader>
                <ModalBody style={{maxHeight: '50vw'}}>
                    <div className="panel panel-default">
                        <FormErrors
                            formErrors={this.state.formErrors}
                            formValid={this.state.formValid}
                        />
                    </div>
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
                    <Row>
                        <Col className={"col-sm-12"} style={{fontSize: "14px"}}>
                            Instruction:
                            <ul>
                                <li>1. Navigate to <a href="https://admanager.google.com/" target="_blank">https://admanager.google.com/</a></li>
                                <li>2. Sign-in</li>
                                <li>3. Copy Network code either from the top left corner of the dashboard or from the URL in the browser:</li>
                            </ul>
                            <img style={{height: '18vw'}} src={"../../../images/dfp.png"} alt="" />
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
        if (value === '' || (ONLY_NUMBERS.test(value) && value.length <= 15)) {
            this.setState({[name]: value});
        }
    }
}

const mapDispatchToProps = {
    dfpAuthModalToggle: adServerActions.dfpAuthModalToggle,
    setNetworkCode: adServerActions.setNetworkCode
};

const mapStateToProps = state => ({
    dfpAuthModalOpen: adServerSelectors.dfpAuthModalOpen(state),
    networkCode: adServerSelectors.networkCode(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthModal)
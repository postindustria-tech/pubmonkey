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
                <ModalHeader>Google Ad Manager (DFP)</ModalHeader>
                <ModalBody>
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
        if (ONLY_NUMBERS.test(value)) {
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
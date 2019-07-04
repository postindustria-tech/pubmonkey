import React, {Component} from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Row,
    Col,
    Form
} from "reactstrap";

export default class HelperModal extends Component {
    static defaultProps = {
        header: "",
        text: ""
    };

    state = {
        open: false
    };

    static getDerivedStateFromProps = (props, state) => {
        return {
            ...props,
            ...state
        };
    };

    open = props => this.setState({open: true, ...props});

    close = () => this.setState({open: false});

    toggle = () => this.setState(state => ({open: !state.open}));

    render() {
        const text = this.state.text;
        return (
            <Modal
                isOpen={this.state.open}
                toggle={this.toggle}
                size="lg"
                backdrop={true}
            >
                <ModalHeader>{this.state.header}</ModalHeader>
                <ModalBody className="mp-order-form">
                    <Col className={"col-sm-12"}>
                        <Form inline>
                            <Row>
                                <span
                                    dangerouslySetInnerHTML={{__html: text}}
                                    style={{fontSize: "10px"}}
                                />
                            </Row>
                        </Form>
                    </Col>
                </ModalBody>
            </Modal>
        );
    }
}

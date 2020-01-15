import React, {Component} from "react";
import {CustomInput, Label, Tooltip} from "reactstrap";
import bind from "bind-decorator";

export class LineItemsNamingInput extends Component {

    static defaultProps = {
        onChange: () => {},
        invalid: false,
        value: null
    };

    state = {
        tooltipOpen: false,
    };

    helperText =
        "{bid} macro is replaced with a corresponding bid value\n" +
        "{position} macro is replaced with a position number (natural values starting from 1)";

    @bind
    tooltipToggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    render() {
        return (
            <React.Fragment>
                <Label className="mp-label">Line Items naming: </Label>
                <CustomInput
                    invalid={this.props.invalid}
                    inline
                    style={{width: "210px", display: "inline-block"}}
                    type="text"
                    id={"lineItemsNaming"}
                    name={"lineItemsNaming"}
                    onChange={this.props.onChange}
                    value={this.props.value}
                    placeholder="PN Hybib {bid}"
                    className={"mp-form-control"}
                    autocomplete={"off"}
                />{" "}
                <i className="fa fa-question-circle" id={"Tooltip-2"}/>
                <Tooltip
                    placement="top"
                    isOpen={this.state.tooltipOpen}
                    target={"Tooltip-2"}
                    toggle={this.tooltipToggle}
                >
                    {this.helperText}
                </Tooltip>
            </React.Fragment>
        );
    }
}
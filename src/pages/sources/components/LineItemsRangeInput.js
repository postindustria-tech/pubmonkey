import React, {Component} from "react";
import {CustomInput, Label} from "reactstrap";

export class LineItemsRangeInput extends Component {

    static defaultProps = {
        onChange: () => {},
        invalidRangeFrom: false,
        invalidRangeTo: false,
        rangeFrom: null,
        rangeTo: null,
        unit: '$'
    };

    render() {
        return (
            <React.Fragment>
                <Label className="mp-label">Line Items Range:</Label>
                <div>from [
                    <CustomInput
                        invalid={this.props.invalidRangeFrom}
                        inline
                        style={{width: "50px"}}
                        type="text"
                        id={"rangeFrom"}
                        name={"rangeFrom"}
                        value={this.props.rangeFrom}
                        onChange={this.props.onChange}
                        className={"mp-form-control"}
                    />{" "}
                    to{" "}
                    <CustomInput
                        invalid={this.props.invalidRangeTo}
                        inline
                        style={{width: "50px"}}
                        type="text"
                        id={"rangeTo"}
                        name={"rangeTo"}
                        value={this.props.rangeTo}
                        onChange={this.props.onChange}
                        className={"mp-form-control"}
                    />
                    ] {this.props.unit}.
                </div>
            </React.Fragment>
        );
    }
}
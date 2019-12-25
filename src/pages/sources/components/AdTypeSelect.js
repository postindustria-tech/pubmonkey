import React, {Component} from "react";
import {Input} from "reactstrap";

export class AdTypeSelect extends Component {

    static defaultProps = {
        onChange: () => {},
        networkClasses: {},
        os: ''
    };

    state = {
        adType: ''
    };

    onChange = (event) => {
        const {value, name} = event.target;
        this.setState({adType: value});
        this.props.onChange(event);
    };

    render() {

        const {networkClasses, os} = this.props;

        return (
            <Input
                type="select"
                name={"adType"}
                onChange={this.onChange}
                value={this.state.adType}
                style={{display: "inline-block", width: "auto"}}
                className={"mp-form-control"}
            >
                {Object.keys(networkClasses[os] || []).map((option, index) => (
                    <option key={index} value={networkClasses[os][option]['value']}>
                        {networkClasses[os][option]['label']}
                    </option>
                ))}
            </Input>
        );
    }
}
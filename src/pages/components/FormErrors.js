import React, {Component} from "react";

export default class FormErrors extends Component {

    static defaultProps = {
        formErrors: {},
        formValid: true
    };

    render() {

        const style = this.props.formValid ? {display: 'none'} : {};

        return (
            <div className='formErrors error-message' style={style}>
                {Object.keys(this.props.formErrors).map((fieldName, i) => {
                    if (this.props.formErrors[fieldName].length > 0) {
                        return (
                            //{fieldName}
                            <p className='error-text' key={i}>{this.props.formErrors[fieldName]}</p>
                        )
                    } else {
                        return '';
                    }
                })}
            </div>
        )
    }
}
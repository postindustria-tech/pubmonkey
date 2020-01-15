import React, {Component} from "react";
import {ONLY_NUMBERS} from "../../constants/common";

let defaultAdvertiser = "amazon";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],
    formValid: true,
    keyword: "",
    adType: "",
};

export default class CreateOrderForm extends Component {

    state = initialState;

    handleChangeKeyword = (event) => {
        const {value} = event.target;
        this.stateSetter({keyword: value});
    };

    onChangeStep = value => {
        if (value === "" || ONLY_NUMBERS.test(value)) {
            this.stateSetter({
                step: value
            });
        }
    };

    onChangeKeywordStep = value => {
        this.stateSetter({
            keywordStep: value
        });
    };

    handleInputChange = (event) => {
        this.props.handleInputChange(event);
    };

    handleAdUnitsCheckboxChange = (event) => {
        this.props.handleAdUnitsCheckboxChange(event);
    };

    stateSetter = (state) => {
        this.props.stateSetter(state);
    };

    onChangeAdType = (event) => {
        const {value, name} = event.target;
        this.setState({adType: value});
        this.stateSetter({customEventClassName: value});
    }
}

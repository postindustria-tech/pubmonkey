import React, {Component} from "react";
import bind from "bind-decorator";
import {ONLY_NUMBERS} from "../../constants/common";

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let defaultAdvertiser = "amazon";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],

    formValid: true,

    tooltipOpen: false,
    keyword: "",
    adType: "",
};

export default class CreateOrderForm extends Component {

    state = initialState;

    helperText =
        "{bid} macro is replaced with a corresponding bid value\n" +
        "{position} macro is replaced with a position number (natural values starting from 1)";

    @bind
    tooltipToggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

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

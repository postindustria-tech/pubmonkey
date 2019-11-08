import React, {Component} from "react";
import CreatableSelect from 'react-select/creatable';

export class CreatableSingle extends Component {

    static defaultProps = {
        placeholder: "Select...",
        options: [],
        onSelect: null,
        value: null
    };

    state = {
        value: "",
    };

    componentDidMount() {
        this.setState({value: this.props.value});
    }

    componentWillReceiveProps = (props, state) => {
        if (props.value !== this.state.value) {
            this.setState({value: props.value});
        }
    };

    handleChange = (newValue, actionMeta) => {
        console.group('Value Changed');
        console.log(newValue);
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();

        this.setState({ value: newValue });

        if (this.props.onSelect) {
            this.props.onSelect(newValue);
        }
    };

    handleInputChange = (inputValue, actionMeta) => {
        console.group('Input Changed');
        console.log(inputValue);
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();
    };

    render() {

        let {options, placeholder} = this.props,
            {value} = this.state;
        return (
            <CreatableSelect
                isClearable={false}
                onChange={this.handleChange}
                onInputChange={this.handleInputChange}
                options={options}
                placeholder={placeholder}
                value={value}
            />
        );
    }
}
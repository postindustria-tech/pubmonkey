import React, {Component} from "react";

// import ChevronDown from '../../../images/chevron-down.png';

export class StatusSelect extends Component {

    static defaultProps = {
        status: "",
        options: [],
        onSelect: null
    };

    state = {
        dropDown: false,
        status: "",
    };

    componentDidMount() {
        this.setState({status: this.props.status});
    }

    componentWillReceiveProps = (props, state) => {
        if (props.status !== this.state.status) {
            this.setState({status: props.status});
        }
    };

    handleSelect = (newStatus) => {

        this.setState({
            status: newStatus,
            dropDown: false,
        });

        if (this.props.onSelect) {
            this.props.onSelect(newStatus);
        }
    };

    setDropDown() {
        this.setState({dropDown: !this.state.dropDown})
    }

    renderOptions = (options) => (
        <div className="status-select__list cursor-pointer">
            {
                options.map((option, index) => (
                    <div
                        key={`${option}${index}`}
                        className="status-select__items d-flex align-items-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            this.handleSelect(`${option}`);
                        }}
                    >
                        <span className={`mr-2 circle-${option.toLowerCase()}`}></span>
                        {option}
                    </div>
                ))
            }
        </div>
    );

    render() {

        let {options} = this.props,
            {status} = this.state;

        return (
            <div className="d-flex align-items-center">
                <div className="d-flex align-items-center mr-3">
                    <div className={'mr-2 circle-' + status.toLowerCase()}></div>
                    <div className="status-select">
                        <div className="status-select__title d-flex align-items-center">
                            <div className="name mr-2 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                this.setDropDown();
                            }}>{status}</div>
                        </div>
                        {
                            this.state.dropDown && this.renderOptions(options)
                        }
                    </div>
                </div>
                <img onClick={(e) => {
                    e.stopPropagation();
                    this.setDropDown();
                }} src={"../../../images/chevron-down.png"} alt="" className="cursor-pointer"/>
            </div>
        )
    }
}

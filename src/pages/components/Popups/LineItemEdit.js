import React, { Component } from 'react'
import { Input, CustomInput, Form, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'
import bind from 'bind-decorator'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

const FIELDS = ["order-name", "order-advertiser", "network_app_id", "network_adunit_id", "network_account_id", "chartboost-app_signature", "chartboost-location", "custom_native-custom_event_class_name", "custom_native-html_data", "name", "start_datetime_0", "start_datetime_1", "end_datetime_0", "end_datetime_1", "form-TOTAL_FORMS", "form-INITIAL_FORMS", "form-MIN_NUM_FORMS", "form-MAX_NUM_FORMS", "form-0-model_id", "form-0-weekdays", "form-0-start_time", "form-0-end_time", "form-1-model_id", "form-1-start_time", "form-1-end_time", "pmp-net_price", "mktplace_price_floor", "budget", "bid", "budget_strategy", "send_keywords", "adunits", "region_targeting_type", "connectivity_targeting_type", "device_targeting", "target_iphone", "target_ipod", "target_android", "target_other", "allocation_percentage", "refresh_interval", "bid_strategy", "budget_type", "advance_bidding_enabled", "order-description", "custom-html_data", "custom_native-custom_event_class_data", "pmp-notes", "targeted_zip_codes", "keywords", "adgroup_type", "priority", "blind", "accept_targeted_locations", "targeted_countries", "ios_version_min", "ios_version_max", "android_version_min", "android_version_max", "impression_caps", "key"].map(field => ({ label: field, value: field }))

export class LineItemEditModal extends Component {
    state = {
        field: 'bid',
        valueType: 'type-single',
        value: {}
    }

    render() {
        let { fields = FIELDS, isOpen, onUpdate, onCancel } = this.props,
            { field, valueType } = this.state

        return (
            <Modal
                isOpen={ isOpen }
            >
                <ModalHeader>Edit</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Select
                                options={ fields }
                                searchable={ true }
                                value={ field }
                                onChange={ this.onFieldChange }
                            />
                        </FormGroup>
                        <FormGroup>
                            <CustomInput type="radio" name="valueType" id="type-single" label="single"
                                onChange={ this.onValueTypeChange }
                                checked={ valueType === 'type-single'}
                            />
                            <CustomInput type="radio" name="valueType" id="type-range" label="range"
                                onChange={ this.onValueTypeChange }
                                checked={ valueType === 'type-range'}
                            />
                        </FormGroup>
                        <FormGroup>
                            {
                                valueType === 'type-single' &&
                                    <div>
                                        value<Input name="single" onChange={ this.onValueChange }/>
                                    </div>
                            }
                            {
                                valueType === 'type-range' &&
                                    <div>
                                        start<Input name="start" onChange={ this.onValueChange }/>
                                        end<Input name="end" onChange={ this.onValueChange }/>
                                        step<Input name="step" onChange={ this.onValueChange }/>
                                    </div>
                            }
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" disabled={ !onUpdate } onClick={ this.onUpdate }>Update</Button>
                    <Button color="secondary" disabled={ !onCancel } onClick={ this.onCancel }>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }

    @bind
    onFieldChange(data) {
        this.setState({
            field: data == null ? '' : data.value
        })
    }

    @bind
    onValueTypeChange({ target: { id: valueType }}) {
        this.setState({
            valueType,
            value: {}
        })
    }

    @bind
    onValueChange({ target: { name, value: newValue } }) {
        let { value } = this.state

        value[name] = newValue

        this.setState({
            value
        })
    }

    @bind
    onUpdate() {
        let { onUpdate } = this.props,
            { value, valueType, field } = this.state

        onUpdate({
            value,
            valueType,
            field
        })
    }

    @bind
    onCancel() {
        let { onCancel } = this.props

        onCancel()
    }
}

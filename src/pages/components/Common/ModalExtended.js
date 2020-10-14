import {Modal} from "reactstrap";

export class ModalExtended extends Modal {
    handleBackdropClick(e) {
        if (e.target === this._mouseDownElement) {
            e.stopPropagation();
        }
    }
}
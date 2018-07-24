import bind from 'bind-decorator'

const ErrorPopup = new class {
    isOpen = false
    message = ''

    @bind
    showMessage(message) {
        this.message = message
        this.isOpen = true

        this.onUpdate && this.onUpdate()
    }

    @bind
    hideModal() {
        this.isOpen = false
        this.onUpdate && this.onUpdate()
    }
}

export const ModalWindowService = {
    ErrorPopup
}

window.ModalWindowService = ModalWindowService

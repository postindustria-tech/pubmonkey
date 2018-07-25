import bind from 'bind-decorator'

class ModalBase {
    isOpen = false

    @bind
    showModal() {
        this.isOpen = true

        onUpdate()
    }

    @bind
    hideModal() {
        this.isOpen = false

        onUpdate()
    }
}

const ProgressModal = new class extends ModalBase {
    progress = []

    @bind
    setProgress(progress) {
        this.progress = progress
        this.showModal()
    }

    @bind
    hideModal() {
        this.progress = []

        super.hideModal()
    }

    @bind
    cancel() {
        this.cancelHandler && this.cancelHandler()

        onUpdate()
    }

    @bind
    onCancel(cancelHandler) {
        this.cancelHandler = cancelHandler
    }
}

const CloneModal = new class extends ModalBase {
    itemCount = 0

    clone(itemCount) {
        this.itemCount = itemCount
        isOpen = true

        onUpdate()
    }
}

const ErrorPopup = new class extends ModalBase {
    message = ''

    @bind
    showMessage(message) {
        this.message = message

        this.showModal()
    }
}

function onUpdate() {
    ModalWindowService.onUpdate && ModalWindowService.onUpdate()
}

export const ModalWindowService = {
    ErrorPopup,
    ProgressModal
}

window.ModalWindowService = ModalWindowService

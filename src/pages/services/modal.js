import bind from 'bind-decorator'

const ProgressModal = new class {
    isOpen = false
    progress = []

    @bind
    setProgress(progress) {
        this.progress = progress
        this.isOpen = true

        onUpdate()
    }

    @bind
    hideModal() {
        this.isOpen = false
        this.progress = []

        onUpdate()
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

const CloneModal = new class {
    isOpen = false
    itemCount = 0

    clone(itemCount) {
        this.itemCount = itemCount
        isOpen = true

        onUpdate()
    }
}

const ErrorPopup = new class {
    isOpen = false
    message = ''

    @bind
    showMessage(message) {
        this.message = message
        this.isOpen = true

        onUpdate()
    }

    @bind
    hideModal() {
        this.isOpen = false

        onUpdate()
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

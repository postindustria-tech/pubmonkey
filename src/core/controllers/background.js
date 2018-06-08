import { HTTPService, StorageService } from '../services'
import { LineItemModel } from '../models'

const WEB_URL = 'https://app.mopub.com'

const BackgroundController = new class Background {
    draft = []

    getAllOrders() {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/query`)
    }

    getOrder(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/get?key=${id}`)
    }

    getLineItem(id) {
        return HTTPService.GET(`${WEB_URL}/advertise/line_items/${id}/edit/`)
            .then(data => LineItemModel.createFromHTML(data, id).toJSON()) //@TODO maybe it's not necessary to create instances for parsing only
    }

    getBackups() {
        return StorageService.get('backups')
            .then(({ backups }) => backups)
    }

    getBackupByDate(_date) {
        return StorageService.get('backups')
            .then(({ backups }) => {
                if (backups == null) {
                    throw 'no backups in store'
                }

                return backups.filter(({ date }) => date === Number(_date))
            })
    }

    addBackup(data) {
        return this.getBackups()
            .then(backups => {
                if (backups == null) {
                    backups = []
                }

                backups.push(data)

                return StorageService.set({ backups })
            })
    }

    removeBackup(_date) {
        return StorageService.get('backups')
            .then(({ backups }) => {
                if (backups == null) {
                    throw 'no backups in store'
                }

                backups = backups.filter(({ date }) => date !== _date)

                return StorageService.set({ backups })
            })
    }

    getDraft() {
        return this.draft
    }

    keepInDraft(data) {
        this.draft.push(data)
    }

    clearDraft() {
        this.draft = []
    }
}

export { BackgroundController }

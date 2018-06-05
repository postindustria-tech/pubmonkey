import { HTTPService, StorageService } from '../services'
import { LineItemModel } from '../models'

const WEB_URL = 'https://app.mopub.com'

const BackgroundController = new class Background {
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

    getBackupById(_id) {
        return StorageService.get('backups')
            .then(backups => {
                if (backups == null) {
                    throw 'no backups in store'
                }

                return backups.filter(({ id }) => id === _id)
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

    removeBackup(_id) {
        return StorageService.get('backups')
            .then(backups => {
                if (backups == null) {
                    throw 'no backups in store'
                }

                backups = backups.filter(({ id }) => id !== _id)

                return StorageService.set({ backups })
            })
    }

    // getFromStore(...keys) {
    //     return StorageService.get(...keys)
    // }
    //
    // setToStore(data) {
    //     return StorageService.set(data)
    // }
    //
    // addToStore(data) {
    //     return StorageService.add(data)
    // }
}

export { BackgroundController }

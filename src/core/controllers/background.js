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

    getAllBackups() {
        return StorageService.get('backups')
            .then(({ backups }) => {
                if (backups == null) {
                    return []
                }

                return backups
            })
    }

    findBackup(data) {
        let keys = Object.keys(data)

        return this.getAllBackups()
            .then(backups =>
                keys.reduce((curr, key) =>
                    curr.filter(backup => backup[key] === data[key])
                , backups)
            )
    }

    getBackupById(id) {
        return this.findBackup({ id })
            .then(result => result[0])
    }

    createBackup(data) {
        data.id = Date.now()

        return this.getAllBackups()
            .then(backups => backups.concat(data))
            .then(backups => StorageService.set({ backups }))
    }

    updateBackup(data) {
        let { id } = data,
            updated = false

        if (id == null) {
            throw 'id is required'
        }

        return this.getAllBackups()
            .then(backups =>
                backups.map(backup => {
                    if (backup.id === id) {
                        updated = true
                        return {
                            ...backup,
                            ...data,
                            updated: Date.now()
                        }
                    } else {
                        return backup
                    }
                })
            )
            .then(backups => {
                if (updated) {
                    return StorageService.set({ backups })
                } else {
                    throw 'can\'t find backup with id ' + id
                }
            })
    }

    deleteBackup(_id) {
        let deleted = false

        return this.getAllBackups()
            .then(backups =>
                backups.filter(({ id }) => {
                    let wanted = id !== _id

                    if (!wanted) {
                        deleted = true
                    }

                    return wanted
                })
            )
            .then(backups => {
                if (deleted) {
                    return StorageService.set({ backups })
                } else {
                    throw 'can\'t find backup with id ' + id
                }
            })
    }

    // getBackupById(_id) {
    //     return this.getBackups()
    //         .then(backups => {
    //             let result = backups.filter(({ id }) => id === _id)//@TODO is it necessary?
    //
    //             if (result.length === 0) {
    //                 throw 'can\'t find backup ' + _id
    //             }
    //
    //             return result[0]
    //         })
    // }

    // updateBackup(data) {
    //     if (data.id == null) {
    //         throw 'backup must have id!'
    //     }
    //
    //     return this.getBackups()
    //         .then(backups => {
    //             let updated = false,
    //                 result = backups.map(backup => {
    //                     if (backup.id === data.id) {
    //                         updated = true
    //                         return {
    //                             ...backup,
    //                             ...data,
    //                             updated: Date.now()
    //                         }
    //                     } else {
    //                         return backup
    //                     }
    //                 })
    //
    //             if (updated) {
    //                 return StorageService.set({ backups: result })
    //             } else {
    //                 throw 'backup ' + data.id + ' does\'nt exist'
    //             }
    //         })
    // }

    // createBackup(data) {
    //     return this.addBackup({
    //             ...data,
    //             id: Date.now()
    //         })
    // }
    //
    // addBackup(data) {
    //     return this.getBackups()
    //         .then(backups => {
    //             if (backups == null) {
    //                 backups = []
    //             }
    //
    //             backups.push(data)
    //
    //             return StorageService.set({ backups })
    //         })
    // }
    //
    // removeBackup(_date) {
    //     return StorageService.get('backups')
    //         .then(({ backups }) => {
    //             if (backups == null) {
    //                 throw 'no backups in store'
    //             }
    //
    //             backups = backups.filter(({ date }) => date !== _date)
    //
    //             return StorageService.set({ backups })
    //         })
    // }

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

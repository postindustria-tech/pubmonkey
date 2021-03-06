import { StorageService } from '../services'

export const MainController = new class Main {
    draft = [];

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
        let keys = Object.keys(data);

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
        data.id = Date.now();

        return this.getAllBackups()
            .then(backups => backups.concat(data))
            .then(backups => {
                return StorageService.set({ backups })
                    .then(() => data)
            })
    }

    updateBackup(data) {
        let { id } = data,
            updated = false;

        if (id == null) {
            throw 'id is required'
        }

        return this.getAllBackups()
            .then(backups =>
                backups.map(backup => {
                    if (backup.id === id) {
                        updated = {
                            ...backup,
                            ...data,
                            updated: Date.now()
                        };

                        return updated
                    } else {
                        return backup
                    }
                })
            )
            .then(backups => {
                if (updated) {
                    return StorageService.set({ backups })
                        .then(() => updated)
                } else {
                    throw 'can\'t find backup with id ' + id
                }
            })
    }

    deleteBackup(_id) {
        let deleted = false;

        return this.getAllBackups()
            .then(backups =>
                backups.filter(({ id }) => {
                    let wanted = id !== _id;

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

    getDraft() {
        return Promise.resolve(this.draft)
    }

    keepInDraft(data) {
        this.draft = data;
        // this.draft.push(data)
        return Promise.resolve()
    }

    clearDraft() {
        this.draft = [];
        return Promise.resolve()
    }
};

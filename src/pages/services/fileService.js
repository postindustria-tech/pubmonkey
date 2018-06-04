class File {
    resolver = null

    constructor() {
        let fileinput = this.fileinput = document.createElement('input'),
            anchor = this.anchor = document.createElement('a')

        fileinput.setAttribute('type', 'file')
        fileinput.setAttribute('accept', 'application/json')

        fileinput.addEventListener('click', this.clickHandler.bind(this))
        this.changeHandler = this.changeHandler.bind(this)
    }

    saveFile(data, name = '') {
        let blob = new Blob(
            [ JSON.stringify(data, null, '  ') ],
            { type: 'application/json;charset=utf-8' }
        )

        this.anchor.download = name
        this.anchor.href = URL.createObjectURL(blob)
        this.anchor.click()
    }

    openFile() {
        this.fileinput.click()

        return new Promise(resolve =>
            this.resolver = resolve
        )
    }

    clickHandler() {
        document.body.onfocus = this.changeHandler
    }

    changeHandler() {
        document.body.onfocus = null
        this.resolver(this.fileinput.files)
    }
}

export const FileService = new File

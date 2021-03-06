class File {
    resolver = null
    // lastLoaded = null

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
            [ data ],
            { type: 'application/json;charset=utf-8' }
        )

        if (window.navigator && window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, name);
        }else{
            this.anchor.download = name
            this.anchor.href = URL.createObjectURL(blob)
            this.anchor.click()
        }
    }

    openFile() {
        this.fileinput.click()

        return (new Promise(resolve =>
                this.resolver = resolve
            )).then(result => {
                let file = result[0],
                    reader = new FileReader

                if (file == null) {
                    return null
                }

                return new Promise(resolve => {
                    reader.onload = ({ target: { result }}) => {
                        resolve(result)
                        this.fileinput.value = ''
                    }

                    reader.readAsText(file)
                })
                // .then(result => this.lastLoaded = result)
            })
    }

    clickHandler() {
        document.body.onfocus = this.changeHandler
    }

    changeHandler() {
        document.body.onfocus = null
        setTimeout(() => this.resolver(this.fileinput.files), 300)
    }
}

export const FileService = new File

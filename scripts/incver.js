import fs from 'fs'
import packageJson from '../package.json'

export function incver(cb) {
    let next = packageJson.version_name.split('.');

    if (isNaN(next[3])) {
        next[3] = 1;
    } else {
        next[3]++;
    }

    const version_name = next.join('.');
    const version = next.splice(0, 3).join('.');

    update('./package.json', 'version', version);
    update('./package.json', 'version_name', version_name);

    // update('./package-lock.json', 'version', version);

    update('./src/manifest.json', 'version', version_name);

    update('./src/misc.json', 'version', version_name);

    cb()
}

function update(filename, field, value) {
    const pattern = `"${field}"\\s*:\\s*"([^"]+)"`;
    const searchValue = new RegExp(pattern,"g");
    fs.writeFileSync(
        filename,
        String(fs.readFileSync(filename))
            .replace(searchValue, `"${field}": "${value}"`)
    )
}

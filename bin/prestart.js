let fs = require('fs');
let cmd = require('node-cmd');

const copy_directory = (dirname, copy_dir) => {
    if(!fs.existsSync(copy_dir)) {
        fs.mkdirSync(copy_dir);
    }
    let dirs = fs.readdirSync(dirname);
    for(let dir of dirs) {
        if(dir === 'LICENSE' || dir === 'Makefile'
            || dir.substr(dir.length - '.js'.length, '.js'.length) === '.js' || dir.substr(dir.length - '.json'.length, '.json'.length) === '.json'
            || dir.substr(dir.length - '.md'.length, '.md'.length) === '.md' || dir.substr(dir.length - '.yml'.length, '.yml'.length) === '.yml'
            || dir.substr(dir.length - '.npmignore'.length, '.npmignore'.length) === '.npmignore'
            || dir.substr(dir.length - '.js.map'.length, '.js.map'.length) === '.js.map'
            || dir.substr(dir.length - 'eslintrc'.length, 'eslintrc'.length) === 'eslintrc') {
            fs.copyFileSync(dirname + '/' + dir, copy_dir + '/' + dir);
        } else {
            fs.mkdirSync(copy_dir + '/' + dir);
            copy_directory(dirname + '/' + dir, copy_dir + '/' + dir);
        }
    }
};

const transpile_js_dir = (origin, destination, files = []) => {
    if(!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    }
    let dirs = fs.readdirSync(origin);
    for(let dir of dirs) {
        if(dir.substr(dir.length - '.js'.length, '.js'.length) === '.js'
            || dir.substr(dir.length - '.ts'.length, '.ts'.length) === '.ts') {
            let file = fs.readFileSync(origin + '/' + dir);
            files.push({
                origin_path: origin + '/' + dir,
                dest_path: destination + '/' + dir.replace('.ts', '.js'),
                content: file
            });
        } else {
            return transpile_js_dir(origin + '/' + dir, destination + '/' + dir, files);
        }
    }
    return files;
};

if(!fs.existsSync(__dirname + '/../public/javascripts/socket.io-client')) {
    copy_directory(__dirname + '/../node_modules/socket.io-client', __dirname + '/../public/javascripts/socket.io-client');
}

if(process.env.AUTO_TRANSPILE) {
    cmd.get('npm run build', (err, data, stdErr) => {
        if (err) {
            console.error(err);
        }
        console.log(data);
    });
}
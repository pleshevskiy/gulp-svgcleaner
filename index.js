const path = require('path');
const svgcleaner = require('node-svgcleaner');
const { Transform } = require('stream');

module.exports = options => {
    let stream = new Transform({ objectMode: true });

    stream._transform = (file, encoding, next) => {
        if (path.extname(file.path).toLowerCase() !== '.svg' || !file.contents.toString('utf8')) {
            return next(null, file);
        }

        if (file.isStream()) {
            return next(null, file);
        }

        if (file.isBuffer()) {
            try {
                let result = svgcleaner.clean(file.contents.toString('utf8'), options);
                file.contents = Buffer.from(result.content, 'utf8');
                next(null, file);
            } catch (err) {
                const colors = { yellow: '\x1b[33m', red: '\x1b[31m', reset: '\x1b[0m' };
                const filepath = path.relative(process.cwd(), file.path);
                const message = err.message || err;

                if (message) {
                    console.error(`${colors.yellow}gulp-svgcleaner:${colors.red}`, message.replace(
                        'Line:', `${colors.reset}File: ${filepath}\nLine:`
                    ).replace(/\n/g, `\n\t`).trim());
                }

                return next(null);
            }
        }
    };

    return stream;
};

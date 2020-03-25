var express = require('express');
var router = express.Router();
var fs = require('fs')
var multer = require('multer')
var upload = multer({
    dest: 'static/'
})
var path = require('path')
var Fontmin = require('fontmin');
var archiver = require('archiver');

function compress () {

    // 创建生成的压缩包路径
    var output = fs.createWriteStream('./static/webfont.zip');
    var archive = archiver('zip', {
        zlib: {
            level: 9
        } // 设置压缩等级
    });
    
    // 'close' 事件监听
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    
    // 'end' 事件监听
    output.on('end', function() {
        console.log('Data has been drained');
    });
    
    // 'warnings' 事件监听
    archive.on('warning', function(err) {
        if(err.code === 'ENOENT') {
            // 打印警告
        } else {
            // throw error
            throw err;
        }
    });
    
    // 'error' 事件监听
    archive.on('error', function(err) {
        throw err;
    });
    
    // pipe 方法
    archive.pipe(output);
    
    // 添加一个目录，且文件放在根目录
    archive.directory('./static/font/', false);
    
    //执行
    archive.finalize();
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: '字体文件最小化工具'
    });
});

router.get('/download/*', function (req, res) {
    console.log(req.url)
    let filePath = req.url.replace('/download', './static')

    fs.readFile(filePath, function (err, data) {
        if (err) {
            res.end("Read file failed!");
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件
            'Content-Disposition': 'attachment;', //告诉浏览器这是一个需要下载的文件
        });
        res.end(data)
    })
})

function handleFont(fontPath, text) {
    let srcPath = fontPath; // 字体源文件
    let destPath = 'static/font/'; // 输出路径

    // 初始化
    let fontmin = new Fontmin()
        .src(srcPath) // 输入配置
        .use(Fontmin.glyph({ // 字型提取插件
            text: text // 所需文字
        }))
        .use(Fontmin.ttf2eot()) // eot 转换插件
        .use(Fontmin.ttf2woff()) // woff 转换插件
        .use(Fontmin.ttf2svg()) // svg 转换插件
        .use(Fontmin.css()) // css 生成插件
        .dest(destPath); // 输出配置

    // 执行
    fontmin.run(function (err, files, stream) {

        if (err) { // 异常捕捉
            console.error(err);
        }
        console.log('done'); // 成功
        compress()
    });
}

function fileTypeValidate(file) {
    if (!file) {
        return false
    }
    let originalname = file.originalname
    let matchType = /\.(ttf|ttc)$/g.test(originalname)
    console.log(originalname, matchType)
    if (!matchType) {
        return false
    } else {
        return 1
    }
}

function fileSizeValidate(file) {
    if (!file) {
        return false
    }
    let size = file.size / 1000;
    if (size > 2048) {
        return false
    } else {
        return 1
    }
}

function deleteFile(files) {
    files = files || []
    files.forEach((item, index) => {
        fs.unlink(item.path, function (err) {
            if (err) {
                console.log(err)
            }
        })
    })
}

// 上传图片
router.post('/fontgenerate', upload.array('nss', 10), (req, res) => {
    let typeValidateResult = true
    let sizeValidateResult = true
    let fontPath = ''
    let files = req.files
    let text = req.query.text
    console.log(req.files, req.body, req.query)
    let urlList = []
    if (!files.length) {
        return res.json({
            code: 10001,
            msg: '请选择字体文件'
        })
    }
    files.forEach((item, index) => {
        if (!typeValidateResult || !sizeValidateResult) {
            return
        } else {
            typeValidateResult = fileTypeValidate(item)
            //   sizeValidateResult = fileSizeValidate(item)
        }
    })
    if (!typeValidateResult) {
        deleteFile(files)
        return res.json({
            code: 10001,
            msg: '文件类型不符合要求'
        })
    } else if (!sizeValidateResult) {
        deleteFile(files)
        return res.json({
            code: 10001,
            msg: '文件大小不符合要求'
        })
    } else {
        files.forEach((item, index) => {
            let reg = new RegExp(/\..+$/ig)
            let type = reg.exec(item.originalname)
            type = type ? type[0] : '.ttf'
            fs.renameSync(item.path, "static/font/webfont" + type)
            fontPath = 'static/font/webfont' + type
            // urlList.push({
            //     css: 'webfont.css',
            //     eot: 'webfont.eot',
            //     svg: 'webfont.svg',
            //     ttf: 'webfont.ttf',
            //     woff: 'webfont.woff',
            // })
            urlList.push({
                tar: 'webfont.zip'
            })
        })
        handleFont(fontPath, text)
        res.json({
            code: 10000,
            status: '上传成功',
            url_list: urlList
        })
    }
})

module.exports = router;
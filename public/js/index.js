function renderDownloadBtn(filesData) {
    // let list = ['css', 'eot', 'ttf', 'woff', 'svg']
    let list = ['tar']
    list.forEach(function (item) {
        $('.' + item + '-file')[0].href = '/download/' + filesData[item]
        $('.' + item + '-file')[0].innerHTML = filesData[item]
        $('.' + item + '-file').addClass("show")
    })
}

$(function () {
    var formData = new FormData()

    $('#file').change(function (e) {
        var file = $(e.target)[0]
        formData.append('nss', file.files[0])
        console.log(formData.getAll('nss'))
    })

    $('#upload-btn').click(function (e) {
        var text = $('.text textarea')[0].value
        $.ajax({
            type: "POST",
            url: '/fontgenerate?text=' + text,
            data: formData,
            processData: false,
            contentType: false,
        }).done(function (res) {
            if (res.code === 10001) {
                alert(res.msg)
            }

            if (res.code === 10000) {
                let data = res.url_list
                renderDownloadBtn(data[0])
            }

        }).fail(function (res) {
            alert('网络错误')
        })
    })
})
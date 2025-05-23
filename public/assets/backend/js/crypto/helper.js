function Base64Encode(v){
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(v));
}
function Base64Decode(v){
    return CryptoJS.enc.Base64.parse(v).toString(CryptoJS.enc.Utf8);
}
function AESEncrypt(data, key, iv) {//加密
    var key = CryptoJS.enc.Utf8.parse(key);
    var iv = CryptoJS.enc.Utf8.parse(iv);
    var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); //返回的是base64格式的密文
}
function AESDecrypt(encrypted, key, iv) {//解密
    var key = CryptoJS.enc.Utf8.parse(key);
    var iv = CryptoJS.enc.Utf8.parse(iv);
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function AESEncryptECB(data, key) {//加密
    var key = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.AES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); //返回的是base64格式的密文
}
function AESDecryptECB(encrypted, key) {//解密
    var key = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function DESEncrypt(data, key, iv) {//加密
    var key = CryptoJS.enc.Utf8.parse(key);
    var iv = CryptoJS.enc.Utf8.parse(iv);
    var encrypted = CryptoJS.DES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); //返回的是base64格式的密文
}
function DESDecrypt(encrypted, key, iv) {//解密
    var key = CryptoJS.enc.Utf8.parse(key);
    var iv = CryptoJS.enc.Utf8.parse(iv);
    var decrypted = CryptoJS.DES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function DESEncryptECB(data, key) {//加密
    var key = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); //返回的是base64格式的密文
}
function DESDecryptECB(encrypted, key) {//解密
    var key = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt(encrypted, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function SHA256(data) {
    var encrypted = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    return encrypted;
}
function MD5(data) {
    var encrypted = CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);
    return encrypted;
}
function SHA1(data) {
    var encrypted = CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex);
    return encrypted;
}
function SM2Encrypt(data,publicKey,cipherMode) {
    if(cipherMode==null) cipherMode='1';
    return SM2Utils.encs(publicKey,data,cipherMode)
}
function encryptFormPassword(formElem) {
    var data = $(formElem).serializeArray();
    var pwdn = $(formElem).find('input[type="password"]').length;
    var pwdi = 0, secret = $(formElem).attr('data-secret');
    if (!secret) return data;
    var parts = secret.split(':',2);
    secret = parts[0];
    for (var i = 0; i < data.length; i++) {
        var v = data[i];
        if ($(formElem).find('input[name="' + v.name + '"][type="password"]').length > 0) {
            if (v.value != '') {
                var pass=v.value;
                if(parts.length==2) pass=JSON.stringify({p:pass,e:parts[1],t:(new Date).getTime()});
                data[i].value = SM2Encrypt(pass, secret);
            }
            pwdi++;
            if (pwdi >= pwdn) break;
        }
    }
    return data;
}
function submitEncryptedData(formElem, onSubmitting, onSubmitted) {
    $(formElem).on('submit', function (e) {
        e.preventDefault();
        var subtn = $(this).find(':submit');
        if(subtn.children('fa-refresh').length>0) return;
        var data = encryptFormPassword(this);
        if (onSubmitting) data = onSubmitting(this, data);
        subtn.prepend('<i class="fa fa-refresh fa-spin"></i>');
        subtn.prop('disabled',true);
        var end = function(){
            subtn.children('.fa-refresh').remove();
            subtn.prop('disabled',false);
        };
        $.post($(this).attr('action'), data, function (r) {
            end();
            if (r.Code == 1) {
                if (onSubmitted) return onSubmitted(r);
                if (r.URL) {
                    if(r.Info){
                        App.message({ title: App.i18n.SYS_INFO, text: r.Info, class_name: 'success' });
                        window.setTimeout(function(){
                            window.location = r.URL;
                        },2000);
                        return;
                    }
                    window.location = r.URL;
                } else {
                    App.message({ title: App.i18n.SYS_INFO, text: r.Info ? r.Info : App.i18n.SUCCESS, class_name: 'success' });
                }
            } else {
                App.captchaUpdate($(formElem), r);
                App.message({ title: App.i18n.SYS_INFO, text: r.Info ? r.Info : App.i18n.FAILURE, class_name: 'danger' });
                $(formElem).trigger('submiterror');
            }
        }, 'json').error(function(xhr,statusText,err){
            end();
            if(!err)err=App.t('网站不可用，请刷新页面后重试');
            App.message({text: err, type: 'error'});
            $(formElem).trigger('submiterror');
        });
    });
}
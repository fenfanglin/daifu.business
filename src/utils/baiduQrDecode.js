import request from '@/utils/request'
import axios from 'axios'

/**
 * @description: 文件附件上传
 * file： 文件raw对象
 * successCallback： 成功的回调函数
 * errCallBack： 错误的回调函数
 */
const decode = function(file, successCallback = new Function(), errCallBack = new Function()) {
	request({
		url: "index/get_token",
	}).then(res => {
		if (!res) {
			errCallBack('access_token ERROR')
		}
		
		let url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/qrcode?access_token=' + res
		
		let form = new FormData()
		
		form.append('image', file)
		
		axios({
			url: url,
			method: 'POST',
			data: form,
			processData: false,
			cache: false,
			contentType: false,
		})
		.then((res2) => {
			console.log('decode res2', res2)
			let data = res2.data
			if (data['codes_result'] != undefined && data['codes_result'][0] != undefined && data['codes_result'][0]['type'] != undefined && data['codes_result'][0]['type'] == 'QR_CODE') {
				successCallback(`${data['codes_result'][0]['text'][0]}`)
			} else {
				errCallBack(`${data['error_msg']} 1`)
			}
		})
		.catch(err => {
			errCallBack(err + '2')
		})
	})
	.catch(err => {
		errCallBack(err + '3')
	})
}
export default decode
import request from '@/utils/request'
import axios from 'axios'

/**
 * @description: 文件附件上传
 * file： 文件raw对象
 * successCallback： 成功的回调函数
 * errCallBack： 错误的回调函数
 * progressCallback： 上传进度的回调函数
 * dir: 上传阿里云目标文件夹 eg:图片image，视频video等
 */
const upload = function(file, successCallback = new Function(), errCallBack = new Function()) {
	let fileName = file.name
	let type = file.name.split('.')[1]

	request({
		url: "index/get_sign",
	}).then(res => {
		let obj = res.data

		let config = {}
		config.host = obj['host']
		config.policyBase64 = obj['policy']
		config.accessid = obj['accessid']
		config.signature = obj['signature']
		config.expire = parseInt(obj['expire'])
		config.callbackbody = obj['callback']
		config.dir = obj['dir']

		let form = new FormData(),
			key = config.dir + '.' + type
		form.append('key', key)
		form.append('x-oss-object-acl', 'public-read')
		form.append('x-oss-meta-fullname', fileName)
		form.append('OSSAccessKeyId', config.accessid)
		form.append('policy', config.policyBase64)
		form.append('signature', config.signature)
		form.append('success_action_status', '200')
		form.append('file', file.raw)
		if (config.host.indexOf('http:') > -1) {
			var protocol = formcation.protocol || 'http:'
			var subUrl = config.host.substring(5, config.host.length)
			config.host = protocol + subUrl
		}

		// 数据组装完成后，发送上传请求到阿里云oss
		axios({
			url: config.host,
			method: 'POST',
			data: form,
			processData: false,
			cache: false,
			contentType: false,
			// // 这里，我们可以做上传经度
			// onUploadProgress: function(progressEvent) {
			// 	if (progressEvent.lengthComputable) {
			// 		let percent = (progressEvent.loaded / progressEvent.total) * 100 || 0
			// 		progressCallback({
			// 			percent: percent
			// 		})
			// 	}
			// }
		})
		.then(() => {
			// // 拿到结果后，做其他操作
			// let size = file.size > 1000000 ? parseFloat(file.size / 1000000).toFixed(2) + 'M' : parseFloat(file.size / 1000).toFixed(2) + 'KB'
			// successCallback({
			// 	attachment: fileName,
			// 	aliyunAddress: key,
			// 	size: size,
			// 	host: config.host
			// })

			successCallback(`${config.host}/${key}`)
		})
		.catch(err => {
			errCallBack(err)
		})
	})
	.catch(err => {
		errCallBack(err)
	})

	// axios({
	// 	method: 'get',
	// 	url: basePath + '/aliyun/get', // 请求签名接口，找后台要
	// 	params: {
	// 	dir: dir // 'image' // 这里的参数，对应的就是上传到那个文件夹下面，找后台要
	// 	}
	// })
	// .then(res => {
	// 	// 拿到签名信息后，组装表单数据，作参考，具体的字段找后台要
	// 	let obj = res.data.data
	// 	let config = {}
	// 	config.host = obj['host']
	// 	config.policyBase64 = obj['policy']
	// 	config.accessid = obj['accessId']
	// 	config.signature = obj['signature']
	// 	config.expire = parseInt(obj['expire'])
	// 	config.callbackbody = obj['callback']
	// 	config.dir = obj['dir']
	// 	let fd = new FormData(),
	// 		uuid = uuidv4(),
	// 		key = config.dir + uuid
	// 	fd.append('key', key)
	// 	fd.append('success_action_status', '200')
	// 	fd.append('x-oss-object-acl', 'public-read')
	// 	fd.append('x-oss-meta-fullname', fileName)
	// 	fd.append('OSSAccessKeyId', config.accessid)
	// 	fd.append('policy', config.policyBase64)
	// 	fd.append('signature', config.signature)
	// 	fd.append('success_action_status', '200')
	// 	fd.append('file', file)
	// 	if (config.host.indexOf('http:') > -1) {
	// 		var protocol = window.location.protocol || 'http:'
	// 		var subUrl = config.host.substring(5, config.host.length)
	// 		config.host = protocol + subUrl
	// 	}
	// 	// 数据组装完成后，发送上传请求到阿里云oss
	// 	axios({
	// 		url: config.host,
	// 		method: 'POST',
	// 		data: fd,
	// 		processData: false,
	// 		cache: false,
	// 		contentType: false,
	// 		// 这里，我们可以做上传经度
	// 		onUploadProgress: function(progressEvent) {
	// 			if (progressEvent.lengthComputable) {
	// 				let percent = (progressEvent.loaded / progressEvent.total) * 100 || 0
	// 				progressCallback({
	// 					percent: percent
	// 				})
	// 			}
	// 		}
	// 	})
	// 	.then(() => {
	// 		// 拿到结果后，做其他操作
	// 		let size = file.size > 1000000 ? parseFloat(file.size / 1000000).toFixed(2) + 'M' : parseFloat(file.size / 1000).toFixed(2) + 'KB'
	// 		successCallback({
	// 			attachment: fileName,
	// 			aliyunAddress: key,
	// 			size: size,
	// 			host: config.host
	// 		})
	// 	})
	// 	.catch(err => {
	// 		errCallBack(err)
	// 	})
	// })
	// .catch(err => {
	// 	errCallBack(err)
	// })
}
export default upload

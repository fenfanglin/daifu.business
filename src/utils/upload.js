import COS from 'cos-js-sdk-v5'

export default function upload(file, callback) {
	
	// const SecretId = 'AKIDrfDVXKr89uPghTzFFzThfMo0wc1A3g29'
	// const SecretKey = 'vc3E9oDNGtGNEpAE3cvrYyA6pJWT9alg'
	// const Bucket = 'szs-1304183976'
	// const Region = 'ap-guangzhou'
	
	const SecretId = 'AKID8IPexDdxKcn5Qj1SqAPME2lWl1A8tPnq'
	const SecretKey = 'we0FQPbcPwCE7nFVWHmRuCKI3cz8B3iE'
	const Bucket = 'futian-1314923728'
	const Region = 'ap-guangzhou'
	
	const cos = new COS({
		SecretId: SecretId, // 身份识别ID
		SecretKey: SecretKey // 身份秘钥
	})
	
	let d = new Date()
	const currentTime = d.format('yyyy/MM/ddhhmmss_') + Math.random()
	const type = file.name.split('.')[1]
	const fileName = `${currentTime}.${type}`
	
	cos.putObject({
		Bucket: Bucket, /* 存储桶 */
		Region: Region, /* 存储桶所在地域，必须字段 */
		Key: fileName, /* 文件名 */
		StorageClass: 'STANDARD', // 上传模式, 标准模式
		Body: file.raw, // 上传文件对象
		onProgress: (progressData) => { // 上传进度
			console.log(JSON.stringify(progressData))
		}
	}, (err, data) => {
		// console.log(err || data)
		callback(`https://${data.Location}`)
	})
}
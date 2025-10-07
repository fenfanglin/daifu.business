<template>
	<div class="app-container" style="min-height: 700px;">
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5" class="text-danger">
				图片名称、收款码不能重复
			</el-col>
		</el-row>
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-upload
					action="#"
					ref="upload"
					accept=".jpg,.jpeg,.png,.gif"
					:auto-upload="false"
					list-type="picture-card"
					:show-file-list="false"
					:file-list="list"
					multiple
					
					:on-change="handleChange"
					class="import_img"
				>
					<el-button
					type="primary"
					>选择收款码</el-button>
				</el-upload>
			</el-col>
			<el-col :span="1.5">
				<el-button type="primary" @click="handleChangeAmount">批量更新金额</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="warning" @click="submitForm">确定添加</el-button>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="图片名称" prop="account" />
			<el-table-column label="收款码" width="150">
				<template slot-scope="scope">
					<el-image :src="scope.row.url" class="qrcode_image" :preview-src-list="[scope.row.url]" lazy></el-image>
				</template>
			</el-table-column>
			<el-table-column label="金额" width="150">
				<template slot-scope="scope">
					<el-input-number v-model="scope.row.amount" :controls="false" class="w120px text-left" />
				</template>
			</el-table-column>
			<el-table-column label="操作" width="150" fixed="right">
				<template slot-scope="scope">
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="delItem(scope.$index)" v-hasPermi="['channel_product:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 添加或编辑对话框 -->
		<el-dialog title="批量更新金额" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px" @submit.native="changeAmount" @submit.native.prevent>
				<el-row>
					<el-form-item label="金额">
						<el-input-number v-model="form.amount" :controls="false" class="w210px text-left" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="changeAmount">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import decode from "@/utils/baiduQrDecode";

export default {
	props: {
		dataNo: {
			type: String,
			default: ''
		},
		// open: {
		// 	type: Boolean
		// },
		// cancel: {
		// 	type: Function
		// }
	},
	data() {
		return {
			user: {},
			// 遮罩层
			loading: false,
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			// 弹出层标题
			title: "",
			// 是否显示弹出层
			open: false,
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				keyword: "",
				type: "",
				status: "",
				create_time: [],
			},
			// 表单参数
			form: {},
			
			// 表单校验
			rules: {
				name: [
					{ required: true, message: "代理名称不能为空", trigger: "blur" }
				],
				phone: [
					{
						required: true,
						pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
						message: "请输入正确的电话号码",
						trigger: "blur",
					}
				],
				email: [
					{
						type: "email",
						message: "请输入正确的邮箱地址",
						trigger: ["blur", "change"],
					}
				],
			},
		}
	},
	computed: {
		modelStatus2() {
			return this.$store.getters.modelStatus2
		},
	},
	created() {
		let that = this
	},
	methods: {
		// 取消按钮
		cancel() {
			this.open = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				name: undefined,
				account: undefined,
				qrcode: undefined,
				amount: 0,
				status: 1,
			};
			this.resetForm("form");
		},
		/** 新增按钮操作 */
		handleChangeAmount() {
			this.reset();
			this.open = true;
			this.title = "添加";
		},
		changeAmount() {
			let that = this
			
			if (!that.form.amount || that.form.amount <= 0) {
				that.$message.error('金额不正确！');
				return false
			}
			
			let list_length = that.list.length
			
			for (let i = 0; i < list_length; i++) {
				that.list[i]['amount'] = that.form.amount
			}
			
			that.open = false
		},
		/** 提交按钮 */
		submitForm: function() {
			let that = this
			
			that.request({
				url: "channel_product/import3_2",
				data: {
					channel_account_no: that.dataNo,
					data: that.list,
				},
			}).then(res => {
				that.$modal.msgSuccess("添加成功");
				
				that.$emit('closeImport', false)
			});
			
			
		},
		delItem(index) {
			this.list.splice(index, 1)
		},
		handleChange(file, fileList) {
			let that = this;
			
			// let name = file.name.split('.')[0]
			// let order_no = ''
			
			// if (name.indexOf("-") > -1) {
			// 	// SM001-3563099353186391464.jpg, 3563099353186391464.jpg
			// 	order_no = name.split('-')[1]
			// } else if (name.indexOf("+") > -1) {
			// 	// 3563099353186391464+SM001.jpg, 3563099353186391464.jpg
			// 	order_no = name.split('+')[0]
			// } else {
			// 	order_no = name
			// }
			
			let order_no = file.name.split('.')[0]
			
			console.log('handleChange file', file)
			// console.log('file.name', file.name)
			// console.log('file.raw.type', file.raw.type)
			// console.log('handleChange fileList', fileList)
			
			// const result = that.qrDecode(file)
			const result = that.QrDecodeUrl(file.url)
			
			result.then(res => {
				if (res.data) {
					// console.log("QrDecodeUrl", res);
					
					// that.form.account = res.data
					
					that.list.push({
						id: that.list.length + 1,
						url: file.url,
						account: order_no,
						qrcode: res.data,
						amount: 0,
					})
					
				} else {
					console.log("error1", res);
					// that.$message.error("识别二维码失败, 请重新上传1")
					
					// that.qrcode_decode(file, file.url, order_no)
					that.qrcode_decode2(file, file.url, order_no)
				}
			})
			.catch(err => {
				console.log("error2", JSON.stringify(err));
				// that.$message.error("识别二维码失败, 请重新上传2")
				
				// that.qrcode_decode(file, file.url, order_no)
				that.qrcode_decode2(file, file.url, order_no)
			});
			
			
		},
		qrcode_decode2(file, file_url, order_no) {
			let that = this;
			
			that.$modal.loading("正在上传图片，请稍候...");
			
			let form = new FormData()
			form.append('file', file.raw)
			
			that.request({
				url: "upload/qr_decode",
				data: form,
			}).then(res => {
				console.log("qrcode_decode2 res", res);
				that.list.push({
					id: that.list.length + 1,
					url: file_url,
					account: order_no,
					qrcode: res,
					amount: 0,
				})
				that.$modal.closeLoading();
			})
			.catch(err => {
				that.$modal.closeLoading();
				that.$message.error("识别二维码失败, 请重新上传4")
				console.log("error4", err);
			});
		},
		qrcode_decode(file, file_url, order_no) {
			let that = this;
			
			that.$modal.loading("正在上传图片，请稍候...");
			
			that.getBase64(file.raw).then(resBase64 => {
				decode(resBase64, content => {
					
					that.list.push({
						id: that.list.length + 1,
						url: file_url,
						account: order_no,
						qrcode: content,
						amount: 0,
					})
					that.$modal.closeLoading();
				},
				error => {
					that.$modal.closeLoading();
					that.$message.error("识别二维码失败, 请重新上传2")
					console.log("error3", error);
				})
			})
		},
		getBase64(file) {
			return new Promise((resolve, reject) => {
				let reader = new FileReader();
				let fileResult = "";
				reader.readAsDataURL(file);
				//开始转
				reader.onload = function () {
					fileResult = reader.result;
				};
				//转 失败
				reader.onerror = function (error) {
					reject(error);
				};
				//转 结束  咱就 resolve 出去
				reader.onloadend = function () {
					resolve(fileResult);
				};
			});
		}
	}
};
</script>
<style scoped lang="scss">
.qrcode_image {
	width: 50px;
}
</style>

<style>
.import_img .el-upload--picture-card {
	background-color: unset;
	border: 0;
	border-radius: 0;
	width: auto;
	height: 0;
	line-height: 0;
}
</style>
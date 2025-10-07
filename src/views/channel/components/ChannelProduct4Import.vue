<template>
	<div class="app-container" style="min-height: 700px;">
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5" class="text-danger">
				商品ID、商品名称不能重复
			</el-col>
		</el-row>
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-upload
					action=""
					accept=".xls,.xlsx"
					:show-file-list="false"
					:http-request="resolveUpload"
				>
					<el-button
					type="primary"
					>导入商品</el-button>
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
			<el-table-column label="商品ID" prop="id" width="150" />
			<el-table-column label="商品名称" prop="name" />
			<el-table-column label="金额" width="150">
				<template slot-scope="scope">
					<el-input-number v-model="scope.row.amount" :controls="false" class="w120px text-left" />
				</template>
			</el-table-column>
			<el-table-column label="操作" width="100" fixed="right">
				<template slot-scope="scope">
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="delItem(scope.$index)" v-hasPermi="['channel_product:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 添加或编辑对话框 -->
		<el-dialog title="批量更新金额" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
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
				url: "channel_product/import4",
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
		resolveUpload(event) {
			let that = this;
			
			// console.log('event', event)
			
			if(!/\.(xls|xlsx)$/.test(event.file.name.toLowerCase())) {
				that.$message.error('上传格式不正确，请上传xls或者xlsx格式');
				return;
			}
			
			const fileReader = new FileReader();
			fileReader.onload = (ev) => {
				try {
					const data = ev.target.result;
					const workbook = that.xlsxRead(data, {
						type: 'binary'
					});
					// 取第一张表
					const wsname = workbook.SheetNames[0];
					// 生成json表格内容
					const ws = that.xlsxUtils.sheet_to_json(workbook.Sheets[wsname]);
					console.log('ws', ws);
					// 后续为自己对ws数据的处理
					
					let _list = []
					let ws_len = ws.length
					
					for (let i = 1; i < ws_len; i++) {
						_list.push({
							id: ws[i]['商品信息'],
							name: ws[i]['__EMPTY'],
							amount: 0,
						})
					}
					
					that.list = _list
					
				} catch (e) {
					return false;
				}
			};
			fileReader.readAsBinaryString(event.file);
		},
	}
};
</script>
<style scoped lang="scss">
.qrcode_image {
	width: 50px;
}
</style>
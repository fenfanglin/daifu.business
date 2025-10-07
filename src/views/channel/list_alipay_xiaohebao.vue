<template>
	<div v-if="check_channel == false" class="app-container">
		<div class="page-message">
			<h2>{{channel_error}}</h2>
			<p>
				请联系后台管理员开启通道
			</p>
		</div>
	</div>
	<div v-else class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="名称/账号" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.card_business_id" placeholder="卡商" clearable>
					<el-option v-for="item in optionCardBusiness" :key="item.id" :label="item.name" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in modelStatus2" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<!-- <el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="更新时间开始"
					end-placeholder="更新时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item> -->
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
				<el-dropdown split-button :type="auto_reload.class" class="ml10" @command="(command) => handleAutoReloadChange(command)">
					{{auto_reload.text}}
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="0">关闭刷新</el-dropdown-item>
						<!-- <el-dropdown-item command="2">开启2秒刷新</el-dropdown-item> -->
						<!-- <el-dropdown-item command="5">开启5秒刷新</el-dropdown-item> -->
						<el-dropdown-item command="10">开启10秒刷新</el-dropdown-item>
						<el-dropdown-item command="30">开启30秒刷新</el-dropdown-item>
						<el-dropdown-item command="60">开启60秒刷新</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['channel_alipay_xiaohebao:save:add']">新增</el-button>
			</el-col>
			<!-- <el-col :span="1.5">
				<el-button type="danger" icon="el-icon-delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['channel_alipay_xiaohebao:delete']">删除</el-button>
			</el-col> -->
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-download" @click="handleExport" v-hasPermi="['channel_alipay_xiaohebao:export']">导出</el-button>
			</el-col>
		</el-row>
		
		<el-row :gutter="10" class="mb20">
			<el-col :span="1.5">
				<a href="https://jqkstore.oss-cn-hongkong.aliyuncs.com/document/alipay_xiaohebao.zip" class="download_document">
					下载教程
				</a>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" @selection-change="handleSelectionChange">
			<!-- <el-table-column type="selection" width="40" /> -->
			<!-- <el-table-column label="序号" type="index" :index="indexMethod" min-width="60" /> -->
			<el-table-column label="卡商" prop="card_business_realname" :show-overflow-tooltip="true" width="80" />
			<el-table-column label="支付宝信息" :show-overflow-tooltip="true" width="200">
				<template slot-scope="scope">
					<span>名称：{{scope.row.name}}</span><br>
					<span>UID：{{scope.row.account}}</span>
				</template>
			</el-table-column>
			<el-table-column label="单笔控制" width="100">
				<template slot-scope="scope">
					<span>{{scope.row.min_amount}} - {{scope.row.max_amount}}</span>
				</template>
			</el-table-column>
			<el-table-column label="设置监控" :show-overflow-tooltip="true" width="120">
				<template slot-scope="scope">
					<span>额度：
						<span v-if="scope.row.check_quota == 1">{{scope.row.quota}}</span>
						<span v-else class="text-danger">关闭</span>
					</span><br>
					<span>笔数：
						<span v-if="scope.row.check_quota_num == 1">{{scope.row.quota_num}}</span>
						<span v-else class="text-danger">关闭</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="账号余额" width="100">
				<template slot-scope="scope">
					<span v-if="scope.row.balance >= user.remark_when_balance_over" class="text-danger">{{scope.row.balance}}</span>
					<span v-else>{{scope.row.balance}}</span>
				</template>
			</el-table-column>
			<el-table-column label="订单统计" :show-overflow-tooltip="true" width="300">
				<template slot-scope="scope">
					<span>今日：{{scope.row.today_success_amount}}元，{{scope.row.today_success_order}}/{{scope.row.today_total_order}}笔，{{scope.row.today_success_rate}}%</span><br>
					<span>昨日：{{scope.row.yesterday_success_amount}}元，{{scope.row.yesterday_success_order}}/{{scope.row.yesterday_total_order}}笔，{{scope.row.yesterday_success_rate}}%</span>
				</template>
			</el-table-column>
			<el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" />
			<el-table-column label="最后在线时间" prop="last_online_time" width="170" />
			<el-table-column label="在线状态" width="80">
				<template slot-scope="scope">
					<span :class="scope.row.is_online_class">{{scope.row.is_online_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="启用状态" width="80">
				<template slot-scope="scope">
					<el-switch v-model="scope.row.status" active-value="1" inactive-value="-1" @change="handleStatusChange(scope.row)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="330" fixed="right">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-edit" @click="handleEdit(scope.row)" v-hasPermi="['channel_alipay_xiaohebao:save:edit']" plain>编辑</el-button>
					<el-button type="primary" :disabled="scope.row.is_online == 1" class="tb-button" icon="el-icon-setting" @click="handleEditInfo(scope.row)" v-hasPermi="['channel_alipay_xiaohebao:save_info:edit']" plain>设置</el-button>
					<el-button type="primary" :disabled="scope.row.is_online == 1" class="tb-button" icon="el-icon-setting" @click="handleLogin(scope.row)" v-hasPermi="['alipay:getqrcode']" plain>登陆</el-button>
					<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['channel_alipay_xiaohebao:delete']" plain>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination
			v-show="total>0"
			:total="total"
			:page.sync="queryParams.page"
			:limit.sync="queryParams.limit"
			@pagination="getList"
		/>

		<!-- 添加或编辑对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" :rules="rules" label-width="100px">
				<el-row>
					<el-form-item v-if="user.type == 1 || user.type == 3" label="卡商">
						<el-select v-model="form.card_business_id">
							<el-option v-for="item in optionCardBusiness" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="账号名称">
						<el-input v-model="form.name" maxlength="50" show-word-limit autocomplete="off" />
					</el-form-item>
					<el-form-item label="UID">
						<el-input v-model="form.account" maxlength="50" show-word-limit autocomplete="off" disabled />
					</el-form-item>
					<el-form-item label="小荷包收款码">
						<el-input v-model="form.qrcode" autocomplete="off" :readonly="true" />
					</el-form-item>
					<el-form-item label="">
						<el-upload
							action=""
							:show-file-list="false"
							:http-request="resolveQR"
						>
							<el-button
							type="success"
							>上传收款码</el-button>
						</el-upload>
					</el-form-item>
					<el-form-item label="单笔控制">
						<el-input-number v-model="form.min_amount" :controls="false" class="w210px text-left" />
						<el-input-number v-model="form.max_amount" :controls="false" class="w210px text-left ml10" />
					</el-form-item>
					<el-form-item label="监控额度">
						<el-radio-group v-model="form.check_quota">
							<el-radio v-for="item in modelStatus2" :label="item.value" :disabled="user.type == 2">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="剩余额度">
						<el-input-number v-model="form.quota" :controls="false" class="w210px text-left" :disabled="user.type == 2" />
					</el-form-item>
					<el-form-item label="监控笔数">
						<el-radio-group v-model="form.check_quota_num">
							<el-radio v-for="item in modelStatus2" :label="item.value" :disabled="user.type == 2">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="剩余笔数">
						<el-input-number v-model="form.quota_num" :controls="false" class="w210px text-left" :disabled="user.type == 2" />
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="form.remark" maxlength="50" show-word-limit autocomplete="off" :disabled="user.type == 2" />
					</el-form-item>
					<el-form-item label="状态">
						<el-radio-group v-model="form.status">
							<el-radio v-for="item in modelStatus2" :label="item.value">{{item.label}}</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-if="form.is_auth_when_edit_account" label="谷歌验证码">
						<el-input v-model="form.google_code" autocomplete="off" class="w210px" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		
		<el-dialog title="设置" :visible.sync="open_info" width="600px" append-to-body :close-on-click-modal="false">
			<el-form ref="form_info" :model="form_info" :rules="rules_info" label-width="100px">
				<el-row>
					<el-form-item label="账号名称">
						{{form_info.name}}
					</el-form-item>
					<el-form-item label="UID">
						{{form_info.account}}
					</el-form-item>
					<el-form-item label="支付宝密钥">
						<el-input type="textarea" v-model="form_info.code" :rows="10" resize="none" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitFormInfo">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		
		<el-dialog title="登录" :visible.sync="open_login" width="400px" append-to-body :close-on-click-modal="false" :show-close="false">
			<div class="login">
				<div class="title">
					名称: {{form_login.name}}
				</div>
				<div class="qrcode">
					<img v-if="qrcode" :src="qrcode">
				</div>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "channel_list_alipay_xiaohebao", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
			channel_id: 106,
			check_channel: true,
			channel_error: '',
			// 遮罩层
			loading: true,
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
			open_info: false,
			open_login: false,
			
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
			form_info: {
				info: {},
			},
			form_login: {},
			loginid: '',
			qrcode: '',
			interval_login: {},
			
			optionCardBusiness: [],
			
			auto_reload: {},
			interval: {},
			
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
			rules_info: {
				// referer: [
				// 	{ required: true, message: "Referer不能为空", trigger: "blur" }
				// ],
				// user_agent: [
				// 	{ required: true, message: "User-Agent不能为空", trigger: "blur" }
				// ],
				// cookie: [
				// 	{ required: true, message: "Cookie不能为空", trigger: "blur" }
				// ],
				code: [
					{ required: true, message: "监听密钥不能为空", trigger: "blur" }
				],
			},
		}
	},
	computed: {
		modelStatus2() {
			return this.$store.getters.modelStatus2
		},
		channelType() {
			return this.$store.getters.channelType
		},
	},
	created() {
		let that = this
		
		that.request({
			url: "user/check_channel",
			data: {channel_id: that.channel_id},
		}).then(res => {
			if (res.data.status != 1) {
				that.check_channel = false
				that.channel_error = res.data.msg
			} else {
				that.check_channel = true
				that.getUserInfo();
				that.getList();
				that.getOptionCardBusiness();
				that.autoReload();
			}
		});
	},
	beforeDestroy() {
		clearInterval(this.interval)
		clearInterval(this.interval_login)
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
		},
		indexMethod(index) {
			return index + this.queryParams.limit * (this.queryParams.page - 1) + 1
		},
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "channel_alipay_xiaohebao/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.loading = false;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
			this.open_info = false;
			this.open_login = false;
			this.reset();
			
			clearInterval(this.interval_login)
		},
		// 表单重置
		reset() {
			this.form = {
				business_id: undefined,
				name: undefined,
				account: undefined,
				qrcode: undefined,
				min_amount: 0,
				max_amount: 999999,
				check_quota: -1,
				check_quota_num: -1,
				status: 1,
			};
			this.form_info = {
				info: {
					referer: undefined,
					user_agent: undefined,
					cookie: undefined,
				},
			};
			
			this.loginid = '';
			this.qrcode = '';
			
			this.resetForm("form");
			this.resetForm("form_info");
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.page = 1;
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.queryParams = {
				page: 1,
				limit: this.queryParams.limit,
				keyword: "",
				status: "",
				create_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.no)
			this.single = selection.length != 1
			this.multiple = !selection.length
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset();
			this.open = true;
			this.title = "添加";
			this.form.is_auth_when_edit_account = this.user.is_auth_when_edit_account
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			let that = this
			
			// 重新加载卡商
			this.getOptionCardBusiness();
			
			that.reset();
			that.request({
				url: "channel_alipay_xiaohebao/view",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form = res.data;
				that.open = true;
				that.title = "编辑";
			});
		},
		handleEditInfo(row) {
			let that = this
			
			that.reset();
			that.request({
				url: "channel_alipay_xiaohebao/view_info",
				data: {
					no: row.no,
				},
			}).then(res => {
				that.form_info = res.data;
				// console.log(res.data)
				that.open_info = true;
			});
		},
		handleLogin(row) {
			let that = this
			
			that.form_login = row
			that.open_login = true;
			
			that.reset();
			that.request({
				url: "alipay/getqrcode",
			}).then(res => {
				that.loginid = res.data.loginid;
				that.qrcode = res.data.qrcodeurl;
				// console.log(res.data)
				
				clearInterval(that.interval_login)
				
				that.interval_login = setInterval(function() {
					
					that.request({
						url: "alipay/getcookie",
						data: {
							account_id: row.id,
							loginid: that.loginid,
						},
					}).then(res2 => {
						if (res2.data.status !== undefined && res2.data.status == 'SUCCESS') {
							that.$modal.msgSuccess("登录成功");
							
							that.open_login = false;
							that.getList();
							clearInterval(that.interval_login)
						} else if (res2.data.status !== undefined && res2.data.status == 'DUPPLICATE_UID') {
							that.$message.error("账号已重复");
							
							that.open_login = false;
							that.getList();
							clearInterval(that.interval_login)
						} else if (res2.data.status !== undefined && res2.data.status == 'UID_ERROR') {
							that.$message.error(res2.data);
							
							that.open_login = false;
							that.getList();
							clearInterval(that.interval_login)
						}
					})
				}, 2000)
			});
		},
		/** 提交按钮 */
		submitForm: function() {
			let that = this
			
			that.$refs["form"].validate(valid => {
				if (valid) {
					that.request({
						url: "channel_alipay_xiaohebao/save",
						data: that.form,
					}).then(res => {
						that.open = false;
						that.getList();
						
						if (that.form.id != undefined) {
							that.$modal.msgSuccess("编辑成功");
						} else {
							that.$modal.msgSuccess("新增成功");
						}
					});
				}
			});
		},
		submitFormInfo: function() {
			let that = this
			
			that.$refs["form_info"].validate(valid => {
				if (valid) {
					that.loadingShow();
					that.request({
						url: "channel_alipay_xiaohebao/save_info",
						data: that.form_info,
					}).then(res => {
						that.loadingClose();
						that.open_info = false;
						that.getList();
						that.$modal.msgSuccess("设置成功");
					}).catch(() => {
						that.loadingClose();
					});
				}
			});
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			let that = this;
			
			const ids = row.no || this.ids;
			
			that.$confirm("是否确认删除?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "channel_alipay_xiaohebao/delete",
					data: {
						ids,
					},
				}).then(res => {
					that.$modal.msgSuccess("删除成功");
					that.getList();
				});
			}).catch(() => {
				
			})
		},
		/** 状态编辑按钮 */
		handleStatusChange(row) {
			switch (row.status) {
				case "1":
					this.enable(row);
					break;
				case "-1":
					this.disable(row);
					break;
				default:
					break;
			}
		},
		/** 更多操作触发 */
		handleCommand(command, row) {
			switch (command) {
				case "enable":
					this.enable(row);
					break;
				case "disable":
					this.disable(row);
					break;
				default:
					break;
			}
		},
		/** 开启 */
		enable(row) {
			let that = this;
			
			that.$confirm("是否确认开启此数据?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.loadingShow();
				that.request({
					url: "channel_alipay_xiaohebao/enable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.loadingClose();
					that.$modal.msgSuccess("开启成功");
					that.getList();
				}).catch(() => {
					that.loadingClose();
					row.status = "-1";
				})
			}).catch(() => {
				row.status = "-1";
			})
		},
		/** 关闭 */
		disable(row) {
			let that = this;
			
			that.$confirm("是否确认关闭此数据?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}).then(function() {
				that.request({
					url: "channel_alipay_xiaohebao/disable",
					data: {
						no: row.no,
					},
				}).then(res => {
					that.$modal.msgSuccess("关闭成功");
					that.getList();
				}).catch(() => {
					row.status = "1";
				})
			}).catch(() => {
				row.status = "1";
			})
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("channel_alipay_xiaohebao/export", this.queryParams, "管理员").then(res => {
				
			});
		},
		getOptionCardBusiness() {
			let that = this;
			
			that.request({
				url: "option/card_business",
				data: {},
			}).then(res => {
				that.optionCardBusiness = res.data
			});
		},
		resolveQR(event) {
			let that = this;
			
			// console.log('resolveQR event.file', event.file)
			
			const result = that.qrDecode(event.file)
			result.then(res => {
				if (res.data) {
					console.log(res.data);
					that.form.qrcode = res.data
					console.log('that.form', that.form);
					that.$message.success("识别二维码成功!")
				} else {
					// console.log(res);
					that.$message.error("识别二维码失败, 请重新上传")
				}
			})
			.catch(err => {
				that.$message.error(JSON.stringify(err));
			});
		},
		autoReload() {
			let that = this
			
			that.auto_reload = {
				text: '关闭刷新',
				class: 'info',
				timer: 0,
			}
			
			let auto_reload = that.cookies.get('auto_reload_alipay_xiaohebao')
			if (auto_reload) {
				that.auto_reload = JSON.parse(auto_reload)
			}
			
			clearInterval(that.interval)
			
			if (that.auto_reload.timer > 0) {
				that.interval = setInterval(function() {
					console.log('interval', that.auto_reload.text)
					that.getList()
				}, that.auto_reload.timer * 1000)
			}
		},
		handleAutoReloadChange(command) {
			let auto_reload = {}
			if (command == '0') {
				auto_reload = {
					text: '关闭刷新',
					class: 'info',
					timer: 0,
				}
			} else {
				auto_reload = {
					text: command + '秒刷新',
					class: 'primary',
					timer: command,
				}
			}
			
			this.cookies.set('auto_reload_alipay_xiaohebao', JSON.stringify(auto_reload))
			
			this.autoReload()
		},
	}
};
</script>
<style lang="scss">
.login {
	.title {
		font-size: 15px;
		text-align: left;
		line-height: 25px;
		margin-left: 35px;
		margin-bottom: 10px;
	}
	
	.qrcode {
		margin: 0 auto;
		width: 300px;
		height: 300px;
		background-color: #f8f8f8;
		
		img {
			width: 100%;
		}
	}
}
</style>
<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.content" placeholder="监控内容" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.device_imei" placeholder="设备id" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.amount" placeholder="金额" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.account_sub" placeholder="尾号" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.out_trade_no" placeholder="商户订单号" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="监控时间开始"
					end-placeholder="监控时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in notifyStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.type" placeholder="类型" clearable>
					<el-option v-for="item in notifyType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['notify_log:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>
		
		<el-table v-if="is_mobile == false" ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="ID" prop="id" fixed="left" width="90" />
			<el-table-column label="订单号" prop="order_out_trade_no" width="210" />
			<el-table-column label="金额" prop="amount" width="90" />
			<el-table-column label="尾号" prop="account_sub" width="90" />
			<el-table-column label="标题" :show-overflow-tooltip="true" width="150">
				<template slot-scope="scope">
					<span class="text-copy" v-clipboard:copy="scope.row.title" v-clipboard:success="clipboardSuccess">{{scope.row.title}}</span>
				</template>
			</el-table-column>
			<el-table-column label="内容" prop="content" />
			<el-table-column label="监控时间" prop="create_time" width="200" />
			<el-table-column label="状态" width="100">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="设备id" :show-overflow-tooltip="true" fixed="right" width="190">
				<template slot-scope="scope">
					<span class="text-copy" v-clipboard:copy="scope.row.device_imei" v-clipboard:success="clipboardSuccess">{{scope.row.device_imei}}</span>
				</template>
			</el-table-column>
		</el-table>
		<el-table v-else ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="ID" prop="id" width="90" />
			<el-table-column label="金额" prop="amount" width="90" />
			<el-table-column label="尾号" prop="account_sub" width="90" />
			<el-table-column label="标题" :show-overflow-tooltip="true" width="150">
				<template slot-scope="scope">
					<span class="text-copy" v-clipboard:copy="scope.row.title" v-clipboard:success="clipboardSuccess">{{scope.row.title}}</span>
				</template>
			</el-table-column>
			<el-table-column label="内容" prop="content" width="400" />
			<el-table-column label="监控时间" prop="create_time" width="200" />
			<el-table-column label="状态" width="100">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{scope.row.status_str}}</span>
				</template>
			</el-table-column>
			<el-table-column label="设备id" :show-overflow-tooltip="true" width="190">
				<template slot-scope="scope">
					<span class="text-copy" v-clipboard:copy="scope.row.device_imei" v-clipboard:success="clipboardSuccess">{{scope.row.device_imei}}</span>
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
		
	</div>
</template>

<script>
export default {
	name: "order_list_notify", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
			is_mobile: this.isMobile(),
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				username: "",
				keyword: "",
				url: "",
				ip: "",
				create_time: [],
			},
			
		}
	},
	computed: {
		notifyStatus() {
			return this.$store.getters.notifyStatus
		},
		notifyType() {
			return this.$store.getters.notifyType
		},
	},
	async created() {
		this.getList();
	},
	methods: {
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "notify_log/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.total = res.data.total;
				that.loading = false;
			});
		},
		// 表单重置
		reset() {
			this.form = {
				name: undefined,
				phone: undefined,
				status: undefined,
				center_id: undefined,
				role_id: undefined,
			};
			this.resetForm("form");
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
				center_id: "",
				create_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("notify_log/export", this.queryParams, "监控记录").then(res => {
				
			});
		},
		/** 复制代码成功 */
		clipboardSuccess() {
			this.$modal.msgSuccess("复制成功");
		},
	}
};
</script>

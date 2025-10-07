<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-input v-model="queryParams.sub_business_id" placeholder="商户id" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.channel_id" placeholder="通道" clearable>
					<el-option v-for="item in optionChannel" :key="item.id" :label="item.name" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.search_time"
					type="daterange"
					range-separator="至"
					start-placeholder="日期开始"
					end-placeholder="日期结束"
				/>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
			</el-form-item>
		</el-form>
		
		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" style="width: 800px;">
			<el-table-column label="排名" type="index" :index="indexMethod" width="80" />
			<el-table-column label="商户id" prop="sub_business_id" min-width="60" />
			<el-table-column label="商户账号" prop="business_username" min-width="80" />
			<el-table-column label="交易总额" prop="success_amount" min-width="100" />
			<el-table-column label="成功率" prop="success_rate" min-width="120" />
		</el-table>
		
	</div>
</template>

<script>
export default {
	name: "finance_transaction_rank", // 路由上 '/' 换成 '_'
	data() {
		return {
			user: {},
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			
			optionChannel: [],
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				sub_business_id: "",
				channel_id: "",
				search_time: [],
			},
			
		}
	},
	computed: {
		notifyStatus() {
			return this.$store.getters.notifyStatus
		},
		moneyLogType() {
			return this.$store.getters.moneyLogType
		},
	},
	async created() {
		var date = new Date();
		this.queryParams.search_time[0] = this.queryParams.search_time[1] = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate());
		
		this.getList();
		this.getOptionChannel();
	},
	methods: {
		indexMethod(index) {
			return index + this.queryParams.limit * (this.queryParams.page - 1) + 1
		},
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "finance/transaction_rank",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data;
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
				sub_business_id: "",
				channel_id: "",
				search_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		// /** 导出按钮操作 */
		// handleExport() {
		// 	let that = this;
			
		// 	that.exportExcel("money_log/export", this.queryParams, "资金明细").then(res => {
				
		// 	});
		// },
		getOptionChannel() {
			let that = this;
			
			that.request({
				url: "option/channel",
				data: {},
			}).then(res => {
				that.optionChannel = res.data
			});
		},
	}
};
</script>

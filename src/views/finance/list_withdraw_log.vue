<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-select v-model="queryParams.type" placeholder="类型" clearable>
					<el-option v-for="item in withdrawLogType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.money" placeholder="发生金额" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.keyword" placeholder="备注" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker v-model="queryParams.create_time" type="datetimerange" range-separator="至" start-placeholder="时间开始" end-placeholder="时间结束" :default-time="['00:00:00', '23:59:59']" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['withdraw_log:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>
		<el-row class="mt10 mb20">
			<el-col :span="1.5" class="total-info">
				<span>
					总费用：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{info.total_fee}}</el-tag>
					订单笔数：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{info.total_order}}单</el-tag>
				</span>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="商户id" prop="sub_business_id" fixed="left" min-width="15%" />
			<el-table-column label="类型" prop="type_str" min-width="17%" />
			<el-table-column label="商户订单号" prop="out_trade_no" min-width="30%" />
			<el-table-column label="发生金额" min-width="20%">
				<template slot-scope="scope">
					<span v-if="scope.row.money >= 0" class="text-success">{{scope.row.money}}</span>
					<span v-else class="text-danger">{{scope.row.money}}</span>
				</template>
			</el-table-column>
			<el-table-column label="发生前余额" prop="money_before" min-width="20%" />
			<el-table-column label="发生后余额" prop="money_after" min-width="20%" />
			<el-table-column label="时间" prop="create_time" min-width="30%" />
			<el-table-column label="备注" prop="remark" width="400" />
		</el-table>

		<pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

	</div>
</template>

<script>
export default {
	name: "finance_list_withdraw_log", // 路由上 '/' 换成 '_'
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
			info: [],

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
		withdrawLogType() {
			return this.$store.getters.withdrawLogType
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
				url: "withdraw_log/list",
				data: that.queryParams,
			}).then(res => {
				that.list = res.data.list;
				that.info = res.data.info;
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

			that.exportExcel("withdraw_log/export", this.queryParams, "资金明细").then(res => {

			});
		},
	}
};
</script>

<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
			<el-form-item class="mr10">
				<el-select v-model="queryParams.url" placeholder="类型" clearable>
					<el-option v-for="item in urlList" :key="item.url" :label="item.name" :value="item.url" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.ip" placeholder="ip" clearable/>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker
					v-model="queryParams.create_time"
					type="datetimerange"
					range-separator="至"
					start-placeholder="时间开始"
					end-placeholder="时间结束"
					:default-time="['00:00:00', '23:59:59']"
				/>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['log:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>
		
		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list">
			<el-table-column label="ID" prop="id" fixed="left" width="160" />
			<el-table-column label="商户编号" prop="business_id" width="160" />
			<el-table-column label="操作" prop="name" />
			<el-table-column label="ip" prop="ip" width="200" />
			<el-table-column label="操作时间" prop="create_time" width="240" />
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
	name: "user_log", // 路由上 '/' 换成 '_'
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
			
			urlList: [],
			
			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				type: "",
				ip: "",
				create_time: [],
			},
			
		}
	},
	computed: {
		
	},
	async created() {
		this.getUrlList();
		this.getList();
	},
	methods: {
		/** 查询列表 */
		getList() {
			let that = this
			
			that.loading = true;
			that.request({
				url: "log/list",
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
				type: "",
				ip: "",
				create_time: [],
			};
			this.resetForm("queryForm");
			this.getList();
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this;
			
			that.exportExcel("log/export", this.queryParams, "操作记录").then(res => {
				
			});
		},
		getUrlList() {
			let that = this;
			
			that.request({
				url: "log/url_list",
				data: {},
			}).then(res => {
				that.urlList = res.data
			});
		},
	}
};
</script>

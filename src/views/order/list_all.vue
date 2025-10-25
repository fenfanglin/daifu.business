<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
			<el-form-item v-if="user.type != 3" class="mr10">
				<el-input v-model="queryParams.sub_business_id" placeholder="商户id" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input v-model="queryParams.out_trade_no" placeholder="商户订单号" clearable />
			</el-form-item>
			<el-form-item v-if="user.type == 1 || user.type == 3" class="mr10">
				<el-select v-model="queryParams.card_business_id" placeholder="工作室" clearable>
					<el-option v-for="item in optionCardBusiness" :key="item.id" :label="item.name" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.account_type" placeholder="收款方式" clearable>
					<el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker v-model="queryParams.success_time" type="datetimerange" range-separator="至" start-placeholder="成功时间开始" end-placeholder="成功时间结束" :default-time="['00:00:00', '23:59:59']" />
			</el-form-item>
			<el-form-item class="mr10">
				<el-date-picker v-model="queryParams.create_time" type="datetimerange" range-separator="至" start-placeholder="下单时间开始" end-placeholder="下单时间结束" :default-time="['00:00:00', '23:59:59']" />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input-number v-model="queryParams.min_amount" placeholder="交易金额最小" :controls="false" class="w210px text-left" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-input-number v-model="queryParams.max_amount" placeholder="交易金额最大" :controls="false" class="w210px text-left" clearable />
			</el-form-item>
			<el-form-item class="mr10">
				<el-select v-model="queryParams.status" placeholder="状态" clearable>
					<el-option v-for="item in orderStatus" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="medium" @click="handleQuery">搜索</el-button>
				<el-button type="primary" icon="el-icon-download" size="medium" @click="handleExport" v-hasPermi="['order:export']">导出</el-button>
				<el-button icon="el-icon-refresh" size="medium" @click="resetQuery">重置</el-button>
				<el-dropdown split-button :type="auto_reload.class" class="ml10" @command="(command) => handleAutoReloadChange(command)">
					{{ auto_reload.text }}
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
				<el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['order:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="primary" icon="el-icon-upload2" @click="handleImport" v-hasPermi="['order:import']">导入订单</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button v-hasPermi="['order:switch_order']">
					<template>
						<el-switch style="display: block" v-model="user.order_status" active-text="开启接单" inactive-text="关闭接单" @change="changeSwitch($event)" :active-value="1" :inactive-value="-1" height="500">
						</el-switch>
					</template>
				</el-button>

			</el-col>
		</el-row>
		<el-row class="mt10 mb20">
			<el-col :span="1.5" class="total-info">
				<span v-if="info.show_search == true">
					交易总额：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">￥{{ info.success_amount }}</el-tag>
					交易笔数：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{ info.success_order }}单</el-tag>
					成功率：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{ info.success_rate }}%</el-tag>
					订单费用：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{ info.success_fee }}</el-tag>

				</span>
				<span v-else>
					今日交易总额：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">￥{{ info.today_success_amount }}</el-tag>
					今日交易笔数：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{ info.today_success_order }}单</el-tag>
					今日成功率：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{ info.today_success_rate }}%</el-tag>
					今日费用：<el-tag type="primary" size="small" effect="dark" class="bolder mr20">{{ info.today_fee }}</el-tag>
				</span>
			</el-col>
		</el-row>

		<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list" :key="key">
			<el-table-column label="订单号" width="260" :show-overflow-tooltip="true" :fixed="is_mobile ? null : 'left'">
				<template slot-scope="scope">
					<span>系统单号：{{ scope.row.order_no }}</span><br>
					<span>商户单号：{{ scope.row.out_trade_no }}</span>
				</template>
			</el-table-column>
			<el-table-column v-if="user.type == 1" label="其他信息" width="180" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span>商户ID：{{ scope.row.sub_business_id }}【{{scope.row.sub_business_realname}}】</span><br>
					<span v-if="scope.row.card_business_id > 0">工作室：{{ scope.row.card_business_id }}【{{scope.row.card_business_realname}}】</span>
					<span v-else>工作室：未分配</span>
				</template>
			</el-table-column>
			<el-table-column label="时间" width="240" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span>下单时间：{{ scope.row.create_time }}</span><br>
					<span>成功时间：{{ scope.row.success_time }}</span>
				</template>
			</el-table-column>
			<el-table-column v-if="is_mobile == false" label="收款信息" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<span v-if="scope.row.account_type === 1">
						<span> 银行：{{ scope.row.bank }} </span>
						<span> 支行：{{ scope.row.branch }}</span><br>
						<span> 姓名：{{ scope.row.account_name }} </span>
						<span> 卡号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 2">
						<span>usdt账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 3">
						<span>支付宝姓名：{{ scope.row.account_name }}</span> <br>
						<span>支付宝账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 4">
						<span>数字RMB姓名：{{ scope.row.account_name }}</span> <br>
						<span>钱包编号：{{ scope.row.account }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column v-else label="收款信息" :show-overflow-tooltip="true" width="300">
				<template slot-scope="scope">
					<span v-if="scope.row.account_type === 1">
						<span>银行：{{ scope.row.bank }} </span>
						<span>支行：{{ scope.row.branch }} </span><br>
						<span>姓名：{{ scope.row.account_name }} </span>
						<span>卡号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 2">
						<span>usdt账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 3">
						<span>支付宝姓名：{{ scope.row.account_name }}</span> <br>
						<span>支付宝账号：{{ scope.row.account }}</span>
					</span>
					<span v-if="scope.row.account_type === 4">
						<span>数字RMB姓名：{{ scope.row.account_name }}</span> <br>
						<span>钱包编号：{{ scope.row.account }}</span>
					</span>
				</template>
			</el-table-column>
			<el-table-column label="费用" :show-overflow-tooltip="true" width="150">
				<template slot-scope="scope">
					<span v-if="scope.row.status > 0">订单费用：<span class="text-danger">{{ parseFloat(scope.row.business_order_fee).toFixed(4) }}</span></span><br>
					<span v-if="scope.row.status > 0">固定费用：<span class="text-danger">{{ parseFloat(scope.row.business_commission).toFixed(4) }}</span></span><br>
				</template>
			</el-table-column>
			<el-table-column label="备注" :show-overflow-tooltip="true" width="150">
				<template slot-scope="scope">
					<span>下单备注：{{ scope.row.remark }}</span><br>
					<span>支付备注：{{ scope.row.pay_remark }}</span><br>
				</template>
			</el-table-column>
			<el-table-column label="交易金额" width="100">
				<template slot-scope="scope">
					<span class="text-danger">{{ scope.row.amount }}</span><br>
					<span v-if="scope.row.usdt_amount > 0" class="text-success">U: {{ scope.row.usdt_amount }}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态" width="120">
				<template slot-scope="scope">
					<span :class="scope.row.status_class">{{ scope.row.status_str }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" :fixed="is_mobile ? null : 'right'" :width="user.type == 1 ? 400 : (user.type == 2 ? 360 : 260)">
				<template slot-scope="scope">
					<el-button type="primary" class="tb-button" icon="el-icon-search" @click="handleView(scope.row)" plain>查看</el-button>
					<el-button :disabled="scope.row.card_business_id > 0" type="danger" class="tb-button" icon="el-icon-success" @click="handleAllocation(scope.row)" v-hasPermi="['order:allocation']" plain>分配</el-button>
					<el-button type="warning" class="tb-button" icon="el-icon-chat-line-square" @click="handleSetRemark(scope.row)" v-hasPermi="['order:set_remark']" plain>备注</el-button>
					<el-button v-if="user.type == 1 || user.type == 2" type="primary" class="tb-button" plain>
						<el-dropdown @command="(command) => handleCommand(command, scope.row)">
							<span class="el-dropdown-link font14 ml15 text-info">
								设置订单<i class="el-icon-arrow-down"></i>
							</span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item command="success" :disabled="scope.row.status > 0" v-hasPermi="['order:set_order_success']">设为成功</el-dropdown-item>
								<el-dropdown-item command="fail" :disabled="scope.row.status == -2" v-hasPermi="['order:set_order_fail']">设为失败</el-dropdown-item>
								<el-dropdown-item command="not_pay" :disabled="scope.row.status == -1" v-hasPermi="['order:set_order_not_pay']">设为未支付</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" :page-sizes="[10, 20, 50, 100, 200]" />

		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" label-width="100px">
				<el-row>
					<el-form-item label="商户单号">
						<el-input v-model="form.out_trade_no" :readonly="true" />
					</el-form-item>
					<el-form-item label="交易金额">
						<el-input v-model="form.amount" :readonly="true" />
					</el-form-item>
					<el-form-item label="Usdt金额" v-if="form.usdt_amount > 0">
						<el-input v-model="form.usdt_amount" :readonly="true" />
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-if="user.type == 3" v-model="form.remark" maxlength="50" show-word-limit autocomplete="off" />
						<el-input v-else v-model="form.pay_remark" maxlength="50" show-word-limit autocomplete="off" />
					</el-form-item>
					<el-form-item label="转账截图" v-if="formType == 'set_success' && (user.type == 1 || user.type == 2)">
						<ImageUploadOneOss :limit="1" v-model="form.image_url"></ImageUploadOneOss>
					</el-form-item>
					<el-form-item label="上传图片" v-if="formType == 'set_fail' && (user.type == 1 || user.type == 2)">
						<ImageUploadOneOss :limit="1" v-model="form.image_url"></ImageUploadOneOss>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button v-if="formType == 'set_success'" type="danger" v-hasPermi="['order:set_order_success']" @click="submitFormSuccess">设为成功</el-button>
				<el-button v-else-if="formType == 'set_fail'" type="danger" v-hasPermi="['order:set_order_fail']" @click="submitFormFail">设为失败</el-button>
				<el-button v-else-if="formType == 'set_not_pay'" type="danger" v-hasPermi="['order:set_order_not_pay']" @click="submitFormNotPay">设为未支付</el-button>
				<el-button v-else-if="formType == 'set_remark'" type="warning" v-hasPermi="['order:set_remark']" @click="submitFormRemark">备注</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

		<el-dialog title="订单信息" :visible.sync="openDetail" width="700px" append-to-body :close-on-click-modal="false">
			<el-table ref="multipleTable2" border empty-text="没有相关数据" :data="detail.info">
				<el-table-column label="内容" prop="title" :show-overflow-tooltip="true" min-width="30" />
				<el-table-column label="信息" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span v-if="scope.row.check == 'usdt_trade'" class="pointer text-primary" @click="goUsdtTrade(scope.row.value)">{{ scope.row.value }}</span>
						<span v-else-if="scope.row.check == 'image'">
							<el-card shadow="hover" :body-style="{ padding: '10px' }">
								<el-popover>
									<img :src="scope.row.value" slot="reference" class="show-image" />
									<img :src="scope.row.value" class="imagePreview" />
								</el-popover>
							</el-card>
						</span>
						<span v-else :class="scope.row.class">{{ scope.row.value }}</span>
					</template>
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">关闭</el-button>
				<el-button type="danger" v-if="detail.status < 0" class="button" icon="el-icon-success" @click="handleSetSuccess(detail.row)" v-hasPermi="['order:set_order_success']" plain>设为成功</el-button>
				<el-button type="danger" v-if="detail.status != -2" class="button" icon="el-icon-error" @click="handleSetFail(detail.row)" v-hasPermi="['order:set_order_fail']" plain>设为失败</el-button>
				<el-button type="danger" v-if="detail.status != -1" class="button" icon="el-icon-error" @click="handleSetNotPay(detail.row)" v-hasPermi="['order:set_order_fail']" plain>设为未支付</el-button>
				<el-button v-if="detail.status == 1" type="danger" v-hasPermi="['order:resend_notify']" @click="resendNotify(detail.no)">补发通知</el-button>
			</div>
		</el-dialog>

		<el-dialog title="补发通知" :visible.sync="openNotify" width="700px" append-to-body :close-on-click-modal="false">
			<div class="wiki-preview-body markdown-body">
				<h4>回调连接：</h4>
				<div class="markdown-code-block">
					<pre><code>{{ notify_result.url }}</code></pre>
				</div>
				<h4>请求状态：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code><span v-if="notify_result.url">请求时间：{{ notify_result.time }}s
HTTP状态：{{ notify_result.http_code }}
HTTP错误：{{ notify_result.http_error }}
CURL错误：{{ notify_result.curl_errno }}</span></code></pre>
				</div>
				<h4>请求参数：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code>{{ notify_result.params }}</code></pre>
				</div>
				<h4>返回信息：</h4>
				<div class="markdown-code-block">
					<pre style="min-height: 110px;"><code>{{ notify_result.response }}</code></pre>
				</div>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancel">关闭</el-button>
			</div>
		</el-dialog>

		<!-- 添加订单 -->
		<el-dialog :title="title" :visible.sync="openOrder" width="700px" append-to-body :close-on-click-modal="false">
			<el-form :model="add_order" label-width="100px">
				<el-row>
					<el-form-item label="收款类型">
						<el-select v-model="add_order.account_type" placeholder="类型" clearable>
							<el-option v-for="item in accountType" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<!-- 银行卡 -->
					<el-form-item v-if="add_order.account_type===1" label="银行名称">
						<el-input v-model="add_order.bank" prop="bank" placeholder="请输入银行" autocomplete="off" />
					</el-form-item>
					<el-form-item v-if="add_order.account_type===1" label="银行支行">
						<el-input v-model="add_order.branch" placeholder="请输入银行支行" autocomplete="off" />
					</el-form-item>
					<el-form-item v-if="add_order.account_type===1" label="姓名">
						<el-input v-model="add_order.account_name" placeholder="请输入姓名" autocomplete="off" />
					</el-form-item>
					<el-form-item v-if="add_order.account_type===1" label="卡号">
						<el-input v-model="add_order.account" placeholder="请输入卡号" autocomplete="off" />
					</el-form-item>
					<!-- 银行卡 -->
					<el-form-item v-if="add_order.account_type===2" label="钱包地址">
						<el-input v-model="add_order.account" placeholder="请输入钱包地址" autocomplete="off" />
					</el-form-item>
					<!-- 支付宝 -->
					<el-form-item v-if="add_order.account_type===3" label="姓名">
						<el-input v-model="add_order.account_name" placeholder="请输入姓名" autocomplete="off" />
					</el-form-item>
					<el-form-item v-if="add_order.account_type===3" label="账号">
						<el-input v-model="add_order.account" placeholder="请输入支付宝账号" autocomplete="off" />
					</el-form-item>
					<!-- 数字RMB -->
					<el-form-item v-if="add_order.account_type===4" label="姓名">
						<el-input v-model="add_order.account_name" placeholder="请输入姓名" autocomplete="off" />
					</el-form-item>
					<el-form-item v-if="add_order.account_type===4" label="账号">
						<el-input v-model="add_order.account" placeholder="钱包编号" autocomplete="off" />
					</el-form-item>
					<el-form-item label="金额">
						<el-input v-model="add_order.amount" type="number" placeholder="请输入金额" autocomplete="off" @change="changeAmount" />
					</el-form-item>
					<el-form-item label="USDT金额" v-if="add_order.account_type ===2">
						<el-input v-model="add_order.usdt_amount" placeholder="USDT金额" autocomplete="off" disabled />
						<p style="margin-top: 0;margin-bottom: 0"> 换算汇率约为 <span class="text-danger">{{ usdt_rate }}</span> 资料由
							OKX 提供</p>
					</el-form-item>
					<el-form-item label="订单号">
						<el-input v-model="add_order.out_trade_no" placeholder="请输入商户订单号" autocomplete="off" />
					</el-form-item>
					<el-form-item label="回调地址">
						<el-input v-model="add_order.notify_url" placeholder="请输入回调地址" autocomplete="off" />
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="addOrder">确定</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>

		<el-dialog title="分配工作室" :visible.sync="allocation" width="500px" append-to-body :close-on-click-modal="false">
			<el-form ref="form" :model="form" label-width="100px">
				<el-row>
					<el-form-item label="商户单号">
						<el-input v-model="form.out_trade_no" :readonly="true" />
					</el-form-item>
					<el-form-item label="交易金额">
						<el-input v-model="form.amount" :readonly="true" />
					</el-form-item>
					<el-form-item label="Usdt金额" v-if="form.usdt_amount > 0">
						<el-input v-model="form.usdt_amount" :readonly="true" />
					</el-form-item>
					<el-form-item label="工作室">
						<el-select v-model="form.card_business_id" clearable>
							<el-option v-for="item in list_card" :key="item.id" :label="item.show" :value="item.id" />
						</el-select>
					</el-form-item>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="danger" v-hasPermi="['order:allocation']" @click="submitAllocation">确认</el-button>
				<el-button @click="cancel">取消</el-button>
			</div>
		</el-dialog>
		<el-dialog :title="title" :visible.sync="openImport" width="1200px" append-to-body :close-on-click-modal="false">
			<el-row :gutter="10" class="mb20">
				<el-col :span="1.5" class="text-danger">
					订单编号、收款码不能重复
				</el-col>
			</el-row>
			<el-row :gutter="10" class="mb20">
				<el-col :span="1.5">
					<el-upload action="" accept=".xls,.xlsx" :show-file-list="false" :http-request="resolveUpload">
						<el-button type="primary">选择导入</el-button>
					</el-upload>
				</el-col>
				<el-col :span="1.5">
					<el-button type="warning" :disabled="isSubmitImport" @click="submitImport">
						确定导入
					</el-button>
				</el-col>
			</el-row>
			<el-table ref="multipleTable" v-loading="loading" border empty-text="没有相关数据" :data="list_import">
				<el-table-column label="账号类型" width="150" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<div>类型：{{ scope.row.account_type }}</div>
						<div v-if="scope.row.bank">银行：{{ scope.row.bank }}</div>
						<div v-if="scope.row.branch">支行：{{ scope.row.branch }}</div>
					</template>
				</el-table-column>
				<el-table-column label="账号信息/金额" width="350" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<div v-if="scope.row.account_name">姓名：{{ scope.row.account_name }}</div>
						<div>账号：{{ scope.row.account }}</div>
						<div>金额：{{ scope.row.amount }}</div>
					</template>
				</el-table-column>
				<el-table-column label="商户单号/回调地址" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span>单号：{{ scope.row.out_trade_no }}</span><br>
						<span>回调：{{ scope.row.notify_url }}</span><br>
					</template>
				</el-table-column>
				<el-table-column label="导入结果" width="150" :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span v-if="scope.row.import_status == 'error'" class="text-danger">{{ scope.row.import_msg }}</span>
						<span v-else class="text-success">{{ scope.row.import_msg }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100" fixed="right">
					<template slot-scope="scope">
						<el-button type="danger" class="tb-button" icon="el-icon-delete" @click="delItem(scope.$index)" v-hasPermi="['order:import_delete']" plain>删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>

	</div>
</template>

<script>
import variables from '@/assets/styles/markdown.css'
import { removeUser } from '../../utils/auth'
import interval from 'echarts/src/scale/Interval'

export default {
	name: 'order_list_all', // 路由上 '/' 换成 '_'
	data() {
		return {
			templateUrl: process.env.VUE_APP_BASE_API + '/template/order.xlsx',
			user: {},
			show_taobao_order: false,
			is_mobile: this.isMobile(),
			// 遮罩层
			loading: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 表格数据
			list: [],
			info: [],
			list_card: [],
			add_order: {},
			// 是否显示弹出层
			open: false,
			openDetail: false,
			openNotify: false,
			openOrder: false,
			openImport: false,
			allocation: false,
			//usdt费率
			usdt_rate: 0,
			key: 0,
			message: -1,
			error_msg: '',

			optionCardBusiness: [],

			// 查询参数
			queryParams: {
				page: 1,
				limit: 10,
				out_trade_no: '',
				card_business_id: '',
				status: '',
				create_time: [],
				success_time: []
			},
			// 表单参数
			title: '',
			form: {},
			formType: '',
			detail: {},
			notify_result: '',
			auto_reload: {},
			interval: {},
			orderForm: {
				bank: '',
				out_trade_no: ''
			},
			list_import: [],
			isSubmitImport: true,
		}
	},
	computed: {
		orderStatus() {
			console.log(this.$store.getters.orderStatus)
			return this.$store.getters.orderStatus
		},
		successType() {
			return this.$store.getters.successType
		},
		accountType() {
			return this.$store.getters.accountType
		}
	},
	created() {
		this.getUserInfo()
		this.getOptionCardBusiness()
		this.getList()
		this.autoReload()
	},
	beforeDestroy() {
		clearInterval(this.interval)
	},
	methods: {
		async getUserInfo() {
			this.user = await this.userInfo()
			this.show_taobao_order = this.user.show_taobao_order
		},
		endPlay() {
			const audio = document.getElementById('myAudio');
			if (audio !== null) {
				audio.pause();
				this.loading = false;
			}
		},
		/** 查询列表 */
		getList() {
			let that = this

			that.loading = true
			that.request({
				url: 'order/list',
				data: that.queryParams
			}).then(res => {
				that.list = res.data.list
				that.total = res.data.total
				that.info = res.data.info
				that.loading = false
				that.key++
				that.endPlay();
				that.message = -1
			})

		},
		changeSwitch: function (event) {
			let that = this;
			that.request({
				url: 'order/switch_order',
				data: {
					order_status: event
				}
			}).then(res => {
				that.getUserInfo()
			})
		},
		// 取消按钮
		cancel() {
			this.open = false
			this.openDetail = false
			this.openNotify = false
			this.openOrder = false
			this.allocation = false
			this.openImport = false
			this.reset()
		},
		// 表单重置
		reset() {
			this.form = {}
			this.notify_result = {}
			this.add_order = {}
			this.resetForm('form')
			this.resetForm('notify_result')
			this.resetForm('add_order')
			this.error_msg = ''
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.reset()
			this.openOrder = true
			this.title = '添加'
			this.getUsdtRate()
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.page = 1
			this.getList()
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.queryParams = {
				page: 1,
				limit: this.queryParams.limit,
				keyword: '',
				status: '',
				center_id: '',
				create_time: []
			}
			this.resetForm('queryForm')
			this.getList()
		},
		handleView(row) {
			let that = this

			that.reset()
			that.request({
				url: 'order/view',
				data: {
					no: row.no
				}
			}).then(res => {
				that.detail = res.data
				that.openDetail = true
			})
		},
		handleSetRemark(row) {
			let that = this

			that.reset()

			that.form = row
			that.formType = 'set_remark'
			that.open = true
			that.title = '备注'
		},
		//分配工作室
		handleAllocation(row) {
			let that = this
			that.reset()
			that.form = row
			that.allocation = true
			that.request({
				url: 'order/list_card_by_order',
				data: {
					no: that.form.no
				}
			}).then(res => {
				that.list_card = res.data
			})
		},
		getUsdtRate() {
			let that = this

			that.request({
				url: 'option/get_usdt_rate',
				data: {}
			}).then(res => {
				that.usdt_rate = res.data
			})
		},
		submitAllocation() {
			let that = this

			that.request({
				url: 'order/allocation',
				data: {
					no: that.form.no,
					card_business_id: that.form.card_business_id
				}
			}).then(res => {
				that.cancel()
				that.getList()

				that.$modal.msgSuccess('成功')
			})
		},
		submitFormRemark() {
			let that = this

			that.request({
				url: 'order/set_remark',
				data: {
					no: that.form.no,
					remark: that.form.remark,
					pay_remark: that.form.pay_remark,
					image_url: that.form.image_url
				}
			}).then(res => {
				that.cancel()
				that.getList()

				that.$modal.msgSuccess('成功')
			})
		},
		changeAmount() {
			let that = this
			console.log(that.add_order.account_type)
			if (that.add_order.account_type === 2) {
				var num = that.add_order.amount / that.usdt_rate
				that.add_order.usdt_amount = num.toFixed(2)
				that.$set(this.add_order, this.add_order.usdt_amount, num.toFixed(2))
			}
		},
		resendNotify(no) {
			let that = this

			that.cancel()
			that.loading = true

			that.request({
				url: 'order/resend_notify',
				data: {
					no: no
				}
			}).then(res => {
				that.loading = false
				that.notify_result = res.data

				setTimeout(function () {
					that.openNotify = true
				}, 300)

				that.getList()
			})
		},
		/** 导出按钮操作 */
		handleExport() {
			let that = this

			that.exportExcel('order/export', this.queryParams, '订单').then(res => {

			})
		},
		getOptionCardBusiness() {
			let that = this

			that.request({
				url: 'option/card_business',
				data: {}
			}).then(res => {
				that.optionCardBusiness = [];
				that.optionCardBusiness.push({ 'id': 0, 'name': '未分配' })
				res.data.forEach((item) => {
					that.optionCardBusiness.push(item)
				})
			})
		},
		goIp(ip) {
			let href = `https://ip.cn/ip/${ip}.html`
			window.open(href, '_blank')
		},
		goUsdtTrade(trade) {
			let href = `https://tronscan.org/#/address/${trade}`
			window.open(href, '_blank')
		},
		autoReload() {
			let that = this

			that.auto_reload = {
				text: '关闭刷新',
				class: 'info',
				timer: 0
			}

			let auto_reload = that.cookies.get('auto_reload_order')
			if (auto_reload) {
				that.auto_reload = JSON.parse(auto_reload)
			}

			clearInterval(that.interval)

			if (that.auto_reload.timer > 0) {
				that.interval = setInterval(function () {
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
					timer: 0
				}
			} else {
				auto_reload = {
					text: command + '秒刷新',
					class: 'primary',
					timer: command
				}
			}

			this.cookies.set('auto_reload_order', JSON.stringify(auto_reload))

			this.autoReload()
		},
		/** 更多操作触发 */
		handleCommand(command, row) {
			switch (command) {
				case "success":
					this.handleSetSuccess(row);
					break;
				case "fail":
					this.handleSetFail(row);
					break;
				case "not_pay":
					this.handleSetNotPay(row);
					break;
				default:
					break;
			}
		},
		handleSetSuccess(row) {
			let that = this

			that.reset()

			that.form = row
			that.formType = 'set_success'
			that.open = true
			that.title = '设为成功'
		},
		handleSetFail(row) {
			let that = this

			that.reset()

			that.form = row
			that.formType = 'set_fail'
			that.open = true
			that.title = '设为失败'
		},
		handleSetNotPay(row) {
			let that = this

			that.reset()

			that.form = row
			that.formType = 'set_not_pay'
			that.open = true
			that.title = '设为未支付'
		},
		submitFormSuccess() {
			let that = this

			that.request({
				url: 'order/set_order_success',
				data: {
					no: that.form.no,
					pay_remark: that.form.pay_remark,
					image_url: that.form.image_url,
				}
			}).then(res => {
				that.cancel()
				that.getList()

				that.$modal.msgSuccess('成功')
			})
		},
		submitFormFail() {
			let that = this

			that.request({
				url: 'order/set_order_fail',
				data: {
					no: that.form.no,
					pay_remark: that.form.pay_remark,
					image_url: that.form.image_url,
				}
			}).then(res => {
				that.cancel()
				that.getList()

				that.$modal.msgSuccess('成功')
			})
		},
		submitFormNotPay() {
			let that = this

			that.request({
				url: 'order/set_order_not_pay',
				data: {
					no: that.form.no,
					pay_remark: that.form.pay_remark,
				}
			}).then(res => {
				that.cancel()
				that.getList()

				that.$modal.msgSuccess('成功')
			})
		},
		addOrder() {
			let that = this
			that.request({
				url: 'order/add',
				data: that.add_order
			}).then(res => {
				that.cancel()
				that.getList()

				that.$modal.msgSuccess('成功')
			})
		},
		/** 导入订单*/
		handleImport() {
			this.reset()
			this.openImport = true
			this.isSubmitImport = true
			this.list_import = []
			this.title = '导入订单'
			this.getUsdtRate()
		},
		submitImport() {
			let that = this

			if (that.isSubmitImport === true) {
				return false
			}

			that.isSubmitImport = true // 显示提交中动画

			that.request({
				url: 'order/import',
				data: {
					data: that.list_import
				},
				checkRepeatSubmit: true
			}).then(res => {
				that.isSubmitImport = false // 提交完成，关闭加载动画
				that.$modal.msgSuccess('添加成功')
				that.getList()

				let list_length = that.list_import.length

				for (let i = 0; i < list_length; i++) {
					that.list_import[i]['import_status'] = res.data[i]['status']
					that.list_import[i]['import_msg'] = res.data[i]['msg']
				}

				console.log(that.list_import)
			}).catch(() => {
				setTimeout(() => {
					that.isSubmitImport = false // 提交失败后重置状态
				}, 3000)
			})
		},
		delItem(index) {
			this.list_import.splice(index, 1)
		},
		resolveUpload(event) {
			let that = this

			// console.log('event', event)

			if (!/\.(xls|xlsx)$/.test(event.file.name.toLowerCase())) {
				that.$message.error('上传格式不正确，请上传xls或者xlsx格式')
				return
			}

			const fileReader = new FileReader()
			fileReader.onload = ev => {
				try {
					const data = ev.target.result
					const workbook = that.xlsxRead(data, {
						type: 'binary'
					})
					// 取第一张表
					const wsname = workbook.SheetNames[0]
					// 生成json表格内容
					const ws = that.xlsxUtils.sheet_to_json(
						workbook.Sheets[wsname]
					)
					console.log('ws', ws)
					// 后续为自己对ws数据的处理

					let _list = []
					let ws_len = ws.length

					that.isSubmitImport = true

					for (let i = 0; i < ws_len; i++) {
						if (ws[i]['商户单号'] != undefined) {
							_list.push({
								account_type: ws[i]['收款类型'],
								bank: ws[i]['银行名称'],
								branch: ws[i]['银行支行'],
								account_name: ws[i]['姓名'],
								account: ws[i]['账号'],
								amount: ws[i]['金额'],
								out_trade_no: ws[i]['商户单号'],
								notify_url: ws[i]['回调地址'],
								import_status: '',
								import_msg: '',
							})

							that.isSubmitImport = false
						}
					}

					that.list_import = _list
				} catch (e) {
					return false
				}
			}
			fileReader.readAsBinaryString(event.file)
		}
	}
}
</script>
<style lang="scss">
.el-switch__label * {
	line-height: 1;
	font-size: 17px;
	display: inline-block;
}
.image {
	max-height: 500px;
}
.show-image {
	width: 110px;
	height: 110px;
	cursor: zoom-in;
}
.imagePreview {
	max-height: 800px;
}
.el-switch__label.is-active {
	color: #ff4949;
}
</style>

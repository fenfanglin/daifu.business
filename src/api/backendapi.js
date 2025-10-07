import request from '@/utils/request'
import { download } from '@/utils/request'

// ---------------------------------------------------------------------------------------------------
export function index(query) {
	return request({
		url: "index/index",
		method: "post",
		data: query
	});
}

export function adminList(query) {
	return request({
		url: "admin/list",
		method: "post",
		data: query
	});
}

// export function adminExport(query, fileName) {
// 	return request({
// 		url: "admin/export",
// 		method: "post",
// 		responseType: "blob",
// 		fileName: fileName,
// 		data: query
// 	});
// }
export function adminExport(query, fileName) {
	return download("admin/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function adminView(query) {
	return request({
		url: "admin/view",
		method: "post",
		data: query
	});
}

export function adminSave(query) {
	return request({
		url: "admin/save",
		method: "post",
		data: query
	});
}

export function adminDelete(query) {
	return request({
		url: "admin/delete",
		method: "post",
		data: query
	});
}

export function adminEnable(query) {
	return request({
		url: "admin/enable",
		method: "post",
		data: query
	});
}

export function adminDisable(query) {
	return request({
		url: "admin/disable",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function roleList(query) {
	return request({
		url: "role/list",
		method: "post",
		data: query
	});
}

export function roleExport(query, fileName) {
	return download("role/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function roleView(query) {
	return request({
		url: "role/view",
		method: "post",
		data: query
	});
}

export function roleSave(query) {
	return request({
		url: "role/save",
		method: "post",
		data: query
	});
}

export function roleDelete(query) {
	return request({
		url: "role/delete",
		method: "post",
		data: query
	});
}

export function roleEnable(query) {
	return request({
		url: "role/enable",
		method: "post",
		data: query
	});
}

export function roleDisable(query) {
	return request({
		url: "role/disable",
		method: "post",
		data: query
	});
}

export function roleListOption(query) {
	return request({
		url: "role/list_option",
		method: "post",
		data: query
	});
}

// 获取代理所有权限（用于设置代理的角色）
export function roleGetCenterFullPermission(query) {
	return request({
		url: "role/get-center-full-permission",
		method: "post",
		data: query
	});
}

// 获取代理后台权限（用于设置代理的权限）
export function roleViewCenterPermission(query) {
	return request({
		url: "role/view-center-permission",
		method: "post",
		data: query
	});
}

// 保存代理后台权限（用于设置代理的权限）
export function roleSaveCenterPermission(query) {
	return request({
		url: "role/save-center-permission",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function centerList(query) {
	return request({
		url: "center/list",
		method: "post",
		data: query
	});
}

export function centerExport(query, fileName) {
	return download("center/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function centerView(query) {
	return request({
		url: "center/view",
		method: "post",
		data: query
	});
}

export function centerSave(query) {
	return request({
		url: "center/save",
		method: "post",
		data: query
	});
}

export function centerDelete(query) {
	return request({
		url: "center/delete",
		method: "post",
		data: query
	});
}

export function centerEnable(query) {
	return request({
		url: "center/enable",
		method: "post",
		data: query
	});
}

export function centerDisable(query) {
	return request({
		url: "center/disable",
		method: "post",
		data: query
	});
}

export function centerListOption(query) {
	return request({
		url: "center/list-option",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function centerMoneyLogList(query) {
	return request({
		url: "center-money-log/list",
		method: "post",
		data: query
	});
}

export function centerMoneyLogExport(query, fileName) {
	return download("center-money-log/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function centerMoneyLogView(query) {
	return request({
		url: "center-money-log/view",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function businessCooperationList(query) {
	return request({
		url: "business-cooperation/list",
		method: "post",
		data: query
	});
}

export function businessCooperationExport(query, fileName) {
	return download("business-cooperation/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function businessCooperationView(query) {
	return request({
		url: "business-cooperation/view",
		method: "post",
		data: query
	});
}

export function businessCooperationSave(query) {
	return request({
		url: "business-cooperation/save",
		method: "post",
		data: query
	});
}

export function businessCooperationDelete(query) {
	return request({
		url: "business-cooperation/delete",
		method: "post",
		data: query
	});
}

export function businessCooperationEnable(query) {
	return request({
		url: "business-cooperation/enable",
		method: "post",
		data: query
	});
}

export function businessCooperationDisable(query) {
	return request({
		url: "business-cooperation/disable",
		method: "post",
		data: query
	});
}

export function businessCooperationListOption(query) {
	return request({
		url: "business-cooperation/list-option",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function userList(query) {
	return request({
		url: "user/list",
		method: "post",
		data: query
	});
}

export function userExport(query, fileName) {
	return download("user/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function userView(query) {
	return request({
		url: "user/view",
		method: "post",
		data: query
	});
}

export function userSave(query) {
	return request({
		url: "user/save",
		method: "post",
		data: query
	});
}

export function userDelete(query) {
	return request({
		url: "user/delete",
		method: "post",
		data: query
	});
}

export function userEnable(query) {
	return request({
		url: "user/enable",
		method: "post",
		data: query
	});
}

export function userDisable(query) {
	return request({
		url: "user/disable",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function userMoneyLogList(query) {
	return request({
		url: "user-money-log/list",
		method: "post",
		data: query
	});
}

export function userMoneyLogExport(query, fileName) {
	return download("user-money-log/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function userMoneyLogView(query) {
	return request({
		url: "user-money-log/view",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function activityList(query) {
	return request({
		url: "activity/list",
		method: "post",
		data: query
	});
}

export function activityExport(query, fileName) {
	return download("activity/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function activityView(query) {
	return request({
		url: "activity/view",
		method: "post",
		data: query
	});
}

export function activitySave(query) {
	return request({
		url: "activity/save",
		method: "post",
		data: query
	});
}

export function activityDelete(query) {
	return request({
		url: "activity/delete",
		method: "post",
		data: query
	});
}

export function activityEnable(query) {
	return request({
		url: "activity/enable",
		method: "post",
		data: query
	});
}

export function activityDisable(query) {
	return request({
		url: "activity/disable",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function orderList(query) {
	return request({
		url: "order/list",
		method: "post",
		data: query
	});
}

export function orderExport(query, fileName) {
	return download("order/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function orderView(query) {
	return request({
		url: "order/view",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function orderDetailList(query) {
	return request({
		url: "order-detail/list",
		method: "post",
		data: query
	});
}

export function orderDetailExport(query, fileName) {
	return download("order-detail/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function orderDetailListItem(query) {
	return request({
		url: "order-detail/list-item",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function withdrawList(query) {
	return request({
		url: "withdraw/list",
		method: "post",
		data: query
	});
}

export function withdrawExport(query, fileName) {
	return download("withdraw/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function withdrawView(query) {
	return request({
		url: "withdraw/view",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function attendList(query) {
	return request({
		url: "attend/list",
		method: "post",
		data: query
	});
}

export function attendExport(query, fileName) {
	return download("attend/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function attendView(query) {
	return request({
		url: "attend/view",
		method: "post",
		data: query
	});
}

export function attendSave(query) {
	return request({
		url: "attend/save",
		method: "post",
		data: query
	});
}

export function attendDelete(query) {
	return request({
		url: "attend/delete",
		method: "post",
		data: query
	});
}

export function attendEnable(query) {
	return request({
		url: "attend/enable",
		method: "post",
		data: query
	});
}

export function attendDisable(query) {
	return request({
		url: "attend/disable",
		method: "post",
		data: query
	});
}


// ---------------------------------------------------------------------------------------------------
export function attendDetailList(query) {
	return request({
		url: "attend-detail/list",
		method: "post",
		data: query
	});
}

export function attendDetailExport(query, fileName) {
	return download("attend-detail/export", {
		...query
	}, `${fileName}_${new Date().getTime()}.xlsx`);
}

export function attendDetailView(query) {
	return request({
		url: "attend-detail/view",
		method: "post",
		data: query
	});
}
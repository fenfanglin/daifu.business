import request from "@/utils/request";
import { download } from "@/utils/request";
import { Loading } from "element-ui";

let loadingInstance;

// ---------------------------------------------------------------------------------------------------
export function exportExcel(url, query, fileName) {
	return download(
		url,
		{
			...query,
		},
		`${fileName}_${new Date().getTime()}.csv`
	);
}

export const userInfo = async () => {
	return new Promise((resolve) => {
		request({
			url: "index/userinfo",
		}).then((res) => {
			if (res.code == 200) {
				resolve(res.data);
			} else {
				resolve(false);
			}
		});
	});
};

export function isMobile() {
	let flag = navigator.userAgent.match(
		/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
	);
	return flag !== null;
}

export function loadingShow(text = "正在加载中，请稍候") {
	loadingInstance = Loading.service({
		text: text,
		spinner: "el-icon-loading",
		background: "rgba(0, 0, 0, 0.7)",
	});
}

export function loadingClose() {
	loadingInstance.close();
}

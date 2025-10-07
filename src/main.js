import Vue from "vue";

import Cookies from "js-cookie";

import Element from "element-ui";
import "./assets/styles/element-variables.scss";

import "@/assets/iconfont/iconfont.css";
import "@/assets/styles/index.scss"; // global css
import "@/assets/styles/ruoyi.scss"; // ruoyi css
import App from "./App";
import store from "./store";
import router from "./router";
import directive from "./directive"; // directive
import plugins from "./plugins"; // plugins
import { getUser, setUser } from "@/utils/auth";
import request from "@/utils/request";
import { download } from "@/utils/request";
import {
	exportExcel,
	userInfo,
	isMobile,
	loadingShow,
	loadingClose,
} from "@/api/common";
import { read, utils } from "xlsx";
import { QrDecode, QrDecodeUrl } from "@/api/qrdecode";
import QRCode from "qrcodejs2";
import upload from "@/utils/upload";
import defined from "./store/defined";

import "./assets/icons"; // icon
import "./permission"; // permission control
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/system/config";
import {
	parseTime,
	resetForm,
	addDateRange,
	selectDictLabel,
	selectDictLabels,
	handleTree,
} from "@/utils/ruoyi";
// 分页组件
import Pagination from "@/components/Pagination";
// 自定义表格工具组件
import RightToolbar from "@/components/RightToolbar";
// 富文本组件
import Editor from "@/components/Editor";
// 文件上传组件
import FileUpload from "@/components/FileUpload";
// 文件上传组件
import FileUploadOne from "@/components/FileUploadOne";
// 图片上传组件
import ImageUploadOneOss from "@/components/ImageUploadOneOss";
// 图片预览组件
import ImagePreview from "@/components/ImagePreview";
// 字典标签组件
import DictTag from "@/components/DictTag";
// 头部标签组件
import VueMeta from "vue-meta";
// 字典数据组件
import DictData from "@/components/DictData";

// 全局方法挂载
Vue.prototype.getDicts = getDicts;
Vue.prototype.getConfigKey = getConfigKey;
Vue.prototype.parseTime = parseTime;
Vue.prototype.resetForm = resetForm;
Vue.prototype.addDateRange = addDateRange;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.selectDictLabels = selectDictLabels;
Vue.prototype.getUser = getUser;
Vue.prototype.setUser = setUser;
Vue.prototype.request = request;
Vue.prototype.download = download;
Vue.prototype.exportExcel = exportExcel;
Vue.prototype.xlsxRead = read;
Vue.prototype.xlsxUtils = utils;
Vue.prototype.userInfo = userInfo;
Vue.prototype.isMobile = isMobile;
Vue.prototype.loadingShow = loadingShow;
Vue.prototype.loadingClose = loadingClose;
Vue.prototype.qrDecode = QrDecode;
Vue.prototype.QrDecodeUrl = QrDecodeUrl;
Vue.prototype.qrCode = QRCode;
Vue.prototype.upload = upload;
Vue.prototype.handleTree = handleTree;
// Vue.prototype.uploadImageUrl = process.env.VUE_APP_BASE_API + '/admin/list'
Vue.prototype.defined = defined;
Vue.prototype.cookies = Cookies;

// this.cookies.set('key', 'value')
// this.cookies.get('key')
// this.cookies.remove('key')

Date.prototype.format = function (format) {
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(), //day
		"h+": this.getHours(), //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
		S: this.getMilliseconds(), //millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(
			RegExp.$1,
			(this.getFullYear() + "").substr(4 - RegExp.$1.length)
		);
	for (var k in o)
		if (new RegExp("(" + k + ")").test(format))
			format = format.replace(
				RegExp.$1,
				RegExp.$1.length == 1
					? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length)
			);
	return format;
};

// 全局组件挂载
Vue.component("DictTag", DictTag);
Vue.component("Pagination", Pagination);
Vue.component("RightToolbar", RightToolbar);
Vue.component("Editor", Editor);
Vue.component("FileUpload", FileUpload);
Vue.component("FileUploadOne", FileUploadOne);
Vue.component("ImageUploadOneOss", ImageUploadOneOss);
Vue.component("ImagePreview", ImagePreview);

Vue.use(directive);
Vue.use(plugins);
Vue.use(VueMeta);
DictData.install();

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
	size: Cookies.get("size") || "medium", // set element-ui default size
});

Vue.config.productionTip = false;

new Vue({
	el: "#app",
	router,
	store,
	render: (h) => h(App),
});

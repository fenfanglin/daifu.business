<template>
	<div class="component-upload-image">
		<el-upload
			action="#"
			accept=".jpg,.jpeg,.png,.gif"
			:auto-upload="false"
			list-type="picture-card"
			:on-change="handleUploadChange"
			:limit="limit"
			name="file"
			:on-remove="handleRemove"
			:show-file-list="true"
			:file-list="fileList"
			:on-preview="handlePictureCardPreview"
			:class="{hide: this.fileList.length >= this.limit}"
		>
			<i class="el-icon-plus"></i>
		</el-upload>
		
		<!-- 上传提示 -->
		<div class="el-upload__tip" slot="tip" v-if="showTip">
			<template v-if="imageSize"> 图片尺寸 <b class="red">{{ imageSize }}</b>， </template>
			<template v-if="fileSize"> 大小不超过 <b class="red">{{ fileSize }}MB</b>， </template>
			<template v-if="fileType"> 格式为 <b class="red">JPG、JPEG、PNG</b> </template>
		</div>
		
		<el-dialog :visible.sync="dialogVisible" title="预览" width="800" append-to-body>
			<img :src="dialogImageUrl" class="image" />
		</el-dialog>
	</div>
</template>

<script>
import upload from "@/utils/upload";

export default {
	props: {
		value: [String, Object, Array],
		// 图片数量限制
		limit: {
			type: Number,
			default: 1,
		},
		// 图片尺寸
		imageSize: {
			type: String,
			default: '',
		},
		// 大小限制(MB)
		fileSize: {
			type: Number,
			default: 5,
		},
		// 文件类型, 例如['png', 'jpg', 'jpeg']
		fileType: {
			type: Array,
			default: () => ["image/jpg", "image/jpeg", "image/png"],
		},
		// 是否显示提示
		isShowTip: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			number: 0,
			uploadList: [],
			dialogImageUrl: "",
			dialogVisible: false,
			hideUpload: false,
			fileList: []
		};
	},
	watch: {
		value: {
			handler(val) {
				if (val) {
					// 首先将值转为数组
					const list = Array.isArray(val) ? val : this.value.split(',');
					// 然后将数组转为对象数组
					this.fileList = list.map(item => {
						if (typeof item === "string") {
							item = { name: item, url: item };
						}
						return item;
					});
				} else {
					this.fileList = [];
					return [];
				}
			},
			deep: true,
			immediate: true
		}
	},
	computed: {
		// 是否显示提示
		showTip() {
			return this.isShowTip && (this.fileType || this.fileSize);
		},
	},
	methods: {
		// 删除图片
		handleRemove(file, fileList) {
			console.log("handleRemove");
			const findex = this.fileList.map(f => f.name).indexOf(file.name);
			if(findex > -1) {
				this.fileList.splice(findex, 1);
				this.$emit("input", this.listToString(this.fileList));
			}
		},
		handleUploadChange(file, fileList) {
			// console.log("handleUploadChange");
			// console.log("file", file);
			
			if (file.size > this.fileSize * 1024 * 1024) {
				fileList.pop()
				return this.$message({ message: '图片大小不超过5M', type: 'warning' })
			}
			if (!this.fileType.find(type => type === file.raw.type)) {
				fileList.pop()
				return this.$message({ message: '格式为JPG、JPEG、PNG', type: 'warning' })
			}
			this.$modal.loading("正在上传图片，请稍候...");
			this.number++;
			
			upload(file, url => {
				// this.$emit("input", url);
				
				this.uploadList.push({ name: url, url: url });
				console.log("this.number", this.number);
				console.log("this.uploadList", this.uploadList);
				if (this.uploadList.length === this.number) {
					this.fileList = this.fileList.concat(this.uploadList);
					this.uploadList = [];
					this.number = 0;
					
					console.log("this.fileList", this.fileList);
					console.log("this.listToString(this.fileList)", this.listToString(this.fileList));
					
					this.$emit("input", this.listToString(this.fileList));
					this.$modal.closeLoading();
				}
				
			})
		},
		// 预览
		handlePictureCardPreview(file) {
			console.log("handlePictureCardPreview");
			this.dialogImageUrl = file.url;
			this.dialogVisible = true;
		},
		// 对象转成指定字符串分隔
		listToString(list, separator) {
			let strs = "";
			separator = separator || ",";
			for (let i in list) {
				strs += list[i].url + separator;
			}
			return strs != '' ? strs.substr(0, strs.length - 1) : '';
		}
	}
};
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
::v-deep.hide .el-upload--picture-card {
	display: none;
}
// 去掉动画效果
::v-deep .el-list-enter-active,
::v-deep .el-list-leave-active {
	transition: all 0s;
}

::v-deep .el-list-enter, .el-list-leave-active {
	opacity: 0;
	transform: translateY(0);
}
.red {
	color: #f56c6c;
}
.image {
	display: block;
	max-width: 100%;
	margin: 0 auto;
}
</style>
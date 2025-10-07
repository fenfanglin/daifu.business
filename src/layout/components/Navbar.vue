<template>
	<div class="navbar">
		<hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

		<breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav"/>
		<top-nav id="topmenu-container" class="topmenu-container" v-if="topNav"/>

		<div class="right-menu">
			<!-- <template v-if="device!=='mobile'">
				<search id="header-search" class="right-menu-item" />

				<el-tooltip content="源码地址" effect="dark" placement="bottom">
					<ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
				</el-tooltip>

				<el-tooltip content="文档地址" effect="dark" placement="bottom">
					<ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
				</el-tooltip>

				<screenfull id="screenfull" class="right-menu-item hover-effect" />

				<el-tooltip content="布局大小" effect="dark" placement="bottom">
					<size-select id="size-select" class="right-menu-item hover-effect" />
				</el-tooltip>

			</template> -->
      <audio ref="audio" controls loop  id="myAudio" v-if="user.type !== 4" v-show="0" >
        <source src="../../../public/note.mp3"/>
      </audio>
      <img style="width: 30px;cursor: pointer;margin-bottom: 7px" src="../../../public/note.png" v-if="user.user_type !== 3 && message === 1" @click="endPlay();orderTo()">
			<el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
				<div class="avatar-wrapper">
					<img :src="user.avatar" class="user-avatar">
					<span>{{user.name}}</span>
					<i class="el-icon-arrow-down" />
				</div>
				<el-dropdown-menu slot="dropdown">
					<!-- <router-link to="/user/profile">
						<el-dropdown-item>个人中心</el-dropdown-item>
					</router-link> -->
					<el-dropdown-item @click.native="setting = true">
						<span>布局设置</span>
					</el-dropdown-item>
					<el-dropdown-item divided @click.native="logout">
						<span>退出登录</span>
					</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
// import Screenfull from '@/components/Screenfull'
// import SizeSelect from '@/components/SizeSelect'
// import Search from '@/components/HeaderSearch'
// import RuoYiGit from '@/components/RuoYi/Git'
// import RuoYiDoc from '@/components/RuoYi/Doc'
import { getUser } from '@/utils/auth'

export default {
	components: {
		Breadcrumb,
		TopNav,
		Hamburger,
		// Screenfull,
		// SizeSelect,
		// Search,
		// RuoYiGit,
		// RuoYiDoc
	},
	data() {
		return {
			user: '',
      message:-1,
      voice:-1
		}
	},
	computed: {
		...mapGetters([
			'sidebar',
			'avatar',
			'device'
		]),
		setting: {
			get() {
				return this.$store.state.settings.showSettings
			},
			set(val) {
				this.$store.dispatch('settings/changeSetting', {
					key: 'showSettings',
					value: val
				})
			}
		},
		topNav: {
			get() {
				return this.$store.state.settings.topNav
			}
		}
	},
	created() {
		let that = this

		that.user = getUser()
		if (!that.user.name) {
			setTimeout(function() {
				that.user = getUser()
			}, 1000)
		}
    if (that.user.user_type === 1 || that.user.user_type === 2){
      that.getNewOrderStatus();
      setInterval(function(){
        that.getNewOrderStatus();
      },10000)
    }
	},
	methods: {
		toggleSideBar() {
			this.$store.dispatch('app/toggleSideBar')
		},
		async logout() {
			this.$confirm('确定注销并退出系统吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$store.dispatch('LogOut').then(() => {
					location.href = '/index';
				})
			}).catch(() => {});
		},
    beginPlay(){
      const audio = document.getElementById('myAudio');
      audio.play();
      this.message = 1;
      this.loading = false;
      let that = this;
      if (this.user.audio_loop === -1){
        //声音停止，消息提示还在
        setTimeout(function(){
          that.endPlay();
          that.message = 1;
          that.voice = -1;
        },1500)
      }
    },
    endPlay(){
      const audio = document.getElementById('myAudio');
      audio.pause();
      this.message = -1;
      this.voice = -1;
      this.loading = false;
    },
    // 是否有新订单
    getNewOrderStatus(){
      let that = this

      that.loading = true
      that.request({
        url: 'order/get_new_order_status',
      }).then(res => {
        if (res.data === 1){
          that.voice = 1;
          that.beginPlay();
        }
      })
    },
    orderTo(){
      this.voice = -1;
      this.$router.push({ path: '/order/list_all' });
    }
	}
}
</script>

<style lang="scss" scoped>
.navbar {
	height: 50px;
	overflow: hidden;
	position: relative;
	background: #fff;
	box-shadow: 0 1px 4px rgba(0,21,41,.08);

	.hamburger-container {
		line-height: 46px;
		height: 100%;
		float: left;
		cursor: pointer;
		transition: background .3s;
		-webkit-tap-highlight-color:transparent;

		&:hover {
			background: rgba(0, 0, 0, .025)
		}
	}

	.breadcrumb-container {
		float: left;
	}

	.topmenu-container {
		position: absolute;
		left: 50px;
	}

	.errLog-container {
		display: inline-block;
		vertical-align: top;
	}

	.right-menu {
		float: right;
		height: 100%;
		line-height: 50px;

		&:focus {
			outline: none;
		}

		.right-menu-item {
			display: inline-block;
			padding: 0 8px;
			height: 100%;
			font-size: 18px;
			color: #5a5e66;
			vertical-align: text-bottom;

			&.hover-effect {
				cursor: pointer;
				// transition: background .3s;

				// &:hover {
				// 	background: rgba(0, 0, 0, .025)
				// }
			}

			i {
				font-size: 14px;
				margin-left: 10px;
			}
		}

		.avatar-container {
			margin-right: 30px;

			.avatar-wrapper {
				// margin-top: 5px;
				position: relative;
				display: flex;
				align-items: center;

				.user-avatar {
					cursor: pointer;
					width: 40px;
					height: 40px;
					border-radius: 10px;
					margin-right: 10px;
				}
				.user-avatar:not([src]) {
					opacity: 0;
				}

				.el-icon-caret-bottom {
					cursor: pointer;
					position: absolute;
					right: -20px;
					top: 25px;
					font-size: 12px;
				}
			}
		}
	}
}
</style>

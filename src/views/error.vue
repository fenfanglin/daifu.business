<script>
import { setToken } from '@/utils/auth'
export default {
	name: "error",
	data() {
		return {
			
		};
	},
	created() {
		if (this.$route.query.token && this.$route.query.sign) {
			this.error();
		}
	},
	methods: {
		error() {
			let that = this
			that.request({
				url: "login/check_login",
				data: that.$route.query,
			}).then(res => {
				setToken(res.data.token)
				
				setTimeout(function() {
					that.getUserInfo()
				}, 200)
			});
		},
		async getUserInfo() {
			let that = this
			
			that.user = await that.userInfo()
			that.setUser(that.user)
			that.$router.push({
				path: '/index',
			})
		},
	}
};
</script>
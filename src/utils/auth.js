import Cookies from "js-cookie";

const TokenKey = "DaifuBusiness-Token";
const InfoKey = "DaifuBusiness-Info";

export function getToken() {
	return Cookies.get(TokenKey);
}

export function setToken(token) {
	return Cookies.set(TokenKey, token);
}

export function removeToken() {
	return Cookies.remove(TokenKey);
}

export function getUser() {
	let info = Cookies.get(InfoKey);
	if (info) {
		return JSON.parse(info);
	} else {
		return {
			center_id: 0,
			real_name: "管理员",
		};
	}
}

export function setUser(info) {
	return Cookies.set(InfoKey, JSON.stringify(info));
}

export function removeUser() {
	return Cookies.remove(InfoKey);
}

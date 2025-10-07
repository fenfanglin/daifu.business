import request from '@/utils/request'
import { getToken } from '@/utils/auth'

// 获取路由
export const getRouters = () => {
  return request({
    url: 'index/get_router',
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  })
}
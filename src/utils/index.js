function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}
// 显示繁忙提示
var showBusy = (text,time=1000) => wx.showToast({
  title: text,
  icon: 'loading',
  duration: time
})
// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();
  wx.showModal({
    title,
    content: JSON.stringify(content),
    showCancel: false
  })
}
var showTip = (title = "提示", content) => {
  wx.hideToast();
  wx.showModal({
    title,
    content: content,
    showCancel: false
  })
}

export default {
  formatNumber,
  formatTime,
  showBusy,
  showSuccess,
  showModel,
  showTip
}

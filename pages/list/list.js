const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const weatherMap2 = {
  '100': 'sunny',
  '101': 'cloudy',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
Page({
  data: {
    weekWeather: [],
    city: '广州市'
  },
  onLoad(options) {
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },
  onPullDownRefresh() {
    this.getWeekWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    wx.request({
      // url: 'https://test-miniprogram.com/api/weather/future',
      url: 'https://free-api.heweather.com/s6/weather/forecast',
      data: {
        // time: new Date().getTime(),
        // city: this.data.city
        location: this.data.city,
        key: 'c5b21f7f901a4cf2806cc11e0d9e49e0'
      },
      success: res => {
        let result = res.data.HeWeather6[0].daily_forecast
        this.setWeekWeather(result)
      },
      complete: ()=>{
        callback && callback()
      }
    })
  },
  setWeekWeather(result){
    console.log(result);
    
    let weekWeather = []
    for (let i = 0; i < result.length; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].tmp_min}° - ${result[i].tmp_max}°`,
        iconPath: '/images/' + weatherMap2[result[i].cond_code_d] + '-icon.png'        
      })      
    }
    weekWeather[0].day = '今天'
    this.setData({
      weekWeather:weekWeather
    })
  }
})
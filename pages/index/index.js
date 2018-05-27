const dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherMap2 = {
  '100': 'sunny',
  '101': 'cloudy',
  '103':'cloudy',//晴间多云
  'overcast': '阴',
  'lightrain': '小雨',
  '302': 'heavyrain',//雷阵雨
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: "",
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    city: '广州市',
    locationAuthType: UNPROMPTED,
    weekWeather:[]
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
    })
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED
            : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })

        if (auth)
          this.getCityAndWeather()
        else{
          this.getNow() //使用默认城市广州
          this.getToday()
          this.getHourlyWeather()
        }
          
      },
      fail: ()=>{
        this.getNow() //使用默认城市广州
        this.getToday()
        this.getHourlyWeather()
      }
    })
  },
  onPullDownRefresh(){
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://free-api.heweather.com/s6/weather/now',
      data: {
        location: this.data.city,
        // username: 'HE1805271731411701',
        key: 'c5b21f7f901a4cf2806cc11e0d9e49e0',
        // t: new Date().getTime()
      },
      success: res => {       
        let result = res.data.HeWeather6[0]
        this.setNow(result)        
      },
      complete: () =>{
        callback && callback()
      }
    })
  },
  getHourlyWeather(callback) {
    wx.request({
      // url: 'https://free-api.heweather.com/s6/weather/hourly',
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        // location: this.data.city,
        city: this.data.city,
        // username: 'HE1805271731411701',
        key: 'c5b21f7f901a4cf2806cc11e0d9e49e0',
        // t: new Date().getTime()
      },
      success: res => {

        // console.log(res);
        // let result = res.data.HeWeather6
        let result = res.data.result

        
        this.setHourlyWeather(result)
        
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setNow(result){
    let temp = result.now.tmp
    let weather = result.now.cond_code
    this.setData({
      nowTemp: temp + '°',
      nowWeather: result.now.cond_txt,
      nowWeatherBackground: '/images/' + weatherMap2[weather] + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weatherMap2[weather]],
    })
  },
  setHourlyWeather(result){
    let forecast = result.forecast
    let hourlyWeather = []
    let nowHour = new Date().getHours()
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i*3 + nowHour) % 24 + "时",
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  getToday(callback){
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
        console.log(res);
        
        let result = res.data.HeWeather6[0].daily_forecast
        this.setToday(result[0])
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setToday(result) {    
    let date = new Date()
    this.setData({
      todayTemp: `${result.tmp_min}° - ${result.tmp_max}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.userLocation']) {
            this.getCityAndWeather()
          }
        }
      })
    else
      this.getCityAndWeather()
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res=>{
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res=>{
            // console.log(res);
            let city=''
            if (res.result.address_component.district){
              city = res.result.address_component.district
            }else{
              city = res.result.address_component.city
            }
            console.log(city);
            
            this.setData({
              city:city,
            })
            this.getNow()
            this.getToday()
            this.getHourlyWeather()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  },
  setWeekWeather(result) {
    console.log(result);

    let weekWeather = []
    for (let i = 0; i < result.length; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getMonth() + 1}-${date.getDate()}`,
        day_txt: result[i].cond_txt_d,
        night_txt: result[i].cond_txt_n,
        temp_min: `${result[i].tmp_min}°`,
        temp_max: `${result[i].tmp_max}°`,
        iconPath: '/images/' + weatherMap2[result[i].cond_code_d] + '-icon.png'
      })
    }
    weekWeather[0].day = '今天'
    this.setData({
      weekWeather: weekWeather
    })
  }
})
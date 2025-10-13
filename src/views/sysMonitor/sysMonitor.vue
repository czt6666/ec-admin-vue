<template>
  <div style="overflow-y: auto; min-width: 50%;min-height: 40vh">
    <div class="pageTitle_pane">
      <h1>系统资源监控</h1>
    </div>
    <!--  <div class="showTable_Pane">-->
    <!--    <div>-->
    <!--      <el-card>刷新时间选择框</el-card>-->
    <!--    </div>-->
    <!--  </div>-->
    <div class="showSysInfo_Pane">
      <el-card style="height: 200px">
        <el-descriptions title = "系统信息">
          <el-descriptions-item label="系统HostName">{{this.sysInfo.HostName}}</el-descriptions-item>
          <el-descriptions-item label="系统位数">{{this.sysInfo.Bitness}}</el-descriptions-item>
          <el-descriptions-item label="系统核心数">{{this.sysInfo.SysCpuCores}}</el-descriptions-item>
          <el-descriptions-item label="系统CPU">{{this.sysInfo.SysCpuIdentifierName}}</el-descriptions-item>
          <el-descriptions-item label="系统版本">{{this.sysInfo.SysVersion}}</el-descriptions-item>
          <el-descriptions-item label="系统平均负载">{{this.sysInfo.SysLoadAverage}}</el-descriptions-item>
          <el-descriptions-item label="系统硬件版本">{{this.sysInfo.hardwareVersion}}</el-descriptions-item>
          <el-descriptions-item label="系统启动时间">{{this.sysInfo.Booted}}</el-descriptions-item>
          <el-descriptions-item label="服务器运行时间">{{this.sysInfo.systemUptime}}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <div class="showChart_Pane"  >
      <div class="test">
        <el-card class="cardItem" id = "CPUChart" style="margin-left: 0px">

        </el-card>
        <el-card class="cardItem" id="RAMChart" ></el-card>
        <el-card class="ROM" id="ROMChart">
          <div style="display: flex;flex-direction: row">
            <div class="ROMItem"  v-for="(item,index) in requestData.ROM.infoArry" :id="'ROM_'+index">

            </div>
          </div>
        </el-card>
      </div>

    </div>
  </div>
</template>


<script>

export default {
  created() {
    this.getSystemInfo()
  },
  mounted() {
    this.handleSSEConnect()
    // this.setCPUChart()
  },
  data(){
    return{
      sysInfo: {},
      cpuRate: [],
      ramRate:[],
      romRate:[],
      dateArray:[],
      ramUsed: "",
      ramUnUsed:"",
      romUsed: "",
      romUnUsed:"",
      requestData: {
        ROM:{}
      }
    }
  },
  name: "sysMonitor",

  methods:{
    getSystemInfo(){
      this.api({
        url:"/sysmonitor/sysinfo",
        methods: 'get',
      }).then( res => {
        this.sysInfo = res
      } ).catch(error => {
        console.log(error)
      })
    },

    handleSSEConnect(){
      let uid = localStorage.getItem("token")
      if ('EventSource' in window) {
        //创建sse连接
        let eventSource = new EventSource(`http://${window.webofdConfig.LONG_CONNECT_URL}/sysmonitor/createSse?uid=${uid}`);

        eventSource.onopen = function (event) {
          new EventSource(`http://${window.webofdConfig.LONG_CONNECT_URL}/sysmonitor/sendMsg?uid=${uid}`);
        }
        eventSource.onmessage =  (event) => {
          if(event.data){
            let date =  Date.now()
            let totalInfo = JSON.parse(event.data)
            this.requestData = JSON.parse(event.data)
            let CPUInfo = totalInfo.CPU

            if  (this.dateArray.length<5){
              this.dateArray.push(this.dateFormat(date,'MM-dd hh:mm:ss'))
              this.cpuRate.push(CPUInfo.CPUCurUsage)
            }else {
              this.dateArray.shift()
              this.cpuRate.shift()
              this.dateArray.push(this.dateFormat(date,'MM-dd hh:mm:ss'))
              this.cpuRate.push(CPUInfo.CPUCurUsage)
            }

            this.ramUsed = totalInfo.RAM.usedByte
            this.ramUnUsed = totalInfo.RAM.availableByte
            let CPUChart = this.$echarts.init(document.getElementById("CPUChart"))
            let RAMChart = this.$echarts.init(document.getElementById("RAMChart"))

            // // //动态创建饼图
            let romInfoArry = totalInfo.ROM.infoArry
            this.$nextTick(()=>{
              for (let index in romInfoArry){
                let romChart = this.$echarts.init(document.getElementById("ROM_"+index))
                // let romChart = this.$echarts.init(document.getElementById("ROMChart"))
                romChart.setOption(this.setROMChart(romInfoArry[index].used,romInfoArry[index].free,romInfoArry[index].usedRate,romInfoArry[index].path))
              }
            })

            RAMChart.setOption(this.setRAMChart(this.ramUsed,this.ramUnUsed,totalInfo.RAM.usageRate))
            CPUChart.setOption(this.setCPUChart(this.dateArray,this.cpuRate,CPUInfo.CPUCurUsage))
          }
        }
        eventSource.onerror = (error) => {
          console.log('SSE链接失败');
        };
      } else {
        alert("你的浏览器不支持SSE");
      }

    },
    setCPUChart(horizontalData,valueData,usedRate ){
      let option = {
        title: {
          text: 'CPU占用',
          subtext:"当前CPU占用率"+usedRate+ "%",
          subtextStyle:{
            fontSize:20
          },
          left: 'center'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: horizontalData
          // data: [60,0]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: valueData,
            type: 'line',
            // areaStyle: {}
            smooth: true
          }
        ]
      };
      return option
    },
    setRAMChart(used,unused,usedRate){
      let option = {
        title: {
          text: '内存占用信息',
          left: 'center',
          subtext:"当前内存占用率"+usedRate+ "%",
          subtextStyle:{
            fontSize:20
          },
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '内存',
            type: 'pie',
            radius: '50%',
            data: [
              { value: used, name: '已用/G' },
              { value: unused, name: '空闲/G' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      return option
    },
    setROMChart(used,unused,usedRate,path) {
      let option = {
        title: {
          text: path+'盘占用信息',
          left: 'center',
          subtext:"当前占用率"+usedRate+ "%",
          subtextStyle:{
            fontSize:20
          },
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '空间',
            type: 'pie',
            radius: '50%',
            data: [
              { value: used, name: '已用/G' },
              { value: unused, name: '空闲/G' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      return option
    },
    dateFormat(date,needFmt){
      Date.prototype.Format = function(fmt){
        var o = {
          "M+" : this.getMonth()+1,                 //月份
          "d+" : this.getDate(),                    //日
          "h+" : this.getHours(),                   //小时
          "m+" : this.getMinutes(),                 //分
          "s+" : this.getSeconds(),                 //秒
          "q+" : Math.floor((this.getMonth()+3)/3), //季度
          "S"  : this.getMilliseconds()             //毫秒
        };

        if(/(y+)/.test(fmt))
          fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
          if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
      }
      return  new Date(date).Format(needFmt)
    }
  }
}


</script>

<style scoped>
.showTable_Pane{
  /*display: flex;*/
}
.test{
  /*position: absolute;*/
  margin-left: 35px;
  display: flex;
  flex-wrap: nowrap;
  /*width: 100%;*/
  overflow-x: auto;
}
.showChart_Pane{

  /*scroll-margin: 30px;*/
  /*height: 55vh;*/
  /*flex: 0 0 250px;*/
  /*  min-width: 50%;*/


}
.otherChart{
  /*flex-wrap: wrap;*/
}
.cardItem{
  height: 53vh;
  width: 48%;
  min-width: 430px;
  flex:0 0 auto;

}
.ROMItem{
  height: 53vh;
  width: 550px;
  min-width: 400px;
  flex:0 0 auto;
}
.ROM{
  height: 53vh;
  min-width: 430px;
  flex:0 0 auto;

  /deep/ .el-card__body{
    display: flex;
    flex-direction: row;
  }
}
.el-card{
  margin-left: 35px;
  margin-bottom:15px;

}

</style>

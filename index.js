// 引入所需的库
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('mqtt'); // 用于与MQTT代理通信的库，可根据实际情况选择其他通信协议

// 创建Express应用程序
const app = express();
const port = 3000;

// 使用body-parser中间件解析POST请求的JSON数据
app.use(bodyParser.json());

// 创建MQTT客户端连接
const mqttClient = new Client({
  // 请根据你的MQTT代理信息进行配置
  host: 'mqtt://mqtt.example.com',
  port: 1883,
});

// 当MQTT连接成功时触发
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

// 定义路由 - 控制设备
app.post('/control-device', (req, res) => {
  const { deviceId, action } = req.body;

  // 发布控制命令到MQTT主题
  mqttClient.publish(`devices/${deviceId}/control`, action);

  res.json({ message: 'Control command sent successfully' });
});

// 定义路由 - 监控设备状态
app.get('/monitor-device/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;

  // 订阅设备状态的MQTT主题
  mqttClient.subscribe(`devices/${deviceId}/status`);

  // 监听MQTT消息，处理设备状态变化
  mqttClient.on('message', (topic, message) => {
    if (topic === `devices/${deviceId}/status`) {
      const deviceStatus = JSON.parse(message.toString());
      res.json({ status: deviceStatus });
    }
  });
});

// 启动Express应用程序
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

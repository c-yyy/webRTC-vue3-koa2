# Introduction to the project
这是一个 `p2p` 的视频服务完整 **demo**
.
├── server
│   ├── html
│   ├── images
│   └── service
└── web
    ├── public
    └── src
包含信令服务和前端 `webRTC` 两个主要模块
若要了解详细说明请点进对应目录查看

## To prepare
### STUN and TUN service
```
docker run -d --network=host instrumentisto/coturn --realm=my.realm.org --external-ip='$(detect-external-ip)' --user=user123:pass123
```

### pm2 to deploy service
主要是部署一个 `socket` 服务
- pm2 部署 root@[your server ip]:/home/site/node-project/webRTC-Socket
- 看进程 `pm2 ls / pm2 monit`
- 看日志 `pm2 logs webRTC-Socket`

###
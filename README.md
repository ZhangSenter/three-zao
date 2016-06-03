CentOS下部署说明
1.利用NVM管理NODE版本
    1.1.安装nvm
      $ git clone https://github.com/creationix/nvm.git ~/.nvm
      $ source ~/.nvm/nvm.sh
    1.2.查看已安装的node版本
      $ nvm ls
    1.3.查看可以安装的版本：
      $ nvm ls-remote
    1.4.安装指定的版本
      $ nvm install <version>
    1.5.删除指定的版本
      $ nvm uninstall <version>
    1.6.使用选定的版本
      $ nvm use <version>

 也可直接安装
 以管理员身份运行
 获取
     curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
 获取V6
     curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
 获取V0.10
     curl --silent --location https://rpm.nodesource.com/setup | bash -
 然后执行:
     yum -y install nodejs

2.安装MongoDB
    2.1 配置yum
      vi  /etc/yum.repos.d/mongodb-org-3.0.repo
    填入内容:
        [mongodb-org-3.0]
        name=MongoDB Repository
        baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.0/x86_64/
        gpgcheck=0
        enabled=1

    2.2 安装
       yum -y install mongodb-org
    2.3 手动创建数据文件夹
       mkdir  /data/db


3. 利用forever来启动
    npm install -g forever
    forever start safe > 1.log &
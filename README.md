<p align="center">
 <img src="https://raw.githubusercontent.com/laorange/sillage-docs/master/docs/.vuepress/public/images/sillage.png" width="200" height="200" alt="sillage">
</p>
<div align="center" style="font-size: xx-large">迹云课表</>
<div align="center" style="color: #8080aa; font-size:large">单文件课程管理系统</div>

<p align="center">
  <a href="http://docs.siae.top">使用说明</a>丨<a href="https://www.yuque.com/laorange/sillage-docs/introduction-en">English Docs</a>
</p>

# 简介

> 项目名为"迹云"，灵感来源于法语单词 **Sillage**【sijaʒ】，可译为"**飞机划过天空后留下的尾迹云**" 。



由于学院有英语和法语外教，由学院教务科统一排课，分班复杂，常规的教务管理系统难以满足需求。当前是使用Excel编辑课表，更新过程繁琐，且容易出错：截至本文档撰写时，不同年级"撞教室"的现象仍时有发生。

因此，本项目的初衷正是为了改善现状，开发一套**现代化的、方便易用的课程管理系统**。



虽然是针对笔者所在学院的实际需求设计的，但项目的**可拓展性强**，但**如果有以下需求，也推荐您使用"迹云课表"**：

+ （⚠必要条件）有明确的学期划分，换言之：每个教学阶段有明确的开始和结束日期。
+ （💡重要条件）包含至少一个明确的分组，例如：年级、班级、部门......否则，现有的课表软件或许更加符合您的需求。
+ （💡重要条件）这是一个供多人查看的课程表，因为该项目将会以网站形式发布，现有的课表软件或许更加符合个人使用的需求。
+ （😆特色功能）支持多样的教学计划，例如同一节课有多个老师、在不同教室、有多个班级...
+ （😄特色功能）可配置多门语言，供外国友人查看。



# 项目特点

## 管理方便

- 操作简单，具备复制、剪切、粘贴等类似Excel上的操作；
- 在添加课程时，会检测教室、教师和分组是否与已有课程冲突；
- 信息变更即时生效，无需额外通知；
- 当课程发生变动时，**自动生成公告；**
- 包含各个课程的课时统计的**教学计划**无需手动计算，系统自动生成。



## 查询方便

- 用户可以自行选择教室、课程名、日期、年级与分组等筛选条件，减少无关信息；
- 可以将常用的页面加入到收藏夹中，快速获取信息；
- 当课程调整时，会自动在课表上方以红点提示，且能在查看公告后消除红点；
- 教学楼管理员可将本系统链接生成二维码的张贴在教室门口，便于同学们查看教室的占用情况。



## 可拓展

1. 课表名称、每节课时间、每学期开始时间等都可以在"**系统配置页**"中自定义，可满足多方需求。

2. 整个项目可以编译为单个可执行文件，方便部署和迁移。

3. 采用`SQLITE`数据库，方便备份和迁移。

4. 数据库具有**符合RESTFUL规范**的应用程序接口，可以基于该项目进行拓展。目前已有"[钉钉课程推送](https://github.com/laorange/sillage-dingtalk)"项目可供参考：

<div align="center"><a href="https://github.com/laorange/sillage-dingtalk"><img alt="Readme Card" src="https://github-readme-stats.vercel.app/api/pin/?username=laorange&repo=sillage-dingtalk"/></a></div>



## 高并发

用户在每次访问时，仅会在进入页面时请求一次数据库，其余的查询操作均支持离线完成。

同时，使用了性能十分优秀的基于GO语言的`Pocketbase`框架，即使在一个1核1G的轻量服务器上也可以轻松支持8000以上的并发量。

<div align="center"><a href="https://github.com/pocketbase/pocketbase"><img alt="Readme Card" src="https://github-readme-stats.vercel.app/api/pin/?username=pocketbase&repo=pocketbase"/></a></div>



## 国际化

用户端中的**每个词语**，都可以在"**系统配置页**"中设置它的外语翻译，以不同的语言展示课程！


const pluginName = 'kellyTestPlugin';
const nodemailer = require("nodemailer");

class kellyTestPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply (compiler) {
    console.log("执行了compiler");
    compiler.hooks.initialize.tap(pluginName, () => {
      console.log('1、webpack initialize');
    });
    compiler.hooks.shouldEmit.tap(pluginName, () => {
      console.log('2、webpack shouldEmit');
    });
    compiler.hooks.done.tap(pluginName, (stats) => {
      console.log('3、webpack done');
      // console.log(stats.hasErrors())
      // console.log(stats.toJson())
      // console.log(stats.compilation.children.map(child => child.getStats().hasErrors()))
    });
    compiler.hooks.afterDone.tap(pluginName, (stats) => {
      console.log('4、webpack afterDone');
      const { fromEmail, password, toEmail, host } = this.options;
      if (!fromEmail || !password || !toEmail || !host) {
        console.log("邮箱配置参数错误！");
      } else if (stats) {
        console.log("统计信息", stats.toString());
        // 发送邮件 TODO:
        const fromEmail = "123456@qq.com"; // 这里改成你的QQ邮箱
        const password = "xxxx";// 这里改成你的QQ授权码
        const toEmail = "xxx@163.com"; // 这里改成你要发送到的邮箱
        const host = "smtp.qq.com"; // 这里是QQ邮箱的host
        const subject = stats.hasErrors() ? "[ERROR]webpack打包失败" : "[SUCCESS]webpack打包成功";
        const html = stats.toString() + `<br><div>${"打包时间：" + new Date(stats.startTime).toLocaleString() + "-" + new Date(stats.endTime).toLocaleString()}</div>`;
        emailTo(host, fromEmail, password, toEmail, subject, html, function (data) {
          console.log(data);
        })
      }
    });
    compiler.hooks.additionalPass.tap(pluginName, () => {
      console.log('5、webpack additionalPass');
    });
    compiler.hooks.beforeRun.tap(pluginName, () => {
      console.log('6、webpack beforeRun');
    });
    compiler.hooks.run.tap(pluginName, () => {
      console.log('7、webpack run');
    });
    compiler.hooks.emit.tap(pluginName, () => {
      console.log('8、webpack emit');
    });
    compiler.hooks.assetEmitted.tap(pluginName, () => {
      console.log('9、webpack assetEmitted');
    });
    compiler.hooks.afterEmit.tap(pluginName, () => {
      console.log('10、webpack afterEmit');
    });
    compiler.hooks.thisCompilation.tap(pluginName, () => {
      console.log('11、webpack thisCompilation');
    });
    compiler.hooks.compilation.tap(pluginName, () => {
      console.log('12、webpack compilation');
    });
    compiler.hooks.normalModuleFactory.tap(pluginName, () => {
      console.log('13、webpack normalModuleFactory');
    });
    compiler.hooks.contextModuleFactory.tap(pluginName, () => {
      console.log('14、webpack contextModuleFactory');
    });
    compiler.hooks.beforeCompile.tap(pluginName, () => {
      console.log('15、webpack beforeCompile');
    });
    compiler.hooks.compile.tap(pluginName, () => {
      console.log('16、webpack compile');
    });
    compiler.hooks.contextModuleFactory.tap(pluginName, () => {
      console.log('17、webpack contextModuleFactory');
    });
    compiler.hooks.make.tap(pluginName, () => {
      console.log('18、webpack make');
    });
    compiler.hooks.finishMake.tap(pluginName, () => {
      console.log('19、webpack finishMake');
    });
    compiler.hooks.afterCompile.tap(pluginName, () => {
      console.log('20、webpack afterCompile');
    });
    compiler.hooks.watchRun.tap(pluginName, () => {
      console.log('21、webpack watchRun');
    });
    compiler.hooks.failed.tap(pluginName, () => {
      console.log('22、webpack failed');
    });
    compiler.hooks.invalid.tap(pluginName, () => {
      console.log('23、webpack invalid');
    });
    compiler.hooks.watchClose.tap(pluginName, () => {
      console.log('24、webpack watchClose');
    });
    compiler.hooks.shutdown.tap(pluginName, () => {
      console.log('25、webpack shutdown');
    });
    compiler.hooks.infrastructureLog.tap(pluginName, (name, type, args) => {
      console.log('26、webpack infrastructureLog');
    });

  }
}

// https://nodemailer.com/about/
// https://www.cnblogs.com/jackson-yqj/p/10154296.html
function emailTo (host, fromEmail, password, toEmail, subject, html, callback) {
  var transporter = nodemailer.createTransport({
    host: host,
    auth: {
      user: fromEmail,
      pass: password // 如果发送邮箱是QQ邮箱，则为授权码

    }
  });
  var mailOptions = {
    from: fromEmail, // 发送者
    to: toEmail, // 接受者,可以同时发送多个,以逗号隔开
    subject: subject, // 标题
  };
  // if (text != undefined) {
  //   mailOptions.text = text;// 文本
  // }
  if (html != undefined) {
    mailOptions.html = html;// html
  }

  var result = {
    httpCode: 200,
    message: '发送成功!',
  }
  try {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        result.httpCode = 500;
        result.message = err;
        callback(result);
        return;
      }
      callback(result);
    });
  } catch (err) {
    result.httpCode = 500;
    result.message = err;
    callback(result);
  }

}


module.exports = kellyTestPlugin;
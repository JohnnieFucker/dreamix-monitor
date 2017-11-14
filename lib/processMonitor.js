/**
 *Module dependencies
 */

const exec = require('child_process').exec;
const util = require('../utils/util');


/**
 * convert serverInfo to required format, and the callback will handle the serverInfo
 *
 * @param {Object} param, contains serverId etc
 * @param {String} data, the output if the command 'ps'
 * @param {Function} cb
 * @api private
 */

function format(param, data, cb) {
    const time = util.formatTime(new Date());
    const outArray = data.toString().replace(/^\s+|\s+$/g, '').split(/\s+/);
    let outValueArray = [];
    for (let i = 0; i < outArray.length; i++) {
        if ((!isNaN(outArray[i]))) {
            outValueArray.push(outArray[i]);
        }
    }
    const ps = {};
    ps.time = time;
    ps.serverId = param.serverId;
    ps.serverType = ps.serverId.split('-')[0];
    ps.pid = param.pid;
    const pid = ps.pid;
    ps.cpuAvg = outValueArray[1];
    ps.memAvg = outValueArray[2];
    ps.vsz = outValueArray[3];
    ps.rss = outValueArray[4];
    outValueArray = [];
    if (process.platform === 'darwin') {
        ps.usr = 0;
        ps.sys = 0;
        ps.gue = 0;
        cb(null, ps);
        return;
    }
    exec(`pidstat -p ${pid}`, (err, output) => {
        if (err) {
            console.error('the command pidstat failed! ', err.stack);
            return;
        }
        const _outArray = output.toString().replace(/^\s+|\s+$/g, '').split(/\s+/);
        for (let i = 0; i < _outArray.length; i++) {
            if ((!isNaN(_outArray[i]))) {
                outValueArray.push(_outArray[i]);
            }
        }
        ps.usr = outValueArray[1];
        ps.sys = outValueArray[2];
        ps.gue = outValueArray[3];

        cb(null, ps);
    });
}

/**
 * get the process information by command 'ps auxw | grep serverId | grep pid'
 *
 * @param {Object} param
 * @param {Function} callback
 * @api public
 */

function getPsInfo(param, callback) {
    if (process.platform === 'windows') return;
    const pid = param.pid;
    const cmd = `ps auxw | grep ${pid} | grep -v 'grep'`;
    // var cmd = "ps auxw | grep -E '.+?\\s+" + pid + "\\s+'"  ;
    exec(cmd, (err, output) => {
        if (err) {
            if (err.code === 1) {
                console.log('the content is null!');
            } else {
                console.error(`getPsInfo failed! ${err.stack}`);
            }
            callback(err, null);
            return;
        }
        format(param, output, callback);
    });
}

module.exports.getPsInfo = getPsInfo;

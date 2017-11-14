/**
 * Module dependencies
 */

const os = require('os');
const util = require('../utils/util');
const exec = require('child_process').exec;

const info = {};
info.hostname = os.hostname;

info.type = os.type;

info.platform = os.platform;

info.arch = os.arch;

info.release = os.release;

info.uptime = os.uptime;

info.loadavg = os.loadavg;

info.totalmem = os.totalmem;

info.freemem = os.freemem;

info.cpus = os.cpus;

info.networkInterfaces = os.networkInterfaces;

info.versions = () => process.versions;

info.arch = () => process.arch;

info.platform = () => process.platform;

info.memoryUsage = process.memoryUsage;

info.uptime = process.uptime;


/**
 * get basic information of operating-system
 *
 * @return {Object} result
 * @api private
 */

function getBasicInfo() {
    const result = {};
    for (const key in info) {
        if (info.hasOwnProperty(key)) {
            result[key] = info[key]();
        }
    }
    return result;
}

/**
 * analysis the disk i/o data,return a map contains kb_read,kb_wrtn ect.
 *
 * @param {String} data, the output of the command 'iostat'
 * @api private
 */

function format(data) {
    const time = util.formatTime(new Date());
    const outputArray = data.toString().replace(/^\s+|\s+$/g, '').split(/\s+/);
    const outputValues = [];
    for (let i = 0, counter = 0; i < outputArray.length; i++) {
        if (!isNaN(outputArray[i])) {
            outputValues[counter] = parseFloat(outputArray[i]);
            counter++;
        }
    }
    if (outputValues.length > 0) {
        return {
            date: time,
            disk: {
                kb_read: outputValues[9],
                kb_wrtn: outputValues[10],
                kb_read_per: outputValues[7],
                kb_wrtn_per: outputValues[8],
                tps: outputValues[6]
            },
            cpu: {
                cpu_user: outputValues[0],
                cpu_nice: outputValues[1],
                cpu_system: outputValues[2],
                cpu_iowait: outputValues[3],
                cpu_steal: outputValues[4],
                cpu_idle: outputValues[5]
            }
        };
    }
    return false;
}

/**
 * get information of operating-system
 *
 * @param {Function} callback
 * @api public
 */

function getSysInfo(callback) {
    if (process.platform === 'windows') return;
    const reData = getBasicInfo();
    exec('iostat ', (err, output) => {
        if (err) {
            console.error(`getSysInfo failed! ${err.stack}`);
            callback(err, reData);
        } else {
            reData.iostat = format(output);
            callback(null, reData);
        }
    });
}


module.exports.getSysInfo = getSysInfo;

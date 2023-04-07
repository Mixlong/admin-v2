
import { saveAs } from "file-saver";
var mixin = {
    data() {
        return {
            parallelism: {
                //待确认对应关系
                name: "name",
                communicationType1: "communication_type1",
                controllerJoint: "controller_joint",
                speedLimit: "speed_limit",
                maxGear: "max_gear",
                ortherConfig: "orther_config",
                notControllerJointString: "not_controller_joint_string",
                speedSteel: "speed_steel",
                shutdownTime: "shutdown_time",
                communicationType2: "communication_type2",
                usb: "usb",
                tiresSize: "tires_size",
                buzzer: "buzzer",
                app: "app",
                //已明确对应关系
                undervoltage: 'low_voltage_threshold',
                currentlimiting: 'current_limit_threshold',
                wheelDiameter: "wheelsize",
                power: 'electricity_method',
                unit: 'display_unit',
                bluetooth: 'has_ble_feature',
                backlightBrightness: 'backlight_brightness',
                voltage: 'system_voltage',
                assist: 'assist_dir',
                perimeter: 'peri_meter',
                agreement: 'uart_protocol',
                driveAssist: 'push_speed_func',
                defaultGear: 'default_assist',
                logo: 'logo',
                buzzerSwitch: 'beep_switch',
                highSpeedBuzzerRemind: 'limit_speed_beep',
                cruise: 'cruise_enable_switch',
                startupPasswd: 'power_on_password',
                menuPasswd: 'menu_password',
                rotateHandle: "rotate_handle",
                rotateHandleSpeedLimit: "rotate_handle_speed_limit",
                slowStart: "slow_start",
                assistSpeedLimitThreshold: "assist_speed_limit_threshold",
                batteryVoltageChangeTime: "battery_voltage_change_time",
                busOvertime: "bus_overtime",
                smoothLevel: "smooth_level",
                assistPercentage: "assist_percentage",
                ebikeName: "ebike_name",
                motorSys: "motor_sys",
                batteryCap: "battery_cap",
                showWheelsize: "show_wheelsize",
                carModel: "car_model",
                assistStartMagnetNumber: "assist_start_magnet_number",
            }
        }

    }
    ,
    mounted() {

    },
    methods: {
        handleChange(file) {
            let reader = new FileReader(); //先new 一个读文件的对象 FileReader
            let me = this;

            if (typeof FileReader === "undefined") {
                //用来判断你的浏览器是否支持 FileReader
                this.$message({
                    type: "info",
                    message: "您的浏览器不支持文件读取。",
                });
                return;
            }
            //  reader.readAsText(file.raw, "gb2312");  //读.txt文件
            reader.readAsArrayBuffer(file.raw); //读任意文件
            reader.onload = function (e) {
                var ints = new Uint8Array(e.target.result); //要使用读取的内容，所以将读取内容转化成Uint8Array
                ints = ints.slice(0, 50000); //截取一段读取的内容
                let snippets = new TextDecoder("gb2312").decode(ints); //二进制缓存区内容转化成中文（即也就是读取到的内容）
                let objVal = me.parseINI(snippets)
       
                let ini = objVal


                let { parallelism } = me
                let id = me.form.id
        
                me.reset()
                if (id) {
                    me.form.id = id
                }
                for (let key in ini) {
                    for (let keys in parallelism) {
                        if (parallelism[keys] == key) {
                            me.form.instrumentModel[keys] = ini[parallelism[keys]]
                        }
                    }

                }
            };
        },
        splitLines(string) {
            return string.split(/\r?\n/);
        },
        parseINI(data) {

            var regex = {

                section: /^\s*\s*([^]*)\s*\]\s*$/,

                param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,

                comment: /^\s*;.*$/

            };

            var value = {};

            var lines = data.split(/\r\n|\r|\n/);

            var section = null;

            lines.forEach(function (line) {

                if (regex.comment.test(line)) {

                    return;

                } else if (regex.param.test(line)) {
                    var match = line.match(regex.param);
                    if (section) {

                        value[section][match[1]] = match[2];

                    } else {

                        value[match[1]] = match[2];


                    }

                } else if (regex.section.test(line)) {

                    // var match = line.match(regex.section);

                    // value[match[1]] = {};

                    // section = match[1];

                } else if (line.length == 0 && section) {

                    section = null;

                };

            });

            return value;
        },
        exportForm() {
            let { form, modelList, parallelism } = this
            let idx = modelList.findIndex(item => item.id == form.categoryId);
            let codeValue = '[UI]\r\n'
            for (let key in form.instrumentModel) {
                if (form.instrumentModel[key]) {
                    if (parallelism[key]) {
                        codeValue += `${parallelism[key]}=${form.instrumentModel[key]}\r\n`
                    }
                }
            }
            const blob = new Blob([codeValue], { type: "text/plain;charset=utf-8" });
            saveAs(blob, form.name + ".ini");
        },
    }
}

export default mixin
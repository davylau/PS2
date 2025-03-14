
//% color="#31C7D5" weight=10 icon="\uf1d1"
 namespace ps2controller {

   //let chipSelect = DigitalPin.P11
    let chipSelect = DigitalPin.P12
    pins.digitalWritePin(chipSelect, 1)
    //pins.spiPins(DigitalPin.P13, DigitalPin.P12, DigitalPin.P10)
    pins.spiPins(DigitalPin.P5, DigitalPin.P14, DigitalPin.P13)
    pins.spiFormat(8, 3)
    pins.spiFrequency(250000)

    let pad = pins.createBuffer(6)
    let connected = false

    const poll_cmd = hex
        `014200000000000000`

    function send_command(transmit: Buffer): Buffer {
        // 处理位顺序
        transmit = reverse.rbuffer(transmit)

        let receive = pins.createBuffer(transmit.length);

        pins.digitalWritePin(chipSelect, 0);
        // 实际发送命令
        for (let i = 0; i < transmit.length; i++) {
            receive[i] = pins.spiWrite(transmit[i]);
        }
        pins.digitalWritePin(chipSelect, 1)

        // 处理位顺序
        receive = reverse.rbuffer(receive)

        return receive
     }

    export enum PS2Button {
        //% blockId="Left" block="向左方向键"
        Left,
        //% blockId="Down" block="向下方向键"
        Down,
        //% blockId="Right" block="向右方向键"
        Right,
        //% blockId="Up" block="向上方向键"
        Up,
        //% blockId="Start" block="开始(Start)按键"
        Start,
        //% blockId="Analog_Left" block="右侧摇杆按下"
        Analog_Left,
        //% blockId="Analog_Right" block="左侧摇杆按下"
        Analog_Right,
        //% blockId="Select" block="选择(Select)按键"
        Select,
        //% blockId="Square" block="正方形(□)按键"
        Square,
        //% blockId="Cross" block="叉型(×)按键"
        Cross,
        //% blockId="Circle" block="圆型(○)按键"
        Circle,
        //% blockId="Triangle" block="三角形(△)按键"
        Triangle,
        //% blockId="R1" block="R1按键"
        R1,
        //% blockId="L1" block="L1按键"
        L1,
        //% blockId="R2" block="R2按键"
        R2,
        //% blockId="L2" block="L2按键"
        L2,

     };

     export enum PS2ButtonX {
       //% blockId="RX" block="右侧摇杆X的值"
       RX,
       //% blockId="RY" block="右侧摇杆Y的值"
       RY,
       //% blockId="LX" block="左侧摇杆x的值"
       LX,
       //% blockId="LY" block="左侧摇杆Y的值"
       LY,
     };

     //% blockId=robotbit_button_value block="设置PS2摇杆|%b|值"
    //% weight=99
    //% blockGap=50
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function button_value(b: PS2ButtonX): number {
        if(!connected) return 0x00

        switch (b) {
            case PS2ButtonX.RX:
                return pad[2] - 0x80;
            case PS2ButtonX.RY:
                return pad[3] - 0x80;
            case PS2ButtonX.LX:
                return pad[4] - 0x80;
            case PS2ButtonX.LY:
                return pad[5] - 0x80;
        }
        return 0;
    };

    //% blockId=robotbit_button_pressed block="设置PS2手柄|%b|按下"
    //% weight=99
    //% blockGap=50
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
     export function button_pressed(b: PS2Button): boolean {
        if(!connected) return false

        switch (b) {
            case PS2Button.Left:
                return pad[0] & 0x80 ? false: true;
            case PS2Button.Down:
                return pad[0] & 0x40 ? false: true;
            case PS2Button.Right:
                return pad[0] & 0x20 ? false: true;
            case PS2Button.Up:
                return pad[0] & 0x10 ? false: true;
            case PS2Button.Start:
                return pad[0] & 0x08 ? false: true;
            case PS2Button.Analog_Left:
                return pad[0] & 0x04 ? false: true;
            case PS2Button.Analog_Right:
                return pad[0] & 0x02 ? false: true;
            case PS2Button.Select:
                return pad[0] & 0x01 ? false: true;
            case PS2Button.Square:
                return pad[1] & 0x80 ? false: true;
            case PS2Button.Cross:
                return pad[1] & 0x40 ? false: true;
            case PS2Button.Circle:
                return pad[1] & 0x20 ? false: true;
            case PS2Button.Triangle:
                return pad[1] & 0x10 ? false: true;
            case PS2Button.R1:
                return pad[1] & 0x08 ? false: true;
            case PS2Button.L1:
                return pad[1] & 0x04 ? false: true;
            case PS2Button.R2:
                return pad[1] & 0x02 ? false: true;
            case PS2Button.L2:
                return pad[1] & 0x01 ? false: true;
        }
        return false;
    }

    function poll(): boolean {
        let buf = send_command(poll_cmd)
        if (buf[2] != 0x5a) {
            return false;
        }

        for (let i = 0; i < 6; i++) {
            pad[i] = buf[3 + i];
        }

        connected = true

        return true
    }

    basic.forever(function () {
        poll();
    })
 }

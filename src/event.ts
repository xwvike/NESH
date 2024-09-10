import { Subject } from 'rxjs'

//按钮触发
export const KeyTrigger = new Subject()
//触摸事件
export const TouchTrigger = new Subject()
//屏幕状态
export const ScreenTrigger = new Subject()
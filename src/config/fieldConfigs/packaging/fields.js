/**
 * 包装信息字段定义
 * 
 * 说明：
 * - 所有包装信息相关的字段都在这里定义
 * - 包含字段名、显示名、表单类型、选项等完整信息
 * - 修改字段只需修改这里，template 自动从配置读取
 */

export const PACKAGING_FIELDS = {
  // 解件出库方式分组
  解件出库方式: {
    groupKey: '解件出库方式',
    displayName: '附件出货方式',
    fields: {
      支架螺丝: {
        key: '支架螺丝',
        displayName: '支架螺丝',
        aliases: [],
        formType: 'select',  // 表单类型
        width: '200',
        defaultValue: '',  // 默认空值，显示"请选择"
        options: [
          { label: '锁上出货', value: '锁上出货' },
          { label: '不锁，以附件出货', value: '不锁，以附件出货' },
          { label: '不涉及', value: '不涉及' }
        ]
      },
      按键螺丝: {
        key: '按键螺丝',
        displayName: '按键螺丝',
        aliases: ['按栓螺丝'],
        formType: 'select',
        width: '200',
        defaultValue: '',  // 默认空值，显示"请选择"
        options: [
          { label: '锁上出货', value: '锁上出货' },
          { label: '不锁，以附件出货', value: '不锁，以附件出货' },
          { label: '不涉及', value: '不涉及' }
        ]
      },
      硅胶垫片: {
        key: '硅胶垫片',
        displayName: '硅胶垫片',
        aliases: [],
        formType: 'select',
        width: '200',
        defaultValue: '',  // 默认空值，显示"请选择"
        options: [
          { label: '粘贴出货', value: '粘贴出货' },
          { label: '不贴，以附件出货', value: '不贴，以附件出货' },
          { label: '不涉及', value: '不涉及' }
        ]
      },
      其它附件要求: {
        key: '其它附件要求',
        displayName: '其它附件要求',
        aliases: [],
        formType: 'richtext',
        minWidth: '250',
        defaultValue: '',
        minHeight: 284
      }
    }
  },
  
  // 附件装箱方式
  附件装箱方式: {
    groupKey: '附件装箱方式',
    displayName: '附件装箱方式',
    formType: 'select-with-richtext',  // 下拉框+富文本
    minWidth: '250',
    fields: {
      value: {
        key: 'value',
        displayName: '装箱方式',
        aliases: [],
        formType: 'select',
        defaultValue: '',  // 默认空值，显示"请选择"
        options: [
          { label: '其它装箱方式（参考附件）', value: '其它装箱方式（参考附件）' },
          { label: '放置每箱内', value: '放置每箱内' },
          { label: '放置尾数箱', value: '放置尾数箱' }
        ]
      },
      administrator: {
        key: 'administrator',
        displayName: '附件说明',
        aliases: [],
        formType: 'richtext',
        defaultValue: '',
        minHeight: 230,
        // 显示条件：这些选项显示富文本
        showWhen: ['其它装箱方式（参考附件）', '放置尾数箱']
      }
    }
  },
  
  // 箱唛要求
  箱唛要求: {
    groupKey: '箱唛要求',
    displayName: '箱唛要求',
    formType: 'select-with-richtext',
    minWidth: '250',
    fields: {
      value: {
        key: 'value',
        displayName: '箱唛要求',
        aliases: [],
        formType: 'select',
        defaultValue: '',  // 默认空值，显示"请选择"
        options: [
          { label: '迪太模板', value: '迪太模板' },
          { label: '迪太中英模板', value: '迪太中英模板' },
          { label: '客户模板（参考附件，内容根据订单内容做修改）', value: '客户模板（参考附件，内容根据订单内容做修改）' },
          { label: '客户系统模板（等出货时，随送货单一起下发）', value: '客户系统模板（等出货时，随送货单一起下发）' }
        ]
      },
      administrator: {
        key: 'administrator',
        displayName: '附件说明',
        aliases: [],
        formType: 'richtext',
        defaultValue: '',
        minHeight: 230,
        showWhen: ['客户模板（参考附件，内容根据订单内容做修改）']
      }
    }
  },
  
  // 检验报告要求
  检验报告要求: {
    groupKey: '检验报告要求',
    displayName: '检验报告要求',
    formType: 'select-with-richtext',
    minWidth: '250',
    fields: {
      value: {
        key: 'value',
        displayName: '检验报告要求',
        aliases: [],
        formType: 'select',
        defaultValue: '',  // 默认空值，显示"请选择"
        options: [
          { label: '迪太模板', value: '迪太模板' },
          { label: '迪太中英模板', value: '迪太中英模板' },
          { label: '客户模板（参考附件，内容根据订单内容做修改）', value: '客户模板（参考附件，内容根据订单内容做修改）' },
          { label: '客户系统模板（等出货时，随送货单一起下发）', value: '客户系统模板（等出货时，随送货单一起下发）' }
        ]
      },
      administrator: {
        key: 'administrator',
        displayName: '附件说明',
        aliases: [],
        formType: 'richtext',
        defaultValue: '',
        minHeight: 230,
        showWhen: ['客户模板（参考附件，内容根据订单内容做修改）']
      }
    }
  }
}

/**
 * 获取字段的默认值
 */
export function getFieldDefaultValue(groupKey, fieldKey) {
  const field = PACKAGING_FIELDS[groupKey]?.fields[fieldKey]
  return field?.defaultValue !== undefined ? field.defaultValue : ''
}

/**
 * 判断是否应该显示富文本编辑器
 */
export function shouldShowRichtext(groupKey, fieldKey, currentValue) {
  const field = PACKAGING_FIELDS[groupKey]?.fields[fieldKey]
  if (!field || !field.showWhen) return true
  return field.showWhen.includes(currentValue)
}


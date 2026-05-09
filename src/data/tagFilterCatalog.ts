/** 企业标签管理多维筛选：企业名录与维度字段 */
export type TagFilterCompanyRow = {
  name: string
  tags: string[]
  /** 上市状态 */
  listingStatus: string
  /** 登记类型（市场主体类型） */
  regType: string
  /** 行业（业务口径） */
  industry: string
  /** 企业规模：大型 / 中型 / 小型 / 微型 */
  enterpriseScale: string
  /** 科技认定类标签（用于筛选维度） */
  techRecognition: string
  /** 省份地区 */
  province: string
  /** 国标行业门类 */
  nationalIndustry: string
  /** 战略新兴产业分类 */
  strategicEmerging: string
  /** 成立年限（年） */
  yearsEstablished: number
  /** 登记状态 */
  regStatus: string
  /** 注册资本（万人民币） */
  regCapitalWan: number
  /** 实缴资本（万人民币） */
  paidInWan: number
  /** 人员规模档 */
  staffScale: string
  /** 纳税信用等级（近年公示口径汇总） */
  taxCredit: string
  /** 海关注册登记企业信用等级（公示） */
  customsCredit: string
  /** 公开招投标参与活跃程度（相对分档） */
  biddingActivity: string
  /** 资本构成背景（控股/参股口径简化） */
  capitalBackground: string
  phone: string
  email: string
  website: string
}

export const TAG_FILTER_COMPANY_INDEX: readonly TagFilterCompanyRow[] = [
  {
    name: '科大讯飞股份有限公司',
    tags: ['上市企业', '国家技术创新示范企业', '人工智能骨干企业', '知识产权优势企业', '重点软件企业', '博士后工作站'],
    listingStatus: '上市',
    regType: '股份有限公司',
    industry: '软件和信息技术服务业',
    enterpriseScale: '大型',
    techRecognition: '高新技术企业',
    province: '安徽省',
    nationalIndustry: 'I 信息传输、软件和信息技术服务业',
    strategicEmerging: '新一代信息技术产业',
    yearsEstablished: 26,
    regStatus: '存续（在营）',
    regCapitalWan: 231069,
    paidInWan: 180000,
    staffScale: '500人以上',
    taxCredit: 'A级',
    customsCredit: '高级认证企业',
    biddingActivity: '高',
    capitalBackground: '民营主导',
    phone: '0551-65331828',
    email: 'ir@iflytek.com',
    website: 'https://www.iflytek.com',
  },
  {
    name: '安徽安大笃北信息科技有限责任公司',
    tags: [
      '合肥高新技术产业开发区',
      '科技型中小企业',
      '信息传输、软件和信息技术服务业',
      '软件和信息技术服务业',
      '信息系统集成和物联网技术服务',
      '信息系统集成服务',
    ],
    listingStatus: '非上市',
    regType: '有限责任公司',
    industry: '软件和信息技术服务业',
    enterpriseScale: '小型',
    techRecognition: '高新技术企业',
    province: '安徽省',
    nationalIndustry: 'I 信息传输、软件和信息技术服务业',
    strategicEmerging: '数字创意产业',
    yearsEstablished: 8,
    regStatus: '存续（在营）',
    regCapitalWan: 5000,
    paidInWan: 5000,
    staffScale: '50-200人',
    taxCredit: 'M级',
    customsCredit: '暂无公开等级',
    biddingActivity: '中',
    capitalBackground: '国有控股或参股',
    phone: '0551-65330000',
    email: 'bd@ahdubei.com',
    website: 'https://www.ahu.edu.cn',
  },
  {
    name: '京东方科技集团股份有限公司',
    tags: ['上市企业', '制造业单项冠军', '绿色工厂', '智能制造试点'],
    listingStatus: '上市',
    regType: '股份有限公司',
    industry: '计算机、通信和其他电子设备制造业',
    enterpriseScale: '大型',
    techRecognition: '国家企业技术中心',
    province: '北京市',
    nationalIndustry: 'C 制造业',
    strategicEmerging: '新材料产业',
    yearsEstablished: 33,
    regStatus: '存续（在营）',
    regCapitalWan: 3781969,
    paidInWan: 3200000,
    staffScale: '500人以上',
    taxCredit: 'A级',
    customsCredit: '高级认证企业',
    biddingActivity: '高',
    capitalBackground: '国有控股或参股',
    phone: '010-64318888',
    email: 'ir@boe.com.cn',
    website: 'https://www.boe.com',
  },
  {
    name: '合肥智算科技有限公司',
    tags: ['科技型中小企业', '大数据企业', '双软认证', '创新型中小企业'],
    listingStatus: '非上市',
    regType: '有限责任公司',
    industry: '互联网和相关服务',
    enterpriseScale: '小型',
    techRecognition: '科技型中小企业',
    province: '安徽省',
    nationalIndustry: 'I 信息传输、软件和信息技术服务业',
    strategicEmerging: '新一代信息技术产业',
    yearsEstablished: 5,
    regStatus: '存续（在营）',
    regCapitalWan: 10000,
    paidInWan: 6200,
    staffScale: '50-200人',
    taxCredit: 'B级',
    customsCredit: '一般信用企业',
    biddingActivity: '低',
    capitalBackground: '民营主导',
    phone: '0551-63638899',
    email: 'service@hfzhisuan.com',
    website: 'https://www.hfzhisuan.com',
  },
  {
    name: '长鑫存储技术有限公司',
    tags: ['集成电路重点企业', '高新技术企业', '专精特新小巨人'],
    listingStatus: '非上市',
    regType: '有限责任公司',
    industry: '计算机、通信和其他电子设备制造业',
    enterpriseScale: '大型',
    techRecognition: '高新技术企业',
    province: '安徽省',
    nationalIndustry: 'C 制造业',
    strategicEmerging: '新一代信息技术产业',
    yearsEstablished: 7,
    regStatus: '存续（在营）',
    regCapitalWan: 2388780,
    paidInWan: 1200000,
    staffScale: '500人以上',
    taxCredit: 'A级',
    customsCredit: '高级认证企业',
    biddingActivity: '高',
    capitalBackground: '国有控股或参股',
    phone: '0551-68106666',
    email: 'contact@cxmt.com',
    website: 'https://www.cxmt.com',
  },
  {
    name: '蔚来控股有限公司',
    tags: ['上市企业', '新能源汽车整车', '智能制造示范'],
    listingStatus: '上市',
    regType: '有限责任公司',
    industry: '汽车制造业',
    enterpriseScale: '大型',
    techRecognition: '省级企业技术中心',
    province: '上海市',
    nationalIndustry: 'C 制造业',
    strategicEmerging: '新能源汽车产业',
    yearsEstablished: 11,
    regStatus: '存续（在营）',
    regCapitalWan: 300000,
    paidInWan: 280000,
    staffScale: '500人以上',
    taxCredit: 'A级',
    customsCredit: '一般信用企业',
    biddingActivity: '高',
    capitalBackground: '港澳台及外商参股',
    phone: '021-80258800',
    email: 'ir@nio.com',
    website: 'https://www.nio.com',
  },
  {
    name: '阳光电源股份有限公司',
    tags: ['上市企业', '国家绿色工厂', '光伏逆变器龙头'],
    listingStatus: '上市',
    regType: '股份有限公司',
    industry: '电气机械和器材制造业',
    enterpriseScale: '大型',
    techRecognition: '高新技术企业',
    province: '安徽省',
    nationalIndustry: 'C 制造业',
    strategicEmerging: '新能源产业',
    yearsEstablished: 28,
    regStatus: '存续（在营）',
    regCapitalWan: 148515,
    paidInWan: 140000,
    staffScale: '500人以上',
    taxCredit: 'A级',
    customsCredit: '一般信用企业',
    biddingActivity: '高',
    capitalBackground: '民营主导',
    phone: '0551-65327878',
    email: 'ir@sungrowpower.com',
    website: 'https://www.sungrowpower.com',
  },
  {
    name: '中科可控信息产业有限公司',
    tags: ['高新技术企业', '信创骨干企业', '国资控股'],
    listingStatus: '非上市',
    regType: '有限责任公司',
    industry: '计算机、通信和其他电子设备制造业',
    enterpriseScale: '中型',
    techRecognition: '高新技术企业',
    province: '江苏省',
    nationalIndustry: 'C 制造业',
    strategicEmerging: '新一代信息技术产业',
    yearsEstablished: 9,
    regStatus: '存续（在营）',
    regCapitalWan: 150000,
    paidInWan: 90000,
    staffScale: '200-500人',
    taxCredit: 'A级',
    customsCredit: '一般信用企业',
    biddingActivity: '中',
    capitalBackground: '国有控股或参股',
    phone: '0512-86668888',
    email: 'contact@sugon.com.cn',
    website: 'https://www.sugon.com',
  },
]

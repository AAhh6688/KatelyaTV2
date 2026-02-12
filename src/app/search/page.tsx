/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
'use client';

import { ChevronUp, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { getAuthInfoFromBrowserCookie } from '@/lib/auth';
import {
  addSearchHistory,
  clearSearchHistory,
  deleteSearchHistory,
  getSearchHistory,
  subscribeToDataUpdates,
} from '@/lib/db.client';
import { SearchResult } from '@/lib/types';

import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';

// ==================== 不良内容过滤关键词（从你提供的3个文档完整复制） ====================
const badTitleKeywords: string[] = [
  // 日文关键词 (从文档A到G部分，以及基础分类等)
  'アダルト', 'AV', '裏', 'エロ', 'ポルノ', 'R18', 'R18+', '禁断', '密着', '無修正', 'モザイク消し',
  '素人', '巨乳', '美乳', '人妻', '熟女', '女子校生', 'JK', '女子大生', 'JD', 'お姉さん', '義母',
  '不倫', '近親相姦', '痴漢', '強制', '監禁', '调教', 'SM', '緊縛', '露出', '盗撮', 'のぞき',
  '中出し', 'フェラ', 'クンニ', '手コキ', 'パイズリ', 'イラマチオ', '本番', '生中出し', '顔射',
  'ぶっかけ', '射精', '絶頂', '潮吹き', 'バイブ', '玩具', 'コスプレ', '制服', '競泳水着', '下着', 'パンティー',
  '看護師', 'ナース', 'OL', '先生', '教師', '家庭教師', 'メイド', 'ＣＡ', 'モデル', 'アイドル', '美少女', '若妻',
  '乱交', 'ハメ撮り', '逆レイプ', '陵辱', 'レイプ', '拘束', '野外', '公共の場', '温泉', '混浴', '介護', '催眠', '媚薬', '放置', 'アナル',
  'マニア', 'フェチ', 'お蔵入り', '独占', '先行配信', '見放題', '激安', '無料', 'フル', '高画質',
  'ヤリたい', 'ヤル', 'イッちゃう', '気持ちいい', '感じまくり', 'ガチ', 'ナンパ', '逆ナン', '合コン', '援交', 'パパ活', 'ホスト', '风俗', 'ソープ', 'デリヘル',
  'アマチュア', 'JC', '貧乳', '美脚', '着衣', '全裸', 'オナニー', '手淫', '正常位', '騎乗位', '後背位', '立ちバック', '口交', '失神', '痙攣',
  '鬼畜', '凌辱', '奴隷', '拷問', '薬物', '恥辱', '暴力', '縛り', '吊り', '責め', '羞恥', '盗み見', '覗き',
  '変態', '肛門', '糞尿', 'スカトロ', '嘔吐', '獣姦', '触手', '尿道', '食糞', '黄金', '浣腸', '鼻フック', '猿ぐつわ', 'ギャグ', '首絞め', '針', '放尿', '飲尿', '息子', '娘', '義父', '兄', '妹', '姉', '弟', '親子', '叔母', '叔父', '家族', '義姉', '義妹',
  '女教師', '家政婦', 'スチュワーデス', 'CA', '女子寮', '露天風呂', 'ラブホテル', '教室', '体育倉庫', '満員電車', 'オフィス', '受付', '秘書',
  '三上悠亜', '河北彩花', '河北彩伽', '深田えいみ', '桃乃木かな', '桜空もも', '天使もえ', '橋本ありな', '相沢みなみ', '涼森れむ', '伊藤舞雪', '本郷愛', '有坂深雪', '葵つかさ', '希島あいり', '枢木あおい', '八木奈々', '山手梨愛', '七沢みあ', '小宵こなん', '安齋らら', '紗倉まな', '明里つむぎ', '石川澪', '楪カレン', '楓ふうあ', '永野いちか', '唯井まひろ', '水端あさみ', '梓ヒカリ', '美谷朱里', '栄川乃亜', '坂道みる', '希崎ジェシカ', '波多野結衣', '上原亜衣', '鈴村あいり', '園田みおん', '明日花キララ', '吉沢明歩', '蒼井そら', '小澤マリア', '宇都宮しをん', '霧島さくら', '水野朝陽', '浜崎真緒', 'Julia', '若月みいな', '霜月るな', '根尾あかり', '椎名そら', '篠田ゆう', '小野夕子', '浅田結梨', '乙白さやか', '山岸逢花', '羽咲みあ', '白石茉莉奈', '宝田もなみ', '跡美しゅり', '桜庭ななみ', '星奈あい', '結城るりな', '真木今日子', '篠田あゆみ', '里美ゆりあ',
  'S1', 'エスワン', 'MOODYZ', 'ムーディーズ', 'Prestige', 'プレステージ', 'SOD', 'Soft On Demand', 'Idea Pocket', 'アイポケ', 'Alice Japan', 'アリスジャパン', 'Attackers', 'アタッカーズ', 'Dogma', 'ドグマ', 'E-BODY', 'Faleno', 'ファレノ', 'Madonna', 'マドンナ', 'TMA', 'MUTEKI', 'Caribbeancom', 'カリビアンコム', 'Tokyo-Hot', '東京熱', 'Heyzo', 'ヘイゾー', '1pondo', '一本道', 'Musun', '天然むすめ', 'Pacopacomama', 'パコパコママ', '10musume', '十代美少女', '溜池ゴロー', '宇宙企画', '映機', '幻影',

  // 简体中文关键词 (核心成人词汇、暴力与血腥、新增电信诈骗、隐晦/代称、核心过滤关键词列表1到4部分，以及其它)
  'A片', '淫秽', '骚麦', '裸聊', '中出', '颜射', '偷拍', '自拍', '乱伦', '强奸', '轮奸', '幼女', '童贞', '巨乳', '丰臀', '翘臀', '调教', '捆绑', '虐待', '性爱', '做爱', '插我', '扣水', '喷水', '一夜情', '约炮', '炮友', '嫖娼', '下流', '骚货', '贱货', '浪叫', '肉棒', '阴道', '阴茎', '龟头', '卵子', '奶子', '露点', '三级片', '无码', '有码', '步兵', '骑兵', '露脸', '内射', '精液', '高潮', '手淫', '自慰', '撸管', '慰安妇', '熟女', '人妻', '护士', '老师', '制服', '诱惑', '勾引', '呻吟', '毛片', '簧片', '涩图', '性奴', '兽交', '群交', '换妻', '私房', '出轨', '门事件', '视频流出', '麻豆传媒', '糖心Vlog', '天美传媒', '果冻传媒', '星空无限', '九一', '探花', '推特大神', '网红黑料', '反差婊', '母狗', '骚妻', '推油', '金鳞岂是池中物', '肉蒲团', '金瓶梅', '色戒', '迷奸', '强奸视频',
  '暴力', '血腥', '碎尸', '斩首', '处决', '自杀', '割喉', '剖腹', '杀人', '尸体', '虐杀', '枪毙', '爆炸', '恐怖分子', '凌迟', '肢解', '活摘', '虐猫', '虐狗', '暴力美学', '满脸是血', '血流不止', '断肢', '复仇', '恐怖袭击', 'IS斩首', '叙利亚战争视频', '车祸现场', '坠楼视频', '跳楼视频', '惨叫', '分尸', '暴力拆迁', '城管打人', '私刑', '电击', '水刑', '烧炭', '服毒', '毒杀', '氰化物', '割腕', '上吊', '血腥玛丽', '死亡视频', '暗网视频',
  '跑分', '洗钱', '水房', '卡农', '杀猪盘', '刷单返现', '兼职赚钱', '博彩源码', '棋牌破解', '菠菜', '百家乐技巧', '牛牛开挂', '北京赛车', '地下钱庄', '裸聊诈骗', '勒索软件', '木马病毒', '翻墙软件', 'SSR', 'V2Ray', '梯子', '节点', '科学上网', '账号代充', '低价话费', 'USDT承兑', '虚拟货币洗钱', '杀猪盘内幕', '投资导师', '内部消息', '操盘手', '黑客攻击', 'DDOS', 'CC攻击', '库带库', '撞库', '开盒', '人肉搜索', '隐私查询', '四件套购买', '实名卡', '接码平台', '短信轰炸', '呼死你', '强制汇款', '冒充公检法', '社工库', 'AI换脸视频', '深度伪造', 'Deepfake', '换脸色情', '定制视频', '定制音频', '假钞', '枪支购买', '火药配方', '弩', '违禁药品', '迷晕药', '听话水', '乖乖水', '催情药',
  '18禁', '种子', '磁力', '处女', '番号', '车牌', '发车', '老司机', '翻墙', '吃瓜', '爆料', '黑料', '修车', '外围', '技师', '大宝剑', '挂炉', '海鲜', '森林', '鲍鱼', '蘑菇', '木耳', '馒头', '嫩草', '极品', '福利视频', '深夜食堂', '禁播', '未删减', '完整版', '私密视频', '付费资源', '内幕', '瓜田', '网红黑料',
  '国产', '原创', '自拍', '无码', '偷拍', '街拍', '探花', '大神', '实录', '破解', '流出', '泄露', '全集', '资源', '网盘', '成人', '色情', '伦理', '三级', '片', '写真', '美女', '嫩模', '网红', '外围', '约炮', '直播', '漏点', '露点', '大尺度', '精品', '精选', '重磅', '新作', '福利', '车牌', '番号',
  '学生', '校花', '学姐', '教师', '老师', '女教', '护士', '制服', '空姐', 'OL', '白领', '少妇', '人妻', '熟女', '良家', '邻家', '妹子', '小姐姐', '女神', '女友', '前任', '闺蜜', '继母', '小姨', '嫂子', '婆婆', '同事', '老板', '中介', '外卖', '快递', '房东', '保姆', '萝莉', '秘书', '上司', '老板', '经理', '主任', '主席', '总理',
  '做爱', '啪啪', '房事', '激情', '缠绵', '肉搏', '内射', '中出', '颜射', '口交', '深喉', '吹箫', '打炮', '打飞机', '自慰', '慰藉', '抠抠', '震动', '潮吹', '高潮', '射精', '喷射', '喷水', '巨乳', '大胸', '美胸', '翘臀', '私处', '阴部', '下体', '玉足', '丝袜', '黑丝', '肉丝', '网袜', '捆绑', '调教', 'SM', '淫', '骚', '裸','独家','肉','蜜桃','色','鬼', '妖', '怖','乳','母','喷','拍',
  '强奸', '强迫', '迷奸', '诱奸', '轮奸', '暴力', '血腥', '虐待', '凌辱', '禁锢', '监禁', '反抗', '惨叫', '伦理', '乱伦', '父女', '母子', '姐弟', '兄妹', '公公', '媳妇', '叔叔', '侄女', '爷爷', '孙女', '禁断', '野战', '野外', '车震', '酒店', '宾馆', '洗手间', '公厕', '大学', '高中', '台湾', '香港', '黑社会', '初次', '鸡巴', '初恋', '逼', '穴', '床', '男', '女', '血', '屌','卵', '男', '女',
  '吃瓜', '黑料', '实锤', '不雅视频', 'XX门', '视频流出', '完整版', '反转', '爆料', '新作', '成人版', '苹果', '手机','电影解说', '灵蛇','捉奸','解说','第一次','哥哥','淫荡','妈妈','东京','日本',

  // 繁体中文关键词 (对应简体部分)
  'A片', '淫穢', '騷麥', '裸聊', '中出', '顏射', '偷拍', '自拍', '亂倫', '強姦', '輪姦', '幼女', '童貞', '巨乳', '豐臀', '翹臀', '調教', '捆綁', '虐待', '性愛', '做愛', '插我', '扣水', '噴水', '一夜情', '約炮', '炮友', '嫖娼', '下流', '騷貨', '賤貨', '浪叫', '肉棒', '陰道', '陰莖', '龜頭', '卵子', '奶子', '露點', '三級片', '無碼', '有碼', '步兵', '騎兵', '露臉', '內射', '精液', '高潮', '手淫', '自慰', '擼管', '慰安婦', '熟女', '人妻', '護士', '老師', '制服', '誘惑', '勾引', '呻吟', '毛片', '簧片', '澀圖', '性奴', '獸交', '群交', '換妻', '私房', '出軌', '門事件', '視頻流出', '麻豆傳媒', '糖心Vlog', '天美傳媒', '果凍傳媒', '星空無限', '九一', '探花', '推特大神', '網紅黑料', '反差婊', '母狗', '騷妻', '推油', '迷姦', '強姦視頻',
  '國產', '原創', '自拍', '無碼', '偷拍', '街拍', '探花', '大神', '實錄', '破解', '流出', '洩露', '全集', '資源', '網盤', '成人', '色情', '倫理', '三級', '片', '寫真', '美女', '嫩模', '網紅', '外圍', '約砲', '直播', '漏點', '露點', '大尺度', '精品', '精選', '重磅', '新作', '福利', '車牌', '番號',
  '學生', '校花', '學姐', '教師', '老師', '女教', '護士', '制服', '空姐', 'OL', '白領', '少婦', '人妻', '熟女', '良家', '鄰家', '妹子', '小姐姐', '女神', '女友', '前任', '閨蜜', '繼母', '小姨', '嫂子', '婆婆', '同事', '老闆', '中介', '外賣', '快遞', '房東', '保姆', '蘿莉',
  '做愛', '啪啪', '房事', '激情', '纏綿', '肉搏', '內射', '中出', '顏射', '口交', '深喉', '吹簫', '打砲', '打飛機', '自慰', '慰藉', '摳摳', '震動', '潮吹', '高潮', '射精', '噴射', '噴水', '巨乳', '大胸', '美胸', '翹臀', '私處', '陰部', '下體', '玉足', '絲襪', '黑絲', '肉絲', '網襪', '捆綁', '調教', 'SM',
  '強姦', '強迫', '迷姦', '誘姦', '輪姦', '暴力', '血腥', '虐待', '凌辱', '禁錮', '監禁', '反抗', '慘叫', '倫理', '亂倫', '父女', '母子', '姐弟', '兄妹', '公公', '媳婦', '叔叔', '侄女', '爺爺', '孫女', '禁斷', '野戰', '野外', '車震', '酒店', '賓館', '洗手間', '公廁',

  // 英文关键词 (核心、进阶、色情与成人分类、解剖学、暴力、变态、补充标签)
  'Porn', 'Adult', 'Hentai', 'Uncensored', 'Amateur', 'Erotica', 'Hardcore', 'BDSM', 'Incest', 'Creampie', 'Blowjob', 'BJ', 'Facial', 'Cum', 'Ejaculation', 'Fetish', 'Milf', 'Teen', 'Orgy', 'Gangbang', 'Hidden', 'Spy', 'Cam', 'Webcam', 'Nude', 'Naked', 'XXX',
  'POV', 'Squirt', 'Swinger', 'Taboo', 'Deepthroat', 'Handjob', 'HJ', 'Threesome', '3P', 'Anal', 'Masturbation', 'Big Dick', 'Cock', 'Cuckold', 'Double Penetration', 'Interracial', 'Massage', 'Submissive', 'Bondage', 'Voyeur', 'Busty', 'Squirting', 'Erotic',
  '18plus', 'bang', 'big-ass', 'big-tits', 'brazzers', 'brunette', 'camgirl', 'climax', 'deep-penetration', 'double-penetration', 'escort', 'filming', 'flick', 'fucked', 'hook-up', 'horny', 'hot-girl', 'jizz', 'lesbian', 'lingerie', 'lust', 'mistress', 'naughty', 'nympho', 'orgasmic', 'penetration', 'playboy', 'pornographic', 'pornhub', 'pussy', 'redtube', 'seduction', 'sex', 'sex-video', 'sexy', 'slut', 'striptease', 'sultry', 'throuple', 'tits', 'toys', 'tube', 'vixen', 'wet', 'xhamster', 'xnxx', 'xvideos',
  'areola', 'ass', 'balls', 'ballsack', 'beaver', 'boobs', 'bottomless', 'breast', 'butt', 'buttocks', 'clit', 'clitoris', 'dick', 'dildo', 'dong', 'erection', 'foreskin', 'genitals', 'labia', 'nipples', 'nutsack', 'penis', 'phallus', 'pubic', 'scrotum', 'shaft', 'snatch', 'sperm', 'testicles', 'vagina', 'vulva', 'wang',
  'assault', 'beheaded', 'beheading', 'blood', 'bloody', 'brutality', 'cannibal', 'carnage', 'corpse', 'cruelty', 'dead-body', 'death', 'decapitation', 'dismemberment', 'execution', 'fatal', 'gore', 'ghoulish', 'homicide', 'horror', 'hurt', 'incinerate', 'insane', 'kill', 'killing', 'lynch', 'massacre', 'morbid', 'murder', 'mutilated', 'mutilation', 'necro', 'pain', 'psycho', 'savage', 'slaughter', 'snuff', 'stab', 'stabbing', 'strangled', 'suffering', 'suicide', 'terror', 'torture', 'trauma', 'victim', 'violence', 'violent', 'war-crime', 'weapon',
  'abduction', 'abuse', 'animal-cruelty', 'beastiality', 'bestiality', 'captive', 'captivity', 'child-abuse', 'coerced', 'confinement', 'deviant', 'domestic-violence', 'drugging', 'exploitation', 'extreme', 'filth', 'forced', 'kidnapping', 'kink', 'masochism', 'molestation', 'non-consensual', 'nymphomania', 'obscene', 'paraphilia', 'pedo', 'perversion', 'pervert', 'predator', 'rape', 'sadism', 'sadistic', 'sexual-assault', 'sick', 'slave', 'trafficking', 'underworld', 'unethical', 'vile', 'zoophilia',
  'age-restricted', 'all-internal', 'autoerotic', 'b-grade', 'black-market', 'blue-film', 'blurred', 'bondage-sex', 'censored-porn', 'cream', 'dark-web', 'deep-fake', 'dirty-talk', 'dungeon', 'ebony', 'explicit-content', 'family-strokes', 'femdom', 'forbidden', 'free-porn', 'full-video', 'gagging', 'girl-on-girl', 'gold-digger', 'hidden-cam', 'homemade', 'illegal', 'indecent', 'kink-shaming', 'lace', 'latex', 'leather', 'live-sex', 'lonely-wife', 'mad-science', 'maledom', 'midnight', 'movie-x', 'night-club', 'no-limit', 'not-safe-for-work', 'nsfw', 'obsession', 'office-sex', 'onlyfans', 'out-of-control', 'over-the-top', 'passion', 'peak', 'peep', 'play-doll', 'private-video', 'raw', 'real-sex', 'rebel', 'restricted', 'revenge', 'rough', 'scandal', 'secret-video', 'shackle', 'sheer', 'shock', 'skin', 'snuck', 'softcore', 'spicy', 'spoiled', 'step-sister', 'step-mom', 'strapped', 'teaser', 'thrill', 'tied-up', 'top-rated', 'toxic', 'trailer', 'trapped', 'underground', 'undercover', 'unique-fetish', 'unleashed', 'unlocked', 'unrestrained', 'untold', 'upskirt', 'vanilla', 'variety', 'viral-video', 'virtual-sex', 'wild', 'x-rated', 'youth-targeted', 'zone',
];

const badTypeKeywords: string[] = [
  '情色片', '伦理片', '写真热舞', '福利', '理论片', '日本伦理', '里番动漫', '色情片', '福利片',
  '情色片', '伦理片', '写真热舞', '福利', '理论片', '日本伦理', '里番动漫', '色情片', '福利片', '三级片','港台三级',
  '情色片', '倫理片', '寫真熱舞', '福利', '理論片', '日本倫理', '裡番動漫', '色情片', '福利片',
  'erotica movie', 'ethical film', 'photo hot dance', 'welfare', ' theory film', 'japanese ethics', 'hentai anime', 'porn film', 'welfare film',
  'エロティカ映画', '倫理映画', '写真ホットダンス', '福祉', '理論映画', '日本倫理', '里番アニメ', 'ポルノ映画', '福祉映画', '恐怖片', '黑帮片', '惊悚片',
  '恐怖片', '黑幫片', '驚悚片',
  'horror film', 'gangster film', 'thriller film',
  'ホラー映画', 'ギャング映画', 'スリラー映画','预告片', '預告片', 'trailer', '予告編', '电影解说', '足球', '短剧大全', '现代都市', '短剧', '女频恋爱', '穿越现代', '现代言情', '古装仙侠', '日本动漫', '漫剧', '有声动漫', '日韩动漫'
];

const badTagsKeywords: string[] = [
  '情色片', '伦理片', '写真热舞', '福利', '理论片', '日本伦理', '里番动漫', '色情片', '福利片', '三级片','港台三级',
  '情色片', '倫理片', '寫真熱舞', '福利', '理論片', '日本倫理', '裡番動漫', '色情片', '福利片',
  'erotica movie', 'ethical film', 'photo hot dance', 'welfare', ' theory film', 'japanese ethics', 'hentai anime', 'porn film', 'welfare film',
  'エロティカ映画', '倫理映画', '写真ホットダンス', '福祉', '理論映画', '日本倫理', '里番アニメ', 'ポルノ映画', '福祉映画', '恐怖片', '黑帮片', '惊悚片',
  '恐怖片', '黑幫片', '驚悚片',
  'horror film', 'gangster film', 'thriller film',
  'ホラー映画', 'ギャング映画', 'スリラー映画','预告片', '預告片', 'trailer', '予告編', '电影解说', '足球', '短剧大全', '现代都市', '短剧', '女频恋爱', '穿越现代', '现代言情', '古装仙侠', '日本动漫', '漫剧', '有声动漫', '日韩动漫'
];
// =================================================================================

function SearchPageClient() {
  // 搜索历史
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  // 返回顶部按钮显示状态
  const [showBackToTop, setShowBackToTop] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // 分组结果状态
  const [groupedResults, setGroupedResults] = useState<{
    regular: SearchResult[];
    adult: SearchResult[];
  } | null>(null);
  
  // 分组标签页状态
  const [activeTab, setActiveTab] = useState<'regular' | 'adult'>('regular');

  // 获取默认聚合设置：只读取用户本地设置，默认为 true
  const getDefaultAggregate = () => {
    if (typeof window !== 'undefined') {
      const userSetting = localStorage.getItem('defaultAggregateSearch');
      if (userSetting !== null) {
        return JSON.parse(userSetting);
      }
    }
    return true; // 默认启用聚合
  };

  const [viewMode, setViewMode] = useState<'agg' | 'all'>(() => {
    return getDefaultAggregate() ? 'agg' : 'all';
  });

  // 聚合函数
  const aggregateResults = (results: SearchResult[]) => {
    const map = new Map<string, SearchResult[]>();
    results.forEach((item) => {
      // 使用 title + year + type 作为键
      const key = `${item.title.replaceAll(' ', '')}-${
        item.year || 'unknown'
      }-${item.episodes.length === 1 ? 'movie' : 'tv'}`;
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    });
    return Array.from(map.entries()).sort((a, b) => {
      // 优先排序：标题与搜索词完全一致的排在前面
      const aExactMatch = a[1][0].title
        .replaceAll(' ', '')
        .includes(searchQuery.trim().replaceAll(' ', ''));
      const bExactMatch = b[1][0].title
        .replaceAll(' ', '')
        .includes(searchQuery.trim().replaceAll(' ', ''));

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // 年份排序
      if (a[1][0].year === b[1][0].year) {
        return a[0].localeCompare(b[0]);
      } else {
        const aYear = a[1][0].year;
        const bYear = b[1][0].year;

        if (aYear === 'unknown' && bYear === 'unknown') {
          return 0;
        } else if (aYear === 'unknown') {
          return 1;
        } else if (bYear === 'unknown') {
          return -1;
        } else {
          return aYear > bYear ? -1 : 1;
        }
      }
    });
  };

  useEffect(() => {
    // 无搜索参数时聚焦搜索框
    !searchParams.get('q') && document.getElementById('searchInput')?.focus();

    // 初始加载搜索历史
    getSearchHistory().then(setSearchHistory);

    // 监听搜索历史更新事件
    const unsubscribe = subscribeToDataUpdates(
      'searchHistoryUpdated',
      (newHistory: string[]) => {
        setSearchHistory(newHistory);
      }
    );

    // 获取滚动位置的函数 - 专门针对 body 滚动
    const getScrollTop = () => {
      return document.body.scrollTop || 0;
    };

    // 使用 requestAnimationFrame 持续检测滚动位置
    let isRunning = false;
    const checkScrollPosition = () => {
      if (!isRunning) return;

      const scrollTop = getScrollTop();
      const shouldShow = scrollTop > 300;
      setShowBackToTop(shouldShow);

      requestAnimationFrame(checkScrollPosition);
    };

    // 启动持续检测
    isRunning = true;
    checkScrollPosition();

    // 监听 body 元素的滚动事件
    const handleScroll = () => {
      const scrollTop = getScrollTop();
      setShowBackToTop(scrollTop > 300);
    };

    document.body.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      unsubscribe();
      isRunning = false; // 停止 requestAnimationFrame 循环

      // 移除 body 滚动事件监听器
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // 当搜索参数变化时更新搜索状态
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query);

      // 保存到搜索历史 (事件监听会自动更新界面)
      addSearchHistory(query);
    } else {
      setShowResults(false);
    }
  }, [searchParams]);

  // ==================== 核心过滤函数 ====================
  const shouldFilterVideo = (item: SearchResult): boolean => {
    if (!item?.title) return false;

    const titleLower = item.title.toLowerCase();

    // 1. 标题过滤
    if (badTitleKeywords.some(k => titleLower.includes(k.toLowerCase()))) return true;

    // 2. 类型过滤（假设类型字段为 type 或 episodes 判断，兼容原代码）
    const videoType = (item as any).type || (item.episodes.length === 1 ? 'movie' : 'tv');
    const typeLower = String(videoType).toLowerCase();
    if (badTypeKeywords.some(k => typeLower.includes(k.toLowerCase()))) return true;

    // 3. 标签过滤（假设标签字段为 tags，如果不存在则跳过）
    const tags = (item as any).tags;
    if (tags) {
      const tagsStr = Array.isArray(tags) ? tags.join(' ').toLowerCase() : String(tags).toLowerCase();
      if (badTagsKeywords.some(k => tagsStr.includes(k.toLowerCase()))) return true;
    }

    return false;
  };

  const filterBadContent = (results: SearchResult[]) => {
    return results.filter(item => !shouldFilterVideo(item));
  };

  const fetchSearchResults = async (query: string) => {
    try {
      setIsLoading(true);
      
      // 获取用户认证信息
      const authInfo = getAuthInfoFromBrowserCookie();
      
      // 构建请求头
      const headers: HeadersInit = {};
      if (authInfo?.username) {
        headers['Authorization'] = `Bearer ${authInfo.username}`;
      }
      
      // 简化的搜索请求 - 成人内容过滤现在在API层面自动处理
      // 添加时间戳参数避免缓存问题
      const timestamp = Date.now();
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}&t=${timestamp}`, 
        { 
          headers: {
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );
      const data = await response.json();
      
      // 先处理原始结果，然后应用过滤
      let regular: SearchResult[] = [];
      let adult: SearchResult[] = [];

      if (data.regular_results || data.adult_results) {
        regular = data.regular_results || [];
        adult = data.adult_results || [];
      } else if (data.grouped) {
        // 兼容旧的分组格式
        regular = data.regular || [];
        adult = data.adult || [];
      } else {
        // 兼容旧的普通结果格式
        regular = data.results || [];
        adult = [];
      }

      // 应用3层过滤
      regular = filterBadContent(regular);
      adult = filterBadContent(adult);
      
      setGroupedResults({
        regular,
        adult
      });
      setSearchResults([...regular, ...adult]);
      
      setShowResults(true);
    } catch (error) {
      setGroupedResults(null);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().replace(/\s+/g, ' ');
    if (!trimmed) return;

    // 回显搜索框
    setSearchQuery(trimmed);
    setIsLoading(true);
    setShowResults(true);

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    // 直接发请求
    fetchSearchResults(trimmed);

    // 保存到搜索历史 (事件监听会自动更新界面)
    addSearchHistory(trimmed);
  };

  // 返回顶部功能
  const scrollToTop = () => {
    try {
      // 根据调试结果，真正的滚动容器是 document.body
      document.body.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      // 如果平滑滚动完全失败，使用立即滚动
      document.body.scrollTop = 0;
    }
  };

  return (
    <PageLayout activePath='/search'>
      <div className='px-4 sm:px-10 py-4 sm:py-8 overflow-visible mb-10'>
        {/* 搜索框 */}
        <div className='mb-8'>
          <form onSubmit={handleSearch} className='max-w-2xl mx-auto'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
              <input
                id='searchInput'
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='搜索电影、电视剧...'
                className='w-full h-12 rounded-lg bg-gray-50/80 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white border border-gray-200/50 shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500 dark:focus:bg-gray-700 dark:border-gray-700'
              />
            </div>
          </form>
        </div>

        {/* 搜索结果或搜索历史 */}
        <div className='max-w-[95%] mx-auto mt-12 overflow-visible'>
          {isLoading ? (
            <div className='flex justify-center items-center h-40'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
            </div>
          ) : showResults ? (
            <section className='mb-12'>
              {/* 标题 + 聚合开关 */}
              <div className='mb-8 flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
                  搜索结果
                </h2>
                {/* 聚合开关 */}
                <label className='flex items-center gap-2 cursor-pointer select-none'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    聚合
                  </span>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      className='sr-only peer'
                      checked={viewMode === 'agg'}
                      onChange={() =>
                        setViewMode(viewMode === 'agg' ? 'all' : 'agg')
                      }
                    />
                    <div className='w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors dark:bg-gray-600'></div>
                    <div className='absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4'></div>
                  </div>
                </label>
              </div>
              
              {/* 如果有分组结果且有成人内容，显示分组标签 */}
              {groupedResults && groupedResults.adult.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <button
                        onClick={() => setActiveTab('regular')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'regular'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        常规结果 ({groupedResults.regular.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('adult')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'adult'
                            ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        成人内容 ({groupedResults.adult.length})
                      </button>
                    </div>
                  </div>
                  {activeTab === 'adult' && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">
                        ⚠️ 以下内容可能包含成人资源，请确保您已年满18周岁
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div
                key={`search-results-${viewMode}-${activeTab}`}
                className='justify-start grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8'
              >
                {(() => {
                  // 确定要显示的结果
                  let displayResults = searchResults;
                  if (groupedResults && groupedResults.adult.length > 0) {
                    displayResults = activeTab === 'adult' 
                      ? groupedResults.adult 
                      : groupedResults.regular;
                  }

                  // 聚合显示模式
                  if (viewMode === 'agg') {
                    const aggregated = aggregateResults(displayResults);
                    return aggregated.map(([mapKey, group]: [string, SearchResult[]]) => (
                      <div key={`agg-${mapKey}`} className='w-full'>
                        <VideoCard
                          from='search'
                          items={group}
                          query={
                            searchQuery.trim() !== group[0].title
                              ? searchQuery.trim()
                              : ''
                          }
                        />
                      </div>
                    ));
                  }

                  // 列表显示模式
                  return displayResults.map((item) => (
                    <div
                      key={`all-${item.source}-${item.id}`}
                      className='w-full'
                    >
                      <VideoCard
                        id={item.id}
                        title={item.title}
                        poster={item.poster}
                        episodes={item.episodes.length}
                        source={item.source}
                        source_name={item.source_name}
                        douban_id={item.douban_id?.toString()}
                        query={
                          searchQuery.trim() !== item.title
                            ? searchQuery.trim()
                            : ''
                        }
                        year={item.year}
                        from='search'
                        type={item.episodes.length > 1 ? 'tv' : 'movie'}
                      />
                    </div>
                  ));
                })()}
                {searchResults.length === 0 && (
                  <div className='col-span-full text-center text-gray-500 py-8 dark:text-gray-400'>
                    未找到相关结果
                  </div>
                )}
              </div>
            </section>
          ) : searchHistory.length > 0 ? (
            // 搜索历史
            <section className='mb-12'>
              <h2 className='mb-4 text-xl font-bold text-gray-800 text-left dark:text-gray-200'>
                搜索历史
                {searchHistory.length > 0 && (
                  <button
                    onClick={() => {
                      clearSearchHistory(); // 事件监听会自动更新界面
                    }}
                    className='ml-3 text-sm text-gray-500 hover:text-red-500 transition-colors dark:text-gray-400 dark:hover:text-red-500'
                  >
                    清空
                  </button>
                )}
              </h2>
              <div className='flex flex-wrap gap-2'>
                {searchHistory.map((item) => (
                  <div key={item} className='relative group'>
                    <button
                      onClick={() => {
                        setSearchQuery(item);
                        router.push(
                          `/search?q=${encodeURIComponent(item.trim())}`
                        );
                      }}
                      className='px-4 py-2 bg-gray-500/10 hover:bg-gray-300 rounded-full text-sm text-gray-700 transition-colors duration-200 dark:bg-gray-700/50 dark:hover:bg-gray-600 dark:text-gray-300'
                    >
                      {item}
                    </button>
                    {/* 删除按钮 */}
                    <button
                      aria-label='删除搜索历史'
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteSearchHistory(item); // 事件监听会自动更新界面
                      }}
                      className='absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* 返回顶部悬浮按钮 */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 md:bottom-6 right-6 z-[500] w-12 h-12 bg-green-500/90 hover:bg-green-500 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out flex items-center justify-center group ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label='返回顶部'
      >
        <ChevronUp className='w-6 h-6 transition-transform group-hover:scale-110' />
      </button>
    </PageLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}

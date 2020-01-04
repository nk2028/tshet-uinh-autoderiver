const is = s => equal音韻地位(小韻號, s);

function 聲母規則() {
	if (is('幫母')) return 'p';
	if (is('滂母')) return 'ph';
	if (is('並母')) return 'b';
	if (is('明母')) return 'm';
	if (is('端母')) return 't';
	if (is('透母')) return 'th';
	if (is('定母')) return 'd';
	if (is('泥母')) return 'n';
	if (is('知母')) return 'tr';
	if (is('徹母')) return 'thr';
	if (is('澄母')) return 'dr';
	if (is('孃母')) return 'nr';
	if (is('精母')) return 'c';
	if (is('清母')) return 'ch';
	if (is('從母')) return 'z';
	if (is('心母')) return 's';
	if (is('邪母')) return 'zs';
	if (is('莊母')) return 'cr';
	if (is('初母')) return 'chr';
	if (is('崇母')) return 'zr';
	if (is('生母')) return 'sr';
	if (is('俟母')) return 'zsr';
	if (is('章母')) return 'cj';
	if (is('昌母')) return 'chj';
	if (is('船母')) return 'zsj';
	if (is('書母')) return 'sj';
	if (is('常母')) return 'zj';
	if (is('見母')) return 'k';
	if (is('溪母')) return 'kh';
	if (is('羣母')) return 'g';
	if (is('疑母')) return 'ng';
	if (is('影母')) return 'q';
	if (is('曉母')) return 'h';
	if (is('匣母')) return 'gh';
	if (is('云母')) return '';
	if (is('以母')) return 'j';
	if (is('來母')) return 'l';
	if (is('日母')) return 'nj';
	throw new Error('無聲母規則');
}

function 韻母規則() {
	// 果攝
	if (is('開 一等 歌韻賅上去入')) return 'a';
	if (is('開 三等 戈韻賅上去入')) return 'ia';
	if (is('合 一等 戈韻賅上去入')) return 'ua';
	if (is('合 三等 戈韻賅上去入')) return 'ya';
	// 假攝
	if (is('開 二等 麻韻賅上去入')) return 'ra';
	if (is('開 三等 麻韻賅上去入')) return 'ia';
	if (is('合 二等 麻韻賅上去入')) return 'rua';
	// 遇攝
	if (is('一等 模韻賅上去入')) return 'o';
	if (is('三等 魚韻賅上去入')) return 'io';
	if (is('三等 虞韻賅上去入')) return 'yo';
	// 蟹攝
	if (is('開 一等 咍韻賅上去入')) return 'ai';
	if (is('開 二等 佳韻賅上去入')) return 're';
	if (is('開 二等 皆韻賅上去入')) return 'rai';
	if (is('開 四等 齊韻賅上去入')) return 'e';
	if (is('開 一等 泰韻賅上去入')) return 'ad';
	if (is('開 二等 夬韻賅上去入')) return 'rad';
	if (is('開 三等 祭韻賅上去入 重紐A類')) return 'jed';
	if (is('開 三等 祭韻賅上去入')) return 'ied';
	if (is('開 三等 廢韻賅上去入')) return 'iad';
	if (is('合 一等 灰韻賅上去入')) return 'uai';
	if (is('合 二等 佳韻賅上去入')) return 'rue';
	if (is('合 二等 皆韻賅上去入')) return 'ruai';
	if (is('合 四等 齊韻賅上去入')) return 'ue';
	if (is('合 一等 泰韻賅上去入')) return 'uad';
	if (is('合 二等 夬韻賅上去入')) return 'ruad';
	if (is('合 三等 祭韻賅上去入')) return 'yed';
	if (is('合 三等 廢韻賅上去入')) return 'yad';
	// 止攝
	if (is('開 三等 支韻賅上去入 重紐A類')) return 'je';
	if (is('開 三等 支韻賅上去入')) return 'ie';
	if (is('開 三等 脂韻賅上去入 重紐A類')) return 'jii';
	if (is('開 三等 脂韻賅上去入')) return 'ii';
	if (is('開 三等 之韻賅上去入')) return 'i';
	if (is('開 三等 微韻賅上去入')) return 'ioi';
	if (is('合 三等 支韻賅上去入 重紐A類')) return 'jye';
	if (is('合 三等 支韻賅上去入')) return 'ye';
	if (is('合 三等 脂韻賅上去入 重紐A類')) return 'jyi';
	if (is('合 三等 脂韻賅上去入')) return 'yi';
	if (is('合 三等 微韻賅上去入')) return 'yoi';
	// 效攝
	if (is('一等 豪韻賅上去入')) return 'au';
	if (is('二等 肴韻賅上去入')) return 'rau';
	if (is('三等 宵韻賅上去入 重紐A類')) return 'jeu';
	if (is('三等 宵韻賅上去入')) return 'ieu';
	if (is('四等 蕭韻賅上去入')) return 'eu';
	// 流攝
	if (is('一等 侯韻賅上去入')) return 'u';
	if (is('三等 尤韻賅上去入')) return 'iu';
	if (is('三等 幽韻賅上去入')) return 'y';
	// 咸攝
	if (is('開 一等 談韻賅上去入')) return 'am';
	if (is('開 二等 銜韻賅上去入')) return 'ram';
	if (is('開 二等 咸韻賅上去入')) return 'rem';
	if (is('開 三等 鹽韻賅上去入 重紐A類')) return 'jem';
	if (is('開 三等 鹽韻賅上去入')) return 'iem';
	if (is('開 三等 嚴韻賅上去入')) return 'iam';
	if (is('開 四等 添韻賅上去入')) return 'em';
	if (is('開 一等 覃韻賅上去入')) return 'om';
	if (is('合 三等 凡韻賅上去入')) return 'yam';
	// 深攝
	if (is('三等 侵韻賅上去入 重紐A類')) return 'jim';
	if (is('三等 侵韻賅上去入')) return 'im';
	// 山攝
	if (is('開 一等 寒韻賅上去入')) return 'an';
	if (is('開 二等 刪韻賅上去入')) return 'ran';
	if (is('開 二等 山韻賅上去入')) return 'ren';
	if (is('開 三等 仙韻賅上去入 重紐A類')) return 'jen';
	if (is('開 三等 仙韻賅上去入')) return 'ien';
	if (is('開 四等 先韻賅上去入')) return 'en';
	if (is('合 一等 桓韻賅上去入')) return 'uan';
	if (is('合 二等 刪韻賅上去入')) return 'ruan';
	if (is('合 二等 山韻賅上去入')) return 'ruen';
	if (is('合 三等 仙韻賅上去入 重紐A類')) return 'jyen';
	if (is('合 三等 仙韻賅上去入')) return 'yen';
	if (is('合 四等 先韻賅上去入')) return 'uen';
	// 臻攝
	if (is('開 一等 痕韻賅上去入')) return 'on';
	if (is('開 三等 眞韻賅上去入 重紐A類')) return 'jin';
	if (is('開 三等 眞韻賅上去入')) return 'in';
	if (is('開 三等 臻韻賅上去入')) return 'in';
	if (is('開 三等 欣韻賅上去入')) return 'ion';
	if (is('開 三等 元韻賅上去入')) return 'ian';
	if (is('合 一等 魂韻賅上去入')) return 'uon';
	if (is('合 三等 眞韻賅上去入')) return 'yn';
	if (is('合 三等 諄韻賅上去入 重紐A類')) return 'jyn';
	if (is('合 三等 諄韻賅上去入')) return 'yn';
	if (is('合 三等 文韻賅上去入')) return 'yon';
	if (is('合 三等 元韻賅上去入')) return 'yan';
	// 宕攝
	if (is('開 一等 唐韻賅上去入')) return 'ang';
	if (is('開 三等 陽韻賅上去入')) return 'iang';
	if (is('合 一等 唐韻賅上去入')) return 'uang';
	if (is('合 三等 陽韻賅上去入')) return 'yang';
	// 梗攝
	if (is('開 二等 庚韻賅上去入')) return 'rang';
	if (is('開 二等 耕韻賅上去入')) return 'reng';
	if (is('開 三等 庚韻賅上去入')) return 'ieng';
	if (is('開 三等 清韻賅上去入 重紐A類')) return 'jeng';
	if (is('開 三等 清韻賅上去入')) return 'ieng';
	if (is('開 四等 青韻賅上去入')) return 'eng';
	if (is('合 二等 庚韻賅上去入')) return 'ruang';
	if (is('合 二等 耕韻賅上去入')) return 'rueng';
	if (is('合 三等 庚韻賅上去入')) return 'yeng';
	if (is('合 三等 清韻賅上去入 重紐A類')) return 'jyeng';
	if (is('合 三等 清韻賅上去入')) return 'yeng';
	if (is('合 四等 青韻賅上去入')) return 'ueng';
	// 曾攝
	if (is('開 一等 登韻賅上去入')) return 'ong';
	if (is('開 三等 蒸韻賅上去入')) return 'ing';
	if (is('合 一等 登韻賅上去入')) return 'uong';
	if (is('合 三等 蒸韻賅上去入')) return 'yng';
	// 通攝
	if (is('一等 東韻賅上去入')) return 'ung';
	if (is('三等 鍾韻賅上去入')) return 'yung';
	if (is('一等 冬韻賅上去入')) return 'uung';
	if (is('三等 東韻賅上去入')) return 'iung';
	// 江攝
	if (is('二等 江韻賅上去入')) return 'rung';
	throw new Error('無韻母規則');
}

function 聲調規則() {
	if (is('平入聲')) return '';
	if (is('上聲')) return 'x';
	if (is('去聲')) return 'h';
	throw new Error('無聲調規則');
}

let 聲母 = 聲母規則();
let 隔音符號 = "'";
let 韻母 = 韻母規則();
let 聲調 = 聲調規則();

if (is('入聲'))
	if (韻母.endsWith('m'))
		韻母 = 韻母.slice(0, -1) + 'p';
	else if (韻母.endsWith('n'))
		韻母 = 韻母.slice(0, -1) + 't';
	else if (韻母.endsWith('ng'))
		韻母 = 韻母.slice(0, -2) + 'k';

if (韻母.endsWith('d'))
	聲調 = '';

if (聲母.endsWith('r') && 韻母.startsWith('r'))
	韻母 = 韻母.substr(1);

if (聲母.endsWith('j') && 韻母.startsWith('i') && 'aeou'.split('').some(x => 韻母.includes(x)))
	韻母 = 韻母.substr(1);

if
( is('幫組 一二三四等'
+ ' 或 端組 一四等'
+ ' 或 知組 二三等'
+ ' 或 精組 一三四等'
+ ' 或 莊組 二三等'
+ ' 或 章組 三等'
+ ' 或 見溪疑母 一二三四等'
+ ' 或 羣母 二三等'
+ ' 或 影曉母 一二三四等'
+ ' 或 匣母 一二四等'
+ ' 或 云以母 三等'
+ ' 或 來母 一二三四等'
+ ' 或 日母 三等'
))
	隔音符號 = '';

if (is('云母 一等'))  // 1444 倄小韻 i'uaix
	聲母 = 'i';

if (is('定母 三等'))  // 2237 地小韻 diih
	隔音符號 = '';

return 聲母 + 隔音符號 + 韻母 + 聲調;

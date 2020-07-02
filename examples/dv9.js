/* 三日月綾香個人思考用語
 * https://ayaka.shn.hk/dv9/
 *
 * 説明
 * 以下內容為生成三日月綾香個人思考用語的函數體
 * 函數接受音韻地位，返回對應的三日月綾香個人思考用語拼音
 */

const is = x => 音韻地位.屬於(x);

function 聲母規則() {
	if (is('幫滂並母')) return 'h';
	if (is('明母')) {
		if (is('梗攝') && !is('庚耕青韻 入聲')) return 'm';
		else return 'b';
	}
	if (is('端透定知徹澄母')) return 't';
	if (is('泥孃母')) {
		if (is('梗攝')) return 'n';
		else return 'd';
	}
	if (is('來母')) return 'l';
	if (is('精清從心邪莊初崇生俟章昌船書常母')) return 's';
	if (is('日母')) return 'z';
	if (is('見溪羣曉匣母')) return 'k';
	if (is('疑母')) return 'g';
	if (is('影云以母')) return '';  // 影母細音 q-，詳後
	throw new Error('無聲母規則');
}

function 韻母規則() {
	// 通攝
	if (is('東冬韻 開口 一等')) return !is('入聲') ? 'oun' : 'ok';
	if (is('東韻 開口 三等')) {
		if (is('幫滂並母')) return !is('入聲') ? 'uun' : 'uk';
		if (is('明母')) return !is('入聲') ? 'oun' : 'ok';
		if (is('精莊章組')) return !is('入聲') ? 'yn' : 'iuk';
		else return !is('入聲') ? 'yn' : 'ik';
	}
	if (is('鍾韻')) {
		if (is('幫組')) return !is('入聲') ? 'oun' : 'ok';
		else return !is('入聲') ? 'ioun' : 'iok';
	}
	// 江攝
	if (is('江韻')) {
		return !is('入聲') ? 'oun' : 'ak';
	}
	// 止攝
	if (is('支脂之微韻 開口 三等')) return 'i';
	if (is('支脂微韻 合口 三等')) {
		if (is('端知精莊章組 或 來日母')) return 'ui';
		else return 'i';
	}
	// 遇攝
	if (is('魚韻')) {
		if (is('莊組')) return 'o';
		else return 'io';
	}
	if (is('虞韻')) {
		if (is('莊組')) return 'u';
		if (is('端精章組 或 以來日母')) return 'iu';
		if (is('知組')) return 'y';
		else return 'u';
	}
	if (is('模韻')) return 'o';
	// 蟹攝
	if (is('齊祭韻')) return 'ei';
	if (is('佳皆灰咍泰夬廢韻')) return 'ai';
	// 臻攝
	if (is('眞臻欣韻')) return !is('入聲') ? 'in' : 'is';
	if (is('諄韻')) {
		if (is('知精莊章組 或 日母')) return !is('入聲') ? 'yn' : 'ius';
		else return !is('入聲') ? 'in' : 'is';
	}
	if (is('文韻')) return !is('入聲') ? 'un' : 'us';
	if (is('元韻 開口 三等')) return !is('入聲') ? 'en' : 'es';
	if (is('元韻 合口 三等')) {
		if (is('幫組')) return !is('入聲') ? 'an' : 'as';
		else return !is('入聲') ? 'en' : 'es';
	}
	if (is('魂痕韻')) return !is('入聲') ? 'on' : 'os';
	// 山攝
	if (is('寒桓刪山韻')) return !is('入聲') ? 'an' : 'as';
	if (is('先仙韻')) return !is('入聲') ? 'en' : 'es';
	// 效攝
	if (is('蕭宵韻')) return 'iou';
	if (is('肴豪韻')) return 'ou';
	// 果攝
	if (is('歌韻 或 戈韻 合口 一等')) return 'a';
	if (is('戈韻 開口 三等')) return 'ia';
	if (is('戈韻 合口 三等')) {
		if (is('見組 或 曉匣母')) return 'a';
		else return 'ia';
	}
	// 假攝
	if (is('麻韻 開口 二等 或 麻韻 合口 二等')) return 'a';
	if (is('麻韻 開口 三等')) return 'ia';
	// 宕攝
	if (is('唐韻')) return !is('入聲') ? 'oun' : 'ak';
	if (is('陽韻 開口 三等')) {
		if (is('幫莊組')) return !is('入聲') ? 'oun' : 'ak';
		else return !is('入聲') ? 'ioun' : 'iak';
	}
	if (is('陽韻 合口 三等')) {
		if (is('見組 或 曉匣母')) return !is('入聲') ? 'ioun' : 'iak';
		else return !is('入聲') ? 'oun' : 'ak';
	}
	// 梗攝
	if (is('庚韻 開口 二等')) {
		if (is('莊章組 或 日母')) return !is('入聲') ? 'ein' : 'ak';
		else return !is('入聲') ? 'oun' : 'ak';
	}
	if (is('庚韻 合口 二等 或 耕韻')) return !is('入聲') ? 'oun' : 'ak';
	if (is('庚韻 開口 三等 或 庚韻 合口 三等 或 清青韻')) return !is('入聲') ? 'ein' : 'eg';
	// 曾攝
	if (is('登韻')) return !is('入聲') ? 'oun' : 'ok';
	if (is('蒸韻')) {
		if (is('莊組')) return !is('入聲') ? 'oun' : 'ok';
		else return !is('入聲') ? 'ioun' : 'iok';
	}
	// 流攝
	if (is('侯韻')) return 'ou';
	if (is('尤韻')) {
		if (is('幫滂並母')) return 'uu';
		if (is('明母')) return 'ou';
		else return 'y';
	}
	if (is('幽韻')) {
		if (is('見組 或 曉匣母')) return 'y';
		else return 'iu';
	}
	// 深攝
	if (is('侵韻')) return !is('入聲') ? 'im' : 'if';
	// 咸攝
	if (is('覃談咸銜韻')) return !is('入聲') ? 'am' : 'af';
	if (is('鹽添韻')) return !is('入聲') ? 'em' : 'ef';
	if (is('嚴凡韻')) {
		if (is('見組 或 曉匣云以母')) return !is('入聲') ? 'em' : 'ef';
		else return !is('入聲') ? 'am' : 'af';
	}
	throw new Error('無韻母規則');
}

let 聲母 = 聲母規則();
let 韻母 = 韻母規則();

let 合口介音 =
	!( (is('見組 合口 或 曉匣母 合口') && (韻母.startsWith('a') || 韻母.startsWith('e')))
	|| (is('精莊章組 合口 或 影云以日母 合口') && 韻母.startsWith('a'))
	) ? '' : 'w';

if (is('影母') && 韻母.startsWith('i'))
	聲母 = 'h';

function 聲調規則() {
	if (is('幫滂端透知徹精清心莊初生章昌書見溪影曉母')) {  // 全清、次清
		if (is('平去入聲')) return 'ˉ';
		if (is('上聲')) return 'ˊ';
	} else {
		if (is('平去入聲')) return 'ˇ';
		if (is('上聲')) return 'ˊ';
	}
	throw new Error('無聲調規則');
}

let 聲調 = 聲調規則();

if (聲母 == '' && 韻母.startsWith('i')) {
	聲母 = 'j';
	if (韻母.length > 1 && 'aiueo'.includes(韻母[1]))
		韻母 = 韻母.substr(1);
}
else if (聲母 == '' && 韻母.startsWith('y')) {
	聲母 = 'j';
}
else if (聲母 == '' && 韻母.startsWith('u')) {
	聲母 = 'w';
	if (韻母.length > 1 && 'aiueo'.includes(韻母[1]))
		韻母 = 韻母.substr(1);
}

return 聲母 + 合口介音 + 韻母 + 聲調;

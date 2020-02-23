/* 三日月綾香個人思考用語
 * https://sgn.shn.hk/members/~ayaka/dv8/
 *
 * 説明
 * 以下內容為生成三日月綾香個人思考用語的函數體
 * 函數接受兩個參數：小韻號、字頭，返回對應的三日月綾香個人思考用語拼音
 */

const is = s => Qieyun.equal音韻地位(小韻號, s);
 
function 聲母規則() {
	if (is('幫滂並母')) return 'h';
	if (is('明母')) {
		if (is('梗攝') && !is('庚耕青韻賅上去入 入聲')) return 'm';
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
	if (is('通攝')) {
		if (is('東冬韻賅上去入 開 一等')) return !is('入聲') ? 'oun' : 'ok';
		if (is('東韻賅上去入 開 三等')) {
			if (is('幫滂並母')) return !is('入聲') ? 'uun' : 'uk';
			if (is('明母')) return !is('入聲') ? 'oun' : 'ok';
			if (is('精莊章組')) return !is('入聲') ? 'iuin' : 'iuk';
			else return !is('入聲') ? 'iuin' : 'ik';
		}
		if (is('鍾韻賅上去入')) {
			if (is('幫組')) return !is('入聲') ? 'oun' : 'ok';
			else return !is('入聲') ? 'ioun' : 'iok';
		}
	}
	if (is('江攝'))
		return !is('入聲') ? 'oun' : 'ak';
	if (is('止攝')) {
		if (is('支脂之微韻賅上去入 開 三等')) return 'i';
		if (is('支脂微韻賅上去入 合 三等')) {
			if (is('端知精莊章組 或 來日母')) return 'ui';
			else return 'i';
		}
	}
	if (is('遇攝')) {
		if (is('魚韻賅上去入')) {
			if (is('莊組 三等')) return 'o';
			else return 'io';
		}
		if (is('虞韻賅上去入')) {
			if (is('莊組 三等')) return 'u';
			if (is('端精莊章組 或 以來日母')) return 'iu';
			if (is('知組')) return 'iui';
			else return 'u';
		}
		if (is('模韻賅上去入')) return 'o';
	}
	if (is('蟹攝')) {
		if (is('齊祭韻賅上去入')) return 'ei';
		if (is('佳皆灰咍泰夬廢韻賅上去入')) return 'ai';
	}
	if (is('臻攝')) {
		if (is('眞臻欣韻賅上去入')) return !is('入聲') ? 'in' : 'is';
		if (is('諄韻賅上去入')) {
			if (is('知精莊章組 或 日母')) return !is('入聲') ? 'iuin' : 'ius';
			else return !is('入聲') ? 'in' : 'is';
		}
		if (is('文韻賅上去入')) return !is('入聲') ? 'un' : 'us';
		if (is('元韻賅上去入 開 三等')) return !is('入聲') ? 'en' : 'es';
		if (is('元韻賅上去入 合 三等')) {
			if (is('幫組')) return !is('入聲') ? 'an' : 'as';
			else return !is('入聲') ? 'en' : 'es';
		}
		if (is('魂痕韻賅上去入')) return !is('入聲') ? 'on' : 'os';
	}
	if (is('山攝')) {
		if (is('寒桓刪山韻賅上去入')) return !is('入聲') ? 'an' : 'as';
		if (is('先仙韻賅上去入')) return !is('入聲') ? 'en' : 'es';
	}
	if (is('效攝')) {
		if (is('蕭宵韻賅上去入')) return 'iou';
		if (is('肴豪韻賅上去入')) return 'ou';
	}
	if (is('果攝')) {
		if (is('歌韻賅上去入 或 戈韻賅上去入 合 一等')) return 'a';
		if (is('戈韻賅上去入 開 三等')) return 'ia';
		if (is('戈韻賅上去入 合 三等')) {
			if (is('見組 或 曉匣母')) return 'a';
			else return 'ia';
		}
	}
	if (is('假攝')) {
		if (is('麻韻賅上去入 開 二等 或 麻韻賅上去入 合 二等')) return 'a';
		if (is('麻韻賅上去入 開 三等')) return 'ia';
	}
	if (is('宕攝')) {
		if (is('唐韻賅上去入')) return !is('入聲') ? 'oun' : 'ak';
		if (is('陽韻賅上去入 開 三等')) {
			if (is('幫組 或 莊組 開 三等')) return !is('入聲') ? 'oun' : 'ak';
			else return !is('入聲') ? 'ioun' : 'iak';
		}
		if (is('陽韻賅上去入 合 三等')) {
			if (is('見組 或 曉匣母')) return !is('入聲') ? 'ioun' : 'iak';
			else return !is('入聲') ? 'oun' : 'ak';
		}
	}
	if (is('梗攝')) {
		if (is('庚韻賅上去入 開 二等')) {
			if (is('莊章組 或 日母')) return !is('入聲') ? 'ein' : 'ak';
			else return !is('入聲') ? 'oun' : 'ak';
		}
		if (is('庚韻賅上去入 合 二等 或 耕韻賅上去入')) return !is('入聲') ? 'oun' : 'ak';
		if (is('庚韻賅上去入 開 三等 或 庚韻賅上去入 合 三等 或 清青韻賅上去入')) return !is('入聲') ? 'ein' : 'eg';
	}
	if (is('曾攝')) {
		if (is('登韻賅上去入')) return !is('入聲') ? 'oun' : 'ok';
		if (is('蒸韻賅上去入')) {
			if (is('莊組 三等')) return !is('入聲') ? 'oun' : 'ok';
			else return !is('入聲') ? 'ioun' : 'iok';
		}
	}
	if (is('流攝')) {
		if (is('侯韻賅上去入')) return 'ou';
		if (is('尤韻賅上去入')) {
			if (is('幫滂並母')) return 'uu';
			if (is('明母')) return 'ou';
			else return 'iui';
		}
		if (is('幽韻賅上去入')) {
			if (is('見組 或 曉匣母')) return 'iui';
			else return 'iu';
		}
	}
	if (is('深攝'))
		if (is('侵韻賅上去入')) return !is('入聲') ? 'im' : 'if';
	if (is('咸攝')) {
		if (is('覃談咸銜韻賅上去入')) return !is('入聲') ? 'am' : 'af';
		if (is('鹽添韻賅上去入')) return !is('入聲') ? 'em' : 'ef';
		if (is('嚴凡韻賅上去入')) {
			if (is('見組 或 曉匣云以母')) return !is('入聲') ? 'em' : 'ef';
			else return !is('入聲') ? 'am' : 'af';
		}
	}
	throw new Error('無韻母規則');
}
 
let 聲母 = 聲母規則();
let 韻母 = 韻母規則();
 
let 合口介音 =
	!( (is('見組 合 或 曉匣母 合') && (韻母.startsWith('a') || 韻母.startsWith('e')))
	|| (is('影云以母 合') && 韻母.startsWith('a'))
	) ? '' : 'u';
 
if (is('影母') && 韻母.startsWith('i'))
	聲母 = 'q';
 
function 聲調規則() {
	if (is('幫滂端透知徹精清心莊初生章昌書見溪影曉母')) {  // 全清
		if (is('平聲')) return '¹';
		if (is('上聲')) return '²';
		if (is('去聲')) return '³';
		if (is('入聲 深臻曾通攝')) return '¹';
		if (is('入聲')) return '³';
	} else {
		if (is('平聲')) return '³';
		if (is('去聲 或 並定澄從邪崇俟船常羣匣母 上聲')) return '³';  // 全濁上變去
		if (is('上聲')) return '²';
		if (is('入聲')) return '³';
	}
	throw new Error('無聲調規則');
}
 
let 聲調 = 聲調規則();
 
/* 若要使用舊式拼寫，註釋掉以下幾行 */
if (聲母 == 't' && 韻母.startsWith('u'))
	聲母 = 'ts';
else if (聲母 == 't' && 韻母.startsWith('i'))
	聲母 = 'ch';
else if (聲母 == 'h' && 韻母.startsWith('u'))
	聲母 = 'f';
else

if (聲母 == '' && 韻母.startsWith('i')) {
	聲母 = 'y';
	if (韻母.length > 1 && 'aiueo'.includes(韻母[1]))
		韻母 = 韻母.substr(1);
}
else if (聲母 == '' && 韻母.startsWith('u')) {
	聲母 = 'w';
	if (韻母.length > 1 && 'aiueo'.includes(韻母[1]))
		韻母 = 韻母.substr(1);
} else if (聲母 == '' && 合口介音 == 'u')
	合口介音 = 'w';
 
return 聲母 + 合口介音 + 韻母 + 聲調;

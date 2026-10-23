// i18n.js 的桩：默认语言英文、没有语言包时 t / translate 原样返回原文（照抄 i18n.js:81-87、101-111，去掉语言包查找）。
export function t(strings, ...values) {
    let str = strings.reduce((result, string, i) => result + string + (values[i] !== undefined ? `\${${i}}` : ''), '');
    let translatedStr = translate(str);
    return translatedStr.replace(/\$\{(\d+)\}/g, (match, index) => values[index]);
}
export function translate(text, key = null) {
    return text;
}
export function getCurrentLocale() { return 'en'; }
export function applyLocale() {}
